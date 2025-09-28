# AI Calling Center - Deployment Guide

## Overview
This guide provides instructions for deploying the AI Calling Center application to production environments, with a focus on Google Cloud Platform as per user preferences.

## Prerequisites
1. Google Cloud Account
2. Supabase Account
3. Domain name (optional but recommended)
4. SSL certificate (optional but recommended)

## Environment Setup

### 1. Supabase Configuration
1. Create a new Supabase project
2. Obtain the following credentials:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWKS_URL`
3. Apply database schema:
   - Run `supabase/schema.sql` in the SQL Editor
   - Run `supabase/analytics-schema.sql` in the SQL Editor
4. Apply RLS policies:
   - Run `supabase/policies/all_rls_updates.sql` in the SQL Editor

### 2. Environment Variables
Create production `.env` files:

**Root `.env` file:**
```env
# Supabase Configuration
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SUPABASE_JWKS_URL=your_production_jwks_url

# Supabase MCP Integration
SUPABASE_ACCESS_TOKEN=your_production_personal_access_token

# Stripe Configuration (if using billing)
STRIPE_SECRET_KEY=your_production_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_production_stripe_webhook_secret

# API Configuration
PORT=3001
WEB_BASE_URL=https://yourdomain.com

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your_gcp_project_id
GOOGLE_CLOUD_REGION=us-central1
```

**Frontend `.env.production` file:**
```env
# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Next.js Configuration
NODE_ENV=production

# API Endpoints
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Google Cloud Deployment

### Option 1: Cloud Run (Recommended)
1. Build the Docker image:
   ```bash
   docker build -t ai-calling-center .
   ```

2. Push to Google Container Registry:
   ```bash
   docker tag ai-calling-center gcr.io/[PROJECT_ID]/ai-calling-center
   docker push gcr.io/[PROJECT_ID]/ai-calling-center
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy ai-calling-center \
     --image gcr.io/[PROJECT_ID]/ai-calling-center \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars SUPABASE_URL=[SUPABASE_URL],SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
   ```

### Option 2: Using Cloud Build
1. Ensure `cloudbuild.yaml` is configured correctly
2. Submit the build:
   ```bash
   gcloud builds submit --config cloudbuild.yaml .
   ```

## User Setup
After deployment, bootstrap the initial user:

```bash
node scripts/quick-setup.js
```

This will create the user `drivendatadynamics@gmail.com` with OWNER role.

## MCP Integration
1. Generate a new Personal Access Token in Supabase dashboard
2. Configure your MCP client (Claude Desktop, Cursor, etc.) with the production configuration
3. Test the integration by asking your AI assistant about your Supabase project

## Domain Configuration
1. Purchase or configure a domain name
2. Set up DNS records to point to your Cloud Run service
3. Configure SSL certificate (Cloud Run provides HTTPS by default)

## Monitoring and Maintenance

### Health Checks
- Monitor `/health` endpoint for backend status
- Set up uptime monitoring for both frontend and backend

### Database Maintenance
- Regular backups of Supabase database
- Monitor RLS policy effectiveness
- Update pg_cron jobs as needed

### Security Updates
- Regularly rotate API keys and secrets
- Monitor Supabase logs for suspicious activity
- Keep dependencies updated

## Troubleshooting

### Common Deployment Issues
1. **Environment Variables Not Set**: Ensure all required variables are configured
2. **Database Connection Failed**: Verify Supabase credentials and network access
3. **Authentication Errors**: Check JWT configuration and JWKS URL
4. **MCP Integration Issues**: Verify Personal Access Token validity

### Logs and Debugging
1. Check Cloud Run logs in Google Cloud Console
2. Review Supabase logs for database issues
3. Check browser console for frontend errors

## Rollback Procedure
If issues occur after deployment:
1. Revert to previous Cloud Run revision
2. Restore Supabase database from backup if needed
3. Reapply environment variables from backup configuration

## Support
For deployment issues, contact the development team or refer to:
- Supabase Documentation: https://supabase.com/docs
- Google Cloud Documentation: https://cloud.google.com/docs
- Next.js Documentation: https://nextjs.org/docs