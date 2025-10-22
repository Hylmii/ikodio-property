import { prisma } from './src/lib/prisma';
import { generateVerificationToken } from './src/lib/utils/helpers';

async function refreshExpiredTokens() {
  console.log('🔄 Refreshing expired verification tokens...\n');

  try {
    // Find expired tokens
    const expiredUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        verificationExpiry: {
          lt: new Date(),
        },
      },
    });

    if (expiredUsers.length === 0) {
      console.log('✅ No expired tokens found!\n');
      return;
    }

    console.log(`Found ${expiredUsers.length} expired token(s)\n`);

    for (const user of expiredUsers) {
      const newToken = generateVerificationToken();
      const newExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newToken,
          verificationExpiry: newExpiry,
        },
      });

      console.log(`✅ Refreshed token for: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   New Expiry: ${newExpiry}`);
      console.log(`   🔗 Verification URL:`);
      console.log(`   http://localhost:3000/verify-email?token=${newToken}&type=${user.role.toLowerCase()}\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

refreshExpiredTokens();
