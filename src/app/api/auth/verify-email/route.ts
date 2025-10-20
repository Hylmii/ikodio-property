import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setPasswordSchema } from '@/lib/validations/schemas';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
      },
    });
  } catch (error) {
    console.error('Verification check error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memeriksa verifikasi' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    const validation = setPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token sudah kadaluarsa' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat verifikasi' },
      { status: 500 }
    );
  }
}
