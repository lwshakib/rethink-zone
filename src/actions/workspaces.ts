"use server";

import { desc, eq } from "drizzle-orm";
import db from "@/db";
import {
  workspacesTable,
  type Workspace,
  type NewWorkspace,
} from "@/db/schema";
import {
  workspacePayloadSchema,
  workspaceUpdateSchema,
  type WorkspacePayload,
  type WorkspaceUpdatePayload,
} from "@/lib/validations/workspace";
import { currentUser } from "@clerk/nextjs/server";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function listWorkspacesAction(): Promise<
  ActionResult<Workspace[]>
> {
  try {
    const workspaces = await db
      .select()
      .from(workspacesTable)
      .orderBy(desc(workspacesTable.updatedAt));

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
    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    const workspace = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1);

    if (!workspace[0]) {
      return { success: false, error: "Workspace not found." };
    }

    return { success: true, data: workspace[0] };
  } catch (error) {
    console.error("getWorkspaceAction failed", error);
    return { success: false, error: "Unable to load workspace." };
  }
}

export async function createWorkspaceAction(
  payload: WorkspacePayload
): Promise<ActionResult<Workspace>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const validated = workspacePayloadSchema.parse(payload);

    const [workspace] = await db
      .insert(workspacesTable)
      .values({
        clerkId: user.id,
        name: validated.name,
        documentData: (validated.documentData ?? null) as Record<
          string,
          unknown
        > | null,
        canvasData: (validated.canvasData ?? null) as Record<
          string,
          unknown
        > | null,
        kanbanBoard: (validated.kanbanBoard ?? null) as Record<
          string,
          unknown
        > | null,
      } satisfies NewWorkspace)
      .returning();

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
    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    const validated = workspaceUpdateSchema.parse(payload);

    const updateData: Partial<Workspace> = {
      ...(validated.name !== undefined ? { name: validated.name } : {}),
      ...(validated.documentData !== undefined
        ? {
            documentData: (validated.documentData ?? null) as Record<
              string,
              unknown
            > | null,
          }
        : {}),
      ...(validated.canvasData !== undefined
        ? {
            canvasData: (validated.canvasData ?? null) as Record<
              string,
              unknown
            > | null,
          }
        : {}),
      ...(validated.kanbanBoard !== undefined
        ? {
            kanbanBoard: (validated.kanbanBoard ?? null) as Record<
              string,
              unknown
            > | null,
          }
        : {}),
      updatedAt: new Date(),
    };

    const [workspace] = await db
      .update(workspacesTable)
      .set(updateData)
      .where(eq(workspacesTable.id, workspaceId))
      .returning();

    if (!workspace) {
      return { success: false, error: "Workspace not found." };
    }

    return { success: true, data: workspace };
  } catch (error) {
    console.error("updateWorkspaceAction failed", error);
    return { success: false, error: "Unable to update workspace." };
  }
}

export async function deleteWorkspaceAction(
  workspaceId: string
): Promise<ActionResult<true>> {
  try {
    if (typeof workspaceId !== "string" || workspaceId.trim().length === 0) {
      return { success: false, error: "Invalid workspace id." };
    }

    const [deleted] = await db
      .delete(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .returning();

    if (!deleted) {
      return { success: false, error: "Workspace not found." };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error("deleteWorkspaceAction failed", error);
    return { success: false, error: "Unable to delete workspace." };
  }
}
