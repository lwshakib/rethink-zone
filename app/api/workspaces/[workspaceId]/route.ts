/**
 * This API module handles GET, PUT, and DELETE requests for a specific workspace.
 * It strictly enforces ownership by checking the 'userId' associated with the workspace.
 */

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { workspaceUpdateSchema } from "@/validations/workspace";
import { ZodError } from "zod";
import { getUser } from "@/actions/user";
import { Prisma } from "@/generated/prisma/client";

/**
 * GET Handler
 * Fetches the full data for a specific workspace.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
): Promise<Response> {
  const { workspaceId } = await context.params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    // Find workspace and verify owner
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Failed to fetch workspace", error);
    return NextResponse.json(
      { error: "Unable to fetch workspace." },
      { status: 500 }
    );
  }
}

/**
 * PUT Handler
 * Updates the contents or metadata of a specific workspace.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
): Promise<Response> {
  const { workspaceId } = await context.params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    // ownership check
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    // Validate payload against update schema
    const payload = workspaceUpdateSchema.parse(body);

    // Map payload into Prisma update input
    const updateData: Prisma.WorkspaceUpdateInput = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.documentData !== undefined
        ? {
            documentData:
              payload.documentData === null
                ? Prisma.JsonNull
                : (payload.documentData as Prisma.InputJsonValue),
          }
        : {}),
      ...(payload.canvasData !== undefined
        ? {
            canvasData:
              payload.canvasData === null
                ? Prisma.JsonNull
                : (payload.canvasData as Prisma.InputJsonValue),
          }
        : {}),
      ...(payload.kanbanBoard !== undefined
        ? {
            kanbanBoard:
              payload.kanbanBoard === null
                ? Prisma.JsonNull
                : (payload.kanbanBoard as Prisma.InputJsonValue),
          }
        : {}),
    };

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    // commit the changes
    const workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: updateData,
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid workspace payload.", issues: error.issues },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    console.error("Failed to update workspace", error);
    return NextResponse.json(
      {
        error: "Unable to update workspace.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE Handler
 * Removes a workspace and all its data.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
): Promise<Response> {
  const { workspaceId } = await context.params;
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    // Verify ownership before deletion
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete workspace", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Unable to delete workspace." },
      { status: 500 }
    );
  }
}
