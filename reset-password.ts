import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'hylmir25@gmail.com';
  const newPassword = 'Test123!'; // Password baru yang mudah diingat
  
  console.log('🔄 Resetting password for:', email);
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log('✅ Password successfully reset!');
  console.log('\n📝 New credentials:');
  console.log('Email:', email);
  console.log('Password:', newPassword);
  console.log('\nYou can now login with these credentials.');
  
  await prisma.$disconnect();
}

resetPassword().catch(console.error);
