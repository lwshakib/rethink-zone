import React from "react";
import { Edit3, X } from "lucide-react";
import { FigureShape } from "../types";

interface FigureButtonsProps {
  figures: FigureShape[];
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
  editingFigureId: string | null;
  onOpenEditor: (figureId: string) => void;
}

/**
 * FigureButtons - Renders an "Open Editor" button above each Figure on the canvas.
 */
const FigureButtons: React.FC<FigureButtonsProps> = ({
  figures,
  canvasToClient,
  zoom,
  editingFigureId,
  onOpenEditor,
}) => {
  return (
    <>
      {figures.map((figure) => {
        // Calculate the screen position (client coordinates) for the button.
        const pos = canvasToClient(figure.x + figure.width, figure.y);
        const isEditing = editingFigureId === figure.id;
        
        return (
          <div
            key={figure.id}
            className="absolute pointer-events-auto z-40"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y - 34}px`, // Positioned above the body, near the header
              transform: 'translateX(-100%)',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditor(figure.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all shadow-2xl active:scale-95 ${
                isEditing 
                  ? "bg-red-500/90 text-white border-red-400/50 hover:bg-red-600" 
                  : "bg-black/90 text-white border-white/20 hover:bg-zinc-800"
              }`}
            >
              {isEditing ? (
                <>
                  <X size={11} className="text-white" />
                  CLOSE EDITOR
                </>
              ) : (
                <>
                  <Edit3 size={11} className="text-blue-400" />
                  OPEN EDITOR
                </>
              )}
            </button>
          </div>
        );
      })}
    </>
  );
};

export { FigureButtons };
export default FigureButtons;
