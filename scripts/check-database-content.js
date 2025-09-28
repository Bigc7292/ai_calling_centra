#!/usr/bin/env node

/**
 * Script to check database content in Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration from your .env file
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseContent() {
  try {
    console.log('🔍 Checking database content...\n');
    
    // Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: test, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('Table "users" does not exist')) {
      console.log('   ⚠️  Auth users table not directly accessible (expected for security)');
    } else if (testError) {
      console.log('   ❌ Connection error:', testError.message);
      return;
    } else {
      console.log('   ✅ Supabase connection successful');
    }
    
    // Check for analytics tables (based on your project structure)
    console.log('\n2. Checking analytics tables...');
    
    // Check campaigns table
    console.log('   Checking campaigns table...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .limit(5);
    
    if (campaignsError) {
      console.log('   ❌ Error accessing campaigns:', campaignsError.message);
    } else {
      console.log(`   ✅ Found ${campaigns.length} campaigns`);
      if (campaigns.length > 0) {
        console.log('   Sample campaign:', JSON.stringify(campaigns[0], null, 2));
      }
    }
    
    // Check assistants table
    console.log('\n   Checking assistants table...');
    const { data: assistants, error: assistantsError } = await supabase
      .from('assistants')
      .select('*')
      .limit(5);
    
    if (assistantsError) {
      console.log('   ❌ Error accessing assistants:', assistantsError.message);
    } else {
      console.log(`   ✅ Found ${assistants.length} assistants`);
      if (assistants.length > 0) {
        console.log('   Sample assistant:', JSON.stringify(assistants[0], null, 2));
      }
    }
    
    // Check agents table
    console.log('\n   Checking agents table...');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .limit(5);
    
    if (agentsError) {
      console.log('   ❌ Error accessing agents:', agentsError.message);
    } else {
      console.log(`   ✅ Found ${agents.length} agents`);
      if (agents.length > 0) {
        console.log('   Sample agent:', JSON.stringify(agents[0], null, 2));
      }
    }
    
    // Check calls table
    console.log('\n   Checking calls table...');
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('*')
      .limit(5);
    
    if (callsError) {
      console.log('   ❌ Error accessing calls:', callsError.message);
    } else {
      console.log(`   ✅ Found ${calls.length} calls`);
      if (calls.length > 0) {
        console.log('   Sample call:', JSON.stringify(calls[0], null, 2));
      }
    }
    
    // Check meetings table
    console.log('\n   Checking meetings table...');
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
      .limit(5);
    
    if (meetingsError) {
      console.log('   ❌ Error accessing meetings:', meetingsError.message);
    } else {
      console.log(`   ✅ Found ${meetings.length} meetings`);
      if (meetings.length > 0) {
        console.log('   Sample meeting:', JSON.stringify(meetings[0], null, 2));
      }
    }
    
    // Check contacts table (if exists)
    console.log('\n3. Checking contacts table...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5);
    
    if (contactsError) {
      console.log('   ℹ️  Contacts table not found or error:', contactsError.message);
    } else {
      console.log(`   ✅ Found ${contacts.length} contacts`);
      if (contacts.length > 0) {
        console.log('   Sample contact:', JSON.stringify(contacts[0], null, 2));
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('   - If you see data but it\'s not showing in your app, check:');
    console.log('     1. Row Level Security (RLS) policies');
    console.log('     2. User authentication and tenant permissions');
    console.log('     3. Frontend API calls and data fetching');
    console.log('   - If you don\'t see data, you may need to populate the tables');
    
  } catch (error) {
    console.error('❌ Error checking database content:', error.message);
  }
}

checkDatabaseContent();