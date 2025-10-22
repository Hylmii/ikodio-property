import { prisma } from './src/lib/prisma';

async function testResendVerification() {
  console.log('🔍 Testing resend verification functionality...\n');

  try {
    // Find an unverified user
    const unverifiedUser = await prisma.user.findFirst({
      where: {
        isVerified: false,
      },
    });

    if (unverifiedUser) {
      console.log('✅ Found unverified user:');
      console.log(`   Email: ${unverifiedUser.email}`);
      console.log(`   Name: ${unverifiedUser.name}`);
      console.log(`   Role: ${unverifiedUser.role}`);
      console.log(`   Verified: ${unverifiedUser.isVerified}`);
      console.log('\n📝 You can test with this email on:');
      console.log('   http://localhost:3000/resend-verification\n');
    } else {
      console.log('ℹ️  No unverified users found in database');
      console.log('   All users are already verified');
      
      // Show verified users
      const verifiedUsers = await prisma.user.findMany({
        take: 3,
        select: {
          email: true,
          name: true,
          isVerified: true,
        },
      });
      
      console.log('\n✅ Verified users:');
      verifiedUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} - ${u.name}`);
      });
    }

    console.log('\n🔗 Access resend verification page:');
    console.log('   http://localhost:3000/resend-verification');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testResendVerification();
