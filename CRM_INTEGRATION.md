# CRM Integration Documentation

## Overview
This document explains how the Frappe CRM is integrated with the AI Calling Center application.

## Architecture
The integration consists of two main components:
1. **Frontend Integration**: Links and navigation to the CRM interface
2. **Backend Integration**: API endpoints that proxy requests to the CRM backend

## Frontend Integration
The frontend integration adds a "CRM" link to the main navigation bar, which leads to a dedicated CRM page (`/crm`). This page provides:
- Direct links to the CRM dashboard and leads section
- Integration status monitoring
- Documentation of available API endpoints

## Backend Integration
The backend integration is implemented through the `/api/crm` routes:

### Endpoints
- `GET /api/crm/dashboard` - CRM dashboard information
- `GET /api/crm/leads` - Fetch leads from CRM
- `GET /api/crm/contacts` - Fetch contacts from CRM
- `GET /api/crm/deals` - Fetch deals from CRM

### Implementation
The CRM routes are implemented in `services/core-api/src/routes/crm.ts` and mounted in the main application at `/crm`.

## Setup Instructions
To fully enable the CRM integration:

1. **Start the main application**:
   ```bash
   pnpm dev:all
   ```

2. **Start the Frappe CRM** (when Docker issues are resolved):
   ```bash
   cd codebase_new/top-loader-agent-ai
   docker-compose up -d
   ```

3. **Access the integration**:
   - Main app: http://localhost:3010
   - CRM link in navigation bar
   - CRM API endpoints: http://localhost:3001/api/crm/

## Troubleshooting
If the CRM integration is not working:

1. Check that both applications are running
2. Verify that the CRM is accessible at its expected URL
3. Check the API endpoints for error responses
4. Review the application logs for integration errors

## Future Enhancements
Planned improvements to the integration:
- Single sign-on (SSO) between applications
- Real-time data synchronization
- Enhanced API proxying with authentication
- Embedded CRM components within the main application