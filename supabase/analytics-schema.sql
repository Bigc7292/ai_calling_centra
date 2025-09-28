-- Analytics Schema for AI Calling Center
-- This schema creates tables and views for dashboard analytics

-- Create analytics tables for campaigns, assistants, agents, calls, and meetings

-- Campaigns table
CREATE TABLE IF NOT EXISTS app.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- AI Assistants table
CREATE TABLE IF NOT EXISTS app.assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Human Agents table
CREATE TABLE IF NOT EXISTS app.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  name text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Calls table
CREATE TABLE IF NOT EXISTS app.calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  campaign_id uuid REFERENCES app.campaigns(id),
  assistant_id uuid REFERENCES app.assistants(id),
  agent_id uuid REFERENCES app.agents(id),
  contact_id uuid REFERENCES app.contacts(id),
  phone_number text NOT NULL,
  status text NOT NULL, -- 'completed', 'failed', 'no_answer', 'busy'
  answered boolean DEFAULT false,
  duration_seconds integer DEFAULT 0,
  cost_cents integer DEFAULT 0,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Meetings table (for successful call outcomes)
CREATE TABLE IF NOT EXISTS app.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  call_id uuid NOT NULL REFERENCES app.calls(id),
  agent_id uuid REFERENCES app.agents(id),
  contact_id uuid REFERENCES app.contacts(id),
  title text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  location text, -- could be address, zoom link, etc.
  latitude decimal(10,8),
  longitude decimal(11,8),
  city text,
  country text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on analytics tables
ALTER TABLE app.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.meetings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics tables
CREATE POLICY "Analytics data can be viewed by tenant members" ON app.campaigns
  FOR SELECT USING (public.is_member(tenant_id));

CREATE POLICY "Analytics data can be viewed by tenant members" ON app.assistants
  FOR SELECT USING (public.is_member(tenant_id));

CREATE POLICY "Analytics data can be viewed by tenant members" ON app.agents
  FOR SELECT USING (public.is_member(tenant_id));

CREATE POLICY "Analytics data can be viewed by tenant members" ON app.calls
  FOR SELECT USING (public.is_member(tenant_id));

CREATE POLICY "Analytics data can be viewed by tenant members" ON app.meetings
  FOR SELECT USING (public.is_member(tenant_id));

-- Create analytics views for dashboard queries

-- Daily metrics view
CREATE OR REPLACE VIEW app.daily_metrics AS
SELECT 
  c.tenant_id,
  DATE(c.started_at) as day,
  COUNT(*) as calls_out,
  COUNT(*) FILTER (WHERE c.answered = true) as answered,
  COUNT(DISTINCT m.id) as meetings,
  COALESCE(SUM(c.duration_seconds), 0) as minutes_total,
  COALESCE(SUM(c.cost_cents), 0) / 100.0 as cost_total
FROM app.calls c
LEFT JOIN app.meetings m ON c.id = m.call_id
GROUP BY c.tenant_id, DATE(c.started_at)
ORDER BY day DESC;

-- Campaign KPIs view
CREATE OR REPLACE VIEW app.campaign_kpis AS
SELECT 
  c.id,
  c.name,
  c.tenant_id,
  COUNT(calls.*) as calls_out,
  COUNT(calls.*) FILTER (WHERE calls.answered = true) as answered,
  COUNT(DISTINCT m.id) as meetings,
  COALESCE(SUM(calls.cost_cents), 0) / 100.0 as cost_total,
  CASE 
    WHEN COUNT(DISTINCT m.id) > 0 
    THEN (COALESCE(SUM(calls.cost_cents), 0) / 100.0) / COUNT(DISTINCT m.id)
    ELSE 0
  END as cost_per_meeting
FROM app.campaigns c
LEFT JOIN app.calls calls ON c.id = calls.campaign_id
LEFT JOIN app.meetings m ON calls.id = m.call_id
GROUP BY c.id, c.name, c.tenant_id;

-- Assistant KPIs view
CREATE OR REPLACE VIEW app.assistant_kpis AS
SELECT 
  a.id,
  a.name,
  a.tenant_id,
  COUNT(calls.*) as calls_out,
  COUNT(calls.*) FILTER (WHERE calls.answered = true) as answered,
  COUNT(DISTINCT m.id) as meetings,
  COALESCE(SUM(calls.cost_cents), 0) / 100.0 as cost_total,
  CASE 
    WHEN COUNT(DISTINCT m.id) > 0 
    THEN (COALESCE(SUM(calls.cost_cents), 0) / 100.0) / COUNT(DISTINCT m.id)
    ELSE 0
  END as cost_per_meeting
