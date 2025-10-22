import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, checkIn, checkOut } = body;

    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    // Get all rooms for the property
    const rooms = await prisma.room.findMany({
      where: { propertyId },
      select: { id: true },
    });

    const roomIds = rooms.map((r) => r.id);

    // Get all bookings that overlap with the requested dates
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
        OR: [
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
        ],
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
      select: {
        roomId: true,
      },
    });

    // Get IDs of booked rooms
    const bookedRoomIds = overlappingBookings.map((b) => b.roomId);

    // Available rooms are those not in the booked list
    const availableRoomIds = roomIds.filter((id) => !bookedRoomIds.includes(id));

    return NextResponse.json({
      success: true,
      availableRoomIds,
      totalRooms: roomIds.length,
      availableRooms: availableRoomIds.length,
    });
  } catch (error) {
    console.error('Check rooms availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
