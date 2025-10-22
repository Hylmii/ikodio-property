import { prisma } from './src/lib/prisma';

async function debugVerifyToken() {
  console.log('🔍 Debugging verification token issues...\n');

  try {
    // Find all unverified users with verification tokens
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        verificationToken: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationToken: true,
        verificationExpiry: true,
        isVerified: true,
        password: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (unverifiedUsers.length === 0) {
      console.log('ℹ️  No unverified users with tokens found\n');
      
      // Check if there are unverified users without tokens
      const usersNoToken = await prisma.user.findMany({
        where: {
          isVerified: false,
          verificationToken: null,
        },
        select: {
          email: true,
          name: true,
          role: true,
        },
      });
      
      if (usersNoToken.length > 0) {
        console.log('⚠️  Found unverified users WITHOUT tokens:');
        usersNoToken.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.email} (${u.role}) - ${u.name}`);
        });
      }
      
      return;
    }

    console.log(`Found ${unverifiedUsers.length} unverified user(s) with tokens:\n`);

    unverifiedUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email} (${user.role})`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Has Password: ${user.password ? 'YES' : 'NO'}`);
      console.log(`   Token: ${user.verificationToken?.substring(0, 20)}...`);
      console.log(`   Token Expires: ${user.verificationExpiry}`);
      
      const now = new Date();
      const isExpired = user.verificationExpiry && user.verificationExpiry < now;
      console.log(`   Is Expired: ${isExpired ? '⚠️  YES' : '✅ NO'}`);
      
      if (user.verificationExpiry) {
        const timeLeft = user.verificationExpiry.getTime() - now.getTime();
        const minutesLeft = Math.floor(timeLeft / 1000 / 60);
        console.log(`   Time Left: ${minutesLeft} minutes`);
      }
      
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   \n   🔗 Verification URL:`);
      console.log(`   http://localhost:3000/verify-email?token=${user.verificationToken}&type=${user.role.toLowerCase()}`);
      console.log('');
    });

    // Test if we can find user by the most recent token
    if (unverifiedUsers.length > 0) {
      const latestUser = unverifiedUsers[0];
      console.log('🧪 Testing token lookup for most recent user...');
      
      const foundUser = await prisma.user.findUnique({
        where: {
          verificationToken: latestUser.verificationToken!,
        },
      });
      
      if (foundUser) {
        console.log('✅ Token lookup successful!');
        console.log(`   Found: ${foundUser.email}`);
      } else {
        console.log('❌ Token lookup failed - user not found by token');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVerifyToken();
