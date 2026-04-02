import { NextResponse } from "next/server";
import { s3Service } from "@/services/s3.services";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/s3/signed-url?key=...
 * Generates a signed URL for secure client-side reading of an S3 object.
 */
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "key parameter is required" },
        { status: 400 }
      );
    }

    // Get the signed download URL from the S3 service
    // Default expiration is 1 hour (3600 seconds)
    const signedUrl = await s3Service.getSignedDownloadUrl(key);

    return NextResponse.json({
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error generating signed download URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
