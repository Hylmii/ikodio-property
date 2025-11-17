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
    console.log('Fetching property:', id);

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
      console.log('Property not found:', id);
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('Property found, fetching avg rating...');

    const avgRating = await prisma.review.aggregate({
      where: { propertyId: id },
      _avg: {
        rating: true,
      },
    });

    console.log('Property fetch complete:', { id, name: property.name, roomsCount: property.rooms.length });

    return NextResponse.json({
      success: true,
      data: {
        ...property,
        averageRating: avgRating._avg.rating || 0,
        totalReviews: property._count.reviews,
      },
    });
  } catch (error: any) {
    console.error('Get property error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan saat mengambil property',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Updating property:', id);

    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      console.log('Unauthorized PUT attempt - role:', session?.user?.role);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      console.log('Property not found for update:', id);
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    if (property.tenantId !== session.user.id) {
      console.log('Forbidden: User does not own property');
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk mengubah property ini' },
        { status: 403 }
      );
    }

    let body;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody.substring(0, 200));
      body = JSON.parse(rawBody);
      console.log('Parsed body keys:', Object.keys(body));
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format in request body' },
        { status: 400 }
      );
    }
    
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error.issues);
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, address, city, province, categoryId, latitude, longitude } = validation.data;
    const images = body.images || property.images;

    console.log('Updating property with data:', {
      name,
      city,
      province,
      categoryId,
      latitude,
      longitude,
      imagesCount: images?.length || 0,
    });

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

    console.log('Property updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Property berhasil diupdate',
      data: updatedProperty,
    });
  } catch (error: any) {
    console.error('Update property error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan saat mengupdate property',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
