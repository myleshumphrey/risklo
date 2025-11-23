#!/usr/bin/env node

/**
 * Quick script to verify Google Sheets API setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking RiskLo Setup...\n');

// Check 1: credentials.json exists
const credsPath = path.join(__dirname, 'server', 'credentials.json');
if (fs.existsSync(credsPath)) {
  console.log('✅ credentials.json found');
  
  try {
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    if (creds.client_email) {
      console.log(`✅ Service account email: ${creds.client_email}`);
      console.log(`\n📋 IMPORTANT: Share your Google Sheet with this email!`);
      console.log(`   Sheet URL: https://docs.google.com/spreadsheets/d/1PCU-1ZjBEkAF1LE3Z1tbajCg3hOBzpKxx--z9QU8sAE/edit`);
      console.log(`   Service account: ${creds.client_email}\n`);
    } else {
      console.log('❌ credentials.json missing client_email');
    }
  } catch (e) {
    console.log('❌ credentials.json is not valid JSON');
  }
} else {
  console.log('❌ credentials.json NOT FOUND');
  console.log('   Location should be: server/credentials.json');
  console.log('   See QUICK_SETUP.md for instructions\n');
}

// Check 2: .env file
const envPath = path.join(__dirname, 'server', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
    console.log('✅ GOOGLE_APPLICATION_CREDENTIALS configured');
  }
} else {
  console.log('⚠️  .env file not found (will use defaults)');
}

// Check 3: Server running
console.log('\n🌐 Testing server connection...');
const http = require('http');
const req = http.get('http://localhost:5000/api/health', (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is running');
    console.log('\n📝 Next steps:');
    console.log('   1. Make sure you shared the Google Sheet with the service account email above');
    console.log('   2. Refresh your browser');
    console.log('   3. Algorithms should appear in the dropdown\n');
  }
});

req.on('error', (e) => {
  console.log('❌ Server is not running');
  console.log('   Start it with: npm run dev\n');
});

req.end();

