import React from "react";
import { Edit3 } from "lucide-react";
import { FigureShape } from "../types";

interface FigureButtonsProps {
  figures: FigureShape[];
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
  onOpenEditor: (figureId: string) => void;
}

/**
 * FigureButtons - Renders an "Open Editor" button above each Figure on the canvas.
 */
const FigureButtons: React.FC<FigureButtonsProps> = ({
  figures,
  canvasToClient,
  zoom,
  onOpenEditor,
}) => {
  return (
    <>
      {figures.map((figure) => {
        // Calculate the screen position (client coordinates) for the button.
        // We place it near the top-right of the figure body.
        const pos = canvasToClient(figure.x + figure.width, figure.y);
        
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/90 backdrop-blur-md text-white text-[10px] font-semibold rounded-sm border border-white/20 hover:bg-zinc-800 transition-all shadow-2xl active:scale-95"
            >
              <Edit3 size={11} className="text-blue-400" />
              OPEN EDITOR
            </button>
          </div>
        );
      })}
    </>
  );
};

export { FigureButtons };
export default FigureButtons;
