"use client";

import { Editor } from "@/components/editor/DynamicEditor";
import ExcaliDraw from "@/components/editor/ExcaliDraw";
import { Block } from "@blocknote/core";

type BothTabProps = {
  documentContent?: Block[] | null;
  canvasData?: Record<string, unknown> | null;
  onDocumentChange?: (doc: Block[]) => void;
  onCanvasChange?: (data: Record<string, unknown>) => void;
};

export default function BothTab({
  documentContent,
  canvasData,
  onDocumentChange,
  onCanvasChange,
}: BothTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 h-full min-h-0">
      <div className=" flex flex-col min-h-0 h-full w-full">
        <Editor
          initialContent={documentContent ?? undefined}
          onChange={onDocumentChange}
        />
      </div>

      <div className=" flex flex-col min-h-0 h-full w-full">
        <ExcaliDraw
          initialData={canvasData ?? undefined}
          onChange={onCanvasChange}
        />
      </div>
    </div>
  );
}
