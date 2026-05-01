import { NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/user/avatar-signed-url
 * Resolves the current user's profile image (if it's an S3 key) to a signed URL.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const imagePath = session.user.image;

    if (!imagePath) {
      return NextResponse.json({ url: null });
    }

    // If the image is already a full URL (legacy Cloudinary or OAuth), return it as is.
    if (imagePath.startsWith("http")) {
      return NextResponse.json({ url: imagePath });
    }

    // Otherwise, generate a signed download URL for the S3 key.
    const signedUrl = await getSignedDownloadUrl(imagePath, 3600);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating signed download URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
