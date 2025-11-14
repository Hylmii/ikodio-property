import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email/templates';
import { getToken } from 'next-auth/jwt';

// GET - Fetch all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Get JWT token from request
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log('🔍 Admin API - Token:', token);
    console.log('🔍 Admin API - Role:', token?.role);

    if (!token || token.role !== 'ADMIN') {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        provider: true,
        createdAt: true,
        phone: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT - Update user (verify/unverify/reset password)
export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing userId or action' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'verify':
        await prisma.user.update({
          where: { id: userId },
          data: { isVerified: true },
        });
        return NextResponse.json({
          success: true,
          message: 'User berhasil diverifikasi',
        });

      case 'unverify':
        await prisma.user.update({
          where: { id: userId },
          data: { isVerified: false },
        });
        return NextResponse.json({
          success: true,
          message: 'Verifikasi user berhasil dicabut',
        });

      case 'reset':
        // Generate random password
        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        // Send email with new password
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .password-box { background: white; border: 2px dashed #2563eb; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
              .password { font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset</h1>
              </div>
              <div class="content">
                <p>Halo ${user.name},</p>
                <p>Password Anda telah direset oleh administrator. Berikut adalah password baru Anda:</p>
                
                <div class="password-box">
                  <div class="password">${newPassword}</div>
                </div>

                <div class="warning">
                  <strong>⚠️ Penting:</strong> Segera ganti password Anda setelah login untuk keamanan akun Anda.
                </div>

                <p>Anda dapat login menggunakan password baru ini di:</p>
                <p><strong>${process.env.APP_URL}/${user.role === 'TENANT' ? 'login-tenant' : 'login-user'}</strong></p>

                <p>Jika Anda tidak meminta reset password, segera hubungi administrator.</p>

                <p>Terima kasih,<br>${process.env.APP_NAME || 'Ikodio Property'}</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendEmail({
          to: user.email,
          subject: 'Password Reset - Ikodio Property',
          html: emailHtml,
        });

        return NextResponse.json({
          success: true,
          message: `Password berhasil direset. Password baru telah dikirim ke ${user.email}`,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete related records first
    await prisma.$transaction(async (tx) => {
      // Delete user's bookings
      await tx.booking.deleteMany({
        where: { userId },
      });

      // Delete user's reviews
      await tx.review.deleteMany({
        where: { userId },
      });

      // If tenant, delete their properties
      if (user.role === 'TENANT') {
        // First delete all related records for each property
        const properties = await tx.property.findMany({
          where: { tenantId: userId },
          select: { id: true },
        });

        for (const property of properties) {
          // Delete rooms and their related data
          const rooms = await tx.room.findMany({
            where: { propertyId: property.id },
            select: { id: true },
          });

          for (const room of rooms) {
            await tx.booking.deleteMany({ where: { roomId: room.id } });
            await tx.peakSeasonRate.deleteMany({ where: { roomId: room.id } });
          }

          await tx.room.deleteMany({ where: { propertyId: property.id } });
          await tx.review.deleteMany({ where: { propertyId: property.id } });
        }

        // Finally delete properties
        await tx.property.deleteMany({
          where: { tenantId: userId },
        });
      }

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus beserta semua data terkait',
    });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user. User mungkin memiliki data yang masih terkait.' },
      { status: 500 }
    );
  }
}
