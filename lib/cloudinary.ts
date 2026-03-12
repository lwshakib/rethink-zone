import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary with environment variables.
 * Note: Cloudinary configuration is global for the process once called.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

/**
 * Generates a signed upload request for Cloudinary.
 * Used on the server to allow secure client-side uploads.
 */
export function generateCloudinarySignature(
  folder: string = "rethink-zone"
): CloudinarySignature {
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
