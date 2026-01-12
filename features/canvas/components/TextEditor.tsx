import React, { RefObject } from "react"; // React core

// Interface for the active text editing state
interface TextEditorProps {
  textEditor: {
    value: string;      // Current text string
    fontSize: number;   // Raw canvas font size
    fontFamily?: string; 
    textAlign?: "left" | "center" | "right";
    fill?: string;       // Text color
    boxWidth?: number;   // Calculated width of the text block in canvas units
    boxHeight?: number;  // Calculated height of the text block in canvas units
    canvasX: number;     // Absolute canvas X position
    canvasY: number;     // Absolute canvas Y position
    pad?: number;        // Optional padding scaling
    kind?: string;       // Shape type (e.g., "text", "figure")
    index: number | null; // Index of the shape being edited
  } | null;
  setTextEditor: React.Dispatch<
    React.SetStateAction<TextEditorProps["textEditor"]>
  >; // Dispatch to update the local editing state
  textAreaRef: RefObject<HTMLTextAreaElement | null>; // Ref for focus management and DOM measurements
  canvasToClient: (x: number, y: number) => { x: number; y: number }; // Transform helper
  zoom: number; // Current zoom level for visual scaling of the textarea
  measureText: (text: string, fontSize: number, fontFamily?: string) => { width: number; height: number }; // Helper to live-update box bounds
  commitTextEditor: () => void; // Triggered on Enter/Blur to save changes to state
  cancelTextEditor: () => void; // Triggered on Esc to discard changes
  theme?: string; // App theme (light/dark)
}

/**
 * TextEditor - An overlay <textarea> that sits exactly on top of a text shape
 * during editing mode, providing a native OS editing experience.
 */
const TextEditor: React.FC<TextEditorProps> = ({
  textEditor,
  setTextEditor,
  textAreaRef,
  canvasToClient,
  zoom,
  measureText,
  commitTextEditor,
  cancelTextEditor,
  theme = "dark",
}) => {
  // Only render if a text shape is currently active for editing
  if (!textEditor) return null;

  // Resolve font fallback based on the app's internal font tokens
  const font = textEditor.fontFamily === "Rough" ? "cursive" : textEditor.fontFamily === "Mono" ? "monospace" : "sans-serif";
  const isDark = theme === "dark";
  const color = textEditor.fill || (isDark ? "white" : "black");

  return (
    <textarea
      autoFocus // Ensure typing starts immediately
      value={textEditor.value}
      onChange={(e) => {
        const val = e.target.value;
        // Re-measure bounds as the user types to expand/contract the box
        const measured = measureText(val, textEditor.fontSize, textEditor.fontFamily);
        setTextEditor((prev) =>
          prev
            ? {
                ...prev,
                value: val,
                boxWidth: measured.width,
                boxHeight: measured.height,
              }
            : prev
        );
      }}
      onKeyDown={(e) => {
        // Standard shortcuts: Enter (no shift) to sync, Escape to abort
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          commitTextEditor();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelTextEditor();
        }
      }}
      onBlur={commitTextEditor} // Save changes when clicking away
      onWheel={(e) => e.nativeEvent.stopPropagation()} // Stop zoom event from reaching canvas
      ref={textAreaRef}
      style={{
        position: "absolute",
        // Position exactly at the canvas coordinates transformed to client pixels
        left: `${
          canvasToClient(
            textEditor.canvasX - (textEditor.pad ?? 0),
            textEditor.canvasY - (textEditor.pad ?? 0)
          ).x
        }px`,
        top: `${
          canvasToClient(
            textEditor.canvasX - (textEditor.pad ?? 0),
            textEditor.canvasY - (textEditor.pad ?? 0)
          ).y
        }px`,
        zIndex: 2000,
        pointerEvents: "auto",
        // Scale the width/height based on current canvas zoom to maintain visual lock
        width: `${
          ((textEditor.boxWidth ?? 120) + (textEditor.pad ?? 4 / zoom) * 2) *
            zoom +
          2
        }px`,
        minWidth: `${20 * zoom}px`, // Minimum clickable area
        height: `${
          ((textEditor.boxHeight ?? textEditor.fontSize * 1.4) +
            (textEditor.pad ?? 4 / zoom) * 2) *
          zoom
        }px`,
        background: "transparent",
        color: color,
        border: "1.6px solid rgba(63,193,255,0.95)", // Blue outline indicating active edit mode
        outline: "none",
        borderRadius: 0,
        padding: `${(textEditor.pad ?? 4 / zoom) * zoom}px`,
        fontSize: textEditor.fontSize * zoom, // Scale font size by zoom
        fontFamily: font,
        textAlign: textEditor.textAlign || "left",
        fontWeight: textEditor.kind === "figure" ? "bold" : "normal",
        lineHeight: `${textEditor.fontSize * 1.2 * zoom}px`,
        resize: "none",
        overflow: "hidden",
        whiteSpace: "pre",
        wordBreak: "initial",
      }}
      rows={Math.max(1, textEditor.value.split("\n").length)}
    />
  );
};

export { TextEditor };
export default TextEditor;
