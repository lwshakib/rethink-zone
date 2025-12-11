import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import db from "@/db";
import { workspacesTable } from "@/db/schema";
import { workspaceUpdateSchema } from "@/lib/validations/workspace";
import { ZodError } from "zod";
import { currentUser } from "@clerk/nextjs/server";

type RouteContext = {
  params: { workspaceId: string };
};

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { workspaceId } = await params;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    const workspace = await db
      .select()
      .from(workspacesTable)
      .where(
        and(
          eq(workspacesTable.id, workspaceId),
          eq(workspacesTable.clerkId, user.id)
        )
      )
      .limit(1);

    if (!workspace[0]) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ workspace: workspace[0] });
  } catch (error) {
    console.error("Failed to fetch workspace", error);
    return NextResponse.json(
      { error: "Unable to fetch workspace." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { workspaceId } = await params;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    const existingWorkspace = await db
      .select()
      .from(workspacesTable)
      .where(
        and(
          eq(workspacesTable.id, workspaceId),
          eq(workspacesTable.clerkId, user.id)
        )
      )
      .limit(1);

    if (!existingWorkspace[0]) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const payload = workspaceUpdateSchema.parse(body);

    const updateData: Partial<typeof workspacesTable.$inferInsert> = {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.documentData !== undefined
        ? {
            documentData: (payload.documentData ?? null) as Record<
              string,
              unknown
            > | null,
          }
        : {}),
      ...(payload.canvasData !== undefined
        ? {
            canvasData: (payload.canvasData ?? null) as Record<
              string,
              unknown
            > | null,
          }
        : {}),
      ...(payload.kanbanBoard !== undefined
        ? {
            kanbanBoard: (payload.kanbanBoard ?? null) as Record<
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
      .where(
        and(
          eq(workspacesTable.id, workspaceId),
          eq(workspacesTable.clerkId, user.id)
        )
      )
      .returning();

    if (!workspace) {
      return NextResponse.json(
        { error: "Unable to update workspace." },
        { status: 404 }
      );
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid workspace payload.", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to update workspace", error);
    return NextResponse.json(
      { error: "Unable to update workspace." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { workspaceId } = await params;
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Invalid workspace id." },
        { status: 400 }
      );
    }

    const [workspace] = await db
      .delete(workspacesTable)
      .where(
        and(
          eq(workspacesTable.id, workspaceId),
          eq(workspacesTable.clerkId, user.id)
        )
      )
      .returning();

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete workspace", error);
    return NextResponse.json(
      { error: "Unable to delete workspace." },
      { status: 500 }
    );
  }
}
