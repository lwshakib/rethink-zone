import React from "react"; // React core
import { Undo2, Redo2 } from "lucide-react"; // Undo/Redo icons

// Props required to drive the History UI and logic
interface HistoryControlsProps {
  canUndo: boolean;   // Whether there are previous snapshots to return to
  canRedo: boolean;   // Whether the user has undone something and can go forward again
  onUndo: () => void; // Trigger for the undo operation
  onRedo: () => void; // Trigger for the redo operation
}

/**
 * HistoryControls - Small floating UI for the Undo and Redo actions.
 */
const HistoryControls: React.FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div
      // Prevent mouse wheel events from zooming the canvas while interacting with this menu
      onWheel={(e) => e.stopPropagation()}
      // Sleek, minimal floating container at the bottom-left corner
      className="absolute left-6 bottom-6 flex items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo} // Button is inert if no history remains
        className={`flex items-center justify-center h-8 w-8 rounded-sm transition-all ${
          canUndo
            ? "text-foreground hover:bg-muted" // Active styling
            : "text-muted-foreground/30 cursor-not-allowed" // Disabled styling
        }`}
        aria-label="Undo"
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      {/* Visual separator line between actions */}
      <div className="h-4 w-px bg-border/40" />
      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo} // Button is inert if the peak of the stack is reached
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
