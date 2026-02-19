import cloudinary from '../config/cloudinary.js';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  return name && key && !name.includes('your-') && !key.includes('your-');
};

export const uploadToCloudinary = async (filePath, folder = 'exam-verify/students') => {
  // If Cloudinary is not configured, keep file locally and return local path
  if (!isCloudinaryConfigured()) {
    logger.warn('Cloudinary not configured — storing photo locally');
    const filename = path.basename(filePath);
    return {
      success: true,
      url: `/uploads/temp/${filename}`,
      publicId: `local_${filename}`,
    };
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    await fs.unlink(filePath);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);

    // Fallback: keep file locally instead of failing
    const filename = path.basename(filePath);
    logger.warn('Falling back to local storage for photo');
    return {
      success: true,
      url: `/uploads/temp/${filename}`,
      publicId: `local_${filename}`,
    };
  }
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.startsWith('local_')) {
    return { success: true };
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};
