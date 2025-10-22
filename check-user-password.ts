import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function checkPassword() {
  const email = 'hylmir25@gmail.com';
  const testPassword = 'Test123!';
  
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      password: true,
      provider: true,
    },
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:');
  console.log('   Email:', user.email);
  console.log('   Name:', user.name);
  console.log('   Role:', user.role);
  console.log('   Provider:', user.provider);
  console.log('   Verified:', user.isVerified);
  console.log('   Has Password:', !!user.password);
  
  if (user.password) {
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log(`\n🔑 Testing password "${testPassword}":`, isValid ? '✅ VALID' : '❌ INVALID');
    
    if (!isValid) {
      console.log('\n🔄 Resetting password to "Test123!"...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      console.log('✅ Password reset successful!');
      console.log('\n📝 Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', testPassword);
    }
  } else {
    console.log('\n⚠️  User has no password (social login account)');
  }
  
  await prisma.$disconnect();
}

checkPassword();
