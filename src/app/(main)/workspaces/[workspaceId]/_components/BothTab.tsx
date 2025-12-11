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
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/5 bg-[#0b0b11] p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)] flex flex-col">
        <Editor />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0b0b11] p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)] flex flex-col">
        <ExcaliDraw />
      </div>
    </div>
  );
}
