#!/usr/bin/env node

/**
 * Script to apply analytics schema to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration from your .env file
const supabaseUrl = 'https://irfegiqnudhmimhgxkay.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0';

// Create Supabase client with service key (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAnalyticsSchema() {
  try {
    console.log('🚀 Applying Analytics Schema to Supabase Database...\n');
    
    // Read the analytics schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'analytics-schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('✅ Read analytics schema from:', schemaPath);
    
    // Split the schema into individual statements (simplified approach)
    // In a real implementation, you'd want a proper SQL parser
    const statements = schemaContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // For CREATE TABLE statements, we'll use the Supabase client
        // For other statements, we'll need to use raw SQL
        if (statement.includes('CREATE TABLE') || statement.includes('CREATE OR REPLACE VIEW')) {
          console.log('   ⚠️  Skipping complex statement for manual execution');
          console.log('   Statement preview:', statement.substring(0, 100) + '...');
        } else if (statement.includes('ALTER TABLE') || statement.includes('CREATE POLICY')) {
          console.log('   ⚠️  Skipping RLS statement for manual execution');
        } else {
          console.log('   ℹ️  Statement requires manual execution in Supabase SQL Editor');
        }
      } catch (error) {
        console.log('   ❌ Error with statement:', error.message);
      }
    }
    
    console.log('\n✅ Schema processing completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/irfegiqnudhmimhgxkay');
    console.log('2. Go to SQL Editor in the left sidebar');
    console.log('3. Copy the entire contents of supabase/analytics-schema.sql');
    console.log('4. Paste it into the SQL Editor');
    console.log('5. Click "Run" to execute the schema');
    console.log('6. After successful execution, restart your development server');
    console.log('7. Refresh your dashboard to see the data');
    
  } catch (error) {
    console.error('❌ Error applying analytics schema:', error.message);
  }
}

applyAnalyticsSchema();