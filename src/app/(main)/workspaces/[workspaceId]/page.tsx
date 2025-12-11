"use client";

import Link from "next/link";
import { useMemo } from "react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { CustomTextLogo } from "@/components/logo";

const workspaces = [
  { id: 6, name: "Workspace 6", updated: "less than a minute ago" },
  { id: 5, name: "Workspace 5", updated: "less than a minute ago" },
  { id: 4, name: "Workspace 4", updated: "less than a minute ago" },
  { id: 3, name: "Workspace 3", updated: "less than a minute ago" },
  { id: 2, name: "Workspace 2", updated: "less than a minute ago" },
  { id: 1, name: "Workspace 1", updated: "about 24 hours ago" },
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
  const workspace = workspaces.find(
    (item) => String(item.id) === params.workspaceId
  );

  const thumbnail = useMemo(() => generateGradientThumbnail(), [workspace?.id]);

  if (!workspace) {
    return (
      <div className="flex min-h-screen flex-col bg-[#050509] px-6 py-10 text-white sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <CustomTextLogo className="text-white" />
          <Link
            href="/workspaces"
            className="text-sm text-white/70 transition hover:text-white"
          >
            Back to workspaces
          </Link>
        </div>
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold">Workspace not found.</p>
          <p className="mt-2 text-sm text-white/60">
            Please return to the workspace list and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#050509] text-foreground w-full">
      {/* Top chrome */}
      <header className="flex items-center justify-between px-6 pt-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <CustomTextLogo className="text-white" />
        </div>
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
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-10 sm:px-8 lg:px-20">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col gap-3 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{workspace.name}</h1>
                <p className="mt-1 text-sm text-white/60">
                  Last updated {workspace.updated}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-9 rounded-full bg-white/10 px-4 text-sm text-white hover:bg-white/15"
                >
                  Rename
                </Button>
                <Button className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.35)] hover:bg-white/90">
                  Open
                </Button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0b0b11]">
              <div className="aspect-[16/9] w-full">
                <img
                  src={thumbnail}
                  alt={`${workspace.name} cover`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_30%)]" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#0b0b11] p-4 text-white">
              <div className="text-sm text-white/70">Members</div>
              <div className="mt-2 text-2xl font-semibold">3</div>
              <p className="mt-2 text-xs text-white/55">
                Invite collaborators to this workspace.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0b0b11] p-4 text-white">
              <div className="text-sm text-white/70">Files</div>
              <div className="mt-2 text-2xl font-semibold">12</div>
              <p className="mt-2 text-xs text-white/55">
                Recent activity and shared assets appear here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

