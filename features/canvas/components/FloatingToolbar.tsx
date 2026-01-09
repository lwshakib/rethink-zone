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
  theme?: string;
}

const SOLID_PALETTE = [
  "#1e1e1e", "#595b27", "#275b39", "#273b5b", "#5b275b",
  "#5b2727", "#5b3b27", "#3e3e3e"
];

const PASTEL_PALETTE = [
  "#f9fbfc", "#e9f5e9", "#e9eff5", "#f5e9f5", "#f5eee9",
  "#fca5a5", "#fdba74", "#fef08a"
];

const ShapeIcon = ({ kind }: { kind: string }) => {
  const s = "currentColor";
  const sw = 2;
  // Use a common wrapper to ensure alignment
  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={s} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 pointer-events-none">
      {children}
    </svg>
  );

  if (kind === "rect") return <Wrap><rect x="3" y="6" width="18" height="12" rx="1"/></Wrap>;
  if (kind === "circle") return <Wrap><circle cx="12" cy="12" r="8"/></Wrap>;
  if (kind.includes("Diamond")) return <Wrap><path d="M12 3L21 12L12 21L3 12L12 3Z"/></Wrap>;
  if (kind.includes("Triangle")) return <Wrap><path d="M12 4L22 20H2L12 4Z"/></Wrap>;
  if (kind.includes("Oval")) return <Wrap><ellipse cx="12" cy="12" rx="9" ry="6"/></Wrap>;
  if (kind.includes("Parallelogram")) return <Wrap><path d="M7 6H21L17 18H3L7 6Z"/></Wrap>;
  if (kind.includes("Trapezoid")) return <Wrap><path d="M6 7H18L21 17H3L6 7Z"/></Wrap>;
  if (kind.includes("Cylinder")) return <Wrap><ellipse cx="12" cy="6" rx="6" ry="3"/><path d="M6 6V18c0 1.66 2.69 3 6 3s6-1.34 6-3V6"/></Wrap>;
  if (kind.includes("Database")) return <Wrap><path d="M4 6h16v10c0 1-2 2-8 2s-8-1-8-2V6z"/><path d="M4 6c0 1.5 3 3 8 3s8-1.5 8-3"/></Wrap>;
  if (kind.includes("Hexagon")) return <Wrap><path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"/></Wrap>;
  if (kind.includes("Star")) return <Wrap><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></Wrap>;
  return <Wrap><rect x="3" y="3" width="18" height="18" rx="2"/></Wrap>;
};

const SHAPES = [
  { kind: "rect", label: "Rectangle" },
  { kind: "circle", label: "Circle" },
  { kind: "poly:Diamond", label: "Diamond" },
  { kind: "poly:Triangle", label: "Triangle" },
  { kind: "poly:Oval", label: "Oval" }, 
  { kind: "poly:Parallelogram", label: "Parallelogram" },
  { kind: "poly:Trapezoid", label: "Trapezoid" },
  { kind: "poly:Cylinder", label: "Cylinder" },
  { kind: "poly:Database", label: "Database" },
  { kind: "poly:Hexagon", label: "Hexagon" },
  { kind: "poly:Star", label: "Star" },
];

const STYLE_PRESETS = [
  { id: "plain", label: "Plain" },
  { id: "outline", label: "Outline" },
  { id: "shadow", label: "Shadow" },
  { id: "watercolor", label: "Watercolor" }
];

const STROKE_PRESETS = [
  { id: "S", label: "S", width: 1 },
  { id: "M", label: "M", width: 2 },
  { id: "L", label: "L", width: 4 },
  { id: "XL", label: "XL", width: 8 },
];

