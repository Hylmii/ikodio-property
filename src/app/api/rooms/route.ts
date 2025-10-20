import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { roomSchema } from '@/lib/validations/schemas';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID wajib diisi' },
        { status: 400 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: { propertyId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            tenantId: true,
          },
        },
        peakSeasonRates: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        basePrice: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil rooms' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const validation = roomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, basePrice, capacity, propertyId } = validation.data;
    const images = body.images || [];

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    if (property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk property ini' },
        { status: 403 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        basePrice,
        capacity,
        propertyId,
        images,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Room berhasil dibuat',
      data: room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat room' },
      { status: 500 }
    );
  }
}
