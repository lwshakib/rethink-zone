"use client";

import { Editor } from "@/components/editor/DynamicEditor";
import { Block } from "@blocknote/core";

type DocumentTabProps = {
  initialContent?: Block[] | null;
  onChange?: (doc: Block[]) => void;
};

export default function DocumentTab({
  initialContent,
  onChange,
}: DocumentTabProps) {
  return (
    <div className="rounded-2xl max-w-3xl shadow-[0_0_40px_rgba(0,0,0,0.25)] mx-auto">
      <Editor initialContent={initialContent ?? undefined} onChange={onChange} />
    </div>
  );
}

