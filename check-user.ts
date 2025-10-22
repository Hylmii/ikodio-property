import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  console.log('📊 Checking all users in database...\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      provider: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  console.log(`Total users: ${users.length}\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
    console.log(`   Provider: ${user.provider}`);
    console.log(`   Created: ${user.createdAt.toLocaleString()}`);
    console.log('');
  });
  
  const userCount = users.filter(u => u.role === UserRole.USER).length;
  const tenantCount = users.filter(u => u.role === UserRole.TENANT).length;
  const verifiedCount = users.filter(u => u.isVerified).length;
  
  console.log('📈 Statistics:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Tenants: ${tenantCount}`);
  console.log(`   Verified: ${verifiedCount}/${users.length}`);
  
  await prisma.$disconnect();
}

checkAllUsers().catch(console.error);
