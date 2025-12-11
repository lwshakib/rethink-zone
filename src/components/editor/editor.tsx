"use client";

import "@blocknote/core/fonts/inter.css";
import { Block, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useEffect, useRef } from "react";

type EditorProps = {
  initialContent?: PartialBlock[] | null;
  onChange?: (doc: Block[]) => void;
};

// BlockNote wrapper that supports initial content and change tracking.
export default function Editor({ initialContent, onChange }: EditorProps) {
  // Track whether initial content has already been loaded
  const hasLoadedInitialContent = useRef(false);

  const editor = useCreateBlockNote({
    initialContent: initialContent ?? undefined,
  });

  // Only sync content ONCE when initialContent first becomes available (e.g. when loading from API).
  // This prevents infinite loops caused by onChange -> parent state update -> initialContent change -> replaceBlocks.
  useEffect(() => {
    if (!editor || !initialContent) return;

    // Only replace blocks if we haven't loaded initial content yet
    if (!hasLoadedInitialContent.current) {
      hasLoadedInitialContent.current = true;
      // Check if the editor already has content from initialization
      const editorHasContent =
        editor.document.length > 1 ||
        (editor.document.length === 1 &&
          editor.document[0].type !== "paragraph");

      // Only replace if editor is empty (just has default empty paragraph)
      if (!editorHasContent) {
        editor.replaceBlocks(editor.document, initialContent);
      }
    }
  }, [editor, initialContent]);

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onChange?.(editor.document)}
      shadCNComponents={{}}
    />
  );
}
