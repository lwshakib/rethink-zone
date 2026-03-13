import { Button } from "@/components/ui/button";
import { Edit3, X, Terminal } from "lucide-react";
import { FigureShape, SelectedShape } from "../types";
import { measureText } from "../utils/canvas-helpers";

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
        
        // Match the sizing logic from drawing.ts (now constant screen size)
        const headerHeight = 20 / zoom;
        const headerGap = 10 / zoom; // Increased vertical gap to separate from the body
        
        // Precise title width calculation matching drawing.ts
        const text = figure.title || `Figure ${figure.figureNumber}`;
        const measured = measureText(text, 11 / zoom, "sans-serif", 600); 
        const textWidth = measured.width;
        
        const iconSize = 10 / zoom;
        const hPadding = 8 / zoom; 
        const iconGap = 4 / zoom; 
        const hWidth = textWidth + iconSize + iconGap + hPadding * 2;
        
        // Position to the right of the title pill - increased horizontal gap
        const buttonXOffset = hWidth + (8 / zoom); 
        const buttonYOffset = -headerHeight - headerGap; 
        
        const pos = canvasToClient(figure.x + buttonXOffset, figure.y + buttonYOffset);
        
        return (
          <div
            key={figure.id}
            className="absolute pointer-events-auto z-40 flex items-center h-auto"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              height: `20px` // Balanced constant screen height
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
              className={`h-full flex items-center gap-1.5 px-3 py-0 text-[11px] font-bold tracking-widest rounded-[3px] border transition-all shadow-xl active:scale-95 bg-black text-white hover:bg-zinc-900 border-white/20`}
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
