"use client";

import ExcaliDraw from "@/components/editor/ExcaliDraw";

type CanvasTabProps = {
  initialData?: Record<string, unknown> | null;
  onChange?: (data: Record<string, unknown>) => void;
};

export default function CanvasTab({ initialData, onChange }: CanvasTabProps) {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <ExcaliDraw initialData={initialData ?? undefined} onChange={onChange} />
      </div>
    </div>
  );
}

