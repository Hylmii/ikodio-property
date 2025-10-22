import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'hylmir25@gmail.com'; // Email dari screenshot Anda
  
  console.log('🔍 Checking user in database...');
  console.log('Email:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    console.log('❌ User not found in database');
    return;
  }
  
  console.log('\n✅ User found:');
  console.log('ID:', user.id);
  console.log('Name:', user.name);
  console.log('Email:', user.email);
  console.log('Role:', user.role);
  console.log('Is Verified:', user.isVerified);
  console.log('Has Password:', !!user.password);
  console.log('Provider:', user.provider);
  
  if (user.role !== UserRole.USER) {
    console.log('\n⚠️  Warning: User role is', user.role, 'not USER');
  }
  
  if (!user.isVerified) {
    console.log('\n❌ User is NOT verified!');
    console.log('Please verify email first');
  }
  
  if (!user.password) {
    console.log('\n❌ User has no password (social login only)');
  }
  
  // Test password
  if (user.password) {
    const testPasswords = ['password123', '123456', 'test123'];
    console.log('\n🔑 Testing common passwords...');
    
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`Testing "${pwd}":`, isValid ? '✅ Match' : '❌ No match');
    }
  }
  
  await prisma.$disconnect();
}

testLogin().catch(console.error);
