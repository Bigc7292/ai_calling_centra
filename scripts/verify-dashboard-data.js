/**
 * Verification script to check if dashboard data is showing correctly
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

console.log('🔍 Verifying Dashboard Data Setup');
console.log('================================');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyDashboardData() {
  try {
    console.log('🧪 Checking if analytics schema is applied...');
    
    // Check if analytics tables exist
    const tablesToCheck = ['campaigns', 'assistants', 'agents', 'calls', 'meetings'];
    let allTablesExist = true;
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count()', { count: 'exact' })
          .limit(1);
        
        if (error && error.message.includes('Could not find the table')) {
          console.log(`❌ Table 'app.${table}' does not exist`);
          allTablesExist = false;
        } else if (error) {
          console.log(`⚠️  Error checking table 'app.${table}': ${error.message}`);
        } else {
          console.log(`✅ Table 'app.${table}' exists`);
        }
      } catch (err) {
        console.log(`⚠️  Exception checking table 'app.${table}': ${err.message}`);
      }
    }
    
    // Check if analytics views exist
    console.log('\n🧪 Checking if analytics views are created...');
    const viewsToCheck = ['daily_metrics', 'campaign_kpis', 'assistant_kpis', 'agent_kpis', 'hourly_metrics', 'geo_meetings'];
    let allViewsExist = true;
    
    for (const view of viewsToCheck) {
      try {
        const { data, error } = await supabase
          .from(view)
          .select('count()', { count: 'exact' })
          .limit(1);
        
        if (error && error.message.includes('Could not find the table')) {
          console.log(`❌ View 'app.${view}' does not exist`);
          allViewsExist = false;
        } else if (error) {
          console.log(`⚠️  Error checking view 'app.${view}': ${error.message}`);
        } else {
          console.log(`✅ View 'app.${view}' exists`);
        }
      } catch (err) {
        console.log(`⚠️  Exception checking view 'app.${view}': ${err.message}`);
      }
    }
    
    // Check if sample data exists
    console.log('\n🧪 Checking if sample data is populated...');
    try {
      const { count, error } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`⚠️  Error counting calls: ${error.message}`);
      } else if (count > 0) {
        console.log(`✅ Sample data exists (${count} calls found)`);
      } else {
        console.log('⚠️  No sample data found in calls table');
      }
    } catch (err) {
      console.log(`⚠️  Exception counting calls: ${err.message}`);
    }
    
    // Summary
    console.log('\n📋 Verification Summary:');
    console.log('======================');
    console.log(`Tables: ${allTablesExist ? '✅ All exist' : '❌ Some missing'}`);
    console.log(`Views: ${allViewsExist ? '✅ All exist' : '❌ Some missing'}`);
    
    if (allTablesExist && allViewsExist) {
      console.log('\n🎉 Analytics schema is properly applied!');
      console.log('🔄 Next steps:');
      console.log('1. Restart your development server: pnpm dev:all');
      console.log('2. Open http://localhost:3000/dashboard');
      console.log('3. You should now see real data in all charts and tables');
    } else {
      console.log('\n❌ Analytics schema is not fully applied');
      console.log('🔧 Please follow these steps:');
      console.log('1. Open your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Load and execute: supabase/analytics-schema.sql');
      console.log('4. Run this verification script again');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  verifyDashboardData().then(() => {
    console.log('\n✅ Dashboard data verification completed');
  }).catch(err => {
    console.error('❌ Error:', err.message);
  });
}

module.exports = { verifyDashboardData };