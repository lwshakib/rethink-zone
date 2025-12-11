"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BothTab from "./_components/BothTab";
import DocumentTab from "./_components/DocumentTab";
import CanvasTab from "./_components/CanvasTab";
import KanbanTab from "./_components/KanbanTab";

const workspaces = [
  { id: 6, name: "Workspace 6", updated: "less than a minute ago" },
  { id: 5, name: "Workspace 5", updated: "less than a minute ago" },
  { id: 4, name: "Workspace 4", updated: "less than a minute ago" },
  { id: 3, name: "Workspace 3", updated: "less than a minute ago" },
  { id: 2, name: "Workspace 2", updated: "less than a minute ago" },
  { id: 1, name: "Workspace 1", updated: "about 24 hours ago" },
];

const dummyMembers = [
  { id: 1, name: "Alex Doe", role: "Owner" },
  { id: 2, name: "Jamie Lee", role: "Editor" },
  { id: 3, name: "Taylor Kim", role: "Viewer" },
  { id: 4, name: "Jordan Cruz", role: "Editor" },
];

const dummyFiles = [
  { id: 1, name: "Pitch Deck.pdf", size: "3.4 MB", updated: "2h ago" },
  { id: 2, name: "Roadmap.qmd", size: "512 KB", updated: "5h ago" },
  { id: 3, name: "Notes.md", size: "86 KB", updated: "1d ago" },
  { id: 4, name: "Screenshot.png", size: "1.2 MB", updated: "2d ago" },
];

const dummyActivity = [
  { id: 1, action: "Alex shared Pitch Deck.pdf", time: "just now" },
  { id: 2, action: "Jamie commented on Notes.md", time: "15m ago" },
  { id: 3, action: "Taylor added Screenshot.png", time: "3h ago" },
];

const generateGradientThumbnail = () => {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  ];

  const randomGradient =
    gradients[Math.floor(Math.random() * gradients.length)];
  const svgContent = `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${
            randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#667eea"
          }" />
          <stop offset="100%" style="stop-color:${
            randomGradient.match(/#[a-fA-F0-9]{6}/g)?.[1] || "#764ba2"
          }" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="32" fill="url(#grad)" />
      <circle cx="120" cy="120" r="50" fill="white" opacity="0.28" />
      <circle cx="620" cy="280" r="70" fill="white" opacity="0.22" />
      <path d="M340 160 L460 160 L460 240 L340 240 Z" fill="white" opacity="0.35" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

type WorkspaceDetailPageProps = {
  params: { workspaceId: string };
};

export default function WorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
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

  const workspace = {
    name: "Workspace 1",
    updated: "less than a minute ago",
    thumbnail: generateGradientThumbnail(),
  };

  const documentData = {
    title: "Product Requirements",
    updated: "Updated 2h ago",
    summary:
      "High-level overview of the problem, goals, constraints, and user stories for the next sprint.",
  };

  const canvasData = {
    title: "Canvas Draft",
    updated: "Saved 45m ago",
    summary:
      "Sticky notes capturing brainstormed ideas for onboarding and retention experiments.",
  };

  const kanbanBoard = [
    { title: "Backlog", items: ["User research notes", "QA checklist"] },
    { title: "In Progress", items: ["Auth flows", "Dashboard polish"] },
    { title: "Review", items: ["PR #142", "Copy update"] },
    { title: "Done", items: ["Landing hero", "Pricing tweaks"] },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#050509] text-foreground w-full">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex w-full flex-1 flex-col"
      >
        {/* Top chrome */}
        <header className="flex flex-col gap-4 px-6 pt-4 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white/80">
                {workspace.name}
              </span>
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
                className="h-8 rounded-full bg-white px-4 text-[11px] font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:bg-white/90"
              >
                Share
              </Button>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-start justify-center min-h-0">
          <div className="w-full h-full space-y-6 text-white min-h-0">
            <TabsContent value="both" className="h-full t-2">
              <BothTab documentData={documentData} canvasData={canvasData} />
            </TabsContent>

            <TabsContent value="document" className="mt-2 h-full">
              <DocumentTab />
            </TabsContent>

            <TabsContent value="canvas" className="mt-2 h-full">
              <CanvasTab />
            </TabsContent>

            <TabsContent value="kanban" className="mt-2 h-full">
              <KanbanTab board={kanbanBoard} />
            </TabsContent>
          </div>
        </main>
      </Tabs>
    </div>
  );
}
