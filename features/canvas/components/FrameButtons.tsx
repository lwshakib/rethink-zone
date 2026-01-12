import React from "react"; // React core
import { Brush } from "lucide-react"; // AI generation icon
import { FrameShape } from "../types"; // Frame shape type definition

// Props required for FrameButtons
interface FrameButtonsProps {
  frames: FrameShape[]; // Array of all frames currently on canvas
  canvasToClient: (x: number, y: number) => { x: number; y: number }; // Transform helper
  zoom: number; // Current view zoom level
}

/**
 * FrameButtons - Renders contextual action buttons on top of Frame shapes.
 */
const FrameButtons: React.FC<FrameButtonsProps> = ({
  frames,
  canvasToClient,
  zoom,
}) => {
  return (
    <>
      {/* Loop through each frame to position a button above its top-right corner */}
      {frames.map((frame, idx) => {
        const buttonX = frame.x + frame.width; // Far right edge of frame
        const buttonY = frame.y;              // Top edge of frame
        const clientPos = canvasToClient(buttonX, buttonY); // Convert to UI pixels
        return (
          <div
            key={`frame-button-${idx}`}
            // Overlaying div positioned absolutely
            className="absolute pointer-events-auto z-50"
            style={{
              left: `${clientPos.x}px`,
              top: `${clientPos.y}px`,
              // Transform to align the button container properly relative to the frame corner
              transform: `translate(-100%, -100%) scale(${zoom})`,
              transformOrigin: "bottom right",
              paddingBottom: "8px", // Visual spacing from the frame border
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent clicks from selecting the canvas
            }}
          >
            {/* The actual clickable action button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Placeholder for future AI integration
                console.log(
                  "Generate Design clicked for frame",
                  frame.frameNumber
                );
              }}
              // Premium styling using Glassmorphism (blur + subtle border)
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
