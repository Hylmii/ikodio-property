import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isValidImageType, isValidFileSize } from '@/lib/utils/helpers';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Upload bukti pembayaran hanya untuk pengguna (user)' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk booking ini' },
        { status: 403 }
      );
    }

    if (booking.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'Booking ini tidak dalam status menunggu pembayaran' },
        { status: 400 }
      );
    }

    if (booking.paymentDeadline < new Date()) {
      await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'PAYMENT_TIMEOUT',
        },
      });

      return NextResponse.json(
        { success: false, error: 'Booking sudah kadaluarsa. Waktu pembayaran telah habis.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File bukti pembayaran wajib diupload' },
        { status: 400 }
      );
    }

    if (!isValidImageType(file.name)) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa gambar (jpg, jpeg, png, gif)' },
        { status: 400 }
      );
    }

    const maxSize = 1048576; // 1MB
    if (!isValidFileSize(file.size, maxSize)) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 1MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'payment');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const paymentProofUrl = `/uploads/payment/${filename}`;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        paymentProof: paymentProofUrl,
        paymentUploadedAt: new Date(),
        status: 'WAITING_CONFIRMATION',
      },
      include: {
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload. Menunggu konfirmasi dari tenant.',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Upload payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupload bukti pembayaran' },
      { status: 500 }
    );
  }
}
