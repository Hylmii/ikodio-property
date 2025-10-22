const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('📋 Checking all users...\n');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verificationToken: true,
        verificationExpiry: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
      console.log(`   Token: ${user.verificationToken || '(none)'}`);
      console.log(`   Token Expiry: ${user.verificationExpiry || '(none)'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
