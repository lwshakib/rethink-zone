"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { CustomTextLogo } from "@/components/logo";

type Workspace = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

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
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
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
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="150" cy="100" r="30" fill="white" opacity="0.8" />
      <path d="M140 90 L160 90 L160 110 L140 110 Z" fill="white" opacity="0.6" />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const workspaceThumbnails = useMemo(() => {
    const thumbnails = new Map<number, string>();
    workspaces.forEach((workspace) => {
      thumbnails.set(workspace.id, generateGradientThumbnail());
    });
    return thumbnails;
  }, [workspaces]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/workspaces");
      if (!res.ok) {
        throw new Error("Failed to load workspaces");
      }
      const data = await res.json();
      setWorkspaces(data.workspaces ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load workspaces right now.");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    try {
      setCreating(true);
      setError(null);
      const name = `Workspace ${new Date().toLocaleString()}`;
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }
      const data = await res.json();
      setWorkspaces((prev) => [...prev, data.workspace]);
    } catch (err) {
      console.error(err);
      setError("Unable to create workspace.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#050509] text-foreground w-full">
      {/* Top chrome */}
      <header className="flex items-center justify-between px-6 pt-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <CustomTextLogo className="text-white" />
        </div>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <span className="hidden text-[11px] sm:inline">Limited credits</span>
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
            onClick={createWorkspace}
            disabled={creating}
            className="h-8 rounded-full bg-white px-4 text-[11px] font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:bg-white/90 disabled:opacity-60"
          >
            {creating ? "Creating..." : "New Workspace"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-10 sm:px-8 lg:px-20">
        <div className="w-full max-w-5xl">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-white">
              Your Workspaces
            </h1>
            <p className="mt-1 text-xs text-white/45">
              Manage your workspaces and continue where you left off.
            </p>
            {error ? (
              <p className="mt-2 text-xs text-red-300">{error}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {loading ? (
              <div className="col-span-full text-white/70 text-sm">
                Loading workspaces...
              </div>
            ) : workspaces.length === 0 ? (
              <div className="col-span-full text-white/70 text-sm">
                No workspaces yet. Create one to get started.
              </div>
            ) : (
              workspaces.map((workspace) => {
                const thumbnail = workspaceThumbnails.get(workspace.id);
                return (
                  <div key={workspace.id} className="flex flex-col gap-2">
                    <Link
                      href={`/workspaces/${workspace.id}`}
                      className="group block w-full aspect-square rounded-3xl bg-[#101018] p-px text-left transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.3rem] bg-[#101018]">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={`${workspace.name} thumbnail`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.7),transparent_55%)] opacity-80" />
                        <div className="relative flex items-center justify-center">
                          <div className="size-10 rounded-full bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.6)]" />
                        </div>
                      </div>
                    </Link>

                    <div className="px-1 text-[11px] text-white/90">
                      <div className="font-medium">{workspace.name}</div>
                      <div className="mt-0.5 text-[10px] text-white/65">
                        Updated {new Date(workspace.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