FROM app.assistants a
LEFT JOIN app.calls calls ON a.id = calls.assistant_id
LEFT JOIN app.meetings m ON calls.id = m.call_id
GROUP BY a.id, a.name, a.tenant_id;

-- Agent KPIs view
CREATE OR REPLACE VIEW app.agent_kpis AS
SELECT 
  a.name as agent,
  a.tenant_id,
  COUNT(calls.*) as calls_out,
  COUNT(calls.*) FILTER (WHERE calls.answered = true) as answered,
  COUNT(DISTINCT m.id) as meetings,
  COALESCE(AVG(calls.duration_seconds), 0)::integer as aht_seconds,
  COALESCE(SUM(calls.cost_cents), 0) / 100.0 as cost_total,
  CASE 
    WHEN COUNT(DISTINCT m.id) > 0 
    THEN (COALESCE(SUM(calls.cost_cents), 0) / 100.0) / COUNT(DISTINCT m.id)
    ELSE 0
  END as cost_per_meeting
FROM app.agents a
LEFT JOIN app.calls calls ON a.id = calls.agent_id
LEFT JOIN app.meetings m ON calls.id = m.call_id
GROUP BY a.id, a.name, a.tenant_id;

-- Hourly metrics view (FIXED: properly qualified tenant_id column)
CREATE OR REPLACE VIEW app.hourly_metrics AS
SELECT 
  c.tenant_id,
  EXTRACT(DOW FROM c.started_at)::integer as dow_local,
  EXTRACT(HOUR FROM c.started_at)::integer as hour_local,
  COUNT(*) as calls_out,
  COUNT(*) FILTER (WHERE c.answered = true) as answered,
  COUNT(DISTINCT m.id) as meetings,
  CASE 
    WHEN COUNT(*) > 0 
    THEN COUNT(*) FILTER (WHERE c.answered = true)::float / COUNT(*)
    ELSE 0
  END as answer_rate,
  CASE 
    WHEN COUNT(*) > 0 
    THEN COUNT(DISTINCT m.id)::float / COUNT(*)
    ELSE 0
  END as meeting_rate
FROM app.calls c
LEFT JOIN app.meetings m ON c.id = m.call_id
GROUP BY c.tenant_id, EXTRACT(DOW FROM c.started_at), EXTRACT(HOUR FROM c.started_at);

-- Geographic meetings view
CREATE OR REPLACE VIEW app.geo_meetings AS
SELECT 
  m.tenant_id,
  latitude as lat,
  longitude as lon,
  city,
  country,
  scheduled_at as starts_at,
  COUNT(*) as meetings
FROM app.meetings m
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY m.tenant_id, latitude, longitude, city, country, scheduled_at;

-- Sample data insertion for tenant_id: '40ba815c-114b-4965-99e2-31df659d6667'
-- Insert sample campaigns
INSERT INTO app.campaigns (id, tenant_id, name, status) VALUES
  ('11111111-1111-1111-1111-111111111111', '40ba815c-114b-4965-99e2-31df659d6667', 'Q4 Sales Outreach', 'active'),
  ('22222222-2222-2222-2222-222222222222', '40ba815c-114b-4965-99e2-31df659d6667', 'Holiday Promotions', 'active'),
  ('33333333-3333-3333-3333-333333333333', '40ba815c-114b-4965-99e2-31df659d6667', 'Customer Retention', 'paused')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assistants
