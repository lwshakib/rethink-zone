import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as env from "@/lib/env";
import { v4 as uuidv4 } from "uuid";

const region = env.AWS_REGION || "auto";
const bucket = env.AWS_S3_BUCKET_NAME!;
const endpoint = env.AWS_ENDPOINT;

if ((!region || !bucket) && process.env.NODE_ENV === "production") {
  throw new Error(
    "S3 Configuration error: AWS_REGION and AWS_S3_BUCKET_NAME must be defined in environment variables."
  );
}

const client = new S3Client({
  region: region,
  ...(endpoint && { endpoint: endpoint }),
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Constructs the public URL for an object key.
 */
export function getPublicUrl(key: string): string {
  const baseUrl = endpoint
    ? endpoint.replace(/\/$/, "")
    : `https://${bucket}.s3.${region}.amazonaws.com`;

  return `${baseUrl}/${key}`;
}

/**
 * Universal asset uploader.
 */
export async function uploadAsset({
  buffer,
  folder,
  extension,
  contentType,
}: {
  buffer: Buffer;
  folder: string;
  extension: string;
  contentType: string;
}): Promise<{ url: string; key: string }> {
  const key = `${folder}/${uuidv4()}.${extension}`;
  const url = await uploadBuffer(buffer, key, contentType);
  return { url, key };
}

/**
 * Uploads a buffer directly to the bucket from the server.
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  return getPublicUrl(key);
}

/**
 * Generates a presigned URL for secure client-side uploading.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Generates a signed URL for secure client-side downloading/viewing.
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Deletes an object from the bucket.
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}

/**
 * Direct access to the S3 client instance if needed.
 */
export function getS3Client(): S3Client {
  return client;
}
