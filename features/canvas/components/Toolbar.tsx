import React from "react";
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
import { Tool } from "../types";

interface ToolbarProps {
  activeTool: string;
  setActiveTool: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  const tools: { icon: LucideIcon; label: Tool }[] = [
    { icon: Hand, label: "Hand" },
    { icon: MousePointer2, label: "Select" },
    { icon: Square, label: "Rectangle" },
    { icon: Circle, label: "Circle" },
    { icon: Minus, label: "Line" },
    { icon: ArrowRight, label: "Arrow" },
    { icon: Type, label: "Text" },
    { icon: PenLine, label: "Pencil" },
  ];

  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="absolute left-6 top-20 flex flex-col items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      {tools.map(({ icon: Icon, label }) => {
        const isActive = activeTool === label;
        return (
          <button
            key={label}
            onClick={() => setActiveTool(label)}
            className={`flex items-center justify-center rounded-sm h-9 w-9 transition-all duration-200 ${
              isActive
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
