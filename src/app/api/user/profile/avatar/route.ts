import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { avatar } = body;

    if (!avatar) {
      return NextResponse.json(
        { success: false, error: 'Avatar is required' },
        { status: 400 }
      );
    }

    // Check if it's base64
    if (!avatar.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Extract base64 data
    const matches = avatar.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: 'Invalid base64 format' },
        { status: 400 }
      );
    }

    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Check file size (max 1MB)
    if (buffer.length > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 1MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profile');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = join(uploadDir, filename);
    const publicPath = `/uploads/profile/${filename}`;

    // Write file
    await writeFile(filepath, buffer);

    // Update user profile in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        profileImage: publicPath,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Avatar berhasil diupdate',
      data: { profileImage: publicPath },
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupdate avatar' },
      { status: 500 }
    );
  }
}
