import React from "react";
import { Brush } from "lucide-react";
import { FrameShape } from "../types";

interface FrameButtonsProps {
  frames: FrameShape[];
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
}

const FrameButtons: React.FC<FrameButtonsProps> = ({
  frames,
  canvasToClient,
  zoom,
}) => {
  return (
    <>
      {frames.map((frame, idx) => {
        const buttonX = frame.x + frame.width;
        const buttonY = frame.y;
        const clientPos = canvasToClient(buttonX, buttonY);
        return (
          <div
            key={`frame-button-${idx}`}
            className="absolute pointer-events-auto z-50"
            style={{
              left: `${clientPos.x}px`,
              top: `${clientPos.y}px`,
              transform: `translate(-100%, -100%) scale(${zoom})`,
              transformOrigin: "bottom right",
              paddingBottom: "8px",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(
                  "Generate Design clicked for frame",
                  frame.frameNumber
                );
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 bg-white/8 backdrop-blur-xl border border-white/12 hover:bg-white/12 transition-colors whitespace-nowrap"
              style={{ pointerEvents: "auto" }}
            >
              <Brush size={12} />
              Generate with AI
            </button>
          </div>
        );
      })}
    </>
  );
};

export { FrameButtons };
export default FrameButtons;
