/**
 * This module defines Zod schemas for validating workspace-related data.
 * These schemas are used both on the client for form validation and on the server for API safety.
 */

import { z } from "zod";

/**
 * schema for creating a new workspace.
 * Requires a name and permits optional initial data for the three core features.
 */
export const workspacePayloadSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  documentData: z.unknown().nullable().optional(),
  canvasData: z.unknown().nullable().optional(),
  kanbanBoard: z.unknown().nullable().optional(),
});

/**
 * schema for updating an existing workspace.
 * Makes all fields optional but ensures that at least one field is provided for the update.
 */
export const workspaceUpdateSchema = workspacePayloadSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update."
  );

/** Type inferred from the creation schema */
export type WorkspacePayload = z.infer<typeof workspacePayloadSchema>;
/** Type inferred from the update schema */
export type WorkspaceUpdatePayload = z.infer<typeof workspaceUpdateSchema>;
