"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

export default function ExcaliDraw() {
  const { resolvedTheme, theme } = useTheme();
  const activeTheme = (theme === "system" ? resolvedTheme : theme) ?? "light";

  return <Excalidraw theme={activeTheme === "dark" ? "dark" : "light"} />;
}
