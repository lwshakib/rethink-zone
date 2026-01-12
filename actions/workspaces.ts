/**
 * This module contains Next.js Server Actions for CRUD operations on Workspaces.
 * It uses Prisma for database interaction and Zod for input validation.
 */

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

/**
 * Standard interface for action responses.
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Retrieves all workspaces belonging to the authenticated user.
 * 
 * @returns {Promise<ActionResult<Workspace[]>>} - The list of workspaces or an error message.
 */
export async function listWorkspacesAction(): Promise<
  ActionResult<Workspace[]>
> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    // Fetch workspaces for the current user, sorted by most recently updated.
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

/**
 * Retrieves a single workspace by its ID, ensuring it belongs to the authenticated user.
 * 
 * @param workspaceId - The unique identifier of the workspace.
 * @returns {Promise<ActionResult<Workspace>>} - The workspace data or an error.
 */
export async function getWorkspaceAction(
  workspaceId: string
): Promise<ActionResult<Workspace>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    // Basic validation for the ID parameter
    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    // Attempt to find the workspace + verify ownership in one query
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

/**
 * Creates a new workspace for the authenticated user.
 * 
 * @param payload - The data required to create a workspace (name, initial tab data).
 * @returns {Promise<ActionResult<Workspace>>} - The newly created workspace.
 */
export async function createWorkspaceAction(
  payload: WorkspacePayload
): Promise<ActionResult<Workspace>> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    // Validate incoming data against the Zod schema
    const validated = workspacePayloadSchema.parse(payload);

    // Persist the new workspace in the DB
    const workspace = await prisma.workspace.create({
      data: {
        userId: user.id,
        name: validated.name,
        // Convert explicit nulls to Prisma.JsonNull for JSONB columns
        documentData:
          validated.documentData === null
            ? Prisma.JsonNull
            : validated.documentData as any,
        canvasData:
          validated.canvasData === null
            ? Prisma.JsonNull
            : validated.canvasData as any,
        kanbanBoard:
          validated.kanbanBoard === null
            ? Prisma.JsonNull
            : validated.kanbanBoard as any,
      },
    });

    return { success: true, data: workspace };
  } catch (error) {
    console.error("createWorkspaceAction failed", error);
    return { success: false, error: "Unable to create workspace." };
  }
}

/**
 * Updates an existing workspace's metadata or feature content.
 * 
 * @param workspaceId - The unique identifier of the workspace to update.
 * @param payload - The subset of fields to be updated.
 * @returns {Promise<ActionResult<Workspace>>} - The updated workspace.
 */
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

    // Validate update fields
    const validated = workspaceUpdateSchema.parse(payload);

    // Verify ownership before performing the update
    const existing = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Workspace not found." };
    }

    // Construct the update object based on provided fields
    const updateData: Prisma.WorkspaceUpdateInput = {
      ...(validated.name !== undefined ? { name: validated.name } : {}),
      ...(validated.documentData !== undefined
        ? {
            documentData:
              validated.documentData === null
                ? Prisma.JsonNull
                : (validated.documentData as any),
          }
        : {}),
      ...(validated.canvasData !== undefined
        ? {
            canvasData:
              validated.canvasData === null
                ? Prisma.JsonNull
                : (validated.canvasData as any),
          }
        : {}),
      ...(validated.kanbanBoard !== undefined
        ? {
            kanbanBoard:
              validated.kanbanBoard === null
                ? Prisma.JsonNull
                : (validated.kanbanBoard as any),
          }
        : {}),
    };

    // Commit changes to the database
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

/**
 * Permanently deletes a workspace.
 * 
 * @param workspaceId - The unique identifier of the workspace to delete.
 */
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

    // Verify ownership before deletion
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
