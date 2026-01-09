import React, { useEffect, useRef } from "react";
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { CodeShape } from "../types";

// Prism tomorrow theme for dark mode
const PRISM_DARK = `
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #999; }
  .token.punctuation { color: #ccc; }
  .token.namespace { opacity: .7; }
  .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #f8c555; }
  .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #7ec699; }
  .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #67cdcc; }
  .token.atrule, .token.attr-value, .token.keyword { color: #cc99cd; }
  .token.function, .token.class-name { color: #f08d49; }
  .token.regex, .token.important, .token.variable { color: #e2777a; }
  .prism-editor textarea, .prism-editor pre { 
    outline: none !important; 
    background-color: transparent !important; 
    min-height: 100% !important;
  }
`;

const PRISM_LIGHT = `
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #90a4ae; }
  .token.punctuation { color: #546e7a; }
  .token.namespace { opacity: .7; }
  .token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #e53935; }
  .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #43a047; }
  .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #00acc1; }
  .token.atrule, .token.attr-value, .token.keyword { color: #7b1fa2; }
  .token.function, .token.class-name { color: #1e88e5; }
  .token.regex, .token.important, .token.variable { color: #fb8c00; }
  .prism-editor textarea, .prism-editor pre { 
    outline: none !important; 
    background-color: transparent !important; 
    min-height: 100% !important;
  }
`;

interface CodeBlockProps {
  codeShape: CodeShape;
  isSelected?: boolean;
  isEditing?: boolean;
  onUpdate: (updates: Partial<CodeShape>) => void;
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  zoom: number;
  theme?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  codeShape,
  isSelected,
  isEditing,
  onUpdate,
  canvasToClient,
  zoom,
  theme = "dark",
}) => {
  const { x, y, width, height, code, fontSize, language } = codeShape;
  const clientPos = canvasToClient(x, y);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorParentRef = useRef<HTMLDivElement>(null);

  const prevDimensionsRef = useRef({ width, height });
  const prevCodeRef = useRef(code);
  const prevFontSizeRef = useRef(fontSize);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === "dark";

  // Auto-resize based on content - debounced to prevent loops
  useEffect(() => {
    const codeChanged = code !== prevCodeRef.current;
    const fontSizeChanged = fontSize !== prevFontSizeRef.current;

    // Only auto-resize if we are editing, if it's the first time, or if content/styling changed
    if (!isEditing && prevDimensionsRef.current.width !== 0 && !codeChanged && !fontSizeChanged) {
      return;
    }

    // Clear any pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the update to prevent rapid re-renders
    updateTimeoutRef.current = setTimeout(() => {
      if (!editorParentRef.current) return;
      
      const textarea = editorParentRef.current.querySelector('textarea');
      const pre = editorParentRef.current.querySelector('pre');
      
      if (textarea && pre) {
        const lines = code.split('\n');
        
        // Temporarily reset height to auto to measure actual "natural" content height
        const originalHeight = editorParentRef.current.style.height;
        editorParentRef.current.style.height = 'auto';
        
        // Measure height: scrollHeight will now reflect content + padding
        const scrollHeight = pre.scrollHeight;
        const newHeight = Math.round(scrollHeight / (zoom || 1));
        
        // Restore height for stability during the update
        editorParentRef.current.style.height = originalHeight;
        
        // Measure width using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let maxW = 0;
        if (ctx) {
          ctx.font = `${(fontSize || 13)}px "Fira Mono", "Courier New", monospace`;
          lines.forEach(line => {
            maxW = Math.max(maxW, ctx.measureText(line).width);
          });
        }
        // padding(20) * 2 + small buffer for caret
        const newWidth = Math.round(maxW + 45);

        // Only update if there's a significant change
        const hDiff = Math.abs(newHeight - height);
        const wDiff = Math.abs(newWidth - width);

        if ((hDiff > 2 || wDiff > 2) && 
            (newHeight !== prevDimensionsRef.current.height || newWidth !== prevDimensionsRef.current.width)) {
          prevDimensionsRef.current = { width: newWidth, height: newHeight };
          onUpdate({ height: newHeight, width: newWidth });
        }

        prevCodeRef.current = code;
        prevFontSizeRef.current = fontSize;
      }
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [code, fontSize, language, isEditing]); // Added isEditing to control when it runs

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && editorParentRef.current) {
      const textarea = editorParentRef.current.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  }, [isEditing]);

  const highlightWithLineNumbers = (input: string) => {
    const lang = language?.toLowerCase() || 'javascript';
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(input, grammar, lang);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute flex flex-col group ${isEditing ? 'z-[100]' : 'z-10'}`}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation();
      }}
      style={{
        left: `${clientPos.x}px`,
        top: `${clientPos.y}px`,
        width: `${width * zoom}px`,
        height: `${height * zoom}px`,
        pointerEvents: isEditing ? "auto" : "none",
      }}
    >
      <style>{`
        ${isDark ? PRISM_DARK : PRISM_LIGHT}
        .prism-editor__textarea:focus { outline: none; }
      `}</style>
      <div 
        ref={editorParentRef}
        className={`flex flex-col w-full h-full backdrop-blur-xl shadow-2xl overflow-hidden ${
          isEditing 
            ? "ring-[2px] ring-[rgba(83,182,255,1)] scale-[1.01] border-transparent" 
            : isSelected
              ? "ring-[1.5px] ring-[rgba(63,193,255,0.7)] border-transparent"
              : isDark
                ? "border border-white/5 hover:border-white/10"
                : "border border-black/[0.05] hover:border-black/[0.08]"
        }`}
        style={{
          borderRadius: 8 / zoom,
          backgroundColor: isDark 
            ? (isEditing ? "rgba(25,25,25,0.98)" : "rgba(13,13,13,0.85)")
            : (isEditing ? "rgba(252,252,252,0.98)" : "rgba(255,255,255,0.85)"),
          color: isDark ? "#eee" : "#333",
        }}
      >
        <div className="flex-1 w-full overflow-hidden p-0 relative">
          <Editor
            value={code}
            onValueChange={(newCode) => onUpdate({ code: newCode })}
            highlight={highlightWithLineNumbers}
            readOnly={!isEditing}
            padding={20}
            className="prism-editor h-full w-full"
            placeholder="// Type your code here..."
            style={{
              fontFamily: '"Fira Mono", "Courier New", monospace',
              fontSize: (fontSize || 13) * zoom,
              minHeight: '100%',
              minWidth: '100%',
              outline: 'none',
              backgroundColor: 'transparent',
              caretColor: '#3bc1ff',
              color: 'inherit',
              lineHeight: 1.5,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;

