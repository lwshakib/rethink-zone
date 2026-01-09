import React, { useEffect, useRef } from "react";
import { CodeShape } from "../types";

interface CodeBlockProps {
  codeShape: CodeShape;
  isSelected?: boolean;
  isEditing?: boolean;
  onUpdate: (updates: Partial<CodeShape>) => void;
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  codeShape,
  isSelected,
  isEditing,
  onUpdate,
  canvasToClient,
  zoom,
}) => {
  const { x, y, width, height, code, fill, fontSize } = codeShape;
  const clientPos = canvasToClient(x, y);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize height based on content
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      const newHeight = scrollHeight / zoom;
      
      // Only update if height changed significantly to avoid loops
      if (Math.abs(newHeight - height) > 1) {
        onUpdate({ height: newHeight });
      }
      textAreaRef.current.style.height = "";
    }
  }, [code, width, fontSize, zoom]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      className="absolute flex flex-col group"
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation();
      }}
      style={{
        left: `${clientPos.x}px`,
        top: `${clientPos.y}px`,
        width: `${width * zoom}px`,
        height: `${height * zoom}px`,
        zIndex: isEditing ? 100 : 10,
        pointerEvents: isEditing ? "auto" : "none",
      }}
    >
      <div 
        className={`flex flex-col w-full h-full backdrop-blur-md shadow-sm overflow-hidden ${
          isSelected || isEditing
            ? "ring-[2px] ring-[rgba(63,193,255,0.95)] shadow-xl" 
            : "border border-border/40 hover:border-border/60"
        }`}
        style={{
          borderRadius: 4 / zoom,
          backgroundColor: fill || "rgba(255,255,255,0.05)",
        }}
      >
        <textarea
          ref={textAreaRef}
          value={code}
          readOnly={!isEditing}
          onChange={(e) => onUpdate({ code: e.target.value })}
          className={`w-full h-full bg-transparent p-4 text-[13px] font-mono text-foreground outline-none resize-none overflow-hidden selection:bg-primary/20 ${!isEditing ? 'cursor-default select-none' : ''}`}
          spellCheck={false}
          placeholder="// Type your code here..."
          style={{ 
            fontSize: (fontSize || 13) * zoom,
            lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  );
};

export default CodeBlock;
