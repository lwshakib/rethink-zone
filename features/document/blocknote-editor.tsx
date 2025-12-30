"use client";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
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

import { useTheme } from "next-themes";

const BlockNoteEditor = ({ initialContent, onChange }: { initialContent?: any, onChange?: (content: any) => void }) => {
  const { resolvedTheme } = useTheme();
  const editor = useCreateBlockNote({
    initialContent: initialContent ? (initialContent as any) : undefined,
  });

  return (
    <div className="blocknote-premium-container h-full w-full">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={() => {
          onChange?.(editor.document);
        }}
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
        /* Make internal UI elements feel more like our theme */
        .bn-menu-item, .bn-button {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default BlockNoteEditor;