INSERT INTO app.assistants (id, tenant_id, name, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '40ba815c-114b-4965-99e2-31df659d6667', 'Sales Assistant Alpha', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '40ba815c-114b-4965-99e2-31df659d6667', 'Customer Success Bot', 'active'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '40ba815c-114b-4965-99e2-31df659d6667', 'Lead Qualifier Pro', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert sample agents
INSERT INTO app.agents (id, tenant_id, name, email, status) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '40ba815c-114b-4965-99e2-31df659d6667', 'John Smith', 'john.smith@company.com', 'active'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '40ba815c-114b-4965-99e2-31df659d6667', 'Sarah Johnson', 'sarah.johnson@company.com', 'active'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '40ba815c-114b-4965-99e2-31df659d6667', 'Mike Davis', 'mike.davis@company.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Generate sample calls and meetings (500 calls over the last 30 days)
DO $$
DECLARE
  call_record RECORD;
  call_id uuid;
  meeting_id uuid;
  rand_date timestamp with time zone;
  rand_campaign uuid;
  rand_assistant uuid;
  rand_agent uuid;
  rand_contact uuid;
  rand_answered boolean;
  rand_duration integer;
  rand_cost integer;
  cities text[] := ARRAY['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'];
  countries text[] := ARRAY['USA', 'Canada', 'UK', 'Australia', 'Germany'];
  lats numeric[] := ARRAY[40.7128, 34.0522, 41.8781, 29.7604, 33.4484, 39.9526, 29.4241, 32.7157, 32.7767, 30.2672];
  lons numeric[] := ARRAY[-74.0060, -118.2437, -87.6298, -95.3698, -112.0740, -75.1652, -98.4936, -117.1611, -96.7970, -97.7431];
  i integer;
BEGIN
  -- Insert sample calls
  FOR i IN 1..500 LOOP
    call_id := gen_random_uuid();
    rand_date := now() - (random() * interval '30 days');
    
    -- Randomly select campaign, assistant, agent
    rand_campaign := (ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'])[floor(random() * 3 + 1)];
    rand_assistant := (ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc'])[floor(random() * 3 + 1)];
    rand_agent := (ARRAY['dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff'])[floor(random() * 3 + 1)];
    
    -- Random call outcome
    rand_answered := random() < 0.6; -- 60% answer rate
    rand_duration := CASE WHEN rand_answered THEN floor(random() * 300 + 60) ELSE 0 END; -- 1-5 minutes if answered
    rand_cost := floor(random() * 500 + 100); -- $1-6 cost per call
    
    INSERT INTO app.calls (
      id, tenant_id, campaign_id, assistant_id, agent_id, 
      phone_number, status, answered, duration_seconds, cost_cents, 
      started_at, ended_at
    ) VALUES (
      call_id, '40ba815c-114b-4965-99e2-31df659d6667', rand_campaign, rand_assistant, rand_agent,
      '+1' || floor(random() * 9000000000 + 1000000000)::text,
      CASE WHEN rand_answered THEN 'completed' ELSE (ARRAY['no_answer', 'busy', 'failed'])[floor(random() * 3 + 1)] END,
      rand_answered, rand_duration, rand_cost,
      rand_date, rand_date + (rand_duration || ' seconds')::interval
    );
    
    -- Create meetings for 20% of answered calls
    IF rand_answered AND random() < 0.2 THEN
      meeting_id := gen_random_uuid();
      
      INSERT INTO app.meetings (
        id, tenant_id, call_id, agent_id,
        title, scheduled_at, duration_minutes, status,
        city, country, latitude, longitude
      ) VALUES (
        meeting_id, '40ba815c-114b-4965-99e2-31df659d6667', call_id, rand_agent,
        'Sales Meeting #' || i, rand_date + interval '2 days', 30 + floor(random() * 60), 'scheduled',
        cities[floor(random() * array_length(cities, 1) + 1)],
        countries[floor(random() * array_length(countries, 1) + 1)],
        lats[floor(random() * array_length(lats, 1) + 1)] + (random() - 0.5) * 0.1,
        lons[floor(random() * array_length(lons, 1) + 1)] + (random() - 0.5) * 0.1
      );
    END IF;
  END LOOP;
END $$;

-- Grant permissions to service role
GRANT SELECT ON app.campaigns TO service_role;
GRANT SELECT ON app.assistants TO service_role;
GRANT SELECT ON app.agents TO service_role;
GRANT SELECT ON app.calls TO service_role;
GRANT SELECT ON app.meetings TO service_role;
GRANT SELECT ON app.daily_metrics TO service_role;
GRANT SELECT ON app.campaign_kpis TO service_role;
GRANT SELECT ON app.assistant_kpis TO service_role;
GRANT SELECT ON app.agent_kpis TO service_role;
GRANT SELECT ON app.hourly_metrics TO service_role;
GRANT SELECT ON app.geo_meetings TO service_role;