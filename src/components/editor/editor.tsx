"use client";

import "@blocknote/core/fonts/inter.css";
import { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useEffect } from "react";

type EditorProps = {
  initialContent?: PartialBlock[] | null;
  onChange?: (doc: Block[]) => void;
};

// BlockNote wrapper that supports initial content and change tracking.
export default function Editor({ initialContent, onChange }: EditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent ?? undefined,
  });

  // Sync content if the caller provides new initialContent (e.g. when loading).
  useEffect(() => {
    if (!editor || !initialContent) return;
    editor.replaceBlocks(editor.document, initialContent);
  }, [editor, initialContent]);

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onChange?.(editor.document)}
      shadCNComponents={{}}
    />
  );
}
