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

const BlockNoteEditor = ({ initialContent, onChange }: { initialContent?: any, onChange?: (content: any) => void }) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent ? (initialContent as any) : undefined,
  });

  return (
    <BlockNoteView
      editor={editor}
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
  );
};

export default BlockNoteEditor;
