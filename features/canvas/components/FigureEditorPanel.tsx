import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  Code2, 
  HelpCircle, 
  ChevronRight, 
  Layers, 
  Square, 
  Download,
  Terminal,
  ArrowRight,
  Database,
  CloudIcon,
  Layout,
  Loader2,
  Trash2,
  Copy,
  Zap
} from "lucide-react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface FigureEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  figureId: string | null;
  figureName: string;
  code: string;
  onCodeChange: (newCode: string) => void;
  onSync: () => void;
}

// Custom Prism grammar for the Diagram DSL
const DSL_GRAMMAR = {
  'comment': /\/\/.*/,
  'group-name': {
    pattern: /^\s*[a-zA-Z0-9\s]+(?=\s*\{)/m,
    alias: 'class-name'
  },
  'node-name': {
    pattern: /^\s*[a-zA-Z0-9\s]+(?=\s*\[)/m,
    alias: 'function'
  },
  'property': {
    pattern: /[a-z-]+(?=:)/,
    alias: 'attr-name'
  },
  'string': {
    pattern: /"(?:\\.|[^\\"])*"/,
    greedy: true
  },
  'keyword': /\b(?:icon|label|color|type)\b/,
  'punctuation': /[{}[\]:,]/,
  'arrow': /->/,
};

/**
 * FigureEditorPanel - A premium slide-out panel for editing diagram logic.
 * Matches the design reference with a sleek dark aesthetic, syntax highlighting, and quick-action toolbar.
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
  const [activeTab, setActiveTab] = useState<string>("code");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  const EXAMPLE_PROMPTS = [
    { title: "Serverless Web", prompt: "A serverless web app on AWS with CloudFront, S3, API Gateway, and Lambda functions connecting to DynamoDB." },
    { title: "K8s Microservices", prompt: "A Kubernetes cluster with 3 worker nodes, a control plane, and an external load balancer." },
    { title: "Data Pipeline", prompt: "A GCP data pipeline with Cloud Scheduler triggering Cloud Run, which tasks Cloud Storage and BigQuery." },
    { title: "Global CDN", prompt: "Global Edge network with Route 53, WAF, and CloudFront distributing content from multi-region S3 buckets." }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description first.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate architecture");
      }

      const result = data.result;

      if (result) {
        onCodeChange(result);
        setActiveTab("code");
        toast.success("Architecture generated successfully!");
      }
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast.error(error.message || "Cloud engine failed to generate diagram.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-sync effect: applies changes as the user types (debounced)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onSync();
    }, 800); // 800ms debounce
    return () => clearTimeout(timer);
  }, [code, isOpen, onSync]);

  // Prevent wheel events from bubbling up to the canvas container (prevents zoom/pan while in editor)
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || !isOpen) return;

    const handleStopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    // Use a native listener with passive: false to ensure we can stop propagation/defaults if needed
    sidebar.addEventListener("wheel", handleStopWheel, { passive: false });
    return () => sidebar.removeEventListener("wheel", handleStopWheel);
  }, [isOpen]);

  const highlightJSON = (code: string) => {
    return Prism.highlight(code, DSL_GRAMMAR, "javascript");
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={sidebarRef}
      className="absolute top-0 right-0 h-full w-[480px] bg-[#121212] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[2000] flex flex-col animate-in slide-in-from-right duration-500 ease-out pointer-events-auto overflow-hidden"
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Header - Tabs Toggle */}
      <div className="flex h-20 items-center justify-center px-8 border-b border-white/5 shrink-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-lg h-10 p-1">
            <TabsTrigger 
              value="ai" 
              className="rounded-md text-xs font-medium transition-all data-[state=active]:bg-[#222] data-[state=active]:text-white"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="rounded-md text-xs font-medium transition-all data-[state=active]:bg-[#222] data-[state=active]:text-white"
            >
              DSL Editor
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Breadcrumb / Section Info - Refined per feedback */}
      <div className="flex items-center gap-4 px-8 py-6 shrink-0">
        <div className="text-white/60">
          <CloudIcon size={22} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white/90 leading-none">
              Cloud Architecture
            </h3>
            <span className="text-[11px] text-white/30 font-medium tracking-tight">
              Diagram-as-Code
            </span>
          </div>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
        {activeTab === "ai" ? (
          <div className="flex flex-col p-8 gap-8 animate-in fade-in duration-300">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-medium text-white/40">
                AI Architect Instructions
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe infrastructure changes (e.g. 'A serverless API with DynamoDB and S3')..."
                className="h-[140px] resize-none border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 text-sm py-4 px-5 rounded-md border focus:border-white/20 transition-all outline-none"
                disabled={isGenerating}
              />
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                variant="default"
                className="h-10 font-semibold text-xs rounded-md px-10 border border-white/10 bg-white text-black hover:bg-zinc-200 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Zap size={14} className="mr-2 fill-current text-zinc-600" />
                    Generate Architecture
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-medium text-white/20">Quick Examples</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {EXAMPLE_PROMPTS.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(ex.prompt)}
                    className="group flex flex-col items-start gap-1 p-3.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-left"
                  >
                    <span className="text-[11px] font-semibold text-white/60 group-hover:text-white transition-colors">
                      {ex.title}
                    </span>
                    <span className="text-[10px] text-white/20 line-clamp-1">
                      {ex.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="flex-1 flex flex-col relative overflow-auto scrollbar-thin scrollbar-thumb-white/10">
              <div className="min-h-full bg-transparent p-6">
                <style>{`
                  .prism-editor textarea { outline: none !important; }
                  .token.comment { color: #555 !important; font-style: italic; }
                  .token.keyword { color: #f97316 !important; }
                  .token.string { color: #a855f7 !important; }
                  .token.punctuation { color: #444 !important; }
                  .token.class-name { color: #3b82f6 !important; font-weight: bold; }
                  .token.function { color: #06b6d4 !important; }
                  .token.attr-name { color: #eab308 !important; }
                  .token.arrow { color: #ec4899 !important; }
                `}</style>
                <Editor
                  value={code}
                  onValueChange={onCodeChange}
                  highlight={highlightJSON}
                  padding={10}
                  style={{
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: '#999',
                    backgroundColor: 'transparent',
                    minHeight: '100%',
                  }}
                  className="prism-editor"
                />
              </div>
            </div>

            {/* Bottom Toolbar & Footer */}
            <div className="mt-auto border-t border-white/5 bg-black/20 pb-8 shrink-0">
              <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-1">
                  <button className="p-2 text-white/40 hover:text-white/80 transition-colors" title="Syntax Help">
                    <HelpCircle size={16} />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors">
                    <span className="text-white/20 font-mono mr-1">&gt;</span>
                    arrow
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors">
                    <span className="text-white/20 font-mono mr-1">{"{}"}</span>
                    group
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-white/40 hover:text-white/80 transition-colors">
                    <span className="text-white/20 font-mono mr-1">{"[]"}</span>
                    icon
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 p-2 text-white/40 hover:text-white/80 transition-colors rounded-lg hover:bg-white/5">
                        <Download size={16} />
                        <span className="sr-only">Download</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white/80">
                      <DropdownMenuItem className="hover:bg-white/5 text-[11px] font-bold cursor-pointer">Export as SVG</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 text-[11px] font-bold cursor-pointer">Export as PNG</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/5 text-[11px] font-bold cursor-pointer">Copy to Clipboard</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { FigureEditorPanel };
export default FigureEditorPanel;

