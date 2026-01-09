import React, { RefObject } from "react";

interface TextEditorProps {
  textEditor: {
    value: string;
    fontSize: number;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    fill?: string;
    boxWidth?: number;
    boxHeight?: number;
    canvasX: number;
    canvasY: number;
    pad?: number;
    kind?: string;
    index: number | null;
  } | null;
  setTextEditor: React.Dispatch<
    React.SetStateAction<TextEditorProps["textEditor"]>
  >;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
  measureText: (text: string, fontSize: number, fontFamily?: string) => { width: number; height: number };
  commitTextEditor: () => void;
  cancelTextEditor: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  textEditor,
  setTextEditor,
  textAreaRef,
  canvasToClient,
  zoom,
  measureText,
  commitTextEditor,
  cancelTextEditor,
}) => {
  if (!textEditor) return null;

  const font = textEditor.fontFamily === "Rough" ? "cursive" : textEditor.fontFamily === "Mono" ? "monospace" : "sans-serif";
  const color = textEditor.fill || "white";

  return (
    <textarea
      autoFocus
      value={textEditor.value}
      onChange={(e) => {
        const val = e.target.value;
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
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          commitTextEditor();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelTextEditor();
        }
      }}
      onBlur={commitTextEditor}
      ref={textAreaRef}
      style={{
        position: "absolute",
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
        width: `${
          ((textEditor.boxWidth ?? 120) + (textEditor.pad ?? 4 / zoom) * 2) *
            zoom +
          2
        }px`,
        minWidth: `${20 * zoom}px`,
        height: `${
          ((textEditor.boxHeight ?? textEditor.fontSize * 1.4) +
            (textEditor.pad ?? 4 / zoom) * 2) *
          zoom
        }px`,
        background: "transparent",
        color: color,
        border: "1.6px solid rgba(63,193,255,0.95)",
        outline: "none",
        borderRadius: 0,
        padding: `${(textEditor.pad ?? 4 / zoom) * zoom}px`,
        fontSize: textEditor.fontSize * zoom,
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
