import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { propertySchema } from '@/lib/validations/schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        rooms: {
          include: {
            peakSeasonRates: {
              where: {
                endDate: {
                  gte: new Date(),
                },
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            reply: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    const avgRating = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: {
        rating: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        averageRating: avgRating._avg.rating || 0,
      },
    });
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    if (property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk mengubah property ini' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, address, city, province, categoryId, latitude, longitude } = validation.data;
    const images = body.images || property.images;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        name,
        description,
        address,
        city,
        province,
        categoryId,
        images,
        latitude,
        longitude,
      },
      include: {
        category: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property berhasil diupdate',
      data: updatedProperty,
    });
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupdate property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    if (property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk menghapus property ini' },
        { status: 403 }
      );
    }

    const activeBookings = await prisma.booking.count({
      where: {
        room: {
          propertyId: id,
        },
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { success: false, error: 'Property tidak dapat dihapus karena masih memiliki booking aktif' },
        { status: 400 }
      );
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Property berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus property' },
      { status: 500 }
    );
  }
}
