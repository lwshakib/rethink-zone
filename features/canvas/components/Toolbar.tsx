import React from "react"; // React core
// Importing Lucide icons for each primary drawing and manipulation tool
import {
  Hand,
  MousePointer2,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  PenLine,
  LucideIcon,
} from "lucide-react";
import { Tool } from "../types"; // Tool enum/type definition

// Props required to manage the active tool state
interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: Tool) => void; // Callback to switch tools
}

/**
 * Toolbar - The vertical primary tool selector on the left side of the canvas.
 */
const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  // Configuration for each tool in the bar
  const tools: { icon: LucideIcon; label: Tool }[] = [
    { icon: Hand, label: "Hand" },          // For panning the canvas
    { icon: MousePointer2, label: "Select" }, // For selecting and moving shapes
    { icon: Square, label: "Rectangle" },   // Draw tool
    { icon: Circle, label: "Circle" },      // Draw tool
    { icon: Minus, label: "Line" },         // Draw tool
    { icon: ArrowRight, label: "Arrow" },   // Draw tool
    { icon: Type, label: "Text" },          // Rich text tool
    { icon: PenLine, label: "Pencil" },     // Freehand drawing tool
  ];

  return (
    <div
      // Ensure scrolling the mouse over the toolbar doesn't accidentally zoom the canvas background
      onWheel={(e) => e.stopPropagation()}
      // Sleek vertical pill-style container with Glassmorphism
      className="absolute left-6 top-20 flex flex-col items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      {/* Map through the tool configuration to render buttons */}
      {tools.map(({ icon: Icon, label }) => {
        const isActive = activeTool === label; // Determine if this specific tool is currently in use
        return (
          <button
            key={label}
            onClick={() => setActiveTool(label)} // Update parent state on click
            // Apply distinct styles for active vs inactive buttons for clear visual feedback
            className={`flex items-center justify-center rounded-sm h-9 w-9 transition-all duration-200 ${
              isActive
                ? "bg-muted text-foreground shadow-sm" // Highlighted state
                : "text-muted-foreground hover:bg-muted hover:text-foreground" // Default state
            }`}
            title={label}
            aria-label={label}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}
    </div>
  );
};

export { Toolbar };
export default Toolbar;
