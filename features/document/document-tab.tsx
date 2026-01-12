/**
 * This component represents the main view for the 'Document' tab.
 * It serves as a container for the rich-text BlockNote editor, providing layout and styling.
 */

"use client";

// Import the dynamically loaded editor to avoid SSR (Server-Side Rendering) issues with BlockNote.
import { BlockNoteEditorView } from "./dynamic-import";

/**
 * DocumentTab Component
 * 
 * @param initialContent - The optional starting state of the document (passed to BlockNote).
 * @param onChange - An optional callback triggered whenever the editor content changes.
 */
export default function DocumentTab({ initialContent, onChange }: { initialContent?: any, onChange?: (content: any) => void }) {
  return (
    // Outer container: fills the available space, handles background, and custom scrolling styles.
    <div className="flex-1 w-full h-full overflow-y-auto bg-background custom-scrollbar">
      {/* Centering wrapper: limits the document width to a maximum for optimal readability. */}
      <div className="max-w-5xl mx-auto min-h-full flex flex-col">
        {/* Content area: provides responsive padding and mounts the actual editor component. */}
        <div className="flex-1 px-4 sm:px-12 py-10">
          <BlockNoteEditorView initialContent={initialContent} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
