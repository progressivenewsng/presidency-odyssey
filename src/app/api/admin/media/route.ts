import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

// GET method to list images
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const images = await prisma.media.findMany({
      where: search ? {
        filename: {
          contains: search,
          mode: 'insensitive'
        }
      } : {},
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ images });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    // Delete from database
    await prisma.media.delete({
      where: { publicId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const names = formData.getAll('names') as string[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const { uploadMultipleImages } = await import('@/lib/cloudinary');
    const uploadedImages = await uploadMultipleImages(files, 'presidency-odyssey-media');

    // Save to database with custom names, handling duplicates
    const savedImages = await Promise.all(uploadedImages.map(async (img, index) => {
      const customName = names[index] || img.publicId;
      const file = files[index];
      const userId = session.user?.id;
      
      if (!userId) {
        throw new Error('User ID not found in session');
      }
      
      // Check if media with this publicId already exists
      const existingMedia = await prisma.media.findUnique({
        where: { publicId: img.publicId }
      });

      if (existingMedia) {
        // Update existing media instead of creating new
        return await prisma.media.update({
          where: { publicId: img.publicId },
          data: {
            filename: customName,
            url: img.url,
            size: file.size,
            mimeType: file.type,
          }
        });
      }

      // Create new media record
      return await prisma.media.create({
        data: {
          url: img.url,
          publicId: img.publicId,
          filename: customName,
          size: file.size,
          mimeType: file.type,
          uploadedBy: userId,
          user: {
            connect: { id: userId }
          }
        }
      });
    }));

    return NextResponse.json({ images: savedImages });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}