"use client";

import ExcaliDraw from "@/components/editor/ExcaliDraw";

export default function CanvasTab() {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <ExcaliDraw />
      </div>
    </div>
  );
}

