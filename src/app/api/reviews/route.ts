import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/lib/validations/schemas';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID wajib diisi' },
        { status: 400 }
      );
    }

    const where: any = { propertyId };

    if (rating) {
      where.rating = parseInt(rating);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          reply: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Hanya user yang dapat membuat review' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = reviewSchema.parse(body);

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Booking tidak dimiliki oleh Anda' },
        { status: 403 }
      );
    }

    // Check if booking is completed (checkout date has passed)
    const now = new Date();
    if (booking.checkOutDate > now) {
      return NextResponse.json(
        { success: false, error: 'Review hanya dapat dibuat setelah checkout' },
        { status: 400 }
      );
    }

    // Check if booking status is CONFIRMED
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'Review hanya dapat dibuat untuk booking yang telah dikonfirmasi' },
        { status: 400 }
      );
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId: validatedData.bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review untuk booking ini sudah dibuat' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        userId: session.user.id,
        propertyId: booking.room.property.id,
        bookingId: validatedData.bookingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Note: Status tetap CONFIRMED karena tidak ada status COMPLETED di enum

    return NextResponse.json({
      success: true,
      message: 'Review berhasil dibuat',
      data: review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Data tidak valid', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat review' },
      { status: 500 }
    );
  }
}
