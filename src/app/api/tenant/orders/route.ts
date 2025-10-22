import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Tenant ID:', session.user.id);

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');
    const search = searchParams.get('search') || '';

    const where: any = {
      tenantId: session.user.id,
    };
    
    console.log('Where clause:', JSON.stringify(where, null, 2));

    if (status) {
      where.status = status;
    }

    if (propertyId) {
      where.room = {
        propertyId,
      };
    }

    if (search) {
      where.bookingNumber = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          room: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);

    console.log('Found orders:', orders.length);
    console.log('Total orders:', total);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tenant orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil orders' },
      { status: 500 }
    );
  }
}
