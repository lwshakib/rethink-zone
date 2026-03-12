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
        return null; // Buttons removed as per user request
      })}
    </>
  );
};

export { FrameButtons };
export default FrameButtons;
