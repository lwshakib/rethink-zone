import { NextResponse } from "next/server";
import { getSignedDownloadUrl } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

const ALLOWED_PREFIXES = [
  "workspaces/",
  "uploads/",
  "canvas/",
  "avatars/",
  "documents/",
];

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

    // Sanitize and validate key parameter to prevent path traversal
    if (typeof key !== "string" || key.includes("..")) {
      return NextResponse.json(
        { error: "Invalid key parameter" },
        { status: 400 }
      );
    }

    // Verify key starts with an authorized directory prefix
    const isAllowedPrefix = ALLOWED_PREFIXES.some((prefix) =>
      key.startsWith(prefix)
    );

    if (!isAllowedPrefix) {
      return NextResponse.json(
        { error: "Forbidden: Invalid object key or prefix" },
        { status: 403 }
      );
    }

    // Verify user authorization: user must exist and have valid session
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Forbidden: User account not found" },
        { status: 403 }
      );
    }

    // Get the signed download URL from the S3 service
    // Default expiration is 1 hour (3600 seconds)
    const signedUrl = await getSignedDownloadUrl(key);

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
