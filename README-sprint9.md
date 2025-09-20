# AI Calling Center - Sprint 9: Gemini Insights & Compliance Alerts

This document outlines the implementation of Sprint 9, focusing on the AI-driven Insights Engine and the automated Compliance Alerts system.

## 1. pg_cron Setup (for Insights)

To enable the weekly insights generation, you need to set up a cron job in your Supabase project:

```sql
SELECT cron.schedule('weekly-insights', '0 0 * * 0', 'SELECT net.http_post(url:="https://<your-app-url>/api/cron/generate-insights", headers:=jsonb_build_object("Authorization", "Bearer <your-cron-auth-token>"))');
```

## 2. Compliance Flow

The DNC violation monitor is an Edge Function triggered by updates to the `contacts` table. To test:

1.  Manually set a contact's status to `dnc`.
2.  Simulate a call to that contact.
3.  Check the `compliance_alerts` table for a new entry.
4.  Verify that a real-time alert is displayed on the dashboard.

## 3. End-to-End Testing

-   **Insights:** Trigger the cron job manually and verify that a new insight is generated and displayed on the dashboard.
-   **Compliance:** Follow the compliance flow above to test the DNC violation alerts.
