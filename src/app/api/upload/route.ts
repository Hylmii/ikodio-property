import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { isValidImageType, isValidFileSize } from '@/lib/utils/helpers';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' | 'property' | 'room' | 'payment'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File wajib diupload' },
        { status: 400 }
      );
    }

    if (!isValidImageType(file.name)) {
      return NextResponse.json(
        { success: false, error: 'File harus berupa gambar (jpg, jpeg, png, gif)' },
        { status: 400 }
      );
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '1048576');
    if (!isValidFileSize(file.size, maxSize)) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 1MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', type || 'general');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Sanitize filename: remove spaces and special chars
    const sanitizedName = file.name
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9.-]/g, '') // Remove special characters
      .toLowerCase();

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${sanitizedName}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${type || 'general'}/${filename}`;

    if (type === 'profile') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          profileImage: url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'File berhasil diupload',
      data: {
        url,
        filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupload file' },
      { status: 500 }
    );
  }
}
