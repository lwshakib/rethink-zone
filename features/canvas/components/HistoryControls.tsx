import React from "react";
import { Undo2, Redo2 } from "lucide-react";

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="absolute left-6 bottom-6 flex items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center justify-center h-8 w-8 rounded-sm transition-all ${
          canUndo
            ? "text-foreground hover:bg-muted"
            : "text-muted-foreground/30 cursor-not-allowed"
        }`}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <div className="h-4 w-px bg-border/40" />
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center justify-center h-8 w-8 rounded-sm transition-all ${
          canRedo
            ? "text-foreground hover:bg-muted"
            : "text-muted-foreground/30 cursor-not-allowed"
        }`}
        aria-label="Redo"
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export { HistoryControls };
export default HistoryControls;
