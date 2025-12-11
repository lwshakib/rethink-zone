"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Block } from "@blocknote/core";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers } from "lucide-react";
import BothTab from "./_components/BothTab";
import DocumentTab from "./_components/DocumentTab";
import CanvasTab from "./_components/CanvasTab";
import KanbanTab from "./_components/KanbanTab";

type Workspace = {
  id: number;
  name: string;
  documentData: Block[] | null;
  canvasData: Record<string, unknown> | null;
  kanbanBoard: unknown;
  updatedAt: string;
};

const defaultKanban = [
  { title: "Backlog", items: ["User research notes", "QA checklist"] },
  { title: "In Progress", items: ["Auth flows", "Dashboard polish"] },
  { title: "Review", items: ["PR #142", "Copy update"] },
  { title: "Done", items: ["Landing hero", "Pricing tweaks"] },
];

const LoadingState = () => (
  <div className="flex flex-1 items-center justify-center text-white/80 py-12">
    <div className="flex items-center gap-3 text-sm">
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Loading workspace...
    </div>
  </div>
);

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const availableTabs = useMemo(
    () => ["both", "document", "canvas", "kanban"],
    []
  );

  const initialTab = useMemo(() => {
    const fromUrl = searchParams?.get("tab") || "";
    return availableTabs.includes(fromUrl) ? fromUrl : "both";
  }, [availableTabs, searchParams]);

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<Block[] | null>(null);
  const [canvasData, setCanvasData] = useState<Record<string, unknown> | null>(
    null
  );
  const [kanbanData, setKanbanData] = useState<any[]>(defaultKanban);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  // Auto-save timer ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fromUrl = searchParams?.get("tab") || "";
    const resolved = availableTabs.includes(fromUrl) ? fromUrl : "both";
    setActiveTab(resolved);
  }, [availableTabs, searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() || [])
    );
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const normalizeBoard = (
    input: unknown
  ): { title: string; items: string[] }[] => {
    if (!Array.isArray(input)) return defaultKanban;
    return input.map((col: any, colIdx: number) => ({
      title:
        typeof col?.title === "string" ? col.title : `Column ${colIdx + 1}`,
      items: Array.isArray(col?.items)
        ? col.items.map((it: any) =>
            typeof it === "string"
              ? it
              : typeof it?.text === "string"
              ? it.text
              : "Item"
          )
        : [],
    }));
  };

  const loadWorkspace = async () => {
    try {
      if (!workspaceId) {
        return;
      }
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) {
        throw new Error("Failed to load workspace");
      }
      const data = await res.json();
      const ws: Workspace | undefined = data.workspace;
      if (!ws) {
        throw new Error("Workspace not found");
      }
      setWorkspace(ws);
      setNameDraft(ws.name);
      setDocumentContent((ws.documentData as Block[] | null) ?? null);
      setCanvasData((ws.canvasData as Record<string, unknown> | null) ?? null);
      setKanbanData(normalizeBoard(ws.kanbanBoard));
    } catch (err) {
      console.error(err);
      setError("Unable to load workspace.");
    } finally {
      setLoading(false);
      setDirty(false);
    }
  };

  const saveWorkspace = useCallback(async () => {
    if (!workspace) return;
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspace.name,
          documentData: documentContent,
          canvasData,
          kanbanBoard: kanbanData,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save workspace");
      }
      const data = await res.json();
      setWorkspace(data.workspace);
      setDirty(false);
    } catch (err) {
      console.error(err);
      setError("Unable to save workspace.");
    } finally {
      setSaving(false);
    }
  }, [workspace, documentContent, canvasData, kanbanData]);

  // Auto-save: debounce save after 2 seconds of no changes
  useEffect(() => {
    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }

    // Only auto-save if there are unsaved changes and we're not currently loading
    if (dirty && !loading && !saving) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveWorkspace();
      }, 2000); // 2 second delay
    }

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [dirty, loading, saving, saveWorkspace]);

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const commitName = () => {
    if (!workspace) return;
    const nextName = nameDraft.trim();
    if (!nextName || nextName === workspace.name) {
      // Revert if empty or unchanged
      setNameDraft(workspace.name);
      setEditingName(false);
      return;
    }
    setWorkspace({ ...workspace, name: nextName });
    setDirty(true);
    setEditingName(false);
  };

  const cancelNameEdit = () => {
    if (!workspace) return;
    setNameDraft(workspace.name);
    setEditingName(false);
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitName();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelNameEdit();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050509] text-foreground w-full">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-red-300">
          {error}
        </div>
      ) : !workspace ? (
        <div className="flex flex-1 items-center justify-center text-white/70">
          Workspace not found.
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex w-full flex-1 flex-col"
        >
          {/* Top chrome */}
          <header className="flex flex-col gap-4 px-6 pt-4 sm:px-10 lg:px-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-white/60" />
                {editingName ? (
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={handleNameKeyDown}
                    className="text-sm font-semibold text-white/90 bg-transparent px-2 py-1 focus:outline-none"
                  />
                ) : (
                  <span
                    role="button"
                    tabIndex={0}
                    onDoubleClick={() => setEditingName(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setEditingName(true);
                      }
                    }}
                    className="text-sm font-semibold text-white/80 cursor-text"
                  >
                    {workspace.name}
                  </span>
                )}
                {dirty && (
                  <span className="text-[11px] text-amber-300">Unsaved</span>
                )}
              </div>
              <TabsList className="mx-auto flex w-fit rounded-full bg-white/5 p-1 text-white/80">
                <TabsTrigger
                  value="both"
                  className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Both
                </TabsTrigger>
                <TabsTrigger
                  value="document"
                  className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Document
                </TabsTrigger>
                <TabsTrigger
                  value="canvas"
                  className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Canvas
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="rounded-full px-4 py-1 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white"
                >
                  Kanban Board
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-4 text-xs text-white/60">
                <Link
                  href="/workspaces"
                  className="text-[11px] font-medium text-white/70 transition hover:text-white"
                >
                  Back
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
                <Button
                  size="sm"
                  onClick={saveWorkspace}
                  disabled={saving || !dirty}
                  className="h-8 rounded-full bg-white px-4 text-[11px] font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:bg-white/90 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex flex-1 items-start justify-center min-h-0">
            <div className="w-full h-full space-y-6 text-white min-h-0">
              <TabsContent value="both" className="h-full t-2">
                <BothTab
                  documentContent={documentContent}
                  canvasData={canvasData}
                  onDocumentChange={(doc) => {
                    setDocumentContent(doc);
                    setDirty(true);
                  }}
                  onCanvasChange={(data) => {
                    setCanvasData(data);
                    setDirty(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="document" className="mt-2 h-full">
                <DocumentTab
                  initialContent={documentContent}
                  onChange={(doc) => {
                    setDocumentContent(doc);
                    setDirty(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="canvas" className="mt-2 h-full">
                <CanvasTab
                  initialData={canvasData}
                  onChange={(data) => {
                    setCanvasData(data);
                    setDirty(true);
                  }}
                />
              </TabsContent>

              <TabsContent value="kanban" className="mt-2 h-full">
                <KanbanTab
                  board={kanbanData}
                  onChange={(board) => {
                    setKanbanData(board);
                    setDirty(true);
                  }}
                />
              </TabsContent>
            </div>
          </main>
        </Tabs>
      )}
    </div>
  );
}
