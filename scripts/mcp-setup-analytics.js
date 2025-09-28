#!/usr/bin/env node

/**
 * MCP Analytics Setup Script
 * Provides instructions for setting up analytics tables using Supabase MCP
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 AI Calling Center - Analytics Setup via MCP');
console.log('==============================================');
console.log('');

// Read the analytics schema
try {
  const schemaPath = path.join(__dirname, '..', 'supabase', 'analytics-schema.sql');
  const schemaContent = readFileSync(schemaPath, 'utf8');
  
  console.log('📊 Analytics Schema Ready');
  console.log('========================');
  console.log('');
  console.log('The analytics schema file has been created at:');
  console.log(`📁 ${schemaPath}`);
  console.log('');
  
  console.log('🔧 Setup Instructions');
  console.log('=====================');
  console.log('');
  console.log('Option 1 - Using Supabase SQL Editor (Recommended):');
  console.log('1. Open your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy the contents of supabase/analytics-schema.sql');
  console.log('4. Paste and run the SQL in the editor');
  console.log('');
  
  console.log('Option 2 - Using MCP (if available):');
  console.log('Ask your AI assistant with Supabase MCP:');
  console.log('"Apply the analytics schema from supabase/analytics-schema.sql to my database"');
  console.log('');
  
  console.log('📈 What This Schema Creates:');
  console.log('===========================');
  console.log('✅ Tables: campaigns, assistants, agents, calls, meetings');
  console.log('✅ Views: daily_metrics, campaign_kpis, assistant_kpis, agent_kpis, hourly_metrics, geo_meetings');
  console.log('✅ Sample Data: 500 sample calls, 3 campaigns, 3 assistants, 3 agents');
  console.log('✅ RLS Policies: Secure tenant isolation');
  console.log('');
  
  console.log('🎯 Your Tenant ID:');
  console.log('==================');
  console.log('The sample data is generated for tenant ID:');
  console.log('40ba815c-114b-4965-99e2-31df659d6667');
  console.log('');
  console.log('This should match your user account. If not, update the tenant ID in:');
  console.log('- The analytics-schema.sql file');
  console.log('- Or run scripts/quick-setup.js to verify your tenant ID');
  console.log('');
  
  console.log('🔄 After Schema Setup:');
  console.log('======================');
  console.log('1. Restart your development server: pnpm dev:all');
  console.log('2. Open http://localhost:3000/dashboard');
  console.log('3. Verify that charts show real data instead of being empty');
  console.log('');
  
  console.log('🐛 Troubleshooting:');
  console.log('===================');
  console.log('- If views return empty: Check that your tenant ID matches the sample data');
  console.log('- If tables exist: The schema includes ON CONFLICT DO NOTHING clauses');
  console.log('- If permissions error: Ensure service role key is correct in .env');
  console.log('');
  
  console.log('🎉 Ready to Apply Schema!');
  console.log('You can now copy the SQL from supabase/analytics-schema.sql');
  console.log('and run it in your Supabase SQL Editor.');
  
} catch (error) {
  console.error('❌ Error reading analytics schema file:', error.message);
  console.log('');
  console.log('Make sure the analytics-schema.sql file exists at:');
  console.log('supabase/analytics-schema.sql');
}