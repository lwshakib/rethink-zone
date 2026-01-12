/**
 * This utility file handles the dynamic loading of the BlockNote editor.
 * Since many rich-text editors rely on browser-only globals (like 'window' or 'document'),
 * we must disable Server-Side Rendering (SSR) for this component to prevent hydration errors in Next.js.
 */

"use client";

import dynamic from "next/dynamic";

/**
 * A client-safe version of the BlockNoteEditor.
 * It is loaded asynchronously and will only be executed in the browser environment.
 */
export const BlockNoteEditorView = dynamic(() => import("./blocknote-editor"), { ssr: false });
