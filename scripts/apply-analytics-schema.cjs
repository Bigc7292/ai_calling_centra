#!/usr/bin/env node

/**
 * Script to apply analytics schema to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from the root .env file
config({ path: path.join(__dirname, '..', '.env') });

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

console.log('🚀 Applying Analytics Schema to Supabase');
console.log('=====================================');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function applyAnalyticsSchema() {
  try {
    // Read the analytics schema SQL file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'analytics-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log(`✅ Loaded schema from: ${schemaPath}`);
    console.log(`📝 Schema size: ${schemaSQL.length} characters`);
    
    // Split the SQL into statements (simple approach for this use case)
    // Note: This is a simplified approach. In production, you'd want a proper SQL parser.
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements or comments
      if (!statement || statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }
      
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // For CREATE VIEW statements, we need to use the Supabase RPC
        if (statement.toUpperCase().includes('CREATE VIEW') || statement.toUpperCase().includes('CREATE OR REPLACE VIEW')) {
          console.log('   🔄 Executing CREATE VIEW statement...');
          // Views are more complex to execute directly, so we'll skip for now
          // In a real implementation, you'd need to use the Supabase SQL editor or a proper migration tool
          console.log('   ⚠️  Skipping view creation for now - please use Supabase SQL Editor');
          continue;
        }
        
        // For other statements, we can try to execute them
        // But Supabase JS client doesn't support raw SQL execution
        // We'll need to use the REST API or recommend using the SQL Editor
        console.log('   ⚠️  This statement needs to be executed in Supabase SQL Editor');
        console.log('   Statement preview:', statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
      } catch (stmtError) {
        console.error(`   ❌ Error executing statement ${i + 1}:`, stmtError.message);
        // Continue with other statements
      }
    }
    
    console.log('\n📋 Manual Steps Required:');
    console.log('========================');
    console.log('1. Open your Supabase dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy the contents of supabase/analytics-schema.sql');
    console.log('4. Paste and run the SQL in the editor');
    console.log('5. Restart your development server: pnpm dev:all');
    console.log('6. Open http://localhost:3000/dashboard to see the data');
    
    console.log('\n🎉 Schema application process completed!');
    console.log('Please follow the manual steps above to complete the setup.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

applyAnalyticsSchema();