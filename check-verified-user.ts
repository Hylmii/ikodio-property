import { prisma } from './src/lib/prisma';

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'hylmi.rabbani@binus.ac.id' },
    select: { 
      email: true, 
      isVerified: true, 
      password: true, 
      verificationToken: true,
      role: true,
    }
  });
  
  console.log('✅ User Status:');
  console.log('   Email:', user?.email);
  console.log('   Role:', user?.role);
  console.log('   Verified:', user?.isVerified);
  console.log('   Has Password:', !!user?.password);
  console.log('   Token:', user?.verificationToken || 'null (cleared)');
  
  await prisma.$disconnect();
}

checkUser();
