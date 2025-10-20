import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { reviewReplySchema } from '@/lib/validations/schemas';
import { z } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Hanya tenant yang dapat membalas review' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = reviewReplySchema.parse(body);

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        property: {
          select: {
            id: true,
            tenantId: true,
          },
        },
        reply: true,
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if property belongs to tenant
    if (review.property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Property tidak dimiliki oleh Anda' },
        { status: 403 }
      );
    }

    // Check if reply already exists
    if (review.reply) {
      return NextResponse.json(
        { success: false, error: 'Review ini sudah memiliki balasan' },
        { status: 400 }
      );
    }

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        comment: validatedData.comment,
        reviewId: params.id,
        tenantId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Balasan review berhasil dibuat',
      data: reply,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create review reply error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat balasan review' },
      { status: 500 }
    );
  }
}
