import { NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const ALLOWED_AVATAR_PREFIXES = ["avatars/", "uploads/"];

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

    // Verify user in database to retrieve verified profile image reference
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    if (!dbUser || !dbUser.image) {
      return NextResponse.json({ url: null });
    }

    const imagePath = dbUser.image;

    // If the image is already a full URL (legacy Cloudinary or OAuth), return it as is.
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return NextResponse.json({ url: imagePath });
    }

    // Sanitize and validate key to prevent path traversal
    if (typeof imagePath !== "string" || imagePath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid avatar image path" },
        { status: 400 }
      );
    }

    // Verify key starts with an authorized avatar prefix
    const isAllowedPrefix = ALLOWED_AVATAR_PREFIXES.some((prefix) =>
      imagePath.startsWith(prefix)
    );

    if (!isAllowedPrefix) {
      return NextResponse.json(
        { error: "Forbidden: Invalid avatar object key or prefix" },
        { status: 403 }
      );
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
