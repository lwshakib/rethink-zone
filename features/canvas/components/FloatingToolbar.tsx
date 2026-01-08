import React, { useMemo, useState, useEffect, useRef } from "react";
import { 
  Copy, Trash2, Palette, Sun, 
  Circle, Square, Triangle, Diamond, Hexagon, Star, 
  Minus, Type, Image as LucideImage, Frame as LucideFrame,
  Activity, ChevronDown, Check, MoreVertical, Layers
} from "lucide-react";
import { SelectedShape, RectShape, CircleShape, ImageShape, TextShape, FrameShape, PolyShape, LineShape, ArrowShape } from "../types";

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
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  onUpdateShape: (kind: string, index: number, updates: any) => void;
  onChangeKind: (kind: string, index: number, newKind: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const COLOR_PALETTES = {
  Bold: ["#000000", "#ffffff", "#ff4d4f", "#1890ff", "#52c41a", "#faad14", "#722ed1", "#eb2f96", "#fa541c"],
  Pastel: ["#f5f5f5", "#fff1f0", "#fff7e6", "#f6ffed", "#e6f7ff", "#f9f0ff", "#fff0f6", "#fffbe6", "#e6fffb"],
  Vibrant: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8000", "#8000ff", "#0080ff"]
};

type PaletteKey = keyof typeof COLOR_PALETTES;

const LINE_STYLES = [
  { label: "Solid", value: [] },
  { label: "Dashed", value: [10, 5] },
  { label: "Dotted", value: [2, 4] },
];

const SHAPES = [
  { kind: "rect", icon: Square, label: "Rectangle" },
  { kind: "circle", icon: Circle, label: "Circle" },
  { kind: "poly:Diamond", icon: Diamond, label: "Diamond" },
  { kind: "poly:Triangle", icon: Triangle, label: "Triangle" },
  { kind: "poly:Hexagon", icon: Hexagon, label: "Hexagon" },
  { kind: "poly:Star", icon: Star, label: "Star" },
];

const PopoverContainer = React.memo(({ children, active, className = "" }: { children: React.ReactNode, active: boolean, className?: string }) => {
  if (!active) return null;
  return (
    <div 
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col gap-2 p-2 bg-background/95 backdrop-blur-md rounded-sm border border-border shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200 min-w-[140px] z-[1001] ${className}`}
      onPointerDown={e => e.stopPropagation()}
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
  onUpdateShape,
  onChangeKind,
  onDelete,
  onDuplicate,
}) => {
  const [activePopover, setActivePopover] = useState<"none" | "shapes" | "color" | "stroke" | "opacity" | "style" | "more">("none");
  const [currentPalette, setCurrentPalette] = useState<PaletteKey>("Bold");
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

  const isMulti = selectedShape.length > 1;
  const shapeData = useMemo(() => {
    if (selectedShape.length === 0) return null;
    const { kind, id } = selectedShape[0];
    
    // Find shape by ID for maximum stability during transformations
    const findById = (arr: any[]) => arr.find(s => s.id === id);
    
    const source = kind === "rect" ? findById(rectangles) :
                   kind === "circle" ? findById(circles) :
                   kind === "image" ? findById(images) :
                   kind === "text" ? findById(texts) :
                   kind === "frame" ? findById(frames) :
                   kind === "poly" ? findById(polygons) :
                   kind === "line" ? findById(lines) :
                   kind === "arrow" ? findById(arrows) : null;
    
    if (!source) return null;

    const label = kind === "poly" ? (source as PolyShape).type : kind.charAt(0).toUpperCase() + kind.slice(1);
    return { ...source, kind, label };
  }, [selectedShape, rectangles, circles, images, texts, frames, polygons, lines, arrows]);

  // Prevent unmounting if selection exists but data is temporarily missing during transitions
  if (selectedShape.length === 0) return null;

  const currentOpacity = (shapeData && "opacity" in shapeData) ? (shapeData.opacity as number) : 1;
  const currentFill = (shapeData && "fill" in shapeData) ? (shapeData.fill as string || "transparent") : "transparent";
  const currentStroke = (shapeData && "stroke" in shapeData) ? (shapeData.stroke as string || "currentColor") : "currentColor";
  const currentDash = (shapeData && "strokeDashArray" in shapeData) ? (shapeData.strokeDashArray as number[]) : [];
  const currentStrokeWidth = (shapeData && "strokeWidth" in shapeData) ? (shapeData.strokeWidth as number) : 2;
  const hasShadow = (shapeData && "shadow" in shapeData) ? (shapeData.shadow as boolean) : false;
  const isOutlineOnly = (shapeData && "outlineOnly" in shapeData) ? (shapeData.outlineOnly as boolean) : false;

  const mainKind = selectedShape[0]?.kind;
  const mainIndex = selectedShape[0]?.index;

  return (
    <div
      ref={toolbarRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-sm bg-background/90 backdrop-blur-xl shadow-lg border border-border z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300"
      onPointerDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {isMulti ? (
        <div className="flex items-center gap-1 px-1">
          <div className="flex items-center gap-2 px-3 py-1.5 border-r border-border/50">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground">{selectedShape.length} items selected</span>
          </div>
          <button 
            onClick={onDuplicate}
            className="h-8 px-3 flex items-center gap-2 rounded-sm text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            title="Duplicate Selection"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Duplicate</span>
          </button>
          <div className="w-px h-4 bg-border/50 mx-0.5" />
          <button 
            onClick={onDelete}
            className="h-8 px-3 flex items-center gap-2 rounded-sm text-xs text-destructive hover:bg-destructive/10 transition-all"
            title="Delete Selection"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      ) : (
        <>
          {/* Shapes Switcher Popover */}
          {["rect", "circle", "poly"].includes(mainKind) && (
            <div className="relative px-1 border-r border-white/10">
              <button 
                onClick={() => setActivePopover(activePopover === "shapes" ? "none" : "shapes")}
                className={`h-8 px-2 flex items-center gap-1.5 rounded-sm transition-all ${activePopover === "shapes" ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
              >
                {(() => {
                  const CurrentIcon = SHAPES.find(s => s.kind === mainKind || (mainKind === "poly" && s.kind === `poly:${(shapeData as PolyShape)?.type}`))?.icon || Square;
                  return <CurrentIcon className="h-[14px] w-[14px]" />;
                })()}
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${activePopover === "shapes" ? 'rotate-180' : ''}`} />
              </button>
              
              <PopoverContainer active={activePopover === "shapes"}>
                <div className="grid grid-cols-2 gap-1 w-full">
                  {SHAPES.map((s) => {
                    const active = mainKind === s.kind || (mainKind === "poly" && s.kind === `poly:${(shapeData as PolyShape)?.type}`);
                    return (
                      <button
                        key={s.label}
                        onClick={() => { onChangeKind(mainKind, mainIndex, s.kind); }}
                        className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${
                          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        title={s.label}
                      >
                        <s.icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </PopoverContainer>
            </div>
          )}

          {/* Color Popover */}
          {["rect", "circle", "poly", "text", "frame"].includes(mainKind) && (
            <div className="relative px-1 border-r border-white/10">
              <button 
                onClick={() => setActivePopover(activePopover === "color" ? "none" : "color")}
                className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${activePopover === "color" ? 'bg-muted' : 'hover:bg-muted/50'}`}
                title="Fill Color"
              >
                <div 
                  className="h-4 w-4 rounded-sm border border-border" 
                  style={{ backgroundColor: currentFill }}
                />
              </button>
              
              <PopoverContainer active={activePopover === "color"}>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1 p-0.5 bg-muted/50 rounded-sm">
                    {(Object.keys(COLOR_PALETTES) as PaletteKey[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPalette(p)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-sm transition-all ${currentPalette === p ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 min-w-[130px]">
                    <button
                      onClick={() => onUpdateShape(mainKind, mainIndex, { fill: "transparent" })}
                      className={`h-7 w-7 rounded-sm border flex items-center justify-center transition-all ${currentFill === "transparent" ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`}
                      title="Transparent"
                    >
                      <Check className={`h-3 w-3 ${currentFill === "transparent" ? 'text-primary' : 'text-transparent'}`} />
                    </button>
                    {COLOR_PALETTES[currentPalette].map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateShape(mainKind, mainIndex, { fill: color })}
                        className={`h-7 w-7 rounded-sm border transition-all hover:scale-110 ${currentFill === color ? 'border-primary ring-1 ring-primary/20 scale-110' : 'border-border'}`}
                        style={{ backgroundColor: color }}
                      >
                        {currentFill === color && <Check className="h-3 w-3 mx-auto text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>

                  {/* Custom Hex & Opacity */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                       <input 
                         type="text"
                         value={typeof currentFill === 'string' && currentFill.startsWith('#') ? currentFill : ''}
                         onChange={(e) => onUpdateShape(mainKind, mainIndex, { fill: e.target.value })}
                         placeholder="#HEX"
                         className="flex-1 min-w-0 bg-muted/50 border border-border rounded-sm px-2 py-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                       />
                       <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: currentFill }} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-medium text-muted-foreground">Opacity</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{Math.round(currentOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={currentOpacity}
                        onChange={(e) => onUpdateShape(mainKind, mainIndex, { opacity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContainer>
            </div>
          )}

          {/* Stroke Settings Popover */}
          {["rect", "circle", "poly", "line", "arrow", "frame"].includes(mainKind) && (
            <div className="relative px-1 border-r border-white/10">
              <button 
                onClick={() => setActivePopover(activePopover === "stroke" ? "none" : "stroke")}
                className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${activePopover === "stroke" ? 'bg-muted' : 'hover:bg-muted/50'}`}
                title="Stroke Settings"
              >
                <Activity className="h-[14px] w-[14px] text-muted-foreground" />
              </button>
              
              <PopoverContainer active={activePopover === "stroke"}>
                <div className="flex flex-col gap-3 p-1 w-48">
                  {/* Stroke Width */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Stroke Width</span>
                    <div className="flex items-center gap-2 px-1">
                      <input 
                        type="range" min="1" max="20" step="1" 
                        value={currentStrokeWidth}
                        onChange={(e) => onUpdateShape(mainKind, mainIndex, { strokeWidth: parseInt(e.target.value) })}
                        className="flex-1 h-1 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
                      />
                      <input 
                        type="number" min="1" max="50"
                        value={currentStrokeWidth}
                        onChange={(e) => onUpdateShape(mainKind, mainIndex, { strokeWidth: parseInt(e.target.value) || 1 })}
                        className="w-10 h-6 bg-muted border border-border rounded-sm text-[11px] text-center focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>

                  {/* Stroke Style */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Dash Style</span>
                    <div className="flex gap-1 px-1">
                      {LINE_STYLES.map((style) => {
                        const active = JSON.stringify(currentDash) === JSON.stringify(style.value);
                        return (
                          <button
                            key={style.label}
                            onClick={() => onUpdateShape(mainKind, mainIndex, { strokeDashArray: style.value })}
                            className={`flex-1 py-1 px-2 rounded-sm text-[10px] font-medium transition-all ${
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {style.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stroke Color */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Border Color</span>
                    <div className="grid grid-cols-5 gap-1 px-1">
                      {COLOR_PALETTES.Bold.map((color) => (
                        <button
                          key={color}
                          onClick={() => onUpdateShape(mainKind, mainIndex, { stroke: color })}
                          className={`h-5 w-5 rounded-sm transition-all hover:scale-110 ${currentStroke === color ? 'ring-1 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <button
                        onClick={() => onUpdateShape(mainKind, mainIndex, { stroke: undefined })}
                        className="h-5 w-5 rounded-sm bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground hover:bg-muted/80"
                        title="Reset"
                      >
                        D
                      </button>
                    </div>
                  </div>
                </div>
              </PopoverContainer>
            </div>
          )}

          <div className="relative px-1">
            <button 
              onClick={() => setActivePopover(activePopover === "more" ? "none" : "more")}
              className={`h-8 w-8 flex items-center justify-center rounded-sm transition-colors ${activePopover === "more" ? 'bg-muted' : 'hover:bg-muted/50'}`}
              title="More Actions"
            >
              <MoreVertical className="h-[14px] w-[14px] text-muted-foreground" />
            </button>
            <PopoverContainer active={activePopover === "more"} className="min-w-[160px]">
              <div className="flex flex-col gap-0.5">
                {/* Visual Style */}
                <div className="px-2 py-1.5 flex flex-col gap-2 border-b border-border/50 mb-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Effects</span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => onUpdateShape(mainKind, mainIndex, { shadow: !hasShadow })}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs transition-all ${hasShadow ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 opacity-70" />
                        <span>Shadow</span>
                      </div>
                      {hasShadow && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => onUpdateShape(mainKind, mainIndex, { outlineOnly: !isOutlineOnly })}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs transition-all ${isOutlineOnly ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Minus className="h-3.5 w-3.5 opacity-70" />
                        <span>Outline Only</span>
                      </div>
                      {isOutlineOnly && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                {/* Opacity slider refined */}
                <div className="px-2 py-1.5 flex flex-col gap-2 border-b border-border/50 mb-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Opacity</span>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={currentOpacity}
                    onChange={(e) => onUpdateShape(mainKind, mainIndex, { opacity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                    <Sun className="h-3 w-3 opacity-50" />
                    <span>{Math.round(currentOpacity * 100)}%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <button 
                    onClick={() => { onDuplicate(); setActivePopover('none'); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-sm hover:bg-muted transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5 opacity-70" />
                    <span>Duplicate</span>
                  </button>
                  
                  {/* Coming soon section */}
                  <div className="h-px bg-border/50 my-1" />
                  <div className="px-2 py-1">
                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">Coming soon...</span>
                  </div>

                  <div className="h-px bg-border/50 my-1" />

                  <button 
                    onClick={() => { onDelete(); setActivePopover('none'); }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </PopoverContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default FloatingToolbar;
