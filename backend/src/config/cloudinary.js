const cloudinary = require('cloudinary').v2;

/**
 * Configure Cloudinary for image and file uploads
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {String} filePath - Path to the file
 * @param {String} folder - Folder name in Cloudinary
 * @returns {Object} Upload result
 */
const uploadToCloudinary = async (filePath, folder = 'chat-app') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Automatically detect file type
    });
    return result;
  } catch (error) {
    throw new Error('File upload failed: ' + error.message);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('File deletion failed:', error.message);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
