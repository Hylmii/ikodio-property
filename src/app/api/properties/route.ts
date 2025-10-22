import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { propertySchema } from '@/lib/validations/schemas';

// GET all properties with pagination, filter, sort (server-side)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const tenantId = searchParams.get('tenantId') || '';

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          category: true,
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          rooms: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              capacity: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil properties' },
      { status: 500 }
    );
  }
}

// CREATE property (Tenant only)
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
    
    const validation = propertySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, description, address, city, province, categoryId, latitude, longitude } = validation.data;
    const images = body.images || [];

    const property = await prisma.property.create({
      data: {
        name,
        description,
        address,
        city,
        province,
        categoryId,
        tenantId: session.user.id,
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
      message: 'Property berhasil dibuat',
      data: property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat property' },
      { status: 500 }
    );
  }
}
