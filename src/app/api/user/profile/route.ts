import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/schemas';
import { generateVerificationToken } from '@/lib/utils/helpers';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email/templates';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profileImage: true,
        role: true,
        provider: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil profil' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, phone, email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    let emailChanged = false;
    let verificationToken = null;

    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: 'Email sudah digunakan' },
          { status: 400 }
        );
      }

      emailChanged = true;
      verificationToken = generateVerificationToken();
      const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000);

      const typeParam = user.role === 'TENANT' ? '&type=tenant' : '';
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}${typeParam}`;
      
      await sendEmail({
        to: email,
        subject: 'Verifikasi Email Baru Anda',
        html: getVerificationEmailTemplate(name, verificationUrl),
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        ...(emailChanged && {
          email: email!,
          isVerified: false,
          verificationToken,
          verificationExpiry: new Date(Date.now() + 60 * 60 * 1000),
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profileImage: true,
        role: true,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: emailChanged 
        ? 'Profil berhasil diupdate. Silakan verifikasi email baru Anda.' 
        : 'Profil berhasil diupdate.',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupdate profil' },
      { status: 500 }
    );
  }
}
