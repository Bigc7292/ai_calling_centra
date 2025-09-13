# Supabase MCP Setup for GitHub OAuth Users

## Issue
When you sign up to Supabase using GitHub OAuth, Personal Access Token generation might not be immediately available.

## Solutions (Try in Order)

### Solution 1: Force Access to Token Page
1. Sign into Supabase with GitHub
2. Try these direct URLs:
   - https://supabase.com/dashboard/account/tokens
   - https://app.supabase.com/account/tokens
   - https://supabase.com/dashboard/settings/api-keys

### Solution 2: GitHub Integration Check
1. Go to https://github.com/settings/applications
2. Find "Supabase" in Authorized OAuth Apps
3. Ensure it has full permissions
4. Try revoking and re-authorizing if needed

### Solution 3: Alternative MCP Configuration
If Personal Access Tokens aren't available, use project-level authentication:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=irfegiqnudhmimhgxkay"
      ],
      "env": {
        "SUPABASE_URL": "https://irfegiqnudhmimhgxkay.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key_here"
      }
    }
  }
}
```

### Solution 4: Manual Token Request
Contact Supabase support via:
- Dashboard chat support
- Email: support@supabase.com
- Discord: https://discord.supabase.com

Mention: "GitHub OAuth account needs Personal Access Token access for MCP integration"

## Current Status
- ✅ Service Role Key configured
- ✅ Project ID: irfegiqnudhmimhgxkay  
- ✅ User bootstrapped: drivendatadynamics@gmail.com
- ⚠️  Personal Access Token pending (GitHub OAuth issue)

## Next Steps
1. Try Solution 1 first
2. If that fails, try Solution 2
3. Use Solution 3 as temporary workaround
4. Contact support via Solution 4 if needed