import { z } from "zod";

/**
 * Schema for creating a new workspace.
 */
export const workspacePayloadSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  documentData: z.unknown().nullable().optional(),
  canvasData: z.unknown().nullable().optional(),
  kanbanBoard: z.unknown().nullable().optional(),
});

/**
 * Schema for updating an existing workspace.
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
