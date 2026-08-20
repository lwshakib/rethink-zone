import { NextResponse } from "next/server";
import { getPresignedUploadUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

/**
 * POST /api/s3/presigned-url
 * Generates a presigned URL for secure client-side uploading.
 *
 * Body: { fileName: string, contentType: string, folder: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, contentType, folder = "uploads" } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    // Permitted upload directories allowlist
    const ALLOWED_FOLDERS = new Set([
      "uploads",
      "avatars",
      "canvas",
      "workspaces",
      "documents",
    ]);

    // Sanitize and validate folder to prevent directory traversal
    if (
      typeof folder !== "string" ||
      folder.includes("..") ||
      !ALLOWED_FOLDERS.has(folder.trim())
    ) {
      return NextResponse.json(
        { error: "Invalid or unpermitted folder parameter" },
        { status: 400 }
      );
    }

    const sanitizedFolder = folder.trim();

    // Generate a unique key for the file
    const extension = fileName.split(".").pop();
    const key = `${sanitizedFolder}/${uuidv4()}.${extension}`;

    // Get the presigned URL from the S3 service
    const presignedUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({
      url: presignedUrl,
      key: key,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
