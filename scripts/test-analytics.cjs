#!/usr/bin/env node

/**
 * Test script to verify analytics data in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
config({ path: path.join(__dirname, '..', '.env') });

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

console.log('🔍 Testing Analytics Data Access');
console.log('================================');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('SUPABASE_URL:', env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testAnalytics() {
  try {
    console.log('🧪 Testing daily_metrics view...');
    
    // Test daily metrics view
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_metrics')
      .select('*')
      .limit(5);
    
    if (dailyError) {
      console.error('❌ Error querying daily_metrics:', dailyError.message);
    } else {
      console.log(`✅ daily_metrics view accessible - Found ${dailyData?.length || 0} records`);
      if (dailyData && dailyData.length > 0) {
        console.log('   Sample record:', JSON.stringify(dailyData[0], null, 2));
      }
    }
    
    console.log('\n🧪 Testing campaign_kpis view...');
    
    // Test campaign kpis view
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaign_kpis')
      .select('*')
      .limit(5);
    
    if (campaignError) {
      console.error('❌ Error querying campaign_kpis:', campaignError.message);
    } else {
      console.log(`✅ campaign_kpis view accessible - Found ${campaignData?.length || 0} records`);
      if (campaignData && campaignData.length > 0) {
        console.log('   Sample record:', JSON.stringify(campaignData[0], null, 2));
      }
    }
    
    console.log('\n🧪 Testing calls table...');
    
    // Test calls table
    const { data: callsData, error: callsError } = await supabase
      .from('calls')
      .select('*')
      .limit(5);
    
    if (callsError) {
      console.error('❌ Error querying calls:', callsError.message);
    } else {
      console.log(`✅ calls table accessible - Found ${callsData?.length || 0} records`);
      if (callsData && callsData.length > 0) {
        console.log('   Sample record:', JSON.stringify(callsData[0], null, 2));
      }
    }
    
    console.log('\n🧪 Testing tenant ID...');
    
    // Test tenant members to get tenant ID
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenant_members')
      .select('tenant_id')
      .eq('user_id', 'e0aa393a-c1ee-4305-b893-82b696fe0feb')
      .limit(1);
    
    if (tenantError) {
      console.error('❌ Error querying tenant_members:', tenantError.message);
    } else {
      console.log(`✅ tenant_members accessible - Found ${tenantData?.length || 0} records`);
      if (tenantData && tenantData.length > 0) {
        console.log('   Tenant ID:', tenantData[0].tenant_id);
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testAnalytics();