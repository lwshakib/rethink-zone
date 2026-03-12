import { NextResponse } from "next/server";
import { generateCloudinarySignature } from "@/lib/cloudinary";

export async function GET() {
  try {
    const signatureData = generateCloudinarySignature("rethink-zone");
    return NextResponse.json(signatureData);
  } catch (error) {
    console.error("Error in cloudinary-signature GET:", error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Internal Server Error: ${error instanceof Error ? error.message : String(error)}`
            : "Internal Server Error",
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}
