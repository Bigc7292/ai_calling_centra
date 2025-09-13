#!/usr/bin/env node

/**
 * Supabase MCP Setup Script for AI Calling Center
 * 
 * This script helps set up the Supabase MCP server integration
 * for drivendatadynamics@gmail.com with full tenant access.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Supabase MCP Setup for AI Calling Center');
console.log('==========================================');
console.log('');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Missing .env file');
  console.log('Please create a .env file based on .env.example with your Supabase credentials');
  console.log('');
  console.log('Required variables:');
  console.log('- SUPABASE_URL=your_supabase_url_here');
  console.log('- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  console.log('');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Missing required environment variables');
  console.log('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Extract project ref from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.log('❌ Could not extract project reference from SUPABASE_URL');
  console.log('Expected format: https://your-project-ref.supabase.co');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 Project Reference: ${projectRef}`);
console.log('');

// Instructions for setting up MCP
console.log('📋 MCP Setup Instructions');
console.log('=========================');
console.log('');
console.log('1. Create a Personal Access Token in your Supabase dashboard:');
console.log('   → Go to https://supabase.com/dashboard/account/tokens');
console.log('   → Click "Generate new token"');
console.log('   → Name it "AI Assistant MCP Server"');
console.log('   → Copy the token (you won\'t see it again)');
console.log('');
console.log('2. Configure your MCP client (Claude Desktop, Cursor, etc.) with this configuration:');
console.log('');

const mcpConfig = {
  mcpServers: {
    supabase: {
      command: "cmd",
      args: [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        `--project-ref=${projectRef}`,
        "--features=account,database,debugging,development,docs,functions"
      ],
      env: {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
};

console.log(JSON.stringify(mcpConfig, null, 2));
console.log('');
console.log('3. Replace "YOUR_PERSONAL_ACCESS_TOKEN_HERE" with your actual token');
console.log('');
console.log('4. For Claude Desktop, add this to:');
console.log('   %APPDATA%\\Claude\\claude_desktop_config.json');
console.log('');
console.log('5. For Cursor, add this to your MCP settings');
console.log('');

// Update the template config file with actual project ref
const configPath = path.join(__dirname, 'mcp-config.json');
const configContent = JSON.stringify(mcpConfig, null, 2);
fs.writeFileSync(configPath, configContent);

console.log('✅ Updated mcp-config.json with your project reference');
console.log('');

// Test MCP server availability
console.log('🧪 Testing MCP Server...');
const { spawn } = require('child_process');

const testProcess = spawn('npx', ['-y', '@supabase/mcp-server-supabase@latest', '--read-only'], {
  stdio: 'pipe',
  shell: true
});

let testOutput = '';
testProcess.stderr.on('data', (data) => {
  testOutput += data.toString();
});

testProcess.on('close', (code) => {
  if (testOutput.includes('Please provide a personal access token')) {
    console.log('✅ MCP Server is available and working');
    console.log('');
    console.log('🎉 Setup Complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Get your Supabase Personal Access Token');
    console.log('2. Configure your MCP client with the configuration above');
    console.log('3. Test the connection by asking your AI assistant about your Supabase project');
    console.log('');
    console.log('💡 For drivendatadynamics@gmail.com to have full access:');
    console.log('   - The user is already set up through your quick-setup script');
    console.log('   - MCP will use your Personal Access Token (which has admin access)');
    console.log('   - The AI assistant will be able to see all tenant data');
  } else {
    console.log('❌ MCP Server test failed');
    console.log('Output:', testOutput);
  }
});

setTimeout(() => {
  testProcess.kill();
}, 3000);