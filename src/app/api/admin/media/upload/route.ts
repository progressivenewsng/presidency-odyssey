import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadMultipleImages } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

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
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Upload to Cloudinary
    const uploadResults = await uploadMultipleImages(files, 'presidency-odyssey-media');

    // Save to database with custom names
    const mediaRecords = await Promise.all(uploadResults.map(async (result, index) => {
      const customName = names[index] || files[index].name.split('.')[0];
      
      // Check if media with this publicId already exists
      const existingMedia = await prisma.media.findUnique({
        where: { publicId: result.publicId }
      });

      if (existingMedia) {
        // Update existing media
        return await prisma.media.update({
          where: { publicId: result.publicId },
          data: {
            filename: customName,
            url: result.url,
            size: files[index].size,
            mimeType: files[index].type,
            uploadedBy: session.user?.id,
          }
        });
      }

      // Create new media record
      return prisma.media.create({
        data: {
          url: result.url,
          publicId: result.publicId,
          filename: customName,
          size: files[index].size,
          mimeType: files[index].type,
          uploadedBy: session.user?.email || '',
          userId: session.user?.id || '',
        }
      });
    }));

    return NextResponse.json({ 
      success: true, 
      images: mediaRecords
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}