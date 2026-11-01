import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryStorageService {
  constructor({
    cloudName = process.env.CLOUDINARY_CLOUD_NAME,
    apiKey = process.env.CLOUDINARY_API_KEY,
    apiSecret = process.env.CLOUDINARY_API_SECRET,
    folder = process.env.CLOUDINARY_FOLDER,
  } = {}) {
    this.folder = folder;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
  }

  async upload({ buffer, fileName, mimeType: _mimeType }) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          resource_type: 'auto',
          filename_override: fileName,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            storageKey: result.public_id,
            url: result.secure_url || result.url,
            bytes: result.bytes,
            format: result.format,
            resourceType: result.resource_type,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  async delete(storageKey, options = {}) {
    return cloudinary.uploader.destroy(storageKey, options);
  }

  getUrl(storageKey, options = {}) {
    return cloudinary.url(storageKey, {
      secure: true,
      ...options,
    });
  }
}
