import { Button } from "@/components/ui/button";
import { Edit3, X, Terminal } from "lucide-react";
import { FigureShape, SelectedShape } from "../types";

interface FigureButtonsProps {
  figures: FigureShape[];
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
  selectedShape: SelectedShape;
  editingFigureId: string | null;
  onOpenEditor: (figureId: string) => void;
}

/**
 * FigureButtons - Renders an "Open Editor" button next to each Figure title on the canvas.
 * Now only appears when the figure itself is selected.
 */
const FigureButtons: React.FC<FigureButtonsProps> = ({
  figures,
  canvasToClient,
  zoom,
  selectedShape,
  editingFigureId,
  onOpenEditor,
}) => {
  return (
    <>
      {figures.map((figure) => {
        const isEditing = editingFigureId === figure.id;
        const isSelected = selectedShape.some(s => s.kind === "figure" && s.id === figure.id);
        
        // Hide buttons if not selected and not currently editing
        if (!isSelected && !isEditing) return null;
        
        // Match the sizing logic from drawing.ts to position precisely
        const headerHeight = 26 / zoom;
        const headerGap = 8 / zoom;
        
        // Approximate the title width for positioning (12px font)
        const text = figure.title || `Figure ${figure.figureNumber}`;
        const charWidth = 7 / zoom; 
        const iconSize = 10 / zoom;
        const hPadding = 10 / zoom;
        const iconGap = 8 / zoom;
        const textWidth = text.length * charWidth;
        const hWidth = textWidth + iconSize + iconGap + hPadding * 2;
        
        // Position to the right of the title pill - reduced gap to 1px
        const pos = canvasToClient(figure.x + hWidth + (1 / zoom), figure.y - headerHeight - headerGap);
        
        return (
          <div
            key={figure.id}
            className="absolute pointer-events-auto z-40 flex items-center gap-1.5 h-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              height: `${headerHeight * zoom}px`
            }}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenEditor(figure.id);
              }}
              className={`h-full flex items-center gap-1.5 px-3 py-0 text-[10px] font-bold uppercase tracking-widest rounded-[3px] border transition-all shadow-xl active:scale-95 bg-black text-white hover:bg-zinc-900 border-white/20`}
            >
              {isEditing ? (
                <>
                  <X size={12} className="text-red-400" />
                  Close Editor
                </>
              ) : (
                <>
                  <Terminal size={12} className="text-blue-400" />
                  Open Editor
                </>
              )}
            </Button>
          </div>
        );
      })}
    </>
  );
};

export { FigureButtons };
export default FigureButtons;
