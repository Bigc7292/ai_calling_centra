# 📊 Analytics Setup Guide

## Overview

This guide will help you set up the analytics dashboard to display real data from your Supabase database instead of mock data. The dashboard tracks calls, meetings, campaigns, and performance metrics.

## 🚨 Current Issue

The analytics dashboard is currently showing empty charts because:
- Analytics routes are querying database views that don't exist yet
- No sample data exists in the database
- The analytics tables (campaigns, calls, meetings, etc.) haven't been created

## 🔧 Solution

### Step 1: Apply Analytics Schema

1. **Open Supabase SQL Editor**:
   - Go to your Supabase dashboard: https://supabase.com/dashboard
   - Navigate to your project: `irfegiqnudhmimhgxkay`
   - Click on "SQL Editor" in the left sidebar

2. **Copy and Run Schema**:
   - Open the file: `supabase/analytics-schema.sql`
   - Copy ALL the contents (it's about 250 lines)
   - Paste into the Supabase SQL Editor
   - Click "Run" to execute

### Step 2: Verify Tables Created

After running the schema, these tables should exist:
- `app.campaigns` - Marketing campaigns
- `app.assistants` - AI assistants
- `app.agents` - Human agents  
- `app.calls` - Call records
- `app.meetings` - Scheduled meetings

And these views:
- `app.daily_metrics` - Daily performance data
- `app.campaign_kpis` - Campaign performance
- `app.assistant_kpis` - AI assistant metrics
- `app.agent_kpis` - Agent performance
- `app.hourly_metrics` - Hourly call patterns
- `app.geo_meetings` - Geographic meeting data

### Step 3: Verify Sample Data

The schema includes 500 sample calls and related data for tenant ID:
`40ba815c-114b-4965-99e2-31df659d6667`

This should match your user's tenant ID. To verify, run in SQL Editor:
```sql
SELECT * FROM app.tenants;
SELECT * FROM app.tenant_members WHERE user_id = auth.uid();
```

### Step 4: Restart Application

After applying the schema:
1. Stop your development server (Ctrl+C)
2. Restart: `pnpm dev:all`
3. Open: http://localhost:3000/dashboard

## 📈 What You Should See

After setup, the dashboard should display:

### Daily Activity Chart
- Real call volume over the last 30 days
- Meeting bookings and answer rates
- Cost tracking

### Campaign Performance
- "Q4 Sales Outreach" 
- "Holiday Promotions"
- "Customer Retention"

### Assistant Performance
- "Sales Assistant Alpha"
- "Customer Success Bot" 
- "Lead Qualifier Pro"

### Agent Leaderboard
- John Smith
- Sarah Johnson
- Mike Davis

### Geographic Map
- Meeting locations across various cities
- Real latitude/longitude coordinates

## 🔍 Troubleshooting

### Charts Still Empty?

1. **Check Tenant ID Match**:
   ```sql
   SELECT id FROM app.tenants WHERE name = 'AI Calling Center';
   ```
   
2. **Verify Sample Data**:
   ```sql
   SELECT COUNT(*) FROM app.calls WHERE tenant_id = 'your-tenant-id';
   ```

3. **Check View Permissions**:
   ```sql
   SELECT * FROM app.daily_metrics LIMIT 5;
   ```

### API Errors?

Check the browser console and server logs for:
- Database connection errors
- Permission denied errors
- Missing environment variables

### Wrong Tenant ID?

If your tenant ID is different, update the sample data:
1. Find your tenant ID from the tenants table
2. Replace `40ba815c-114b-4965-99e2-31df659d6667` in the schema
3. Re-run the INSERT statements

## 🎯 Key Files Modified

- `services/core-api/src/routes/analytics.ts` - Updated to query real database views
- `supabase/analytics-schema.sql` - Complete analytics schema with sample data
- `scripts/mcp-setup-analytics.js` - Setup helper script

## 🔐 Security Notes

- All tables have Row Level Security (RLS) enabled
- Data is isolated by tenant_id
- Service role has SELECT permissions only
- Views respect tenant permissions

## ✅ Success Criteria

After successful setup:
- Dashboard shows real data instead of empty charts
- All KPI numbers are non-zero
- Geographic map shows meeting pins
- Performance trends reflect the sample data

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs for SQL errors
2. Verify environment variables are correct
3. Confirm schema applied successfully
4. Check browser network tab for API errors

The analytics system should now display comprehensive business intelligence data for your AI calling center operations!