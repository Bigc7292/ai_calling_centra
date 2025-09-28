#!/usr/bin/env node

/**
 * Script to verify tenant setup and help with data visibility issues
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from your .env file
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTenantSetup() {
  try {
    console.log('🔍 Verifying Tenant Setup...\n');
    
    // Check if we can access the tenants table
    console.log('1. Checking tenants table...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('app.tenants')
      .select('*')
      .limit(5);
    
    if (tenantsError) {
      console.log('   ❌ Error accessing tenants:', tenantsError.message);
      console.log('   ℹ️  This might be expected if the schema hasn\'t been applied yet');
    } else {
      console.log(`   ✅ Found ${tenants.length} tenants`);
      if (tenants.length > 0) {
        console.log('   Tenant IDs:');
        tenants.forEach(tenant => {
          console.log(`     - ${tenant.id}: ${tenant.name || 'Unnamed tenant'}`);
        });
      }
    }
    
    // Check tenant members
    console.log('\n2. Checking tenant members...');
    const { data: tenantMembers, error: membersError } = await supabase
      .from('app.tenant_members')
      .select('*')
      .limit(5);
    
    if (membersError) {
      console.log('   ❌ Error accessing tenant members:', membersError.message);
    } else {
      console.log(`   ✅ Found ${tenantMembers.length} tenant members`);
      if (tenantMembers.length > 0) {
        console.log('   Tenant memberships:');
        tenantMembers.forEach(member => {
          console.log(`     - User ${member.user_id} belongs to tenant ${member.tenant_id} (role: ${member.role})`);
        });
      }
    }
    
    // Check current user
    console.log('\n3. Checking current user setup...');
    console.log('   To check your specific user information, you would need to:');
    console.log('   1. Sign in to your app first');
    console.log('   2. Check the user ID in the Supabase Authentication dashboard');
    console.log('   3. Verify that user ID has a corresponding entry in tenant_members');
    
    console.log('\n📋 Summary:');
    console.log('   - If you see "table does not exist" errors, you need to apply the schema first');
    console.log('   - The analytics schema creates tables in the "app" schema');
    console.log('   - Row Level Security (RLS) policies ensure users only see their tenant\'s data');
    console.log('   - Make sure your user ID is associated with a tenant in tenant_members table');
    
    console.log('\n🔧 Recommended Actions:');
    console.log('   1. Apply the analytics schema using the Supabase SQL Editor');
    console.log('   2. Run the quick-setup script to verify your tenant association');
    console.log('   3. Restart your development server after schema changes');
    
  } catch (error) {
    console.error('❌ Error verifying tenant setup:', error.message);
  }
}

verifyTenantSetup();