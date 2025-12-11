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

  useEffect(() => {
    if (initialDataRef.current === undefined && initialData) {
      initialDataRef.current = initialData;
    }
  }, [initialData]);

  const handleChange = useCallback(
    (elements: any, appState: any, files: any) => {
      onChange?.({
        elements,
        appState,
        files,
      });
    },
    [onChange]
  );

  return (
    <Excalidraw
      theme={activeTheme === "dark" ? "dark" : "light"}
      initialData={initialDataRef.current}
      onChange={handleChange}
    />
  );
}
