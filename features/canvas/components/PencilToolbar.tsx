import React, { useState, useEffect, useRef, useCallback } from "react"; // React core and hooks
// Relevant icons for manual drawing mode
import { PenLine, Eraser, MoreHorizontal, ChevronDown, Check, Settings2 } from "lucide-react";
import { Tool } from "../types"; // Canvas tool definitions

/**
 * HELPER: hsvToHex
 * Converts Hue (0-360), Saturation (0-100), and Value (0-100) to a Hexadecimal string.
 * Used for the custom color picker's internal logic.
 */
interface PencilToolbarProps {
  activeTool: Tool; // Current active drawing tool (Pencil/Eraser)
  setActiveTool: (tool: Tool) => void; // Tool switch callback
  strokeColor: string; // Active ink color (Hex)
  setStrokeColor: (color: string) => void; // Ink color callback
  strokeWidth: number; // Active pen thickness
  setStrokeWidth: (width: number) => void; // Thickness callback
}

// Color conversion math for the HSV color model
const hsvToHex = (h: number, s: number, v: number) => {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * HELPER: hexToHsv
 * Converts a Hex string to HSV values. Necessary for synchronizing input text
 * with the visual picker UI.
 */
const hexToHsv = (hex: string) => {
  if (!hex || hex === "transparent") return { h: 0, s: 0, v: 100 };
  let r = 0, g = 0, b = 0;
  if(hex.startsWith('#')) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

// Selection of quick-pick colors for the pencil
const DEFAULT_COLORS = [
  "#ffffff", "#000000", "#ff4d4f", "#1890ff", "#52c41a", "#faad14", 
  "#722ed1", "#eb2f96"
];

/**
 * PopoverContainer - Sub-component for pop-up menus (color selection).
 */
const PopoverContainer = React.memo(({ children, active, className = "" }: { children: React.ReactNode, active: boolean, className?: string }) => {
  if (!active) return null; // Render nothing if inactive
  return (
    <div 
      // Positions above the trigger button with an upward slide animation
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col gap-2 p-2 bg-background/95 backdrop-blur-md rounded-sm border border-border shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200 min-w-[140px] z-[1001] ${className}`}
      onPointerDown={e => e.stopPropagation()} // Stop canvas selection when using sub-menu
    >
      {children}
    </div>
  );
});
PopoverContainer.displayName = "PopoverContainer";

/**
 * AdvancedColorPicker - HSV-based gradient picker for precise color selection.
 */
const AdvancedColorPicker = ({ color, onChange }: { color: string, onChange: (c: string) => void }) => {
  // Local state to keep track of the current pixel point in HSV space
  const [hsv, setHsv] = useState(() => hexToHsv(color.startsWith('#') ? color : '#ffffff'));
  const satRectRef = useRef<HTMLDivElement>(null);

  // Sync HSV state if external color changes (e.g. typing a new hex)
  useEffect(() => {
    if (color.startsWith('#') && color.length === 7) {
      const newHsv = hexToHsv(color);
      setHsv(newHsv);
    }
  }, [color]);

  // Update Hue from the horizontal rainbow slider
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value);
    const newColor = hsvToHex(h, hsv.s, hsv.v);
    setHsv({ ...hsv, h });
    onChange(newColor);
  };

  // Update Saturation and Value from the square gradient area
  const handleSatValueChange = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!satRectRef.current) return;
    const rect = satRectRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Convert relative mouse position (%) to HSV values (0-100)
    let s = ((clientX - rect.left) / rect.width) * 100;
    let v = (1 - (clientY - rect.top) / rect.height) * 100;
    
    // Clamp values to prevent picking outside the bounds
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));
    
    const newColor = hsvToHex(hsv.h, s, v);
    setHsv({ ...hsv, s, v });
    onChange(newColor);
  }, [hsv, onChange]);

  return (
    <div className="flex flex-col gap-3 p-1">
      {/* UI: Rainbow Hue Slider Container */}
      <div className="relative h-3 w-full rounded-full overflow-hidden" style={{
        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
      }}>
        <input 
          type="range" min="0" max="360" value={hsv.h} onChange={handleHueChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Visual handle for the hue slider */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${(hsv.h / 360) * 100}% - 6px)` }}
        />
      </div>

      {/* UI: Saturation-Value Square Gradient */}
      <div 
        ref={satRectRef}
        onMouseDown={(e) => {
          handleSatValueChange(e);
          // Set up global listeners for smooth dragging outside the box
          const moveHandler = (me: MouseEvent) => handleSatValueChange(me as any);
          const upHandler = () => {
             window.removeEventListener('mousemove', moveHandler);
             window.removeEventListener('mouseup', upHandler);
          };
          window.addEventListener('mousemove', moveHandler);
          window.addEventListener('mouseup', upHandler);
        }}
        className="relative h-32 w-full rounded-sm cursor-crosshair overflow-hidden"
        style={{ backgroundColor: hsvToHex(hsv.h, 100, 100) }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        {/* Reticle showing current selection in the square */}
        <div 
          className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        />
      </div>

      {/* UI: Hex Code Input Field */}
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-sm px-2 py-1.5 mt-1">
        <div className="w-5 h-5 rounded-sm shadow-sm border border-white/10" style={{ backgroundColor: color }} />
        <input 
          type="text" value={color.toUpperCase()} 
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none outline-none text-[10px] font-mono text-foreground w-full uppercase"
        />
      </div>
    </div>
  );
};

/**
 * Main PencilToolbar component
 */
export const PencilToolbar: React.FC<PencilToolbarProps> = ({
  activeTool,
  setActiveTool,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
}) => {
  // Popover state for the color menu
  const [activePopover, setActivePopover] = useState<"none" | "color">("none");
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle between presets and custom picker
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (toolbarRef.current && !e.composedPath().includes(toolbarRef.current)) {
        setActivePopover("none");
        setShowAdvanced(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  // Pre-set pencil thicknesses
  const sizePresets = [
    { value: 2, iconSize: 4 },
    { value: 6, iconSize: 8 },
    { value: 12, iconSize: 12 },
    { value: 20, iconSize: 18 },
  ];

  return (
    <div 
      ref={toolbarRef}
      // Fixed floating toolbar with premium styling
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 p-1 rounded-sm bg-background/90 backdrop-blur-xl shadow-lg border border-border z-[1000] animate-in fade-in slide-in-from-bottom-2 duration-300"
      onPointerDown={(e) => e.stopPropagation()} // Stop propagation to canvas
      onWheel={(e) => e.stopPropagation()}
    >
      {/* SECTION: Tool Toggles (Pencil / Eraser) */}
      <div className="flex items-center gap-1.5 px-1.5 border-r border-border/50">
        <button
          onClick={() => setActiveTool("Pencil")}
          className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${
            activeTool === "Pencil"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          title="Pencil"
        >
          <PenLine size={16} />
        </button>
        <button
          onClick={() => setActiveTool("Eraser")}
          className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${
            activeTool === "Eraser"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
          title="Eraser"
        >
          <Eraser size={16} />
        </button>
      </div>

      {/* SECTION: Color Picker Toggle */}
      <div className="relative px-1 border-r border-border/50">
        <button 
          onClick={() => setActivePopover(activePopover === "color" ? "none" : "color")}
          className={`h-8 w-11 flex items-center justify-center gap-1 rounded-sm transition-colors ${activePopover === "color" ? 'bg-muted' : 'hover:bg-muted/50'}`}
          title="Fill Color"
        >
          {/* Circular indicator of current ink color */}
          <div 
            className="h-4 w-4 rounded-full border border-border mt-0.5" 
            style={{ backgroundColor: strokeColor }}
          />
          <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${activePopover === "color" ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Color Popover Menu */}
        <PopoverContainer active={activePopover === "color"} className="min-w-[150px]">
          {!showAdvanced ? (
            // VIEW 1: Basic Swatches
            <div className="flex flex-col gap-2 p-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Colors</span>
              <div className="grid grid-cols-4 gap-1.5 min-w-[120px]">
                {DEFAULT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setStrokeColor(c);
                      setActivePopover("none");
                    }}
                    className={`h-7 w-7 rounded-sm border border-border transition-all hover:scale-110 flex items-center justify-center ${strokeColor === c ? 'border-primary ring-1 ring-primary/20 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  >
                    {/* Checkmark indicator for current color selection */}
                    {strokeColor === c && <Check size={12} className={c === "#ffffff" ? "text-black" : "text-white"} />}
                  </button>
                ))}
              </div>
              {/* Button to toggle to the advanced custom picker */}
              <button
                onClick={() => setShowAdvanced(true)}
                className="flex items-center justify-center gap-2 w-full py-1.5 mt-1 bg-muted/50 hover:bg-muted rounded-sm text-[10px] text-muted-foreground hover:text-foreground transition-colors border border-border/50"
              >
                <Settings2 size={12} />
                Custom Color
              </button>
            </div>
          ) : (
            // VIEW 2: Advanced Picker
            <div className="flex flex-col gap-2 p-1">
              <div className="flex items-center justify-between pb-1 px-1 border-b border-border/50">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Custom</span>
                 <button onClick={() => setShowAdvanced(false)} className="text-[10px] text-primary hover:underline font-bold">Back</button>
              </div>
              <AdvancedColorPicker color={strokeColor} onChange={setStrokeColor} />
            </div>
          )}
        </PopoverContainer>
      </div>

      {/* SECTION: Size Presets (Pen thickness) */}
      <div className="flex items-center gap-1.5 px-2 border-r border-border/50">
        {sizePresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setStrokeWidth(preset.value)}
            className={`h-8 w-8 flex items-center justify-center rounded-sm transition-all ${
              strokeWidth === preset.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            {/* Visual circle representing the pen size */}
            <div 
              className="rounded-full transition-all duration-200"
              style={{ 
                width: preset.iconSize, 
                height: preset.iconSize,
                backgroundColor: strokeWidth === preset.value ? 'currentColor' : 'currentColor',
                opacity: strokeWidth === preset.value ? 1 : 0.4
              }}
            />
          </button>
        ))}
      </div>

      {/* SECTION: More Actions (Currently disabled placeholder) */}
      <div className="px-1">
        <button 
          disabled
          className="h-8 w-8 flex items-center justify-center rounded-sm text-muted-foreground/30 cursor-not-allowed"
          title="More Actions"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
};

export default PencilToolbar;
