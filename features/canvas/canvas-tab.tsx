"use client";

import CanvasArea from "@/features/canvas/CanvasArea";
import { CanvasAreaProps } from "@/features/canvas/types";

export default function CanvasTab({ initialData, onChange }: CanvasAreaProps) {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <CanvasArea initialData={initialData} onChange={onChange} />
      </div>
    </div>
  );
}
