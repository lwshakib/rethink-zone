"use client"; // Indicates this component runs on the client side

import CanvasArea from "@/features/canvas/CanvasArea"; // Core canvas drawing component
import { CanvasAreaProps } from "@/features/canvas/types"; // Type definitions for canvas properties

/**
 * CanvasTab - Wrapper component that provides a full-height container for the CanvasArea.
 */
export default function CanvasTab({ initialData, onChange }: CanvasAreaProps) {
  return (
    // Outer flex container ensuring the tab fills available height
    <div className="flex h-full min-h-0">
      {/* Inner wrapper to manage overflow and sizing consistency */}
      <div className="min-h-0 h-full w-full">
        {/* The main interactive canvas workspace */}
        <CanvasArea initialData={initialData} onChange={onChange} />
      </div>
    </div>
  );
}
