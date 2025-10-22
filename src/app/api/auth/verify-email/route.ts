import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setPasswordSchema } from '@/lib/validations/schemas';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [VERIFY GET] Starting verification check...');
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    console.log('🔍 [VERIFY GET] Token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('❌ [VERIFY GET] No token provided');
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    console.log('🔍 [VERIFY GET] Querying database...');
    
    // Add timeout to database query
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    );
    
    const userPromise = prisma.user.findUnique({
      where: { verificationToken: token },
    });

    const user = await Promise.race([userPromise, timeoutPromise]) as any;
    
    console.log('✅ [VERIFY GET] Database query completed');
    console.log('🔍 [VERIFY GET] User found:', !!user);

    if (!user) {
      console.log('❌ [VERIFY GET] User not found with this token');
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    console.log('🔍 [VERIFY GET] User:', user.email, 'Verified:', user.isVerified);

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      console.log('❌ [VERIFY GET] Token expired');
      return NextResponse.json(
        { success: false, error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      console.log('⚠️ [VERIFY GET] User already verified');
      return NextResponse.json(
        { success: false, error: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }

    console.log('✅ [VERIFY GET] Returning success response');
    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ [VERIFY GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memeriksa verifikasi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📝 [VERIFY POST] Starting password set...');
    const body = await req.json();
    const { token, password, confirmPassword } = body;
    console.log('📝 [VERIFY POST] Token:', token?.substring(0, 10) + '...');
    console.log('📝 [VERIFY POST] Password length:', password?.length);

    if (!token) {
      console.log('❌ [VERIFY POST] No token provided');
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    console.log('📝 [VERIFY POST] Validating password...');
    const validation = setPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      console.log('❌ [VERIFY POST] Validation failed:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    console.log('📝 [VERIFY POST] Looking up user by token...');
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      console.log('❌ [VERIFY POST] User not found with token');
      return NextResponse.json(
        { success: false, error: 'Token tidak valid atau sudah digunakan' },
        { status: 400 }
      );
    }

    console.log('✅ [VERIFY POST] User found:', user.email);

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      console.log('❌ [VERIFY POST] Token expired');
      return NextResponse.json(
        { success: false, error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    console.log('📝 [VERIFY POST] Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📝 [VERIFY POST] Updating user in database...');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    console.log('✅ [VERIFY POST] User updated successfully!');
    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
    });
  } catch (error) {
    console.error('❌ [VERIFY POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat verifikasi: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
