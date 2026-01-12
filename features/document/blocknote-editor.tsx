"use client"; // Marks this as a client-side component for Next.js
import "@blocknote/core/fonts/inter.css"; // Load Default Inter fonts for the editor
import { useCreateBlockNote } from "@blocknote/react"; // Hook to initialize the BlockNote editor instance
import { BlockNoteView } from "@blocknote/shadcn"; // The view component that renders the editor UI
import "@blocknote/shadcn/style.css"; // Core styles for the Shadcn-themed BlockNote components
// Importing Shadcn UI primitives to be used by the editor's internal components
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as Card from "@/components/ui/card";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import * as Form from "@/components/ui/form";
import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as Popover from "@/components/ui/popover";
import * as Select from "@/components/ui/select";
import * as Tabs from "@/components/ui/tabs";
import * as Toggle from "@/components/ui/toggle";
import * as Tooltip from "@/components/ui/tooltip";

import { useTheme } from "next-themes"; // Hook to manage light/dark mode

/**
 * BlockNoteEditor - A high-performance, block-based rich text editor.
 */
const BlockNoteEditor = ({ initialContent, onChange }: { initialContent?: any, onChange?: (content: any) => void }) => {
  const { resolvedTheme } = useTheme(); // Access the current theme (light or dark)
  
  // Initialize the editor instance with optional starting content
  const editor = useCreateBlockNote({
    initialContent: initialContent ? (initialContent as any) : undefined,
  });

  return (
    <div className="blocknote-premium-container h-full w-full">
      {/* Renders the editor interface */}
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"} // Sync editor theme with application theme
        onChange={() => {
          // Fire the onChange callback whenever the document structure changes
          onChange?.(editor.document);
        }}
        // Injects our application's Shadcn components into the editor for a native feel
        shadCNComponents={{
          Badge,
          Button,
          Card,
          DropdownMenu,
          Form,
          Input,
          Label,
          Popover,
          Select,
          Tabs,
          Toggle,
          Tooltip,
        }}
      />
      {/* Custom CSS overrides to blend the editor perfectly into our branding */}
      <style jsx global>{`
        .blocknote-premium-container .bn-editor {
          padding-left: 0 !important;
          padding-right: 0 !important;
          background: transparent !important;
        }
        .blocknote-premium-container .bn-container {
          background: transparent !important;
        }
        .blocknote-premium-container .bn-editor [data-content-editable] {
          padding-left: 0 !important;
          padding-right: 0 !important;
          min-height: 200px;
        }
        .blocknote-premium-container .bn-block-outer {
           margin-left: 0 !important;
        }
        /* Enhance the aesthetic of internal menu items and buttons */
        .bn-menu-item, .bn-button {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteEditor;
