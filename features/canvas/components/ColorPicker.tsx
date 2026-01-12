import React, { useState, useEffect, useRef } from "react"; // Importing core React hooks

// Properties for the ColorPicker component
interface ColorPickerProps {
  color: string; // Current color in hex format (e.g., "#FF0000")
  onChange: (color: string) => void; // Callback function called when color changes
  theme?: string; // Application theme (light/dark) for visual styling
}

/**
 * ColorPicker - A custom HSV-based color selection component.
 */
const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, theme = "dark" }) => {
  // State for Hue, Saturation, and Value to drive the UI
  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(0);
  const [val, setVal] = useState(100);
  
  // Synchronize internal HSV state whenever the 'color' hex prop changes
  useEffect(() => {
    if (color && color.startsWith("#")) {
      const { h, s, v } = hexToHsv(color);
      setHue(h);
      setSat(s);
      setVal(v);
    }
  }, [color]);

  // Refs for tracking DOM elements to calculate interactive coordinates
  const satValRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Handles mouse/touch interactions on the Hue slider (the rainbow bar)
  const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (clientX: number) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const h = (x / rect.width) * 360; // Map screen X coordinate to 0-360 degrees
      setHue(h);
      onChange(hsvToHex(h, sat, val)); // Commit change back to parent as hex
    };

    // Global listeners to handle dragging outside the element boundaries
    const onMouseMove = (e: MouseEvent) => move(e.clientX);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);
    
    // Initial movement on click
    if ('clientX' in e) move(e.clientX);
    else move(e.touches[0].clientX);
  };

  // Handles mouse/touch interactions on the Saturation/Value area (the square picker)
  const handleSatValMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (clientX: number, clientY: number) => {
      if (!satValRef.current) return;
      const rect = satValRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const s = (x / rect.width) * 100; // Map X to 0-100% Saturation
      const v = 100 - (y / rect.height) * 100; // Map Y to 0-100% Value (inverted)
      setSat(s);
      setVal(v);
      onChange(hsvToHex(hue, s, v)); // Commit change as hex
    };

    // Global listeners for dragging behavior
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY);
    const onEnd = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onEnd);

    if ('clientX' in e) move(e.clientX, e.clientY);
    else move(e.touches[0].clientX, e.touches[0].clientY);
  };

  const isDark = theme === "dark"; // Boolean for styling logic

  return (
    // Main container with theme-aware background and borders
    <div className={`flex flex-col gap-3 p-3 rounded-lg border shadow-2xl w-[200px] ${
      isDark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-black/10"
    }`}>
      {/* Hue Slider: The rainbow horizontal bar */}
      <div 
        ref={hueRef}
        className="h-3 w-full rounded-full cursor-pointer relative"
        style={{ background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)" }}
        onMouseDown={handleHueMouseDown}
        onTouchStart={handleHueMouseDown}
      >
        {/* The visual handle indicator on the hue slider */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-5 w-2 bg-white border border-black/20 rounded-full pointer-events-none"
          style={{ left: `${(hue / 360) * 100}%`, transform: "translate(-50%, -50%)" }}
        />
      </div>

      {/* Saturation/Value Area: The large square for fine-tuning colors */}
      <div 
        ref={satValRef}
        className="h-[150px] w-full rounded-md cursor-crosshair relative overflow-hidden ring-1 ring-black/10"
        style={{ backgroundColor: hsvToHex(hue, 100, 100) }} // Background color is the full-saturated hue
        onMouseDown={handleSatValMouseDown}
        onTouchStart={handleSatValMouseDown}
      >
        {/* Gradients to simulate the HSV color space mixing (White for Sat, Black for Val) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        {/* The target reticle indicator */}
        <div 
          className="absolute h-4 w-4 border-2 border-white rounded-full shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${sat}%`, top: `${100 - val}%` }}
        />
      </div>

      {/* Hex Input: Manual code entry and color preview */}
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md border ${
        isDark ? "bg-muted/30 border-white/10" : "bg-black/[0.03] border-black/10"
      }`}>
        <div className={`h-4 w-4 rounded-sm border ${isDark ? "border-white/20" : "border-black/10"}`} style={{ backgroundColor: color }} />
        <input 
          type="text" 
          value={color.toUpperCase()} 
          onChange={(e) => onChange(e.target.value)} // Allows users to type custom hex codes
          className="bg-transparent border-none outline-none text-[11px] font-mono font-bold w-full text-foreground"
        />
      </div>
    </div>
  );
};

/**
 * HELPER: Converts HSV values to a standard Hex string.
 */
function hsvToHex(h: number, s: number, v: number) {
  s /= 100;
  v /= 100;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  // Choose algorithm based on hue sector (6 sectors of 60 degrees)
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
}

/**
 * HELPER: Parses a Hex string into its HSV components.
 */
function hexToHsv(hex: string) {
  let r = 0, g = 0, b = 0;
  // Handle both shorthand (#FFF) and full length (#FFFFFF) hex
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
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
}

export default ColorPicker;
