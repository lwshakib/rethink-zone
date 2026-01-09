import React, { useMemo, useState, useEffect, useRef } from "react";
import { 
  Copy, Trash2, Palette, Sun, 
  Circle, Square, Triangle, Diamond, Hexagon, Star, 
  Minus, Type, Image as LucideImage, Frame as LucideFrame,
  Activity, ChevronDown, Check, MoreVertical, Layers,
  AlignLeft, AlignCenter, AlignRight, MessageSquare, Plus,
  Code as CodeIcon, Type as TypeIcon
} from "lucide-react";
import { SelectedShape, RectShape, CircleShape, ImageShape, TextShape, FrameShape, PolyShape, LineShape, ArrowShape, CodeShape, Connector } from "../types";
import ColorPicker from "./ColorPicker";

interface FloatingToolbarProps {
  selectedShape: SelectedShape;
  rectangles: RectShape[];
  circles: CircleShape[];
  images: ImageShape[];
  texts: TextShape[];
  frames: FrameShape[];
  polygons: PolyShape[];
  lines: LineShape[];
  arrows: ArrowShape[];
  codes: CodeShape[];
  connectors: Connector[];
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  onUpdateShape: (kind: string, index: number, updates: any) => void;
  onChangeKind: (kind: string, index: number, newKind: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const COLOR_PALETTES = [
  "#1e1e1e", "#eab308", "#22c55e", "#3b82f6", "#a855f7",
  "#ef4444", "#f97316", "#ffffff", "rainbow"
];

const SHAPES = [
  { kind: "rect", icon: Square, label: "Rectangle" },
  { kind: "circle", icon: Circle, label: "Circle" },
  { kind: "poly:Diamond", icon: Diamond, label: "Diamond" },
  { kind: "poly:Triangle", icon: Triangle, label: "Triangle" },
  { kind: "poly:Hexagon", icon: Hexagon, label: "Hexagon" },
  { kind: "poly:Star", icon: Star, label: "Star" },
];

const FONT_FAMILIES = ["Rough", "Clean", "Mono"];
const ALIGNMENTS = [
  { icon: AlignLeft, value: "left" },
  { icon: AlignCenter, value: "center" },
  { icon: AlignRight, value: "right" },
];
const SIZE_PRESETS = [
  { label: "Small", value: 12 },
  { label: "Medium", value: 18 },
  { label: "Large", value: 24 },
  { label: "X-Large", value: 36 },
];
const LANGUAGES = ["Auto detect", "Javascript", "Typescript", "Python", "Go", "Rust", "Swift", "Kotlin", "Java", "C++", "C#"];

const PopoverContainer = React.memo(({ children, active, className = "", style = {} }: { children: React.ReactNode, active: boolean, className?: string, style?: React.CSSProperties }) => {
  if (!active) return null;
  return (
    <div 
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col gap-2 p-2 bg-[#1e1e1e] backdrop-blur-md rounded-sm border border-border shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200 z-[1001] ${className}`}
      style={style}
      onPointerDown={e => e.stopPropagation()}
      onWheel={e => {
        e.stopPropagation();
        e.nativeEvent.stopPropagation();
      }}
    >
      {children}
    </div>
  );
});

PopoverContainer.displayName = "PopoverContainer";

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedShape,
  rectangles,
  circles,
  images,
  texts,
  frames,
  polygons,
  lines,
  arrows,
  codes,
  connectors,
  onUpdateShape,
  onChangeKind,
  onDelete,
  onDuplicate,
}) => {
  const [activePopover, setActivePopover] = useState<string>("none");
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (toolbarRef.current && !e.composedPath().includes(toolbarRef.current)) {
        setActivePopover("none");
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const shapeData = useMemo(() => {
    if (selectedShape.length === 0) return null;
    const { kind, id } = selectedShape[0];
    const findById = (arr: any[]) => arr.find(s => s.id === id);
    
    const source = kind === "rect" ? findById(rectangles) :
                   kind === "circle" ? findById(circles) :
                   kind === "image" ? findById(images) :
                   kind === "text" ? findById(texts) :
                   kind === "frame" ? findById(frames) :
                   kind === "poly" ? findById(polygons) :
                   kind === "line" ? findById(lines) :
                   kind === "arrow" ? findById(arrows) : 
                   kind === "code" ? findById(codes) :
                   kind === "connector" ? findById(connectors) : null;
    
    if (!source) return null;
    const label = kind === "poly" ? (source as PolyShape).type : 
                  kind === "connector" ? "Connection" :
                  kind.charAt(0).toUpperCase() + kind.slice(1);
    return { ...source, kind, label };
  }, [selectedShape, rectangles, circles, images, texts, frames, polygons, lines, arrows, codes, connectors]);

  if (selectedShape.length === 0 || !shapeData) return null;

  const mainKind = selectedShape[0]?.kind;
  const mainIndex = selectedShape[0]?.index;
  const isMulti = selectedShape.length > 1;

  const currentOpacity = (shapeData && "opacity" in shapeData) ? (shapeData.opacity as number) : 1;
  const currentFill = (shapeData && "fill" in shapeData) ? (shapeData.fill as string || "#ffffff") : "#ffffff";
  const currentFontSize = (shapeData && "fontSize" in shapeData) ? (shapeData.fontSize as number) : 18;
  const currentFontFamily = (shapeData && "fontFamily" in shapeData) ? (shapeData.fontFamily as string || "Clean") : "Clean";
  const currentTextAlign = (shapeData && "textAlign" in shapeData) ? (shapeData.textAlign as string || "left") : "left";
  const currentLanguage = (shapeData && "language" in shapeData) ? (shapeData.language as string || "Auto detect") : "Auto detect";

  const renderColorGrid = () => (
    <div className="flex flex-col gap-2 p-1">
      <div className="grid grid-cols-5 gap-2">
        {COLOR_PALETTES.slice(0, 5).map((color) => (
          <button
            key={color}
            onClick={() => onUpdateShape(mainKind, mainIndex, { fill: color })}
            className={`h-9 w-9 rounded-sm border transition-all hover:scale-105 flex items-center justify-center ${currentFill === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1e1e1e]' : 'border-white/10'}`}
            style={{ backgroundColor: color }}
          >
             {currentFill === color && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {COLOR_PALETTES.slice(5).map((color) => {
          if (color === "rainbow") {
            return (
              <button
                key="rainbow"
                onClick={() => setActivePopover("custom-color")}
                className="h-9 w-9 rounded-sm border border-white/10 relative overflow-hidden group hover:scale-105 transition-transform"
                style={{ background: "conic-gradient(from 0deg, red, yellow, green, cyan, blue, magenta, red)" }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            );
          }
          return (
            <button
              key={color}
              onClick={() => onUpdateShape(mainKind, mainIndex, { fill: color })}
              className={`h-9 w-9 rounded-sm border transition-all hover:scale-105 flex items-center justify-center ${currentFill === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#1e1e1e]' : 'border-white/10'}`}
              style={{ backgroundColor: color }}
            >
               {currentFill === color && <div className="h-1.5 w-1.5 rounded-full bg-black/40 shadow-sm" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="flex flex-col min-w-[120px]">
      <div className="flex flex-col gap-0.5 border-b border-border/50 pb-1.5 mb-1.5">
        {FONT_FAMILIES.map(ff => (
          <button
            key={ff}
            onClick={() => onUpdateShape(mainKind, mainIndex, { fontFamily: ff })}
            className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs transition-all ${currentFontFamily === ff ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground/80 hover:bg-muted font-medium'}`}
          >
            <span style={{ fontFamily: ff === "Rough" ? "cursive" : ff === "Mono" ? "monospace" : "sans-serif" }}>{ff}</span>
            {currentFontFamily === ff && <Check className="h-3 w-3" />}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 justify-between px-1">
        {ALIGNMENTS.map(a => (
          <button
            key={a.value}
            onClick={() => onUpdateShape(mainKind, mainIndex, { textAlign: a.value })}
            className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${currentTextAlign === a.value ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm' : 'text-foreground/60 hover:bg-muted hover:text-foreground border border-transparent'}`}
          >
            <a.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );

  const renderSize = () => (
    <div className="flex flex-col min-w-[140px]">
      <div className="flex items-center gap-1 p-1 bg-muted/20 border border-border/50 rounded-sm mb-2 group-focus-within:border-primary/50 transition-colors">
        <button 
          onClick={() => onUpdateShape(mainKind, mainIndex, { fontSize: Math.max(8, currentFontSize - 1) })}
          className="h-6 w-6 flex items-center justify-center rounded-sm text-foreground/60 hover:bg-muted hover:text-foreground active:scale-90 transition-all"
        >
          <Minus className="h-3 w-3" />
        </button>
        <div className="flex-1 flex items-center justify-center text-[11px] font-bold text-foreground font-mono">
          {currentFontSize}px
        </div>
        <button 
          onClick={() => onUpdateShape(mainKind, mainIndex, { fontSize: Math.min(200, currentFontSize + 1) })}
          className="h-6 w-6 flex items-center justify-center rounded-sm text-foreground/60 hover:bg-muted hover:text-foreground active:scale-90 transition-all"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {SIZE_PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => onUpdateShape(mainKind, mainIndex, { fontSize: p.value })}
            className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs transition-all ${currentFontSize === p.value ? 'bg-primary text-primary-foreground font-bold shadow-sm' : 'text-foreground/80 hover:bg-muted font-medium'}`}
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="flex flex-col max-h-[240px] overflow-y-auto min-w-[140px] custom-scrollbar">
      {LANGUAGES.map(lang => (
        <button
          key={lang}
          onClick={() => onUpdateShape(mainKind, mainIndex, { language: lang })}
          className={`flex items-center justify-between px-3 py-2 rounded-sm text-xs text-left transition-all ${currentLanguage === lang ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-foreground/80 hover:bg-muted font-medium'}`}
        >
          <span>{lang}</span>
          {currentLanguage === lang && <Check className="h-3 w-3" />}
        </button>
      ))}
    </div>
  );

  const isTextOrCode = ["text", "code"].includes(mainKind);
  const isConnector = mainKind === "connector";

  return (
    <div
      ref={toolbarRef}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-sm bg-[#121212]/95 backdrop-blur-3xl shadow-2xl border border-white/10 z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMulti ? 'py-1.5' : ''}`}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopPropagation();
      }}
    >
      {isMulti ? (
        <div className="flex items-center gap-1 px-1">
           {/* Multi selection UI stays mostly same but polished */}
           <div className="flex items-center gap-2 px-3 py-1.5 border-r border-white/5 mr-1">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground/90 uppercase tracking-widest">{selectedShape.length} selected</span>
          </div>
          <button 
            onClick={onDuplicate}
            className="h-8 px-3 flex items-center gap-2 rounded-sm text-[10px] font-bold uppercase tracking-wider text-foreground/60 hover:bg-white/5 hover:text-foreground transition-all"
          >
            <Copy className="h-3 w-3" />
            <span>Duplicate</span>
          </button>
          <button 
            onClick={onDelete}
            className="h-8 px-3 flex items-center gap-2 rounded-sm text-[10px] font-bold uppercase tracking-wider text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <Trash2 className="h-3 w-3" />
            <span>Delete</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5">
          {/* Text/Code Toggle */}
          {isTextOrCode && (
            <div className="flex items-center p-0.5 bg-white/5 rounded-sm border border-white/5 mr-1">
              <button
                onClick={() => onChangeKind(mainKind, mainIndex, "text")}
                className={`h-7 px-3 flex items-center gap-2 rounded-sm text-[11px] font-bold transition-all ${mainKind === "text" ? 'bg-[#2a2a2a] text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/60'}`}
              >
                <div className="flex items-center justify-center font-bold">Text</div>
              </button>
              <button
                onClick={() => onChangeKind(mainKind, mainIndex, "code")}
                className={`h-7 px-3 flex items-center gap-2 rounded-sm text-[11px] font-bold transition-all ${mainKind === "code" ? 'bg-[#2a2a2a] text-foreground shadow-sm' : 'text-foreground/40 hover:text-foreground/60'}`}
              >
                <div className="flex items-center justify-center font-bold">Code</div>
              </button>
            </div>
          )}

          {/* Size Dropdown */}
          {isTextOrCode && (
            <div className="relative border-r border-white/5 pr-0.5">
              <button
                onClick={() => setActivePopover(activePopover === "size" ? "none" : "size")}
                className={`h-8 px-2 flex items-center gap-1.5 rounded-sm text-[11px] font-bold transition-all ${activePopover === "size" ? 'bg-white/10 text-foreground' : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}`}
              >
                <span>{SIZE_PRESETS.find(p => p.value === currentFontSize)?.label || `${currentFontSize}px`}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              <PopoverContainer active={activePopover === "size"}>
                {renderSize()}
              </PopoverContainer>
            </div>
          )}

          {/* Language Dropdown for Code */}
          {mainKind === "code" && (
            <div className="relative border-r border-white/5 pr-0.5">
              <button
                onClick={() => setActivePopover(activePopover === "language" ? "none" : "language")}
                className={`h-8 px-3 flex items-center gap-1.5 rounded-sm text-[11px] font-bold transition-all ${activePopover === "language" ? 'bg-white/10 text-foreground' : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}`}
              >
                <span>{currentLanguage}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              <PopoverContainer active={activePopover === "language"}>
                {renderLanguage()}
              </PopoverContainer>
            </div>
          )}

          {/* Typography Button for Text */}
          {mainKind === "text" && (
            <div className="relative border-r border-white/5 pr-0.5">
              <button
                onClick={() => setActivePopover(activePopover === "typography" ? "none" : "typography")}
                className={`h-8 px-3 flex items-center gap-1.5 rounded-sm text-[11px] font-bold transition-all ${activePopover === "typography" ? 'bg-white/10 text-foreground' : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}`}
              >
                <span>{currentFontFamily}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              <PopoverContainer active={activePopover === "typography"}>
                {renderTypography()}
              </PopoverContainer>
            </div>
          )}

          {/* Color Tool */}
          {mainKind !== "code" && (
            <div className="relative border-r border-white/5 px-1">
             <button
                onClick={() => setActivePopover(activePopover === "color" ? "none" : "color")}
                className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${activePopover === "color" ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div 
                  className="h-4 w-4 rounded-sm border border-white/20" 
                  style={{ backgroundColor: currentFill }}
                />
              </button>
              <PopoverContainer active={activePopover === "color"}>
                {renderColorGrid()}
              </PopoverContainer>
              <PopoverContainer 
                active={activePopover === "custom-color"} 
                style={{ marginLeft: '100px' }} // Positioned to the side of the color grid
              >
                <ColorPicker color={currentFill} onChange={(c) => onUpdateShape(mainKind, mainIndex, { fill: c })} />
              </PopoverContainer>
            </div>
          )}

          {isConnector && (
            <div className="flex items-center gap-1 border-r border-border/50 pr-2 mr-1">
              <button 
                onClick={onDelete}
                className="h-8 px-2 flex items-center justify-center gap-1.5 rounded-sm bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all text-[10px] font-bold uppercase tracking-wider"
                title="Disconnect shapes"
              >
                <Trash2 className="h-3 w-3" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-0.5 px-0.5">
            <button className="h-8 w-8 flex items-center justify-center rounded-sm text-foreground/40 hover:bg-white/5 hover:text-foreground transition-all">
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setActivePopover(activePopover === "more" ? "none" : "more")}
                className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${activePopover === "more" ? 'bg-white/10 text-foreground' : 'text-foreground/40 hover:bg-white/5 hover:text-foreground'}`}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              <PopoverContainer active={activePopover === "more"} className="min-w-[140px]">
                  <div className="flex flex-col gap-0.5">
                    {!isConnector && (
                      <button 
                        onClick={onDuplicate}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-sm hover:bg-white/5 transition-colors text-foreground/80"
                      >
                        <Copy className="h-3.5 w-3.5 opacity-60" />
                        <span>Duplicate</span>
                      </button>
                    )}
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={onDelete}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-sm hover:bg-destructive/10 transition-colors text-destructive/80"
                    >
                      <Trash2 className="h-3.5 w-3.5 opacity-60" />
                      <span>Delete</span>
                    </button>
                  </div>
              </PopoverContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
