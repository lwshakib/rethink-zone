import { z } from "zod";

export const workspacePayloadSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  documentData: z.unknown().nullable().optional(),
  canvasData: z.unknown().nullable().optional(),
  kanbanBoard: z.unknown().nullable().optional(),
});

export const workspaceUpdateSchema = workspacePayloadSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update."
  );

export type WorkspacePayload = z.infer<typeof workspacePayloadSchema>;
export type WorkspaceUpdatePayload = z.infer<typeof workspaceUpdateSchema>;


