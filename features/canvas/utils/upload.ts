import axios from "axios";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
}

export const uploadFileToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<CloudinaryUploadResult> => {
  // 1. Get the signature from our API
  const sigRes = await axios.get("/api/cloudinary-signature", { signal });
  
  if (sigRes.status !== 200) {
    throw new Error("Failed to get upload signature");
  }

  const signatureData = sigRes.data;
  const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

  const uploadApi = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  if (folder) formData.append("folder", folder);

  // 3. Upload to Cloudinary
  const uploadRes = await axios.post(uploadApi, formData, {
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  if (uploadRes.status !== 200) {
    throw new Error("Cloudinary upload failed");
  }

  const data = uploadRes.data;
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
  };
};
