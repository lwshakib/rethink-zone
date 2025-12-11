"use client";

import { Editor } from "@/components/editor/DynamicEditor";
import ExcaliDraw from "@/components/editor/ExcaliDraw";

type DocumentData = {
  title: string;
  updated: string;
  summary: string;
};

type CanvasData = {
  title: string;
  updated: string;
  summary: string;
};

type BothTabProps = {
  documentData: DocumentData;
  canvasData: CanvasData;
};

export default function BothTab({ documentData, canvasData }: BothTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 h-full min-h-0">
      <div className=" flex flex-col min-h-0 h-full w-full">
        <Editor />
      </div>

      <div className=" flex flex-col min-h-0 h-full w-full">
        <ExcaliDraw />
      </div>
    </div>
  );
}
