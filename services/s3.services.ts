import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as env from "@/lib/env";
import { v4 as uuidv4 } from "uuid";

/**
 * AWS S3 / Cloudflare R2 Service Class
 * Handles all direct and server-side interactions with the storage bucket.
 *
 * Synchronized with storage standards.
 */
export class S3Service {
  private client: S3Client;
  private bucket: string;
  private region: string;
  private endpoint?: string;

  constructor() {
    this.region = env.AWS_REGION!;
    this.bucket = env.AWS_S3_BUCKET_NAME!;
    this.endpoint = env.AWS_ENDPOINT;

    if (!this.region || !this.bucket) {
      // Allow soft failure in development if variables are missing
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "S3 Configuration error: AWS_REGION and AWS_S3_BUCKET_NAME must be defined in environment variables."
        );
      } else {
        console.warn(
          "S3 Service: Configuration variables are missing. Some features may not work."
        );
      }
    }

    this.client = new S3Client({
      region: this.region || "auto",
      ...(this.endpoint && { endpoint: this.endpoint }),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Constructs the public URL for an object key.
   *
   * @param key - The destination path (key) in the bucket.
   * @returns The public URL of the object.
   */
  getPublicUrl(key: string): string {
    const baseUrl = this.endpoint
      ? this.endpoint.replace(/\/$/, "")
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    return `${baseUrl}/${key}`;
  }

  /**
   * Universal asset uploader.
   * Generates a unique key with the bucket prefix and uploads the buffer.
   *
   * @param buffer - File content.
   * @param folder - Destination folder (audio, images, etc).
   * @param extension - File extension without dot (mp3, png, etc).
   * @param contentType - MIME type.
   */
  async uploadAsset({
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
    const url = await this.uploadBuffer(buffer, key, contentType);
    return { url, key };
  }

  /**
   * Uploads a buffer directly to the bucket from the server.
   *
   * @param buffer - The file content as a Buffer.
   * @param key - The destination path (key) in the bucket.
   * @param contentType - The MIME type of the file.
   * @returns The public URL of the uploaded object.
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);

    return this.getPublicUrl(key);
  }

  /**
   * Generates a presigned URL for secure client-side uploading.
   *
   * @param key - The destination path (key) in the bucket.
   * @param contentType - The expected MIME type.
   * @param expiresIn - Expiration time in seconds (default 1 hour).
   * @returns The presigned PUT URL.
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generates a signed URL for secure client-side downloading/viewing.
   *
   * @param key - The path (key) of the object in the bucket.
   * @param expiresIn - Expiration time in seconds (default 1 hour).
   * @returns The signed GET URL.
   */
  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Deletes an object from the bucket.
   *
   * @param key - The path (key) of the object to delete.
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }

  /**
   * Direct access to the S3 client instance if needed.
   */
  getClient(): S3Client {
    return this.client;
  }
}

// Export a singleton instance for global use
export const s3Service = new S3Service();
