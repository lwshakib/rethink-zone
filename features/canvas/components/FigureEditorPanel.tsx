import React, { useState } from "react";
import { X, Sparkles, Code2 } from "lucide-react";

interface FigureEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  figureId: string | null;
  figureName: string;
  code: string;
  onCodeChange: (newCode: string) => void;
  onSync: () => void;
}

/**
 * FigureEditorPanel - A slide-out panel for editing the logic/design of a Figure using AI or a custom DSL.
 */
const FigureEditorPanel: React.FC<FigureEditorPanelProps> = ({
  isOpen,
  onClose,
  figureId,
  figureName,
  code,
  onCodeChange,
  onSync,
}) => {
  const [activeTab, setActiveTab] = useState<"ai" | "code">("code");
  const [prompt, setPrompt] = useState("");

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-[450px] bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl z-[2000] flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto">
      {/* Header / Tabs - Minimalist */}
      <div className="flex px-2 pt-2 border-b border-border/30 bg-muted/5">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2.5 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === "ai" 
              ? "border-blue-500 text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={14} className={activeTab === "ai" ? "text-blue-500" : ""} />
          AI
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2.5 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === "code" 
              ? "border-purple-500 text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 size={14} className={activeTab === "code" ? "text-purple-500" : ""} />
          CODE
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === "ai" ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Describe edit prompt</label>
              <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded-full border border-blue-500/20">AGENTIC</div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'Add a database connected to the web server' or 'Reorganize for high availability'..."
              className="flex-1 bg-muted/20 border border-border/50 rounded-sm p-5 text-sm font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500/30 resize-none placeholder:text-muted-foreground/20 italic"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Logic Script (DSL)</label>
              <div className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold rounded-full border border-purple-500/20">REAL-TIME</div>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="// Define groups, nodes and connections here..."
                className="absolute inset-0 w-full h-full bg-zinc-950 text-zinc-100 border border-border/50 rounded-sm p-5 text-[13px] font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500/40 resize-none scrollbar-thin scrollbar-thumb-zinc-800"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-6 pt-4 border-t border-border/50 bg-muted/5">
        <button
          onClick={onSync}
          className="w-full py-5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.25em] rounded-sm hover:opacity-90 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-3"
        >
          SYNC & APPLY CHANGES
        </button>
      </div>
    </div>
  );
};

export { FigureEditorPanel };
export default FigureEditorPanel;
