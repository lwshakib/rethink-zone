/**
 * This API route handles fetching and creating workspaces.
 * It serves as an alternative/complement to Server Actions for client-side fetch calls.
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { workspacePayloadSchema } from "@/validations/workspace";
import { ZodError } from "zod";
import { getUser } from "@/actions/user";

/**
 * GET Handler
 * Fetches a list of metadata for all workspaces belonging to the current user.
 */
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Retrieve lightweight workspace records (excluding heavy JSON data fields)
    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Failed to fetch workspaces", error);
    return NextResponse.json(
      { error: "Unable to fetch workspaces." },
      { status: 500 }
    );
  }
}

/**
 * POST Handler
 * Creates a new workspace for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Parse and validate the request body
    const body = await request.json();
    const { name, documentData, canvasData, kanbanBoard } =
      workspacePayloadSchema.parse(body);

    // Create the record in the database
    const workspace = await prisma.workspace.create({
      data: {
        userId: user.id,
        name,
        // Ensure default empty objects if data is missing
        documentData: documentData === null ? {} : documentData as any,
        canvasData: canvasData === null ? {} : canvasData as any,
        kanbanBoard: kanbanBoard === null ? {} : kanbanBoard as any,
      },
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid workspace payload.",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Failed to create workspace", error);
    return NextResponse.json(
      { error: "Unable to create workspace." },
      { status: 500 }
    );
  }
}
