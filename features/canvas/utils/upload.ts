import axios from "axios"; // External library for making HTTP requests

/**
 * Interface representing the standardized response format after a successful media upload to Cloudinary.
 */
export interface CloudinaryUploadResult {
  secureUrl: string; // The HTTPS URL to access the uploaded asset
  publicId: string; // The unique identifier assigned by Cloudinary
  resourceType: string; // Type of resource (e.g., image, video)
}

/**
 * Orchestrates the secure client-side upload of a file to Cloudinary.
 * Uses a two-step process: fetching a signed authorization token from the local backend, 
 * then posting the file directly to Cloudinary's API.
 * 
 * @param file - The Blob or File object to upload.
 * @param onProgress - Optional callback for tracking upload percentage.
 * @param signal - Optional AbortSignal to cancel the pending request.
 */
export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<CloudinaryUploadResult> => {
  // 1. Get the signature from our server-side API to authorize the client-side upload
  const sigRes = await axios.get("/api/cloudinary-signature", { signal });
  
  // Validate successful retrieval of the signature
  if (sigRes.status !== 200) {
    throw new Error("Failed to get upload signature");
  }

  // Destructure authorization parameters returned by the backend
  const signatureData = sigRes.data;
  const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

  // Construct the official Cloudinary upload endpoint for this specific cloud account
  const uploadApi = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  // 2. Prepare FormData to match Cloudinary's required multipart/form-data structure
  const formData = new FormData();
  formData.append("file", file); // The actual binary data
  formData.append("api_key", apiKey); // Public API Key
  formData.append("timestamp", timestamp.toString()); // Backend generated timestamp
  formData.append("signature", signature); // HMAC-SHA signature for security
  if (folder) formData.append("folder", folder); // Optional destination folder

  // 3. Post the file directly to Cloudinary's servers
  const uploadRes = await axios.post(uploadApi, formData, {
    signal, // Pass signal for request cancellation
    onUploadProgress: (progressEvent) => {
      // Calculate and report upload progress percentage if the total size is known
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  // Verify that Cloudinary accepted the file
  if (uploadRes.status !== 200) {
    throw new Error("Cloudinary upload failed");
  }

  // Map Cloudinary's snake_case response to our camelCase interface
  const data = uploadRes.data;
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
};
