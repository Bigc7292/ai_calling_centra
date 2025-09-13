# 🔧 Authentication Fix & Setup Guide

## 🚀 Quick Fix for drivendatadynamics@gmail.com Login

This guide will help you fix the authentication issues so that `drivendatadynamics@gmail.com` can successfully log into your AI Calling Center application.

## 📋 Prerequisites

1. **Supabase Project**: Make sure you have a Supabase project created
2. **Schema Applied**: Run the `supabase/schema.sql` in your Supabase SQL Editor
3. **Environment Variables**: Configure your environment variables (see below)

## ⚙️ Environment Setup

### 1. Backend Environment (`.env` in root directory)

Create `.env` file in the root directory with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOi...your-service-role-key
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/keys
STRIPE_SECRET_KEY=sk_test_...your-stripe-key (can be test key)
STRIPE_WEBHOOK_SECRET=whsec_...your-webhook-secret
PORT=3001
WEB_BASE_URL=http://localhost:3000
```

### 2. Frontend Environment (`.env.local` in `apps/frontend/`)

Create `.env.local` file in `apps/frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOi...your-anon-key
```

## 🔧 Fixed Issues

### What Was Wrong:
1. Users could sign up in Supabase Auth but weren't getting proper database records
2. Missing entries in `public.users`, `public.profiles`, and `app.tenant_members` tables
3. Authentication middleware was failing because user had no tenant assignment

### What Was Fixed:
1. **Enhanced Bootstrap Endpoint**: `/tenants/bootstrap` now handles user creation automatically
2. **Better Error Handling**: Clear error messages for debugging
3. **User Setup Tools**: Scripts and web interface for easy user management

## 🚀 Setup Methods

### Method 1: Quick Setup Script (Recommended)

1. **Start the application**:
   ```bash
   pnpm dev:all
   ```

2. **Run quick setup**:
   ```bash
   node scripts/quick-setup.js
   ```

This will automatically:
- Create/find the user in Supabase Auth
- Set up all required database records
- Assign them to a tenant with OWNER role

### Method 2: Web Interface

1. **Start the application**:
   ```bash
   pnpm dev:all
   ```

2. **Open setup page**:
   ```
   http://localhost:3001/setup
   ```

3. **Fill in the form**:
   - Email: `drivendatadynamics@gmail.com`
   - Tenant: `AI Calling Center`
   - Password: (if creating new user)

### Method 3: Manual API Call

If you prefer to use your own tools:

```bash
curl -X POST http://localhost:3001/tenants/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "drivendatadynamics@gmail.com",
    "tenantName": "AI Calling Center",
    "password": "YourPassword123!"
  }'
```

## 🔐 Login Credentials

After setup, the user can log in with:
- **Email**: `drivendatadynamics@gmail.com`
- **Password**: The password you provided during setup

## ✅ Verification

After setup, you should see:
- ✅ User exists in Supabase Auth
- ✅ User record in `public.users` table
- ✅ Profile record in `public.profiles` table with `default_tenant_id`
- ✅ Tenant member record in `app.tenant_members` table with OWNER role

## 🔍 Troubleshooting

### If login still fails:

1. **Check API logs**: Look for error messages in the terminal running the API
2. **Verify environment variables**: Make sure all Supabase credentials are correct
3. **Check Supabase Auth**: Go to Supabase dashboard > Authentication > Users
4. **Verify database records**: Check the tables mentioned above

### Common Issues:

- **"No authorization header"**: Frontend can't reach backend API
- **"User profile not found"**: User exists in Auth but missing database records
- **"Not a member of tenant"**: User has profile but no tenant membership

## 📁 New Files Created

The following **new files** were added (your existing code was not modified):

- `scripts/setup-user.js` - User setup script
- `scripts/quick-setup.js` - Quick setup for drivendatadynamics@gmail.com
- `public/setup.html` - Web interface for user setup
- `.env.example` - Backend environment template
- `apps/frontend/.env.local.example` - Frontend environment template
- `AUTH_FIX_README.md` - This guide

## ✨ Enhanced Features

- **Automatic user creation**: No need to manually create users in Supabase
- **Better error messages**: Clear feedback when things go wrong
- **Flexible setup**: Multiple ways to set up users
- **Existing user support**: Works with both new and existing users

---

**Your existing login page and authentication flow remain completely unchanged!**