import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Komentar balasan wajib diisi' },
        { status: 400 }
      );
    }

    if (comment.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Komentar maksimal 1000 karakter' },
        { status: 400 }
      );
    }

    const review = await getReviewWithProperty(reviewId);

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review tidak ditemukan' },
        { status: 404 }
      );
    }

    validateTenantOwnership(review, session.user.id);

    if (review.reply) {
      return NextResponse.json(
        { success: false, error: 'Review sudah memiliki balasan' },
        { status: 400 }
      );
    }

    const reply = await createReply(reviewId, session.user.id, comment);

    return NextResponse.json({
      success: true,
      message: 'Balasan berhasil ditambahkan',
      data: reply,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menambahkan balasan' },
      { status: 500 }
    );
  }
}

async function getReviewWithProperty(reviewId: string) {
  return await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      property: {
        select: {
          tenantId: true,
        },
      },
      reply: true,
    },
  });
}

function validateTenantOwnership(review: any, tenantId: string) {
  if (review.property.tenantId !== tenantId) {
    throw new ValidationError(
      'Anda tidak memiliki akses untuk review ini',
      403
    );
  }
}

async function createReply(reviewId: string, tenantId: string, comment: string) {
  return await prisma.reviewReply.create({
    data: {
      reviewId,
      tenantId,
      comment: comment.trim(),
    },
  });
}

class ValidationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ValidationError';
  }
}