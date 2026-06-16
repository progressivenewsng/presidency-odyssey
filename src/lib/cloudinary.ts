import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Log configuration to verify
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  has_api_key: !!process.env.CLOUDINARY_API_KEY,
  has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
});

export async function uploadMultipleImages(
  files: File[] | string[],
  folder: string = 'news-articles'
): Promise<{ url: string; publicId: string }[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder));
  return Promise.all(uploadPromises);
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  await Promise.all(publicIds.map(id => deleteImage(id)));
}

// Upload function that preserves image extensions
export async function uploadImage(
  file: File | string,
  folder: string = 'news-articles'
): Promise<{ url: string; publicId: string }> {
  try {
    console.log('Uploading image:', typeof file === 'string' ? 'URL' : file.name);
    
    let result: any;

    if (typeof file === 'string') {
      // Upload from URL
      result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
      });
    } else {
      // Upload from File object
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: file.name.split('.')[0],
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary stream error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });
    }

    console.log('Upload successful:', result);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error details:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}