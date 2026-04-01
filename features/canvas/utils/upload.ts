import axios from "axios";

/**
 * Interface representing the standardized response format after a successful media upload to S3.
 */
export interface S3UploadResult {
  url: string; // The public/accessible URL of the uploaded asset
  key: string; // The unique key (path) in the bucket
}

/**
 * Orchestrates the secure client-side upload of a file to S3/R2.
 * Uses a two-step process: fetching a presigned PUT URL from the local backend,
 * then performing a direct binary upload to the storage provider.
 * 
 * @param file - The File object to upload.
 * @param folder - Destination folder in the bucket (e.g., 'canvas', 'avatars').
 * @param onProgress - Optional callback for tracking upload percentage.
 * @param signal - Optional AbortSignal to cancel the pending request.
 */
export const uploadFileToS3 = async (
  file: File,
  folder: string = "uploads",
  onProgress?: (progress: number) => void,
  signal?: AbortSignal
): Promise<S3UploadResult> => {
  // 1. Get the presigned URL and key from our server-side API
  const prepRes = await axios.post(
    "/api/s3/presigned-url",
    {
      fileName: file.name,
      contentType: file.type,
      folder: folder,
    },
    { signal }
  );

  if (prepRes.status !== 200) {
    throw new Error("Failed to get presigned upload URL.");
  }

  const { url, key } = prepRes.data;

  // 2. Perform the direct binary upload to S3/R2 using the PUT method
  await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return { url, key };
};
