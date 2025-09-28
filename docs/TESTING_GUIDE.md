# AI Calling Center - Testing Guide

## Overview
This guide provides comprehensive testing procedures for the AI Calling Center application to ensure all components are functioning correctly.

## Backend API Testing

### Health Check
**Endpoint**: `GET /health`
**Expected Response**: `{"ok":true}`
**Status Code**: 200

```bash
curl http://localhost:3001/health
```

### Tenant Bootstrap
**Endpoint**: `POST /tenants/bootstrap`
**Request Body**:
```json
{
  "email": "test@example.com",
  "tenantName": "Test Tenant",
  "password": "SecurePassword123!"
}
```

**Expected Response**:
```json
{
  "tenantId": "uuid",
  "message": "Tenant bootstrapped successfully",
  "userId": "uuid",
  "email": "test@example.com"
}
```

### Authentication
**Endpoint**: `GET /me` (Requires authentication)
**Headers**: `Authorization: Bearer [JWT_TOKEN]`

**Expected Response**:
```json
{
  "user": { /* user object */ },
  "tenantId": "uuid",
  "role": "OWNER|ADMIN|MEMBER"
}
```

### Analytics Endpoints
**Endpoint**: `GET /analytics/daily`
**Headers**: `Authorization: Bearer [JWT_TOKEN]`

**Expected Response**: Daily metrics data

**Endpoint**: `GET /analytics/campaigns`
**Headers**: `Authorization: Bearer [JWT_TOKEN]`

**Expected Response**: Campaign KPIs data

## Frontend Testing

### Signup Flow
1. Navigate to `/signup`
2. Fill in user details
3. Generate wallet
4. Submit form
5. Verify success message

### Login Flow
1. Navigate to `/login`
2. Enter credentials
3. Submit form
4. Verify redirect to dashboard

### Dashboard
1. Verify KPI cards display data
2. Verify charts render correctly
3. Verify map displays data points
4. Verify filters work correctly

### Campaign Creation
1. Navigate to campaign creation page
2. Fill in campaign details
3. Upload leads CSV
4. Configure script
5. Launch campaign
6. Verify campaign appears in list

### Team Management
1. Navigate to team settings
2. Invite new member
3. Change member role
4. Verify permissions update

## Integration Testing

### VAPI Integration
1. Configure VAPI assistant
2. Initiate outbound call
3. Verify webhook receives data
4. Check contact is updated with transcript
5. Verify analytics are updated

### Stripe Integration
1. Navigate to billing page
2. Initiate checkout
3. Complete payment
4. Verify subscription is active
5. Check entitlements are granted

### Gemini API Integration
1. Complete a call
2. Verify transcript is sent to Edge Function
3. Check contact is tagged with analysis
4. Verify sentiment scores are applied

### Supabase MCP Integration
1. Configure MCP client
2. Ask AI assistant about database
3. Verify assistant can query data
4. Check read-only restrictions are enforced

## Database Testing

### RLS Policies
1. Create users in different tenants
2. Verify users can only see their tenant data
3. Test role-based permissions (OWNER, ADMIN, MEMBER)
4. Verify insert/update/delete restrictions

### Data Integrity
1. Create contacts
2. Verify data is stored correctly
3. Update contacts
4. Verify changes are persisted
5. Delete contacts
6. Verify soft delete behavior

## Performance Testing

### Load Testing
1. Run K6 script in `load-test/load-test.js`
2. Monitor response times
3. Check error rates
4. Verify system stability under load

### Stress Testing
1. Simulate high concurrent user load
2. Monitor database performance
3. Check memory usage
4. Verify auto-scaling works

## Security Testing

### Authentication
1. Test invalid credentials
2. Verify account lockout after failed attempts
3. Test session expiration
4. Verify JWT token validation

### Authorization
1. Test role-based access control
2. Verify restricted endpoints cannot be accessed
3. Test data isolation between tenants
4. Verify API rate limiting

### Data Protection
1. Verify PII data is properly hashed
2. Check encryption of sensitive data
3. Verify blockchain audit logging
4. Test data erasure compliance

## Automated Testing

### Unit Tests
Run unit tests with:
```bash
npm run test
```

### End-to-End Tests
Run Playwright tests with:
```bash
npx playwright test
```

### Test Suites
1. **Signup Test**: `tests/signup.test.ts`
2. **Dashboard Test**: `tests/dashboard.test.ts`
3. **Sprint Tests**: `tests/sprint*.test.ts`

## Manual Testing Checklist

### Pre-Deployment
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] User can sign up and log in
- [ ] Database schema is applied
- [ ] RLS policies are working
- [ ] All environment variables are set

### Post-Deployment
- [ ] Application is accessible via domain
- [ ] SSL certificate is valid
- [ ] All integrations are working
- [ ] Monitoring is set up
- [ ] Backup procedures are configured

## Troubleshooting

### Common Issues
1. **API Not Responding**: Check if services are running
2. **Database Connection Failed**: Verify credentials and network access
3. **Authentication Errors**: Check JWT configuration
4. **Missing Environment Variables**: Ensure all required variables are set

### Debugging Tools
1. Browser developer tools for frontend issues
2. Supabase dashboard for database queries
3. Cloud Run logs for backend issues
4. Network tab to inspect API calls

## Reporting Issues
When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Screenshots or logs
4. Environment details
5. Browser/OS information

## Contact
For testing issues or questions, contact the QA team.