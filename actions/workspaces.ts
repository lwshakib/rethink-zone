"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  workspacePayloadSchema,
  workspaceUpdateSchema,
  type WorkspacePayload,
  type WorkspaceUpdatePayload,
} from "@/validations/workspace";
import { getUser } from "@/actions/user";
import type { Workspace } from "@/generated/prisma/client";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listWorkspacesAction(): Promise<
  ActionResult<Workspace[]>
> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: workspaces };
  } catch (error) {
    console.error("listWorkspacesAction failed", error);
    return { success: false, error: "Unable to load workspaces." };
  }
}

export async function getWorkspaceAction(
  workspaceId: string
): Promise<ActionResult<Workspace>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!workspace) {
      return { success: false, error: "Workspace not found." };
    }

    return { success: true, data: workspace };
  } catch (error) {
    console.error("getWorkspaceAction failed", error);
    return { success: false, error: "Unable to load workspace." };
  }
}

export async function createWorkspaceAction(
  payload: WorkspacePayload
): Promise<ActionResult<Workspace>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const validated = workspacePayloadSchema.parse(payload);

    const workspace = await prisma.workspace.create({
      data: {
        userId: user.id,
        name: validated.name,
        documentData:
          validated.documentData === null
            ? Prisma.JsonNull
            : validated.documentData,
        canvasData:
          validated.canvasData === null
            ? Prisma.JsonNull
            : validated.canvasData,
        kanbanBoard:
          validated.kanbanBoard === null
            ? Prisma.JsonNull
            : validated.kanbanBoard,
      },
    });

    return { success: true, data: workspace };
  } catch (error) {
    console.error("createWorkspaceAction failed", error);
    return { success: false, error: "Unable to create workspace." };
  }
}

export async function updateWorkspaceAction(
  workspaceId: string,
  payload: WorkspaceUpdatePayload
): Promise<ActionResult<Workspace>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    const validated = workspaceUpdateSchema.parse(payload);

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Workspace not found." };
    }

    const updateData: Prisma.WorkspaceUpdateInput = {
      ...(validated.name !== undefined ? { name: validated.name } : {}),
      ...(validated.documentData !== undefined
        ? {
            documentData:
              validated.documentData === null
                ? Prisma.JsonNull
                : validated.documentData,
          }
        : {}),
      ...(validated.canvasData !== undefined
        ? {
            canvasData:
              validated.canvasData === null
                ? Prisma.JsonNull
                : validated.canvasData,
          }
        : {}),
      ...(validated.kanbanBoard !== undefined
        ? {
            kanbanBoard:
              validated.kanbanBoard === null
                ? Prisma.JsonNull
                : validated.kanbanBoard,
          }
        : {}),
    };

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: updateData,
    });

    return { success: true, data: workspace };
  } catch (error) {
    console.error("updateWorkspaceAction failed", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return { success: false, error: "Workspace not found." };
    }
    return { success: false, error: "Unable to update workspace." };
  }
}

export async function deleteWorkspaceAction(
  workspaceId: string
): Promise<ActionResult<true>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Workspace not found." };
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return { success: true, data: true };
  } catch (error) {
    console.error("deleteWorkspaceAction failed", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return { success: false, error: "Workspace not found." };
    }
    return { success: false, error: "Unable to delete workspace." };
  }
}
