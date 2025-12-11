import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import db from "@/db";
import { workspacesTable } from "@/db/schema";
import { workspacePayloadSchema } from "@/lib/validations/workspace";
import { ZodError } from "zod";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const workspaces = await db
      .select()
      .from(workspacesTable)
      .where(eq(workspacesTable.clerkId, user.id))
      .orderBy(desc(workspacesTable.updatedAt));

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Failed to fetch workspaces", error);
    return NextResponse.json(
      { error: "Unable to fetch workspaces." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await request.json();
    const { name, documentData, canvasData, kanbanBoard } =
      workspacePayloadSchema.parse(body);

    const newWorkspace: typeof workspacesTable.$inferInsert = {
      clerkId: user.id ?? "",
      name,
      documentData: (documentData ?? null) as Record<string, unknown> | null,
      canvasData: (canvasData ?? null) as Record<string, unknown> | null,
      kanbanBoard: (kanbanBoard ?? null) as Record<string, unknown> | null,
    };

    const [workspace] = await db
      .insert(workspacesTable)
      .values([newWorkspace])
      .returning();

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
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
