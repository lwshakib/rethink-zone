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
import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Layers,
  ChevronLeft,
  Save,
  Trash2,
  Edit2,
  Loader2,
} from "lucide-react";
import { Workspace } from "@/context";
import DocumentTab from "@/features/document/document-tab";
import CanvasTab from "@/features/canvas/canvas-tab";
import KanbanTab from "@/features/kanban/kanban-tab";
import { ModeToggle } from "@/components/mode-toggle";

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
  const { data: session } = authClient.useSession();

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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false); // Tracks if there are unsaved changes
  const [editingName, setEditingName] = useState(false); // Title edit mode toggle
  const [nameDraft, setNameDraft] = useState(""); // Temporary title while editing
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Content state for each individual feature
  const [documentData, setDocumentData] = useState<any>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [kanbanBoard, setKanbanBoard] = useState<any>(null);

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
  const loadWorkspace = async () => {
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
      setDocumentData(ws.documentData);
      setCanvasData(ws.canvasData);
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
  };

  /** Persists all current tab data and workspace metadata to the server */
  const saveWorkspace = useCallback(async () => {
    if (!workspace) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: workspace.name,
        documentData,
        canvasData,
        kanbanBoard,
      };
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save workspace");
      }
      const data = await res.json();
      setWorkspace(data.workspace);
      setDirty(false); // Reset dirty flag after successful save
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }, [workspace, documentData, canvasData, kanbanBoard]);

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
  }, [workspaceId]);

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

  const handleDocumentChange = useCallback((data: any) => {
    setDocumentData(data);
    setDirty(true);
  }, []);

  const handleCanvasChange = useCallback((data: any) => {
    setCanvasData(data);
    setDirty(true);
  }, []);

  const handleKanbanChange = useCallback((data: any) => {
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
                  <Layers className="h-4 w-4 text-blue-400" />
                  {editingName ? (
                    <input
                      autoFocus
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      onBlur={commitName}
                      onKeyDown={(e) => e.key === "Enter" && commitName()}
                      className="bg-transparent text-sm font-semibold text-foreground outline-none ring-0 border-b border-primary/50"
                    />
                  ) : (
                    <div
                      className="flex items-center gap-2 group cursor-pointer"
                      onClick={() => setEditingName(true)}
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {workspace?.name}
                      </span>
                      <Edit2 className="h-3 w-3 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
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

                  {/* Manual Save Button (shows dirty state) */}
                  <Button
                    onClick={saveWorkspace}
                    disabled={saving || !dirty}
                    size="sm"
                    className="h-8 gap-2 rounded-full bg-primary px-4 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 shadow-lg"
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    Save
                  </Button>
                  <ModeToggle />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage
                          src={session?.user?.image || ""}
                          alt={session?.user?.name || "User"}
                        />
                        <AvatarFallback className="bg-muted text-[10px] text-muted-foreground">
                          {session?.user?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-card border-border text-foreground"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onClick={async () => {
                        await authClient.signOut({
                          fetchOptions: {
                            onSuccess: () => router.push("/sign-in"),
                          },
                        });
                      }}
                    >
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              initialContent={documentData}
              onChange={handleDocumentChange}
            />
          </TabsContent>

          {/* Canvas Tab View */}
          <TabsContent
            value="canvas"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <CanvasTab
              initialData={canvasData}
              onChange={handleCanvasChange}
            />
          </TabsContent>

          {/* Kanban Tab View */}
          <TabsContent
            value="kanban"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <KanbanTab
              board={kanbanBoard}
              onChange={handleKanbanChange}
            />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
