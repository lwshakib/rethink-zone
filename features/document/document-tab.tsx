"use client";

import { BlockNoteEditorView } from "./dynamic-import";

export default function DocumentTab() {
  return (
    <div className="rounded-2xl max-w-3xl shadow-[0_0_40px_rgba(0,0,0,0.25)] mx-auto">
      <BlockNoteEditorView />
    </div>
  );
}
