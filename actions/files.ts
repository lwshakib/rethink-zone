"use server";

import { s3Service } from "@/services/s3.services";
import { getUser } from "@/actions/user";
import { v4 as uuidv4 } from "uuid";

/**
 * Standard interface for action responses.
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generates a presigned URL for secure client-side uploading to S3/R2.
 * 
 * @param fileName - The original name of the file being uploaded.
 * @param contentType - The MIME type of the file.
 * @returns {Promise<ActionResult<{ uploadUrl: string; key: string }>>}
 */
export async function getPresignedUploadUrlAction(
  fileName: string,
  contentType: string
): Promise<ActionResult<{ uploadUrl: string; key: string }>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const extension = fileName.split(".").pop();
    const key = `workspaces/uploads/${uuidv4()}-${fileName}${
      extension ? "" : ".bin"
    }`;

    const uploadUrl = await s3Service.getPresignedUploadUrl(key, contentType);

    return { success: true, data: { uploadUrl, key } };
  } catch (error) {
    console.error("getPresignedUploadUrlAction failed", error);
    return { success: false, error: "Unable to generate upload URL." };
  }
}

/**
 * Generates a temporary signed URL for viewing a file from S3/R2.
 * 
 * @param key - The S3 path (key) of the object.
 * @returns {Promise<ActionResult<string>>}
 */
export async function getSignedUrlAction(
  key: string
): Promise<ActionResult<string>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (!key.startsWith("workspaces/")) {
      return { success: false, error: "Invalid access key." };
    }

    const signedUrl = await s3Service.getSignedDownloadUrl(key);

    return { success: true, data: signedUrl };
  } catch (error) {
    console.error("getSignedUrlAction failed", error);
    // Return the original key as a fallback (it might be a public URL or already broken)
    return { success: false, error: "Unable to generate signed URL." };
  }
}
