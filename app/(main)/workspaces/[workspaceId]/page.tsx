/**
 * This page represents the detailed view of a specific workspace.
 * It manages the multi-tab interface (Document, Canvas, Kanban) and orchestrates
 * persistence (fetching and saving) of the workspace state.
 */

"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Trash2, Loader2 } from "lucide-react";
import { Workspace } from "@/hooks/use-workspace-store";
import DocumentTab from "@/features/document/document-tab";
import CanvasTab from "@/features/canvas/canvas-tab";
import KanbanTab from "@/features/kanban/kanban-tab";
import { ModeToggle } from "@/components/mode-toggle";
import { useDebounce } from "@/hooks/use-debounce";
import { SavingStatus, SavingStatusType } from "@/components/saving-status";

/**
 * Centered loading spinner shown while the workspace data is being fetched.
 */
const LoadingState = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-pink-glow rounded-full bg-blue-500/20 blur-xl"></div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium tracking-wide text-muted-foreground">
        Loading workspace...
      </p>
    </div>
  </div>
);

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>(); // Extract ID from URL
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // List of available features within a workspace
  const availableTabs = useMemo(() => ["document", "canvas", "kanban"], []);

  /** determines which tab to show on page load based on the 'tab' URL parameter */
  const initialTab = useMemo(() => {
    const fromUrl = searchParams?.get("tab") || "";
    return availableTabs.includes(fromUrl) ? fromUrl : "document";
  }, [availableTabs, searchParams]);

  // --- LOCAL STATE ---
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<SavingStatusType>("idle");
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false); // Tracks if there are unsaved changes
  const [editingName, setEditingName] = useState(false); // Title edit mode toggle
  const [nameDraft, setNameDraft] = useState(""); // Temporary title while editing
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Content state for each individual feature
  const [documentData, setDocumentData] = useState<unknown>(null);
  const [canvasData, setCanvasData] = useState<unknown>(null);
  const [kanbanBoard, setKanbanBoard] = useState<unknown>(null);

  /** sync active tab state with URL search params */
  useEffect(() => {
    const fromUrl = searchParams?.get("tab") || "";
    const resolved = availableTabs.includes(fromUrl) ? fromUrl : "document";
    setActiveTab(resolved);
  }, [availableTabs, searchParams]);

  /** switch tabs and update the URL accordingly */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(
      Array.from(searchParams?.entries() || [])
    );
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  /** Fetches the workspace details and all sub-feature data from the server */
  const loadWorkspace = useCallback(async () => {
    try {
      if (!workspaceId) {
        setError("Invalid workspace ID");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to load workspace");
      }
      const data = await res.json();
      const ws: Workspace | undefined = data.workspace;
      if (!ws) throw new Error("Workspace not found");

      // Populate local state with fetched data
      setWorkspace(ws);
      setNameDraft(ws.name);

      // Pre-process document data to sign any S3 keys for secure viewing
      const { signDocumentUrls } = await import("@/lib/document-utils");
      const signedDocument = await signDocumentUrls(ws.documentData);

      // Pre-process canvas data to sign any S3 keys for secure viewing
      const { signCanvasUrls } = await import("@/lib/canvas-utils");
      const signedCanvas = await signCanvasUrls(ws.canvasData);

      setDocumentData(signedDocument);
      setCanvasData(signedCanvas);
      setKanbanBoard(ws.kanbanBoard);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to load workspace."
      );
    } finally {
      setLoading(false);
      setDirty(false); // Reset dirty flag after load
    }
  }, [workspaceId]);

  // Stable payload object to prevent unnecessary debounce resets
  const currentPayload = useMemo(
    () => ({
      name: workspace?.name,
      documentData,
      canvasData,
      kanbanBoard,
    }),
    [workspace?.name, documentData, canvasData, kanbanBoard]
  );

  // Debounced auto-save effect
  const debouncedPayload = useDebounce(currentPayload, 2000);

  // Ref to track the latest state without triggering re-renders of the save callback
  const stateRef = useRef({
    workspace,
    dirty,
    currentPayload,
  });

  // Sync ref with state on every change
  useEffect(() => {
    stateRef.current = { workspace, dirty, currentPayload };
  }, [workspace, dirty, currentPayload]);

  /** Persists all current tab data and workspace metadata to the server */
  const saveWorkspace = useCallback(async () => {
    const {
      workspace: ws,
      dirty: isDirty,
      currentPayload: payload,
    } = stateRef.current;
    if (!ws || !isDirty) return;

    try {
      setSavingStatus("saving");
      setError(null);

      // Sanitize document URLs before sending to the server (replacing signed URLs with S3 keys)
      const { sanitizeDocumentUrls } = await import("@/lib/document-utils");
      const sanitizedDocument = sanitizeDocumentUrls(payload.documentData);

      // Sanitize canvas URLs before sending to the server (replacing signed URLs with S3 keys)
      const { sanitizeCanvasUrls } = await import("@/lib/canvas-utils");
      const sanitizedCanvas = sanitizeCanvasUrls(payload.canvasData);

      const requestBody = {
        ...payload,
        documentData: sanitizedDocument,
        canvasData: sanitizedCanvas,
      };

      const res = await fetch(`/api/workspaces/${ws.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save workspace");
      }

      const data = await res.json();
      setWorkspace(data.workspace);

      // Only reset dirty if the payload hasn't changed since we started the save
      if (stateRef.current.currentPayload === payload) {
        setDirty(false);
      }
      setSavingStatus("saved");

      // Return to idle after showing "saved" for a bit
      setTimeout(() => {
        setSavingStatus((current) => (current === "saved" ? "idle" : current));
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save.");
      setSavingStatus("error");
    }
  }, []); // Truly stable callback

  useEffect(() => {
    // Only trigger save when the debounced payload actually updates.
    // This stops the infinite loop caused by frequent state changes.
    if (stateRef.current.dirty && debouncedPayload) {
      saveWorkspace();
    }
  }, [debouncedPayload, saveWorkspace]);

  useEffect(() => {
    if (dirty && savingStatus === "idle") {
      setSavingStatus("unsaved");
    }
  }, [dirty, savingStatus]);

  /** triggers workspace deletion and redirects to dashboard */
  const deleteWorkspace = async () => {
    if (!workspaceId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete workspace");
      router.push("/workspaces");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Unable to delete workspace.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  /** finalizes a workspace title edit */
  const commitName = () => {
    if (!workspace) return;
    const nextName = nameDraft.trim();
    if (!nextName || nextName === workspace.name) {
      setNameDraft(workspace.name);
      setEditingName(false);
      return;
    }
    setWorkspace({ ...workspace, name: nextName });
    setDirty(true);
    setEditingName(false);
  };

  // --- Content change handlers (memoized to prevent unneeded re-renders in children) ---

  const handleDocumentChange = useCallback((data: unknown) => {
    setDocumentData(data);
    setDirty(true);
  }, []);

  const handleCanvasChange = useCallback((data: unknown) => {
    setCanvasData(data);
    setDirty(true);
  }, []);

  const handleKanbanChange = useCallback((data: unknown) => {
    setKanbanBoard(data);
    setDirty(true);
  }, []);

  if (loading) return <LoadingState />;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground w-full overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex h-full w-full flex-col"
      >
        {/* --- HEADER BAR --- */}
        <header className="z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex flex-col gap-4 px-4 py-3 ">
            <div className="flex items-center justify-between">
              {/* Left: Navigation and Workspace Title */}
              <div className="flex items-center gap-4">
                <Link
                  href="/workspaces"
                  className="flex size-8 items-center justify-center rounded-full bg-accent transition-colors hover:bg-accent/80"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </Link>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  {editingName ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={commitName}
                      onKeyDown={(e) => e.key === "Enter" && commitName()}
                      className="bg-transparent text-sm font-semibold text-foreground outline-none ring-0 focus:ring-0"
                    />
                  ) : (
                    <div
                      className="flex items-center gap-2 group cursor-pointer select-none"
                      onDoubleClick={() => setEditingName(true)}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {workspace?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle: Feature Selectors (Tabs) */}
              <TabsList className="hidden h-10 items-center justify-center rounded-full bg-muted/50 p-1 md:flex border border-border/50 backdrop-blur-sm">
                <TabsTrigger
                  value="document"
                  className="rounded-full px-6 py-1.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg active:scale-95"
                >
                  Document
                </TabsTrigger>
                <TabsTrigger
                  value="canvas"
                  className="rounded-full px-6 py-1.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg active:scale-95"
                >
                  Canvas
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="rounded-full px-6 py-1.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg active:scale-95"
                >
                  Kanban
                </TabsTrigger>
              </TabsList>

              {/* Right: Workspace Actions (Save, Delete) and User Profile */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pr-2 border-r border-border">
                  {/* Delete Confirmation Dialog */}
                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border text-foreground">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. All data in this
                          workspace will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted border-none hover:bg-accent text-foreground">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteWorkspace}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none"
                        >
                          {deleting ? "Deleting..." : "Delete Workspace"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Saving Status Icon (Auto-save) */}
                  <SavingStatus status={savingStatus} />
                  <ModeToggle />
                </div>

                <UserMenu />
              </div>
            </div>

            {/* Mobile-only Tabs Navigation (simpler UI) */}
            <TabsList className="flex h-9 w-full bg-muted p-1 md:hidden">
              <TabsTrigger value="document" className="flex-1 text-[10px]">
                Doc
              </TabsTrigger>
              <TabsTrigger value="canvas" className="flex-1 text-[10px]">
                Canvas
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex-1 text-[10px]">
                Kanban
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* --- MAIN CONTENT PANELS --- */}
        <main className="flex-1 min-h-0 relative">
          {/* Document Tab View */}
          <TabsContent
            value="document"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <DocumentTab
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initialContent={documentData as any}
              onChange={handleDocumentChange}
            />
          </TabsContent>

          {/* Canvas Tab View */}
          <TabsContent
            value="canvas"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <CanvasTab
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initialData={canvasData as any}
              onChange={handleCanvasChange}
            />
          </TabsContent>

          {/* Kanban Tab View */}
          <TabsContent
            value="kanban"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <KanbanTab
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              board={kanbanBoard as any}
              onChange={handleKanbanChange}
            />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
