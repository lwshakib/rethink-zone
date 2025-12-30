"use client";

import { BlockNoteEditorView } from "./dynamic-import";

export default function DocumentTab({ initialContent, onChange }: { initialContent?: any, onChange?: (content: any) => void }) {
  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-background custom-scrollbar">
      <div className="max-w-5xl mx-auto min-h-full flex flex-col">
        <div className="flex-1 px-4 sm:px-12 py-10">
          <BlockNoteEditorView initialContent={initialContent} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
