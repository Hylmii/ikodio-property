#!/usr/bin/env node

/**
 * Test Email Verification Link
 * Use this to test if verification token is valid
 */

const token = process.argv[2];

if (!token) {
  console.log('Usage: node test-verification.js <token>');
  console.log('Example: node test-verification.js 1cb60fd4f09bf896478289b272014504');
  process.exit(1);
}

console.log('\n🔍 Testing Verification Token...\n');
console.log('Token:', token);
console.log('\n📋 Direct Links to Test:\n');
console.log('For USER:');
console.log('  http://localhost:3000/verify-email?token=' + token);
console.log('\nFor TENANT:');
console.log('  http://localhost:3000/verify-email?token=' + token + '&type=tenant');
console.log('\n💡 Instructions:');
console.log('1. Copy one of the links above');
console.log('2. Paste directly in browser address bar');
console.log('3. Press Enter');
console.log('4. Should load verification page\n');

// Test if server is responding
const http = require('http');

const testUrl = `http://localhost:3000/verify-email?token=${token}`;
console.log('🧪 Testing server response...\n');

http.get(testUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  
  if (res.statusCode === 200) {
    console.log('✅ Server is responding correctly!');
    console.log('\n📝 Next step: Open link in browser to set password');
  } else if (res.statusCode === 302 || res.statusCode === 301) {
    console.log('🔀 Server redirecting to:', res.headers.location);
  } else {
    console.log('⚠️  Unexpected status code');
  }
  
  console.log();
}).on('error', (err) => {
  console.error('❌ Error connecting to server:', err.message);
  console.log('\n⚠️  Make sure the development server is running:');
  console.log('   npm run dev');
  console.log();
});
