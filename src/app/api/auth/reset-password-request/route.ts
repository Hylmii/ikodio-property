import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordRequestSchema } from '@/lib/validations/schemas';
import { generateVerificationToken } from '@/lib/utils/helpers';
import { sendEmail, getResetPasswordEmailTemplate } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = resetPasswordRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email tidak terdaftar' },
        { status: 400 }
      );
    }

    if (user.provider !== 'EMAIL') {
      return NextResponse.json(
        { success: false, error: 'Reset password hanya untuk akun dengan email dan password' },
        { status: 400 }
      );
    }

    const resetToken = generateVerificationToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry,
      },
    });

    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Reset Password Anda',
      html: getResetPasswordEmailTemplate(user.name, resetUrl),
    });

    return NextResponse.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda.',
    });
  } catch (error) {
    console.error('Reset password request error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat meminta reset password' },
      { status: 500 }
    );
  }
}
