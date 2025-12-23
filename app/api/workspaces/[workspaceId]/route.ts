import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { workspaceUpdateSchema } from "@/validations/workspace";
import { ZodError } from "zod";
import { getUser } from "@/actions/user";
import { Prisma } from "@/generated/prisma/client";

type RouteContext = {
  params: Promise<{ workspaceId: string }>;
};

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
    console.log("Update request body:", JSON.stringify(body, null, 2));

    const payload = workspaceUpdateSchema.parse(body);
    console.log("Parsed payload:", JSON.stringify(payload, null, 2));

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

    console.log("Update data:", JSON.stringify(updateData, null, 2));

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.update({
      where: {
        id: workspaceId,
      },
      data: updateData,
    });

    return NextResponse.json({ workspace });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error.issues);
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

    console.error("Failed to update workspace - Full error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Unable to update workspace.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

    // First check if workspace exists and belongs to user
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
