#!/usr/bin/env node

/**
 * Script to check app schema content in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from your .env file
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAppSchema() {
  try {
    console.log('🔍 Checking app schema content...\n');
    
    // Check if app schema exists by querying information_schema
    console.log('1. Checking if app schema exists...');
    const { data: schemas, error: schemaError } = await supabase
      .from('information_schema.schemata')
      .select('schema_name')
      .eq('schema_name', 'app');
    
    if (schemaError) {
      console.log('   ❌ Error checking schemas:', schemaError.message);
      return;
    }
    
    if (schemas.length === 0) {
      console.log('   ❌ App schema not found');
      return;
    } else {
      console.log('   ✅ App schema exists');
    }
    
    // Check for analytics tables in app schema
    console.log('\n2. Checking analytics tables in app schema...');
    
    // Check campaigns table
    console.log('   Checking app.campaigns table...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('app.campaigns')
      .select('*')
      .limit(5);
    
    if (campaignsError) {
      console.log('   ❌ Error accessing app.campaigns:', campaignsError.message);
    } else {
      console.log(`   ✅ Found ${campaigns.length} campaigns in app schema`);
      if (campaigns.length > 0) {
        console.log('   Sample campaign:', JSON.stringify(campaigns[0], null, 2));
      }
    }
    
    // Check assistants table
    console.log('\n   Checking app.assistants table...');
    const { data: assistants, error: assistantsError } = await supabase
      .from('app.assistants')
      .select('*')
      .limit(5);
    
    if (assistantsError) {
      console.log('   ❌ Error accessing app.assistants:', assistantsError.message);
    } else {
      console.log(`   ✅ Found ${assistants.length} assistants in app schema`);
      if (assistants.length > 0) {
        console.log('   Sample assistant:', JSON.stringify(assistants[0], null, 2));
      }
    }
    
    // Check agents table
    console.log('\n   Checking app.agents table...');
    const { data: agents, error: agentsError } = await supabase
      .from('app.agents')
      .select('*')
      .limit(5);
    
    if (agentsError) {
      console.log('   ❌ Error accessing app.agents:', agentsError.message);
    } else {
      console.log(`   ✅ Found ${agents.length} agents in app schema`);
      if (agents.length > 0) {
        console.log('   Sample agent:', JSON.stringify(agents[0], null, 2));
      }
    }
    
    // Check calls table
    console.log('\n   Checking app.calls table...');
    const { data: calls, error: callsError } = await supabase
      .from('app.calls')
      .select('*')
      .limit(5);
    
    if (callsError) {
      console.log('   ❌ Error accessing app.calls:', callsError.message);
    } else {
      console.log(`   ✅ Found ${calls.length} calls in app schema`);
      if (calls.length > 0) {
        console.log('   Sample call:', JSON.stringify(calls[0], null, 2));
      }
    }
    
    // Check meetings table
    console.log('\n   Checking app.meetings table...');
    const { data: meetings, error: meetingsError } = await supabase
      .from('app.meetings')
      .select('*')
      .limit(5);
    
    if (meetingsError) {
      console.log('   ❌ Error accessing app.meetings:', meetingsError.message);
    } else {
      console.log(`   ✅ Found ${meetings.length} meetings in app schema`);
      if (meetings.length > 0) {
        console.log('   Sample meeting:', JSON.stringify(meetings[0], null, 2));
      }
    }
    
    // Check views
    console.log('\n3. Checking analytics views...');
    
    // Check daily_metrics view
    console.log('   Checking app.daily_metrics view...');
    const { data: dailyMetrics, error: dailyMetricsError } = await supabase
      .from('app.daily_metrics')
      .select('*')
      .limit(5);
    
    if (dailyMetricsError) {
      console.log('   ❌ Error accessing app.daily_metrics:', dailyMetricsError.message);
    } else {
      console.log(`   ✅ Found ${dailyMetrics.length} daily metrics records`);
      if (dailyMetrics.length > 0) {
        console.log('   Sample daily metric:', JSON.stringify(dailyMetrics[0], null, 2));
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('   - If tables exist but data isn\'t showing in your app, check:');
    console.log('     1. Row Level Security (RLS) policies');
    console.log('     2. User authentication and tenant permissions');
    console.log('     3. Frontend API calls are using the correct schema (app.)');
    console.log('   - If tables don\'t exist, you may need to apply the analytics schema');
    
  } catch (error) {
    console.error('❌ Error checking app schema content:', error.message);
  }
}

checkAppSchema();