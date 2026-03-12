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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
        <div className="flex flex-col">
          <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-primary">Diagram Engine</h2>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[300px]">
            {figureName || "Generic Figure Instance"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 px-2 rounded-sm hover:bg-muted text-muted-foreground transition-colors group"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex px-6 pt-1 border-b border-border/30 bg-muted/5">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2.5 px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 ${
            activeTab === "ai" 
              ? "border-blue-500 text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={14} className={activeTab === "ai" ? "text-blue-500 animate-pulse" : ""} />
          AI Generate
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-2.5 px-5 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2 ${
            activeTab === "code" 
              ? "border-purple-500 text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 size={14} className={activeTab === "code" ? "text-purple-500" : ""} />
          Logic Script
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6 overflow-y-auto">
        {activeTab === "ai" ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Generative Prompt</label>
              <div className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded-full border border-blue-500/20">PREVIEW</div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your architecture... e.g. 'Build a multi-region VPC with auto-scaling EC2 instances and an RDS database connected via Peering connection'"
              className="flex-1 bg-muted/20 border border-border/50 rounded-sm p-5 text-sm font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500/30 resize-none placeholder:text-muted-foreground/20 italic"
            />
            <div className="text-[10px] text-muted-foreground/70 leading-relaxed bg-blue-500/5 p-4 rounded-sm border border-blue-500/10 flex gap-3">
              <div className="h-4 w-4 rounded-full bg-blue-500/20 flex-shrink-0 animate-pulse mt-0.5" />
              <span>
                Our AI model is training. For now, you can manually define your architecture using the <strong>Logic Script</strong> tab using the custom Diagram DSL.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Source Code (DSL)</label>
              <div className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold rounded-full border border-purple-500/20">REAL-TIME</div>
            </div>
            <div className="flex-1 relative group">
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
      <div className="p-6 pt-0 border-t border-border/50 bg-muted/5">
        <div className="grid grid-cols-2 gap-3 mb-4 mt-6">
          <button className="py-2 bg-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-700 transition-colors border border-white/5">
            Reset Template
          </button>
          <button className="py-2 bg-zinc-800 text-zinc-300 text-[9px] font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-700 transition-colors border border-white/5">
            Export JSON
          </button>
        </div>
        <button
          onClick={onSync}
          className="w-full py-4 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all shadow-lg active:scale-[0.99]"
        >
          SYNC & APPLY CHANGES
        </button>
      </div>
    </div>
  );
};

export { FigureEditorPanel };
export default FigureEditorPanel;
