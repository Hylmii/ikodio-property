const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Test 1: Simple query
    console.log('Test 1: Connecting to database...');
    const startTime = Date.now();
    
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5s')), 5000)
      )
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Database connected successfully! (${duration}ms)`);
    console.log('Result:', result);
    
    // Test 2: Check users table
    console.log('\nTest 2: Checking users table...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test 3: Find verification token
    console.log('\nTest 3: Looking for verification token...');
    const token = '1cb60fd4f09bf896478289b272014504';
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verificationExpiry: true,
      }
    });
    
    if (user) {
      console.log('✅ User found:', user);
      console.log('Token expired?', user.verificationExpiry && user.verificationExpiry < new Date());
    } else {
      console.log('❌ User with this token not found');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.message.includes('timeout')) {
      console.error('\n⚠️  TIMEOUT ERROR - Railway database might be sleeping or unreachable');
      console.error('   Try: npx prisma db push to wake up the database');
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testConnection();
