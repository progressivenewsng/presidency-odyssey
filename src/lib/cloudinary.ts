import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload function that preserves image extensions
export async function uploadImage(
  file: File | string,
  folder: string = 'news-articles'
): Promise<{ url: string; publicId: string }> {
  try {
    let result;

    if (typeof file === 'string') {
      // Upload from URL (preserves original format)
      result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
        // Preserve original format to avoid extension stripping
        format: 'auto', 
        // Don't apply transformations that change format
        transformation: [],
        // Use eager transformations if needed
        eager: [],
      });
    } else {
      // Upload from File object
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto', // Let Cloudinary detect type
            // Preserve original file format
            format: 'auto',
            // Prevent automatic optimization that strips extensions
            transformation: [],
            // Use filename to preserve extension
            public_id: file.name.split('.')[0],
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

// Upload multiple images (for carousel functionality)
export async function uploadMultipleImages(
  files: File[] | string[],
  folder: string = 'news-articles'
): Promise<{ url: string; publicId: string }[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

// Delete image from Cloudinary
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

// Delete multiple images
export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  const deletePromises = publicIds.map(id => deleteImage(id));
  await Promise.all(deletePromises);
}

// Get optimized image URL (for display)
export function getOptimizedImageUrl(
  publicId: string,
  transformations: Record<string, any> = {}
): string {
  return cloudinary.url(publicId, {
    transformation: transformations,
    fetch_format: 'auto', // Auto-select best format (WebP, AVIF, etc.)
    quality: 'auto', // Auto quality for best compression
  });
}
