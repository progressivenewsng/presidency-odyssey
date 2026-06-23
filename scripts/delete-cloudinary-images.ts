import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteAllImages() {
  try {
    console.log('Fetching all resources from Cloudinary...');
    
    // Get all resources
    const result = await cloudinary.api.resources({
      max_results: 500,
      type: 'upload',
    });

    const resources = result.resources;
    console.log(`Found ${resources.length} resources`);

    if (resources.length === 0) {
      console.log('No images to delete');
      return;
    }

    // Delete each resource
    const publicIds = resources.map((r: any) => r.public_id);
    console.log('Deleting images...');
    
    const deleteResult = await cloudinary.api.delete_resources(publicIds);
    
    console.log(`Successfully deleted ${deleteResult.deleted.length} images`);
    console.log('Failed deletions:', Object.keys(deleteResult.failed).length);
    
    if (Object.keys(deleteResult.failed).length > 0) {
      console.log('Failed to delete:', deleteResult.failed);
    }
  } catch (error) {
    console.error('Error deleting images:', error);
    process.exit(1);
  }
}

deleteAllImages();
