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

export default function ExcaliDraw({ initialData, onChange }: ExcaliDrawProps) {
  const { resolvedTheme, theme } = useTheme();
  const activeTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";
  // Excalidraw treats `initialData` as a reset trigger. If we feed changes from
  // `onChange` back into `initialData`, it can loop infinitely. Capture the
  // first non-null initialData only, so subsequent updates don't reset the scene.
  const initialDataRef = useRef<Record<string, unknown> | undefined>(
    initialData ?? undefined
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
      initialDataRef.current = initialData;
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
