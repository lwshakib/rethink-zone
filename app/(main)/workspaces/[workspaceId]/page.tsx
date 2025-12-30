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
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const availableTabs = useMemo(() => ["document", "canvas", "kanban"], []);

  const initialTab = useMemo(() => {
    const fromUrl = searchParams?.get("tab") || "";
    return availableTabs.includes(fromUrl) ? fromUrl : "document";
  }, [availableTabs, searchParams]);

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [documentData, setDocumentData] = useState<any>(null);
  const [canvasData, setCanvasData] = useState<any>(null);
  const [kanbanBoard, setKanbanBoard] = useState<any>(null);

  useEffect(() => {
    const fromUrl = searchParams?.get("tab") || "";
    const resolved = availableTabs.includes(fromUrl) ? fromUrl : "document";
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
      setDirty(false);
    }
  };

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
      setDirty(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  }, [workspace, documentData, canvasData, kanbanBoard]);

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

  if (loading) return <LoadingState />;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground w-full overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex h-full w-full flex-col"
      >
        {/* Header Section */}
        <header className="z-10 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex flex-col gap-4 px-4 py-4 ">
            <div className="flex items-center justify-between">
              {/* Left: Breadcrumbs & App Name */}
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
                      className="bg-transparent text-sm font-semibold text-foreground outline-none ring-0"
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
                  {dirty && (
                    <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                      Unsaved Changes
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Improved TabsList */}
              <TabsList className="hidden h-10 items-center justify-center rounded-full bg-muted p-1 md:flex">
                <TabsTrigger
                  value="document"
                  className="rounded-full px-6 py-1.5 text-xs font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Document
                </TabsTrigger>
                <TabsTrigger
                  value="canvas"
                  className="rounded-full px-6 py-1.5 text-xs font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Canvas
                </TabsTrigger>
                <TabsTrigger
                  value="kanban"
                  className="rounded-full px-6 py-1.5 text-xs font-medium transition-all duration-300 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.1)] dark:data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  Kanban Board
                </TabsTrigger>
              </TabsList>

              {/* Right: Actions & User */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pr-2 border-r border-border">
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

            {/* Mobile TabsList */}
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

        {/* Content Area */}
        <main className="flex-1 min-h-0 relative">
          <TabsContent
            value="document"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <DocumentTab
              initialContent={documentData}
              onChange={(data) => {
                setDocumentData(data);
                setDirty(true);
              }}
            />
          </TabsContent>

          <TabsContent
            value="canvas"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <CanvasTab
              initialData={canvasData}
              onChange={(data) => {
                setCanvasData(data);
                setDirty(true);
              }}
            />
          </TabsContent>

          <TabsContent
            value="kanban"
            className="m-0 h-full w-full outline-none data-[state=active]:flex flex-col"
          >
            <KanbanTab
              board={kanbanBoard}
              onChange={(data) => {
                setKanbanBoard(data);
                setDirty(true);
              }}
            />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
