import React, { useEffect, useRef } from "react"; // Importing React hooks for component logic
import Editor from 'react-simple-code-editor'; // A lightweight code editor component
import Prism from 'prismjs'; // Library for syntax highlighting
// Load specific Prism languages for syntax support
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import { CodeShape } from "../types"; // Type definition for the code shape object

// Prism tomorrow theme definitions for dark mode (CSS string)
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

// Prism light theme definitions (CSS string)
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

// Props interface for the CodeBlock component
interface CodeBlockProps {
  codeShape: CodeShape; // The data object for the code shape
  isSelected?: boolean; // If the shape is currently selected on the canvas
  isEditing?: boolean; // If the user is currently typing in the editor
  onUpdate: (updates: Partial<CodeShape>) => void; // Callback to update shape properties
  canvasToClient: (x: number, y: number) => { x: number; y: number }; // Transform helper
  zoom: number; // Current canvas zoom level
  theme?: string; // Current UI theme (light/dark)
}

/**
 * CodeBlock Component - Renders a syntax-highlighted editor as a canvas element
 */
const CodeBlock: React.FC<CodeBlockProps> = ({
  codeShape,
  isSelected,
  isEditing,
  onUpdate,
  canvasToClient,
  zoom,
  theme = "dark",
}) => {
  // Destructure required properties from the code shape object
  const { x, y, width, height, code, fontSize, language } = codeShape;
  // Convert canvas coordinates to screen-space pixel coordinates
  const clientPos = canvasToClient(x, y);
  // Refs for managing the DOM elements and preventing infinite resize loops
  const containerRef = useRef<HTMLDivElement>(null);
  const editorParentRef = useRef<HTMLDivElement>(null);

  // Storage for previous state to determine if updates are necessary
  const prevDimensionsRef = useRef({ width, height });
  const prevCodeRef = useRef(code);
  const prevFontSizeRef = useRef(fontSize);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === "dark"; // Helper boolean for theme checks

  // EFFECT: Auto-resize the code block based on content length and line count
  useEffect(() => {
    // Check what specific data changed
    const codeChanged = code !== prevCodeRef.current;
    const fontSizeChanged = fontSize !== prevFontSizeRef.current;

    // Guard: Only auto-resize if we are editing, initializing, or content changed
    if (!isEditing && prevDimensionsRef.current.width !== 0 && !codeChanged && !fontSizeChanged) {
      return;
    }

    // Clear any previous debounce timer
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce the resizing logic to ensure smoothness during typing
    updateTimeoutRef.current = setTimeout(() => {
      if (!editorParentRef.current) return;
      
      const textarea = editorParentRef.current.querySelector('textarea');
      const pre = editorParentRef.current.querySelector('pre');
      
      if (textarea && pre) {
        const lines = code.split('\n');
        
        // Temporarily reset height to 'auto' to let the content expand for measurement
        const originalHeight = editorParentRef.current.style.height;
        editorParentRef.current.style.height = 'auto';
        
        // Measure real content height
        const scrollHeight = pre.scrollHeight;
        const newHeight = Math.round(scrollHeight / (zoom || 1));
        
        // Revert height to keep layout stable until state propagates
        editorParentRef.current.style.height = originalHeight;
        
        // Create an off-screen canvas to measure the width of the longest line
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let maxW = 0;
        if (ctx) {
          ctx.font = `${(fontSize || 13)}px "Fira Mono", "Courier New", monospace`;
          lines.forEach(line => {
            maxW = Math.max(maxW, ctx.measureText(line).width);
          });
        }
        // Account for padding and a small buffer for the cursor/caret
        const newWidth = Math.round(maxW + 45);

        // Calculate differences to avoid tiny insignificant updates
        const hDiff = Math.abs(newHeight - height);
        const wDiff = Math.abs(newWidth - width);

        // Only commit updates to state if coordinates or size changed meaningfully
        if ((hDiff > 2 || wDiff > 2) && 
            (newHeight !== prevDimensionsRef.current.height || newWidth !== prevDimensionsRef.current.width)) {
          prevDimensionsRef.current = { width: newWidth, height: newHeight };
          onUpdate({ height: newHeight, width: newWidth });
        }

        // Cache the latest values
        prevCodeRef.current = code;
        prevFontSizeRef.current = fontSize;
      }
    }, 100);

    // Cleanup: Clear timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [code, fontSize, language, isEditing]);

  // EFFECT: Automatically focus the hidden textarea when the user enters 'Edit' mode
  useEffect(() => {
    if (isEditing && editorParentRef.current) {
      const textarea = editorParentRef.current.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  }, [isEditing]);

  // Transform function to apply syntax highlighting using Prism
  const highlightWithLineNumbers = (input: string) => {
    const lang = language?.toLowerCase() || 'javascript';
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(input, grammar, lang);
  };

  return (
    <div
      ref={containerRef}
      // Position the block absolutely on the background layer
      className={`absolute flex flex-col group ${isEditing ? 'z-[100]' : 'z-10'}`}
      onPointerDown={(e) => {
        // Prevent canvas interaction when clicking inside an active editor
        if (isEditing) e.stopPropagation();
      }}
      style={{
        left: `${clientPos.x}px`,
        top: `${clientPos.y}px`,
        width: `${width * zoom}px`, // Visual size scaled by zoom
        height: `${height * zoom}px`,
        pointerEvents: isEditing ? "auto" : "none", // Only capture events when editing
      }}
    >
      {/* Dynamic style tag to apply theme-specific token colors globally within this scope */}
      <style>{`
        ${isDark ? PRISM_DARK : PRISM_LIGHT}
        .prism-editor__textarea:focus { outline: none; }
      `}</style>
      <div 
        ref={editorParentRef}
        // Aesthetic styling for the editor container (Glassmorphism + Shadows)
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
          {/* Third-party editor component */}
          <Editor
            value={code}
            onValueChange={(newCode) => onUpdate({ code: newCode })} // Push changes back to canvas state
            highlight={highlightWithLineNumbers}
            readOnly={!isEditing}
            padding={20}
            className="prism-editor h-full w-full"
            placeholder="// Type your code here..."
            style={{
              fontFamily: '"Fira Mono", "Courier New", monospace',
              fontSize: (fontSize || 13) * zoom, // Visual font size scaled by zoom
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

