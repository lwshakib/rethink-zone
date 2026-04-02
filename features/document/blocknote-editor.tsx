"use client"; // Marks this as a client-side component for Next.js
import "@blocknote/core/fonts/inter.css"; // Load Default Inter fonts for the editor
import { Block, PartialBlock } from "@blocknote/core"; // Core types for BlockNote
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
const BlockNoteEditor = ({
  initialContent,
  onChange,
}: {
  initialContent?: PartialBlock[];
  onChange?: (content: Block[]) => void;
}) => {
  const { resolvedTheme } = useTheme(); // Access the current theme (light or dark)

  // Initialize the editor instance with optional starting content
  const editor = useCreateBlockNote({
    initialContent,
    uploadFile: async (file) => {
      // Step 1: Request a presigned URL from the server
      const { getPresignedUploadUrlAction } = await import("@/actions/files");
      const res = await getPresignedUploadUrlAction(file.name, file.type);
      if (!res.success) {
        throw new Error(res.error || "Failed to generate upload URL.");
      }

      const { uploadUrl, key } = res.data;

      // Step 2: Upload the file directly to S3/R2 via PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Unable to upload file to storage.");
      }

      // Step 3: Return the key so BlockNote can store it (temporarily)
      // We also want the editor to display the image immediately.
      // So we fetch a signed GET URL for it.
      const { getSignedUrlAction } = await import("@/actions/files");
      const signedRes = await getSignedUrlAction(key);

      if (!signedRes.success) {
        throw new Error("Failed to generate signed viewing URL.");
      }

      // We add the original key as a custom _s3Key to the object if possible,
      // though BlockNote doesn't directly support this.
      // Our sanitizeDocumentUrls logic expects this structure.
      return signedRes.data;
    },
  });

  return (
    <div className="blocknote-premium-container h-full w-full">
      {/* Renders the editor interface */}
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"} // Sync editor theme with application theme
        onChange={() => {
          // Fire the onChange callback whenever the document structure changes.
          // Note: editor.document will now contain the transient signed URLs.
          // These will be sanitized back to S3 keys before persistence in the page component.
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
        .bn-menu-item,
        .bn-button {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteEditor;
