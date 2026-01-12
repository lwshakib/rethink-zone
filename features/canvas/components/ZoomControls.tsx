import React from "react"; // React core
import { ZoomIn, ZoomOut, Scan, RefreshCw } from "lucide-react"; // Zoom and view utility icons

// Props interface for Zoom management UI
interface ZoomControlsProps {
  zoomPercent: number;    // Calculated zoom level shown as percentage string
  onZoomIn: () => void;   // Increment zoom trigger
  onZoomOut: () => void;  // Decrement zoom trigger
  onFitToScreen: () => void; // Fit all elements into the viewport
  onResetView: () => void;   // Reset pan and zoom to default (100% at center)
}

/**
 * ZoomControls - The floating control bar at the bottom-right of the canvas.
 */
const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetView,
}) => {
  return (
    <div
      // Prevent the mouse wheel from zooming the canvas while scrolling within this UI
      onWheel={(e) => e.stopPropagation()}
      // Styled with Glassmorphism for a premium desktop feel
      className="absolute right-6 bottom-6 flex items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      {/* ZOOM OUT BUTTON */}
      <button
        onClick={onZoomOut}
        className="flex items-center justify-center h-8 w-8 rounded-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <ZoomOut className="h-[18px] w-[18px]" />
      </button>
      {/* ZOOM PERCENTAGE READOUT */}
      <div className="px-1 text-[11px] font-bold text-foreground min-w-[45px] text-center font-mono">
        {zoomPercent}%
      </div>
      {/* ZOOM IN BUTTON */}
      <button
        onClick={onZoomIn}
        className="flex items-center justify-center h-8 w-8 rounded-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Zoom in"
        title="Zoom In"
      >
        <ZoomIn className="h-[18px] w-[18px]" />
      </button>
      {/* SEPARATOR */}
      <div className="h-4 w-px bg-border/40" />
      {/* FIT TO SCREEN ACTION */}
      <button
        onClick={onFitToScreen}
        className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        aria-label="Fit to screen"
        title="Fit to screen"
      >
        <Scan className="h-[18px] w-[18px]" />
      </button>
      {/* RESET VIEW ACTION */}
      <button
        onClick={onResetView}
        className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        aria-label="Reset zoom"
        title="Reset zoom"
      >
        <RefreshCw className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
};

export { ZoomControls };
export default ZoomControls;
