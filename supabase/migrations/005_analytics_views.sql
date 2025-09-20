-- Sprint 5: Analytics Views
-- PRD v1.3, Section 2 & 5

-- Materialized view for KPIs for performance
CREATE MATERIALIZED VIEW analytics_kpis AS
SELECT
  p.user_id,
  COUNT(c.id) AS total_calls,
  COUNT(c.id) FILTER (WHERE c.status = 'booked') AS total_booked,
  SUM(CAST(cl.call_logs->>'duration' AS INTEGER)) / 60 AS total_minutes,
  (COUNT(c.id) FILTER (WHERE c.status = 'booked') * 100.0 / COUNT(c.id)) AS conversion_rate,
  p.quota_minutes
FROM
  profiles p
LEFT JOIN
  contacts c ON p.user_id = c.user_id
LEFT JOIN
  contacts cl ON p.user_id = cl.user_id
GROUP BY
  p.user_id, p.quota_minutes;

CREATE UNIQUE INDEX ON analytics_kpis (user_id);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_kpis()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_kpis;
  RETURN NULL;
END;
$$;

-- Triggers to refresh the view on data changes
CREATE TRIGGER refresh_on_contact_change
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON contacts
FOR EACH STATEMENT EXECUTE PROCEDURE refresh_analytics_kpis();

CREATE TRIGGER refresh_on_profile_change
AFTER UPDATE OF quota_minutes ON profiles
FOR EACH STATEMENT EXECUTE PROCEDURE refresh_analytics_kpis();
