import { NextResponse } from "next/server";
import { s3Service } from "@/services/s3.services";
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

    // Generate a unique key for the file
    const extension = fileName.split(".").pop();
    const key = `${folder}/${uuidv4()}.${extension}`;

    // Get the presigned URL from the S3 service
    const presignedUrl = await s3Service.getPresignedUploadUrl(key, contentType);

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
