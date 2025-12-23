"use client";

import CanvasArea from "@/features/canvas/CanvasArea";

export default function CanvasTab() {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <CanvasArea />
      </div>
    </div>
  );
}
