import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { resetPasswordSchema } from '@/lib/validations/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid' },
        { status: 400 }
      );
    }

    if (user.resetExpiry && user.resetExpiry < new Date()) {
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
        resetToken: null,
        resetExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Anda sekarang dapat login dengan password baru.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat reset password' },
      { status: 500 }
    );
  }
}
