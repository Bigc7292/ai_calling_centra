#!/usr/bin/env node

// Supabase Credential Verification Script
// Verifies all provided credentials match configuration files

console.log("🔍 Verifying all Supabase credentials...\n");

// User-provided credentials
const providedCredentials = {
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MzUxMzMsImV4cCI6MjA3MzExMTEzM30.Y8N5p8xgPwbTJAnO3Ca6JKJckQCljzy4ckriC_iAV0w",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmVnaXFudWRobWltaGd4a2F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUzNTEzMywiZXhwIjoyMDczMTExMTMzfQ.gF2spJ7qN2CA7EL_4XNZeTAwCNnskEqDZp50fwihGJ0",
  publishableKey: "sb_publishable_aJfGJUq2oq5iuwfG8wqcgg_BK8qCswm",
  secretKey: "sb_secret_vu715DdFnkx6RyNvRZnTgA_1M21jZjM",
  accessToken: "sbp_b38877fcb1ff9e7321f1598f0e58ca1eebb1617b",
  projectUrl: "https://irfegiqnudhmimhgxkay.supabase.co"
};

const fs = require('fs');
const path = require('path');

// Read environment files
const rootEnvPath = path.join(__dirname, '..', '.env');
const frontendEnvPath = path.join(__dirname, '..', 'apps', 'frontend', '.env.local');
const mcpConfigPath = path.join(__dirname, '..', 'mcp-config.json');

let rootEnv = {};
let frontendEnv = {};
let mcpConfig = {};

// Parse .env files
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

try {
  rootEnv = parseEnvFile(rootEnvPath);
  frontendEnv = parseEnvFile(frontendEnvPath);
  
  if (fs.existsSync(mcpConfigPath)) {
    mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  }
} catch (error) {
  console.error("❌ Error reading configuration files:", error.message);
  process.exit(1);
}

// Verification checks
const checks = [
  {
    name: "Supabase URL",
    expected: providedCredentials.projectUrl,
    actual: rootEnv.SUPABASE_URL,
    location: "Root .env"
  },
  {
    name: "Frontend Supabase URL",
    expected: providedCredentials.projectUrl,
    actual: frontendEnv.NEXT_PUBLIC_SUPABASE_URL,
    location: "Frontend .env.local"
  },
  {
    name: "Service Role Key",
    expected: providedCredentials.serviceRoleKey,
    actual: rootEnv.SUPABASE_SERVICE_ROLE_KEY,
    location: "Root .env"
  },
  {
    name: "Anon Key",
    expected: providedCredentials.anonKey,
    actual: frontendEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    location: "Frontend .env.local"
  },
  {
    name: "MCP Access Token",
    expected: providedCredentials.accessToken,
    actual: mcpConfig.mcpServers?.supabase?.env?.SUPABASE_ACCESS_TOKEN,
    location: "mcp-config.json"
  },
  {
    name: "Root MCP Access Token",
    expected: providedCredentials.accessToken,
    actual: rootEnv.SUPABASE_ACCESS_TOKEN,
    location: "Root .env"
  }
];

let allValid = true;
const mismatches = [];

console.log("Credential Verification Results:");
console.log("=".repeat(50));

checks.forEach(check => {
  const isValid = check.actual === check.expected;
  const status = isValid ? "✅" : "❌";
  
  console.log(`${status} ${check.name}`);
  console.log(`   Location: ${check.location}`);
  
  if (!isValid) {
    allValid = false;
    mismatches.push(check);
    console.log(`   Expected: ${check.expected}`);
    console.log(`   Actual:   ${check.actual || 'MISSING'}`);
  }
  console.log("");
});

// Additional credential information
console.log("📋 Additional Credentials Provided:");
console.log("=".repeat(50));
console.log(`🔑 Publishable Key: ${providedCredentials.publishableKey}`);
console.log(`🔐 Secret Key: ${providedCredentials.secretKey}`);
console.log("");

if (allValid) {
  console.log("🎉 All credentials are correctly aligned!");
} else {
  console.log(`⚠️  Found ${mismatches.length} mismatched credential(s):`);
  mismatches.forEach(mismatch => {
    console.log(`   - ${mismatch.name} in ${mismatch.location}`);
  });
}

console.log("\n" + "=".repeat(50));
console.log("Verification complete.");