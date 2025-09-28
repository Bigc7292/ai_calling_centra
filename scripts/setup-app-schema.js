#!/usr/bin/env node

/**
 * Script to set up the app schema and apply analytics tables in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from your .env file
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAppSchema() {
  try {
    console.log('🚀 Setting up App Schema in Supabase Database...\n');
    
    // First, create the app schema
    console.log('1. Creating app schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE SCHEMA IF NOT EXISTS app;'
    });
    
    if (schemaError) {
      console.log('   ⚠️  Schema creation error (might already exist):', schemaError.message);
    } else {
      console.log('   ✅ App schema created successfully');
    }
    
    // Set the search path for the session
    console.log('\n2. Setting search path...');
    const { error: searchPathError } = await supabase.rpc('exec_sql', {
      sql: 'SET search_path TO app, public;'
    });
    
    if (searchPathError) {
      console.log('   ⚠️  Search path error:', searchPathError.message);
    } else {
      console.log('   ✅ Search path set successfully');
    }
    
    // Create the tenants table first since other tables reference it
    console.log('\n3. Creating tenants table...');
    const { error: tenantsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS app.tenants (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text NOT NULL,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now()
        );
      `
    });
    
    if (tenantsError) {
      console.log('   ⚠️  Tenants table creation error:', tenantsError.message);
    } else {
      console.log('   ✅ Tenants table created successfully');
    }
    
    // Create the tenant_members table
    console.log('\n4. Creating tenant_members table...');
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS app.tenant_members (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
          user_id uuid NOT NULL,
          role text NOT NULL DEFAULT 'member',
          created_at timestamp with time zone DEFAULT now(),
          UNIQUE(tenant_id, user_id)
        );
      `
    });
    
    if (membersError) {
      console.log('   ⚠️  Tenant members table creation error:', membersError.message);
    } else {
      console.log('   ✅ Tenant members table created successfully');
    }
    
    // Create a function to check if user is a member of a tenant
    console.log('\n5. Creating tenant membership function...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION app.is_member(target_tenant_id uuid)
        RETURNS boolean AS $$
        DECLARE
          current_user_id uuid;
        BEGIN
          -- Get the current user ID from JWT claims
          SELECT auth.uid() INTO current_user_id;
          
          -- Check if the user is a member of the target tenant
          RETURN EXISTS (
            SELECT 1 
            FROM app.tenant_members 
            WHERE tenant_id = target_tenant_id 
            AND user_id = current_user_id
          );
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (functionError) {
      console.log('   ⚠️  Function creation error:', functionError.message);
    } else {
      console.log('   ✅ Tenant membership function created successfully');
    }
    
    console.log('\n✅ Basic app schema setup completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay');
    console.log('2. Go to SQL Editor in the left sidebar');
    console.log('3. Copy the contents of supabase/analytics-schema.sql');
    console.log('4. Paste it into the SQL Editor');
    console.log('5. Click "Run" to execute the analytics schema');
    console.log('6. After successful execution, restart your development server');
    console.log('7. Refresh your dashboard to see the data');
    
  } catch (error) {
    console.error('❌ Error setting up app schema:', error.message);
  }
}

setupAppSchema();