"use client";

import CanvasArea from "@/features/canvas/CanvasArea";

export default function CanvasTab({ initialData, onChange }: { initialData?: any, onChange?: (data: any) => void }) {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <CanvasArea initialData={initialData} onChange={onChange} />
      </div>
    </div>
  );
}
