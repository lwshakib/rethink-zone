"use client";

import dynamic from "next/dynamic";

export const BlockNoteEditorView = dynamic(() => import("./blocknote-editor"), { ssr: false });
