import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken } from '@/lib/utils/helpers';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email tidak terdaftar' },
        { status: 400 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }

    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry,
      },
    });

    const typeParam = user.role === 'TENANT' ? '&type=tenant' : '';
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}${typeParam}`;
    
    await sendEmail({
      to: email,
      subject: 'Verifikasi Email Anda',
      html: getVerificationEmailTemplate(user.name, verificationUrl),
    });

    return NextResponse.json({
      success: true,
      message: 'Email verifikasi telah dikirim ulang. Silakan cek email Anda.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengirim ulang email' },
      { status: 500 }
    );
  }
}
