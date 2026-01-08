import React from "react";
import { ZoomIn, ZoomOut, Scan, RefreshCw } from "lucide-react";

interface ZoomControlsProps {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetView: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetView,
}) => {
  return (
    <div
      onWheel={(e) => e.stopPropagation()}
      className="absolute right-6 bottom-6 flex items-center gap-1.5 rounded-sm bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-border/40 z-10"
    >
      <button
        onClick={onZoomOut}
        className="flex items-center justify-center h-8 w-8 rounded-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Zoom out"
        title="Zoom Out"
      >
        <ZoomOut className="h-[18px] w-[18px]" />
      </button>
      <div className="px-1 text-[11px] font-bold text-foreground min-w-[45px] text-center font-mono">
        {zoomPercent}%
      </div>
      <button
        onClick={onZoomIn}
        className="flex items-center justify-center h-8 w-8 rounded-sm transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Zoom in"
        title="Zoom In"
      >
        <ZoomIn className="h-[18px] w-[18px]" />
      </button>
      <div className="h-4 w-px bg-border/40" />
      <button
        onClick={onFitToScreen}
        className="flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        aria-label="Fit to screen"
        title="Fit to screen"
      >
        <Scan className="h-[18px] w-[18px]" />
      </button>
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
