const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkPassword() {
  console.log('🔍 Checking user password...\n');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'hylmir25@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isVerified: true,
        verificationToken: true,
        role: true,
        provider: true,
      }
    });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('User Info:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Provider:', user.provider);
    console.log('  Verified:', user.isVerified ? '✅' : '❌');
    console.log('  Has Password:', user.password ? '✅' : '❌');
    console.log('  Password Hash:', user.password ? user.password.substring(0, 20) + '...' : '(none)');
    console.log('  Verification Token:', user.verificationToken || '(none)');
    console.log('');
    
    if (!user.password) {
      console.log('❌ NO PASSWORD SET! User cannot login.');
      console.log('   Please complete verification process.');
      return;
    }
    
    if (!user.isVerified) {
      console.log('⚠️  User NOT verified yet!');
      return;
    }
    
    // Test password
    console.log('Testing password validation...');
    console.log('Enter a test password to verify hash: ');
    
    const testPassword = '123456'; // Replace with actual password used
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`Test with '${testPassword}':`, isValid ? '✅ VALID' : '❌ INVALID');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
