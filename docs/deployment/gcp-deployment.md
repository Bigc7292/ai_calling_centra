# Google Cloud Deployment Guide
# Instructions for deploying AI Calling Center to Google Cloud Platform

## Prerequisites

1. **Google Cloud CLI** installed and authenticated
2. **Google Cloud Project** created with billing enabled
3. **Required APIs** enabled:
   - Cloud Build API
   - Cloud Run API
   - Container Registry API
   - App Engine API (for frontend)

## Setup Commands

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable appengine.googleapis.com
```

## Environment Variables Setup

### For Cloud Run (Core API)
Set these in Cloud Console or via CLI:

```bash
# Set environment variables for Cloud Run service
gcloud run services update ai-calling-center-api \
  --set-env-vars="SUPABASE_URL=https://irfegiqnudhmimhgxkay.supabase.co" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" \
  --set-env-vars="WEB_BASE_URL=https://your-frontend-domain.com" \
  --region=us-central1
```

### For App Engine (Frontend)
Set in Google Cloud Console > App Engine > Settings > Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL=https://irfegiqnudhmimhgxkay.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`

## Deployment Commands

### Option 1: Automated Deployment (Recommended)
```bash
# Deploy everything with Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### Option 2: Manual Deployment

#### Deploy Core API to Cloud Run
```bash
# Build and deploy the API
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-calling-center-api services/core-api/

# Deploy to Cloud Run
gcloud run deploy ai-calling-center-api \
  --image gcr.io/YOUR_PROJECT_ID/ai-calling-center-api \
  --platform managed \
  --region us-central1 \
  --port 3001 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

#### Deploy Frontend to App Engine
```bash
# Deploy frontend
cd apps/frontend
gcloud app deploy app.yaml
```

## Post-Deployment Setup

### 1. Configure Custom Domain (Optional)
```bash
# Map custom domain to App Engine
gcloud app domain-mappings create your-domain.com

# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service ai-calling-center-api \
  --domain api.your-domain.com \
  --region us-central1
```

### 2. Set up HTTPS
Both App Engine and Cloud Run automatically provide HTTPS certificates.

### 3. Configure CORS
Update the backend CORS settings to include your production frontend URL.

### 4. Database Setup
- Apply `supabase/schema.sql` to your production Supabase instance
- Run user bootstrap: Update the script to use your production API URL

## Monitoring and Logs

### View Logs
```bash
# Cloud Run logs
gcloud logs tail --service=ai-calling-center-api

# App Engine logs  
gcloud app logs tail
```

### Performance Monitoring
- Enable Cloud Monitoring in Google Cloud Console
- Set up alerts for high CPU/memory usage
- Monitor request latency and error rates

## Scaling Configuration

### Cloud Run Scaling
```bash
# Update scaling settings
gcloud run services update ai-calling-center-api \
  --min-instances=1 \
  --max-instances=10 \
  --cpu=1 \
  --memory=1Gi \
  --region=us-central1
```

### App Engine Scaling
Scaling is configured in `app.yaml` and automatically managed.

## Security Best Practices

1. **Environment Variables**: Never commit secrets to repository
2. **IAM Roles**: Use least privilege principle
3. **VPC**: Consider using VPC for sensitive data
4. **Firewall**: Configure Cloud Armor for DDoS protection

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check that all environment variables are set
   - Verify Dockerfile syntax
   - Ensure sufficient build timeout

2. **Service Not Starting**:
   - Check Cloud Run logs
   - Verify port configuration (3001)
   - Ensure health check endpoint works

3. **Frontend Issues**:
   - Verify Supabase anon key is set
   - Check that API URL is accessible
   - Ensure static files are properly served

### Debug Commands
```bash
# Check service status
gcloud run services describe ai-calling-center-api --region=us-central1

# View recent deployments
gcloud builds list --limit=10

# Test health endpoint
curl https://your-api-url.com/health
```

## Costs Optimization

- **Cloud Run**: Pay per request, scales to zero
- **App Engine**: Consider switching to Cloud Run for better cost control
- **Build**: Use cached builds to reduce build time
- **Storage**: Clean up old container images periodically

## Backup and Recovery

1. **Database**: Supabase handles automatic backups
2. **Code**: GitHub repository serves as backup
3. **Secrets**: Store in Google Secret Manager
4. **Configuration**: Document all settings

---

**Remember**: Update your frontend API URLs to point to the deployed Cloud Run service!