const PopoverContainer = React.memo(({ children, active, className = "", style = {}, transparent = false, theme = "dark" }: { children: React.ReactNode, active: boolean, className?: string, style?: React.CSSProperties, transparent?: boolean, theme?: string }) => {
  if (!active) return null;
  const isDark = theme === "dark";
  return (
    <div 
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex flex-col gap-2 ${
        transparent 
          ? "p-0" 
          : isDark
            ? "p-3 bg-[#121212] rounded-lg border border-white/10 shadow-2xl"
            : "p-3 bg-white rounded-lg border border-black/10 shadow-2xl"
      } animate-in fade-in slide-in-from-bottom-2 duration-200 z-[1001] ${className}`}
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

const FloatingToolbar = React.memo(({
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
  theme = "dark",
}: FloatingToolbarProps) => {
  const isDark = theme === "dark";
  const bgSubtle = isDark ? "bg-white/5" : "bg-black/[0.03]";
  const bgHover = isDark ? "hover:bg-white/5" : "hover:bg-black/[0.04]";
  const bgActive = isDark ? "bg-white/10" : "bg-black/[0.08]";
  const borderSubtle = isDark ? "border-white/10" : "border-black/[0.08]";
  const separatorColor = isDark ? "bg-white/5" : "bg-black/[0.05]";
  const toggleBg = isDark ? "bg-[#2a2a2a]" : "bg-black/[0.08]";

  const [activePopover, setActivePopover] = useState<string>("none");
  const [paletteMode, setPaletteMode] = useState<"solid" | "pastel">("solid");
  const [colorTarget, setColorTarget] = useState<"fill" | "stroke">("fill");
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

  const currentLanguage = (shapeData && "language" in shapeData) ? (shapeData.language as string || "Auto detect") : "Auto detect";
  
  // Extract current shape properties
  const currentFill = (shapeData && "fill" in shapeData) ? (shapeData.fill as string) : "#1e1e1e";
  const currentStroke = (shapeData && "stroke" in shapeData) ? (shapeData.stroke as string) : "#1e1e1e";
  const currentColor = colorTarget === "fill" ? currentFill : currentStroke;
  const currentFontFamily = (shapeData && "fontFamily" in shapeData) ? (shapeData.fontFamily as string) : "Clean";
  const currentFontSize = (shapeData && "fontSize" in shapeData) ? (shapeData.fontSize as number) : 18;
  const currentTextAlign = (shapeData && "textAlign" in shapeData) ? (shapeData.textAlign as string) : "left";

  const canChangeShape = ["rect", "circle", "poly"].includes(mainKind);
  const isTextOrCode = ["text", "code"].includes(mainKind);
  const isLineOrArrow = ["line", "arrow"].includes(mainKind);
  const isConnector = mainKind === "connector";

  const renderShapesGrid = () => (
    <div className="grid grid-cols-4 gap-3 p-1 w-fit min-w-[180px]">
      {SHAPES.map((s) => (
        <button
          key={s.kind}
          onClick={() => onChangeKind(mainKind, mainIndex, s.kind)}
          className={`h-10 w-10 flex items-center justify-center rounded-lg transition-all flex-shrink-0 ${
            mainKind === s.kind || (mainKind === "poly" && s.kind.startsWith("poly") && (shapeData as any).type === s.kind.split(":")[1])
              ? "bg-[#3bc1ff] text-white shadow-lg" 
              : `text-foreground/80 ${bgHover}`
          }`}
        >
          <div className="h-5 w-5 flex items-center justify-center">
            <ShapeIcon kind={s.kind} />
          </div>
        </button>
      ))}
    </div>
  );

  const renderColorGrid = () => {
    const isCustomActive = activePopover === "custom-color";
    const currentPalette = paletteMode === "solid" ? SOLID_PALETTE : PASTEL_PALETTE;
    
    return (
      <div className="flex flex-col gap-4">
        {/* Style Presets */}
        <div className={`flex gap-3 justify-center border-b ${separatorColor} pb-3`}>
          {STYLE_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.id === "outline") onUpdateShape(mainKind, mainIndex, { fill: "transparent", opacity: 1, strokeWidth: 2 });
                else if (preset.id === "watercolor") onUpdateShape(mainKind, mainIndex, { opacity: 0.4 });
                else onUpdateShape(mainKind, mainIndex, { opacity: 1 });
              }}
              className="group flex flex-col items-center gap-1"
            >
              <div className={`h-8 w-8 rounded-full border ${isDark ? "border-white/20" : "border-black/10"} transition-all ${preset.id === "outline" ? "bg-transparent" : (isDark ? "bg-white/40" : "bg-black/10")} group-hover:scale-110`} />
              <span className="text-[10px] text-foreground/40 font-medium group-hover:text-foreground/80 transition-colors">{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Target Switcher (Fill vs Border) */}
        {!isLineOrArrow && mainKind !== "text" && (
          <div className={`flex p-0.5 ${bgSubtle} rounded-lg border ${borderSubtle}`}>
            <button 
              onClick={() => setColorTarget("fill")}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${colorTarget === "fill" ? `${toggleBg} text-foreground shadow-sm` : "text-foreground/40 hover:text-foreground/60"}`}
            >
              Fill
            </button>
            <button 
              onClick={() => setColorTarget("stroke")}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${colorTarget === "stroke" ? `${toggleBg} text-foreground shadow-sm` : "text-foreground/40 hover:text-foreground/60"}`}
            >
              Border
            </button>
          </div>
        )}

        {/* Caption for special modes */}
        {isLineOrArrow && (
           <div className="px-1 text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Line Color</div>
        )}
        {mainKind === "text" && (
           <div className="px-1 text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Text Color</div>
        )}

        {/* Palette Switcher */}
        <div className="flex items-center justify-between px-1">
           <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Palette</span>
           <div className="flex gap-2">
              <button 
                onClick={() => setPaletteMode("solid")}
                className={`text-[10px] font-bold transition-colors ${paletteMode === "solid" ? "text-blue-400" : "text-foreground/20 hover:text-foreground/40"}`}
              >
                Solid
              </button>
              <button 
                onClick={() => setPaletteMode("pastel")}
                className={`text-[10px] font-bold transition-colors ${paletteMode === "pastel" ? "text-blue-400" : "text-foreground/20 hover:text-foreground/40"}`}
              >
                Pastel
              </button>
           </div>
        </div>

        {/* Color Palette */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {currentPalette.slice(0, 5).map((color) => (
              <button
                key={color}
                onClick={() => onUpdateShape(mainKind, mainIndex, { [colorTarget]: color })}
                className={`h-8 w-8 rounded-[6px] border ${isDark ? "border-white/20" : "border-black/10"} transition-all flex items-center justify-center ${currentColor === color && !isCustomActive ? 'ring-[3px] ring-blue-500' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentPalette.slice(5, 8).map((color) => (
              <button
                key={color}
                onClick={() => onUpdateShape(mainKind, mainIndex, { [colorTarget]: color })}
                className={`h-8 w-8 rounded-[6px] border ${isDark ? "border-white/20" : "border-black/10"} transition-all flex items-center justify-center ${currentColor === color && !isCustomActive ? 'ring-[3px] ring-blue-500' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }}
              />
            ))}
            <button
              onClick={() => setActivePopover("custom-color")}
              className={`h-8 w-8 rounded-[6px] border ${isDark ? "border-white/20" : "border-black/10"} relative overflow-hidden transition-all ${isCustomActive ? 'ring-[3px] ring-blue-500' : 'hover:scale-105'}`}
              style={{ background: "conic-gradient(from 0deg, red, yellow, green, cyan, blue, magenta, red)" }}
            />
            <button
              onClick={() => {
                if (mainKind === "text" || isLineOrArrow) {
                  const target = mainKind === "text" ? "fill" : "stroke";
                  onUpdateShape(mainKind, mainIndex, { [target]: "transparent" });
                  if (isLineOrArrow) onUpdateShape(mainKind, mainIndex, { strokeWidth: 0 });
                } else if (colorTarget === "fill") {
                  onUpdateShape(mainKind, mainIndex, { fill: "transparent" });
                } else {
                  onUpdateShape(mainKind, mainIndex, { strokeWidth: 0 });
                }
              }}
              className={`h-8 w-8 rounded-[6px] border ${isDark ? "border-white/20" : "border-black/10"} transition-all flex items-center justify-center relative ${
                (mainKind === "text" ? currentFill === "transparent" : (isLineOrArrow ? (shapeData as any).strokeWidth === 0 : (colorTarget === "fill" ? currentFill === "transparent" : (shapeData as any).strokeWidth === 0))) 
                ? 'ring-[3px] ring-[#3bc1ff]' 
                : 'hover:scale-105'}`}
              style={{ backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5" }}
            >
              <div className={`absolute h-[1px] w-full ${isDark ? "bg-white/40" : "bg-black/40"} rotate-45`} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStrokePanel = () => (
    <div className="flex flex-col gap-4 min-w-[160px]">
      <div className="flex flex-col gap-1">
        {STROKE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => onUpdateShape(mainKind, mainIndex, { strokeWidth: preset.width })}
            className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
              (shapeData as any).strokeWidth === preset.width ? "bg-[#3bc1ff] text-white" : `${bgHover} text-foreground/80`
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold w-4">{preset.label}</span>
              <div className={`${isDark ? "bg-white" : "bg-black"} rounded-full`} style={{ height: preset.width, width: 40 }} />
            </div>
          </button>
        ))}
      </div>
      <div className={`h-px ${separatorColor}`} />
      <div className="flex items-center gap-2 justify-between">
         <button 
           onClick={() => onUpdateShape(mainKind, mainIndex, { strokeDashArray: undefined })}
           className={`flex-1 h-8 flex items-center justify-center rounded-md border ${(shapeData as any).strokeDashArray ? `border-transparent ${isDark ? "text-white/40" : "text-black/40"}` : "border-[#3bc1ff] bg-[#3bc1ff]/10 text-[#3bc1ff]"}`}
         >
           <div className="h-0.5 w-8 bg-current" />
         </button>
         <button 
           onClick={() => onUpdateShape(mainKind, mainIndex, { strokeDashArray: [5, 5] })}
           className={`flex-1 h-8 flex items-center justify-center rounded-md border ${(shapeData as any).strokeDashArray ? "border-[#3bc1ff] bg-[#3bc1ff]/10 text-[#3bc1ff]" : `border-transparent ${isDark ? "text-white/40" : "text-black/40"}`}`}
         >
           <div className="h-0.5 w-8 border-b border-dashed border-current" />
         </button>
         <button 
           onClick={() => onUpdateShape(mainKind, mainIndex, { strokeWidth: 0 })}
           className={`h-8 w-8 flex items-center justify-center rounded-md border ${(shapeData as any).strokeWidth === 0 ? "border-[#3bc1ff] bg-[#3bc1ff]/10 text-[#3bc1ff]" : `${borderSubtle} ${isDark ? "text-white/40" : "text-black/40"} ${bgHover}`}`}
           title="No Border"
         >
           <div className="h-5 w-5 rounded-full border border-current relative overflow-hidden flex items-center justify-center">
              <div className="absolute h-[1px] w-full bg-current rotate-45" />
           </div>
         </button>
      </div>
    </div>
  );

  const renderTypographyPanel = () => (
    <div className="flex flex-col gap-4 min-w-[200px]">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-foreground/40 px-1 opacity-50">Font Family</span>
        <div className={`flex gap-1 p-0.5 ${bgSubtle} rounded-lg`}>
          {["Clean", "Rough", "Mono"].map(f => (
            <button
              key={f}
              onClick={() => onUpdateShape(mainKind, mainIndex, { fontFamily: f })}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${currentFontFamily === f ? `${bgActive} text-foreground` : "text-foreground/40 hover:text-foreground/60"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-foreground/40 px-1 opacity-50">Font Size</span>
        <div className={`flex gap-1 p-0.5 ${bgSubtle} rounded-lg`}>
          {[{l:"S",v:14},{l:"M",v:18},{l:"L",v:24},{l:"XL",v:32}].map(s => (
            <button
              key={s.l}
              onClick={() => onUpdateShape(mainKind, mainIndex, { fontSize: s.v })}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${currentFontSize === s.v ? `${bgActive} text-foreground` : "text-foreground/40 hover:text-foreground/60"}`}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-foreground/40 px-1 opacity-50">Alignment</span>
        <div className="flex gap-1 mt-1 justify-center">
          {[
            { id: "left", icon: AlignLeft },
            { id: "center", icon: AlignCenter },
            { id: "right", icon: AlignRight }
          ].map(a => (
            <button
              key={a.id}
              onClick={() => onUpdateShape(mainKind, mainIndex, { textAlign: a.id })}
              className={`h-8 w-8 flex items-center justify-center rounded-md transition-all ${currentTextAlign === a.id ? "bg-[#3bc1ff] text-white" : `${bgHover} text-foreground/40`}`}
            >
              <a.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCodePanel = () => (
    <div className="flex flex-col gap-4 min-w-[200px]">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-foreground/40 px-1 opacity-50">Language</span>
        <div className="grid grid-cols-2 gap-1 max-h-[160px] overflow-y-auto px-1 scrollbar-hide">
          {["Javascript", "Python", "HTML", "CSS", "TypeScript", "React", "Rust", "Go"].map(l => (
            <button
              key={l}
              onClick={() => onUpdateShape(mainKind, mainIndex, { language: l })}
              className={`h-8 px-3 text-left rounded-md text-[10px] font-medium transition-all ${currentLanguage === l ? "bg-[#3bc1ff]/10 text-[#3bc1ff]" : `${bgHover} text-foreground/40`}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className={`h-px ${separatorColor}`} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] uppercase font-bold text-foreground/40 px-1 opacity-50">Text Size</span>
        <div className={`flex gap-1 p-0.5 ${bgSubtle} rounded-lg`}>
          {[{l:"S",v:12},{l:"M",v:14},{l:"L",v:18}].map(s => (
            <button
              key={s.l}
              onClick={() => onUpdateShape(mainKind, mainIndex, { fontSize: s.v })}
              className={`flex-1 h-8 rounded-md text-[10px] font-bold transition-all ${currentFontSize === s.v ? `${bgActive} text-foreground` : "text-foreground/40 hover:text-foreground/60"}`}
            >
              {s.l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );



  return (
    <div
      ref={toolbarRef}
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-xl border shadow-2xl z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isDark ? "bg-[#121212] border-white/10" : "bg-white border-black/10"
      }`}
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => {
        e.stopPropagation();
        e.nativeEvent.stopPropagation();
      }}
    >
      {isMulti ? (
        <div className="flex items-center gap-1">
           <div className={`flex items-center gap-2 px-3 border-r ${separatorColor} mr-1`}>
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-foreground/90 uppercase tracking-widest">{selectedShape.length} selected</span>
          </div>
          <button onClick={onDuplicate} className={`h-9 w-9 flex items-center justify-center rounded-lg ${bgHover} transition-all`}>
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive transition-all">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {/* Text/Code Toggle Switch */}
          {isTextOrCode && (
            <div className={`flex p-0.5 ${bgSubtle} rounded-lg border ${borderSubtle} mr-1`}>
              <button
                onClick={() => onChangeKind(mainKind, mainIndex, "text")}
                className={`h-7 px-3 flex items-center gap-1 rounded-md text-[10px] font-bold transition-all ${mainKind === "text" ? `${toggleBg} text-foreground shadow-sm` : "text-foreground/40 hover:text-foreground/60"}`}
              >
                Text
              </button>
              <button
                onClick={() => onChangeKind(mainKind, mainIndex, "code")}
                className={`h-7 px-3 flex items-center gap-1 rounded-md text-[10px] font-bold transition-all ${mainKind === "code" ? `${toggleBg} text-foreground shadow-sm` : "text-foreground/40 hover:text-foreground/60"}`}
              >
                Code
              </button>
            </div>
          )}

          {/* Shapes Menu (Only for Rect, Circle, Poly) */}
          {canChangeShape && (
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "shapes" ? "none" : "shapes")}
                className={`h-9 px-2 flex items-center gap-1 rounded-lg transition-all ${activePopover === "shapes" ? bgActive : bgHover}`}
              >
                <div className="flex flex-col gap-0.5 items-center justify-center scale-90">
                   <div className="flex gap-0.5"><div className="h-1.5 w-1.5 rounded-full border border-current"/><div className="h-1.5 w-1.5 border border-current rotate-45"/></div>
                   <div className="h-1.5 w-1.5 border border-current"/>
                </div>
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
              <PopoverContainer active={activePopover === "shapes"} theme={theme}>
                {renderShapesGrid()}
              </PopoverContainer>
            </div>
          )}

          {canChangeShape && <div className={`h-6 w-px ${separatorColor} mx-0.5`} />}

          {/* Color Menu (Shown for everything except Connector and Code) */}
          {!isConnector && mainKind !== "code" && (
            <div className="relative">
              <button
                onClick={() => {
                  if (mainKind === "text") setColorTarget("fill");
                  else if (isLineOrArrow) setColorTarget("stroke");
                  setActivePopover(activePopover === "color" ? "none" : "color");
                }}
                className={`h-9 px-2 flex items-center gap-1 rounded-lg transition-all ${activePopover === "color" ? bgActive : bgHover}`}
              >
                {mainKind === "text" ? (
                  <div className="h-5 w-5 flex items-center justify-center">
                    <div className="h-4 w-4 rounded-sm border border-foreground/20" style={{ backgroundColor: currentFill }} />
                  </div>
                ) : isLineOrArrow ? (
                  <div className="h-7 w-8 flex items-center justify-center">
                    <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: currentStroke }} />
                  </div>
                ) : (
                  <div className="relative h-7 w-10 flex items-center justify-center">
                    <div 
                      className={`absolute top-1 right-1.5 h-4.5 w-4.5 rounded-full border ${isDark ? "border-white/40" : "border-black/20"} overflow-hidden shadow-sm z-10`} 
                      style={{ backgroundColor: currentStroke }}
                    />
                    <div 
                      className={`absolute bottom-1 left-1.5 h-4.5 w-4.5 rounded-full border ${isDark ? "border-white/40" : "border-black/20"} overflow-hidden shadow-sm`}
                      style={{ backgroundColor: currentFill === "transparent" ? (isDark ? "#1e1e1e" : "#f5f5f5") : currentFill }}
                    >
                      {currentFill === "transparent" && <div className={`absolute h-[1px] w-full ${isDark ? "bg-white/60" : "bg-black/40"} rotate-45 top-1/2 -translate-y-1/2`} />}
                    </div>
                  </div>
                )}
                <ChevronDown className="h-3 w-3 opacity-40" />
              </button>
              <PopoverContainer active={activePopover === "color"} theme={theme}>
                {renderColorGrid()}
              </PopoverContainer>
              <PopoverContainer active={activePopover === "custom-color"} className="ml-[160px]" theme={theme}>
                <ColorPicker 
                   color={currentColor === "transparent" ? (isDark ? "#ffffff" : "#000000") : currentColor} 
                   onChange={(c) => onUpdateShape(mainKind, mainIndex, { [colorTarget]: c })} 
                   theme={theme}
                />
              </PopoverContainer>
            </div>
          )}

          {/* Typography for Text */}
          {mainKind === "text" && (
             <>
               <div className={`h-6 w-px ${separatorColor} mx-0.5`} />
               <div className="relative">
                 <button
                   onClick={() => setActivePopover(activePopover === "typo" ? "none" : "typo")}
                   className={`h-9 px-2 flex items-center gap-1 rounded-lg transition-all ${activePopover === "typo" ? `${bgActive} text-[#3bc1ff]` : `${bgHover} text-foreground/60`}`}
                 >
                   <TypeIcon className="h-4 w-4" />
                   <ChevronDown className="h-3 w-3 opacity-40 ml-0.5" />
                 </button>
                 <PopoverContainer active={activePopover === "typo"} theme={theme}>
                   {renderTypographyPanel()}
                 </PopoverContainer>
               </div>
             </>
          )}

          {/* Code Panel for Code */}
          {mainKind === "code" && (
             <>
               <div className={`h-6 w-px ${separatorColor} mx-0.5`} />
               <div className="relative">
                 <button
                   onClick={() => setActivePopover(activePopover === "code-panel" ? "none" : "code-panel")}
                   className={`h-9 px-2 flex items-center gap-1 rounded-lg transition-all ${activePopover === "code-panel" ? `${bgActive} text-[#3bc1ff]` : `${bgHover} text-foreground/60`}`}
                 >
                   <CodeIcon className="h-4 w-4" />
                   <ChevronDown className="h-3 w-3 opacity-40 ml-0.5" />
                 </button>
                 <PopoverContainer active={activePopover === "code-panel"} theme={theme}>
                   {renderCodePanel()}
                 </PopoverContainer>
               </div>
             </>
          )}

          {/* Stroke/Line Menu (Shown for Shapes and Lines) */}
          {(canChangeShape || isLineOrArrow) && (
            <>
              <div className={`h-6 w-px ${separatorColor} mx-0.5`} />
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "stroke" ? "none" : "stroke")}
                  className={`h-9 px-2 flex items-center gap-1 rounded-lg transition-all ${activePopover === "stroke" ? bgActive : bgHover}`}
                >
                  <div className="flex flex-col gap-1 w-4">
                    <div className={`h-px ${isDark ? "bg-white/80" : "bg-black/80"} w-full`} />
                    <div className={`h-px ${isDark ? "bg-white/50" : "bg-black/50"} w-full`} />
                    <div className={`h-px ${isDark ? "bg-white/20" : "bg-black/20"} w-full`} />
                  </div>
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </button>
                <PopoverContainer active={activePopover === "stroke"} theme={theme}>
                  {renderStrokePanel()}
                </PopoverContainer>
              </div>
            </>
          )}

          <div className={`h-6 w-px ${separatorColor} mx-0.5`} />

          {/* Chat Icon */}
          <button className={`h-9 w-9 flex items-center justify-center rounded-lg ${bgHover} transition-all`}>
            <MessageSquare className="h-4 w-4 opacity-70" />
          </button>

          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => setActivePopover(activePopover === "more" ? "none" : "more")}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-all ${activePopover === "more" ? bgActive : bgHover}`}
            >
              <MoreVertical className="h-4 w-4 opacity-70" />
            </button>
            <PopoverContainer active={activePopover === "more"} className="min-w-[140px]" theme={theme}>
                <div className="flex flex-col gap-1">
                  <button onClick={onDuplicate} className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md ${bgHover} active:${bgActive} transition-colors`}>
                    <Copy className="h-4 w-4 opacity-60" />
                    <span>Duplicate</span>
                  </button>
                  <button onClick={onDelete} className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 className="h-4 w-4 opacity-60" />
                    <span>Delete</span>
                  </button>
                </div>
            </PopoverContainer>
          </div>
        </div>
      )}
    </div>
  );
});

export default FloatingToolbar;
