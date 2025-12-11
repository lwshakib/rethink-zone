"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useRef } from "react";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

type ExcaliDrawProps = {
  initialData?: Record<string, unknown> | null;
  onChange?: (data: Record<string, unknown>) => void;
};

// Sanitize initialData to fix serialization issues.
// When saved to DB, Map objects (like collaborators) become plain objects.
// Excalidraw expects collaborators to be a Map, so we convert it back.
function sanitizeInitialData(
  data: Record<string, unknown> | null | undefined
): Record<string, unknown> | undefined {
  if (!data) return undefined;

  const sanitized = { ...data };

  // Fix appState.collaborators - must be a Map, not a plain object
  if (sanitized.appState && typeof sanitized.appState === "object") {
    const appState = { ...(sanitized.appState as Record<string, unknown>) };

    // Convert collaborators to Map if it's not already
    if (appState.collaborators && !(appState.collaborators instanceof Map)) {
      // If it's an object or array, convert to empty Map (collaborators are session-specific)
      appState.collaborators = new Map();
    }

    sanitized.appState = appState;
  }

  return sanitized;
}

export default function ExcaliDraw({ initialData, onChange }: ExcaliDrawProps) {
  const { resolvedTheme, theme } = useTheme();
  const activeTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";
  // Excalidraw treats `initialData` as a reset trigger. If we feed changes from
  // `onChange` back into `initialData`, it can loop infinitely. Capture the
  // first non-null initialData only, so subsequent updates don't reset the scene.
  const initialDataRef = useRef<Record<string, unknown> | undefined>(
    sanitizeInitialData(initialData)
  );

  // Store onChange in a ref to keep handleChange stable across renders.
  // This prevents infinite loops caused by the callback being recreated
  // when the parent re-renders (which triggers Excalidraw's onChange again).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initialDataRef.current === undefined && initialData) {
      initialDataRef.current = sanitizeInitialData(initialData);
    }
  }, [initialData]);

  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      onChangeRef.current?.({
        elements,
        appState,
        files,
      });
    },
    [] // No dependencies - uses ref instead
  );

  return (
    <Excalidraw
      theme={activeTheme === "dark" ? "dark" : "light"}
      initialData={initialDataRef.current}
      onChange={handleChange}
    />
  );
}
