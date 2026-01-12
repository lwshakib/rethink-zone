import { 
  RectShape, CircleShape, ImageShape, TextShape, FrameShape, 
  PolyShape, LineShape, ArrowShape, Connector, FigureShape, CodeShape, AnchorSide, ShapeKind 
} from "../types"; // Import shape interfaces for type-safe property access
import { getConnectorPoints } from "./geometry"; // Import routing utility for smart connectors

/**
 * Renders a dashed blue highlighting box around a selected shape.
 * Includes small circular 'handles' at the corners for visual feedback of a transformable state.
 * 
 * @param ctx - The canvas 2D rendering context.
 * @param x, y, width, height - The bounding box of the overlay.
 * @param zoom - Current viewport scale (to maintain constant visual thickness).
 * @param kind - The type of shape being highlighted.
 */
export const drawSelectionOverlay = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number,
  kind?: ShapeKind
) => {
  ctx.save();
  // Set the characteristic 'selection blue' color
  ctx.strokeStyle = "rgba(63, 193, 255, 0.8)";
  // Adjust line width based on zoom to prevent it from getting too thick/thin
  ctx.lineWidth = 1.5 / zoom;
  // Apply a dashed pattern to distinguish from normal shape strokes
  ctx.setLineDash([4 / zoom, 2 / zoom]);
  // Stroke slightly outside the actual shape boundaries to increase visibility
  ctx.strokeRect(x - 2 / zoom, y - 2 / zoom, width + 4 / zoom, height + 4 / zoom);
  
  // Revert dash settings for the solid corner handles
  ctx.setLineDash([]);
  ctx.fillStyle = "white"; // White fill for high contrast against the blue stroke
  const hs = 6 / zoom; // Handle size
  
  // Identify key points (corners) where handles should be drawn
  let handles: [number, number][] = [
    [x, y], [x + width, y], [x, y + height], [x + width, y + height]
  ];

  // Draw each handle as a small stroked circle
  handles.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.arc(hx, hy, hs / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
};

/**
 * Renders an Image element on the canvas from a pre-loaded image cache.
 * If the image is missing, it draws a gray placeholder box.
 */
export const drawImageItem = (
  ctx: CanvasRenderingContext2D,
  im: ImageShape,
  imageCache: Record<string, HTMLImageElement>,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  const img = imageCache[im.src];
  ctx.save();
  // Multiply personal opacity with global override alpha
  ctx.globalAlpha = (im.opacity ?? 1) * alpha;
  
  // Verify image availability and completion status
  if (img && img.complete) {
    ctx.drawImage(img, im.x, im.y, im.width, im.height);
  } else {
    // Placeholder rendering
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(im.x, im.y, im.width, im.height);
  }
  ctx.restore();

  // Draw selection UI if the shape is active in the inspector
  if (isSelected) {
    drawSelectionOverlay(ctx, im.x, im.y, im.width, im.height, zoom, "image");
  }
};

/**
 * Basic rectangle drawing with support for customizable fill, stroke, and dashed outlines.
 */
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  r: RectShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = r.opacity ?? 1;
  
  // Optional internal filling
  if (r.fill) {
    ctx.fillStyle = r.fill;
    ctx.fillRect(r.x, r.y, r.width, r.height);
  }
  
  // Border rendering logic
  ctx.strokeStyle = r.stroke || themeStroke;
  const sw = r.strokeWidth !== undefined ? r.strokeWidth : 2;
  if (sw > 0) {
    ctx.lineWidth = sw / zoom;
    // Support for custom dash patterns (e.g., for notes or grid regions)
    if (r.strokeDashArray) ctx.setLineDash(r.strokeDashArray.map(v => v / zoom));
    ctx.strokeRect(r.x, r.y, r.width, r.height);
  }
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, r.x, r.y, r.width, r.height, zoom, "rect");
  }
};

/**
 * Elliptical shape drawing (Circles are treated as ovals with rx == ry).
 */
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  c: CircleShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = c.opacity ?? 1;
  ctx.beginPath();
  // Use the native ellipse function for precise rendering
  ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
  
  if (c.fill) {
    ctx.fillStyle = c.fill;
    ctx.fill();
  }
  
  ctx.strokeStyle = c.stroke || themeStroke;
  const sw = c.strokeWidth !== undefined ? c.strokeWidth : 2;
  if (sw > 0) {
    ctx.lineWidth = sw / zoom;
    if (c.strokeDashArray) ctx.setLineDash(c.strokeDashArray.map(v => v / zoom));
    ctx.stroke();
  }
  ctx.restore();

  if (isSelected) {
    // Selection bounding box needs to account for radius vs diameter
    drawSelectionOverlay(ctx, c.x - c.rx, c.y - c.ry, c.rx * 2, c.ry * 2, zoom, "circle");
  }
};

/**
 * Renders multi-line text with support for various alignments and custom fonts.
 */
export const drawText = (
  ctx: CanvasRenderingContext2D,
  t: TextShape,
  themeText: string,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = (t.opacity ?? 1) * alpha;

  // Resolve internal font names to CSS-compatible values
  const font = t.fontFamily === "Rough" ? "cursive" : t.fontFamily === "Mono" ? "monospace" : "sans-serif";
  ctx.font = `${t.fontSize}px ${font}`;
  
  ctx.fillStyle = t.fill || themeText;
  ctx.textBaseline = "top"; // Use top baseline for easier multi-line calculation
  
  const align = t.textAlign || "left";
  ctx.textAlign = align;

  // Split content by newlines and render line-by-line
  const lines = t.text.split("\n");
  const lineHeight = t.fontSize * 1.2;
  
  lines.forEach((line, idx) => {
    let x = t.x;
    // Offset X based on alignment relative to the bounding box
    if (align === "center") x = t.x + t.width / 2;
    else if (align === "right") x = t.x + t.width;
    
    ctx.fillText(line, x, t.y + idx * lineHeight);
  });
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, t.x, t.y, t.width, t.height, zoom, "text");
  }
};

/**
 * Complex drawing function for 'Frames' which represent device mockups (Phone, Tablet, Browser, Desktop).
 */
export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  f: FrameShape,
  themeStroke: string,
  themeText: string,
  themeFrameBg: string,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = (f.opacity ?? 1) * alpha;
  
  const x = f.x;
  const y = f.y;
  const w = f.width;
  const h = f.height;
  const strokeColor = f.stroke || themeStroke;
  const sw = (f.strokeWidth !== undefined ? f.strokeWidth : 1) / zoom;

  // Render the basic background surface
  ctx.fillStyle = f.fill || themeFrameBg;
  
  // Logic branch for rounded portable devices
  if (f.deviceType === "phone" || f.deviceType === "tablet") {
    const isPhone = f.deviceType === "phone";
    const radius = (isPhone ? 32 : 16) / zoom; // Phones are typically more rounded
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    
    if (sw > 0) {
      ctx.lineWidth = sw;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
    
    // Internal bezel/screen area simulation with subtle transparency
    const bezel = 6 / zoom;
    ctx.fillStyle = "rgba(0,0,0,0.02)";
    ctx.beginPath();
    ctx.roundRect(x + bezel, y + bezel, w - bezel * 2, h - bezel * 2, radius - bezel);
    ctx.fill();

    // Specific detailing for modern phone notches
    if (isPhone) {
        const notchW = Math.min(w * 0.4, 100 / zoom);
        const notchH = 20 / zoom;
        const notchR = 10 / zoom;
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.roundRect(x + (w - notchW) / 2, y + 4/zoom, notchW, notchH, notchR);
        ctx.fill();
        
        // Earpiece speaker detail
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.roundRect(x + (w - 30/zoom) / 2, y + 10/zoom, 30/zoom, 3/zoom, 1.5/zoom);
        ctx.fill();
        
        // Front-facing camera lens detail
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(x + (w + 50/zoom) / 2, y + 11.5/zoom, 2.5/zoom, 0, Math.PI * 2);
        ctx.fill();
    } else {
        // Tablet camera dot (usually centered in bezel)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(x + w / 2, y + 10 / zoom, 3 / zoom, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Bottom orientation/home bar indicator
    const barW = w * 0.3;
    const barH = 4 / zoom;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(x + (w - barW) / 2, y + h - 12 / zoom, barW, barH, 2/zoom);
    ctx.fill();

  } else if (f.deviceType === "desktop" || f.deviceType === "browser") {
    // Logic branch for windowed desktop/browser interfaces
    const isBrowser = f.deviceType === "browser";
    const barH = (isBrowser ? 44 : 32) / zoom; // Browsers have larger address bars
    const radius = 8 / zoom;

    // Main window body with rounded top edges
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [radius, radius, 0, 0]);
    ctx.fill();
    
    if (sw > 0) {
      ctx.lineWidth = sw;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
    
    // Render the window header bar
    ctx.fillStyle = "rgba(0,0,0,0.03)";
    ctx.beginPath();
    ctx.roundRect(x, y, w, barH, [radius, radius, 0, 0]);
    ctx.fill();
    
    // Hairline separator between header and content area
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.moveTo(x, y + barH);
    ctx.lineTo(x + w, y + barH);
    ctx.stroke();
    
    // Traditional 'Traffic Light' window controls (Red, Yellow, Green)
    const dotR = 5 / zoom;
    const spacing = 12 / zoom;
    const colors = ["#ff5f56", "#ffbd2e", "#27c93f"];
    colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(x + 16 / zoom + i * spacing, y + barH / 2, dotR, 0, Math.PI * 2);
        ctx.fill();
    });

    if (isBrowser) {
        // Realistic browser navigation elements (Back, Forward, Address Bar)
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5 / zoom;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const iconY = y + barH / 2;
        
        // Back arrow icon
        const bx = x + 60 / zoom;
        ctx.beginPath();
        ctx.moveTo(bx + 10/zoom, iconY); ctx.lineTo(bx, iconY);
        ctx.lineTo(bx + 4/zoom, iconY - 4/zoom); ctx.moveTo(bx, iconY); ctx.lineTo(bx + 4/zoom, iconY + 4/zoom);
        ctx.stroke();
        
        // Forward arrow icon
        const fx = x + 80 / zoom;
        ctx.beginPath();
        ctx.moveTo(fx, iconY); ctx.lineTo(fx + 10/zoom, iconY);
        ctx.lineTo(fx + 6/zoom, iconY - 4/zoom); ctx.moveTo(fx + 10/zoom, iconY); ctx.lineTo(fx + 6/zoom, iconY + 4/zoom);
        ctx.stroke();
        
        // Simulated address bar field
        const addrX = x + 105 / zoom;
        const addrW = w - 120 / zoom;
        const addrH = 26 / zoom;
        ctx.fillStyle = "rgba(0,0,0,0.04)";
        ctx.beginPath();
        ctx.roundRect(addrX, y + (barH - addrH) / 2, addrW, addrH, 13 / zoom);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.stroke();
    }
  } else {
    // Basic fallback rectangle if no device type is specified
    ctx.fillRect(x, y, w, h);
    if (sw > 0) {
      ctx.lineWidth = sw;
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x, y, w, h);
    }
  }

  // Render the Frame title label above the top-left corner
  ctx.fillStyle = themeText;
  ctx.font = `${11 / zoom}px sans-serif`;
  ctx.textBaseline = "bottom";
  ctx.fillText(`Frame ${f.frameNumber}${f.deviceType ? ` (${f.deviceType})` : ''}`, f.x, f.y - 4 / zoom);
  
  ctx.restore();

  // Highlight the frame boundary if selected
  if (isSelected) {
    drawSelectionOverlay(ctx, f.x, f.y, f.width, f.height, zoom, "frame");
  }
};

/**
 * Renders diverse geometric polygons (Triangles, Diamonds, Stars, etc.)
 */
export const drawPoly = (
  ctx: CanvasRenderingContext2D,
  p: PolyShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = p.opacity ?? 1;
  ctx.beginPath();
  
  // Custom path definition based on the polygon sub-type
  if (p.type === "Triangle") {
    ctx.moveTo(p.x + p.width / 2, p.y);
    ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height);
  } else if (p.type === "Diamond") {
    ctx.moveTo(p.x + p.width / 2, p.y);
    ctx.lineTo(p.x + p.width, p.y + p.height / 2);
    ctx.lineTo(p.x + p.width / 2, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height / 2);
  } else if (p.type === "Hexagon") {
    const w = p.width; const h = p.height;
    ctx.moveTo(p.x + w * 0.25, p.y);
    ctx.lineTo(p.x + w * 0.75, p.y);
    ctx.lineTo(p.x + w, p.y + h * 0.5);
    ctx.lineTo(p.x + w * 0.75, p.y + h);
    ctx.lineTo(p.x + w * 0.25, p.y + h);
    ctx.lineTo(p.x, p.y + h * 0.5);
  } else if (p.type === "Star") {
    const cx = p.x + p.width / 2; const cy = p.y + p.height / 2;
    const outer = Math.min(p.width, p.height) / 2;
    const inner = outer * 0.4;
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
        const r = i % 2 === 0 ? outer : inner;
        ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
  } else if (p.type === "Oval") {
    ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
  } else if (p.type === "Parallelogram") {
    ctx.moveTo(p.x + p.width * 0.2, p.y);
    ctx.lineTo(p.x + p.width, p.y);
    ctx.lineTo(p.x + p.width * 0.8, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height);
  } else if (p.type === "Trapezoid") {
    ctx.moveTo(p.x + p.width * 0.2, p.y);
    ctx.lineTo(p.x + p.width * 0.8, p.y);
    ctx.lineTo(p.x + p.width, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height);
  } else if (p.type === "Cylinder" || p.type === "Database") {
    // Specialized multi-part drawing for 3D-looking primitives
    const w = p.width; const h = p.height;
    const rx = w / 2;
    // Database icons have shallower elipses than general cylinders
    const ry = p.type === "Cylinder" ? Math.min(h * 0.15, 20) : Math.min(h * 0.1, 15);
    const cx = p.x + rx;
    
    // 1. Fill the main body (rectangle side + bottom cap)
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + ry);
    ctx.lineTo(p.x, p.y + h - ry);
    ctx.ellipse(cx, p.y + h - ry, rx, ry, 0, 0, Math.PI, false);
    ctx.lineTo(p.x + w, p.y + ry);
    ctx.ellipse(cx, p.y + ry, rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    if (p.fill) {
      ctx.fillStyle = p.fill;
      ctx.fill();
    }

    // 2. Stroke the bottom arc and vertical walls
    ctx.strokeStyle = p.stroke || themeStroke;
    const sw = p.strokeWidth !== undefined ? p.strokeWidth : 2;
    if (sw > 0) {
      ctx.lineWidth = sw / zoom;
      if (p.strokeDashArray) ctx.setLineDash(p.strokeDashArray.map(v => v / zoom));
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + ry);
      ctx.lineTo(p.x, p.y + h - ry);
      ctx.ellipse(cx, p.y + h - ry, rx, ry, 0, 0, Math.PI, false);
      ctx.lineTo(p.x + w, p.y + ry);
      ctx.stroke();
    }

    // 3. Draw the top cap as a distinct full ellipse on top
    ctx.beginPath();
    ctx.ellipse(cx, p.y + ry, rx, ry, 0, 0, Math.PI * 2);
    if (p.fill) {
      ctx.fillStyle = p.fill;
      ctx.fill();
    }
    if (sw > 0) {
      ctx.stroke();
    }
    
    // Early return for specialized shapes as they manage their own ctx.restore() logic implicitly via the return
    ctx.restore();
    if (isSelected) drawSelectionOverlay(ctx, p.x, p.y, p.width, p.height, zoom, "poly");
    return;
  }
  
  ctx.closePath();
  // Standard fill/stroke procedure for basic polygons
  if (p.fill) {
    ctx.fillStyle = p.fill;
    ctx.fill();
  }
  ctx.strokeStyle = p.stroke || themeStroke;
  const sw = p.strokeWidth !== undefined ? p.strokeWidth : 2;
  if (sw > 0) {
    ctx.lineWidth = sw / zoom;
    if (p.strokeDashArray) ctx.setLineDash(p.strokeDashArray.map(v => v / zoom));
    ctx.stroke();
  }
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, p.x, p.y, p.width, p.height, zoom, "poly");
  }
};

/**
 * Renders a simple point-to-point line.
 */
export const drawLine = (
  ctx: CanvasRenderingContext2D,
  l: LineShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.beginPath();
  ctx.moveTo(l.x1, l.y1);
  ctx.lineTo(l.x2, l.y2);
  ctx.strokeStyle = l.stroke || themeStroke;
  const sw = l.strokeWidth !== undefined ? l.strokeWidth : 2;
  if (sw > 0) {
    ctx.lineWidth = sw / zoom;
    if (l.strokeDashArray) ctx.setLineDash(l.strokeDashArray.map(v => v / zoom));
    ctx.stroke();
  }
  ctx.restore();

  // Draw circular endpoints when selected for easier drag handle identification
  if (isSelected) {
    const hs = 10 / zoom;
    ctx.save();
    ctx.strokeStyle = "rgba(63, 193, 255, 0.8)";
    ctx.lineWidth = 1.5 / zoom;
    ctx.beginPath();
    ctx.arc(l.x1, l.y1, hs / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(l.x2, l.y2, hs / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
};

/**
 * Renders an arrow with a triangulated head at the destination point.
 */
export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  a: ArrowShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = a.opacity ?? 1;
  ctx.strokeStyle = a.stroke || themeStroke;
  ctx.lineWidth = (a.strokeWidth || 2) / zoom;
  if (a.strokeDashArray) ctx.setLineDash(a.strokeDashArray.map(v => v / zoom));

  const headlen = 10 / zoom; // Visual size of the arrowhead
  const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
  ctx.beginPath();
  ctx.moveTo(a.x1, a.y1);
  ctx.lineTo(a.x2, a.y2); // Main shaft
  // Left side of arrowhead
  ctx.lineTo(a.x2 - headlen * Math.cos(angle - Math.PI / 6), a.y2 - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(a.x2, a.y2);
  // Right side of arrowhead
  ctx.lineTo(a.x2 - headlen * Math.cos(angle + Math.PI / 6), a.y2 - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  ctx.restore();

  // Highlight endpoints if selected
  if (isSelected) {
     const hs = 10 / zoom;
     ctx.save();
     ctx.strokeStyle = "rgba(63, 193, 255, 0.8)";
     ctx.lineWidth = 1.5 / zoom;
     ctx.beginPath(); ctx.arc(a.x1, a.y1, hs/2, 0, Math.PI*2); ctx.stroke();
     ctx.beginPath(); ctx.arc(a.x2, a.y2, hs/2, 0, Math.PI*2); ctx.stroke();
     ctx.restore();
  }
};

/**
 * Renders an intelligent orthogonal connector between two shape anchor points.
 * Uses smart pathfind points and supports rounded corners for aesthetics.
 */
export const drawConnector = (
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  themeStroke: string,
  zoom: number,
  options: {
    fromAnchor?: AnchorSide | "none";
    toAnchor?: AnchorSide | "none";
    fromBounds?: { x: number; y: number; width: number; height: number };
    toBounds?: { x: number; y: number; width: number; height: number };
    highlight?: boolean; // If true, renders a thicker, dashed line for hover feedback
    stroke?: string;
    strokeWidth?: number;
  }
) => {
  ctx.save();
  const strokeColor = options.stroke || (options.highlight ? "rgba(83,182,255,1)" : themeStroke);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = (options.strokeWidth || (options.highlight ? 2.5 : 2)) / zoom;
  if (options.highlight) ctx.setLineDash([5 / zoom, 5 / zoom]);
  ctx.lineJoin = "round"; // Smoothens the sharp bends
  ctx.lineCap = "round";

  // Request the optimal orthogonal point sequence from the geometry engine
  const points = getConnectorPoints(
    from,
    to,
    options.fromAnchor,
    options.toAnchor,
    options.fromBounds,
    options.toBounds,
    zoom
  );

  // Safety exit if no points could be computed
  if (points.length < 2) {
    ctx.restore();
    return;
  }

  const cornerRadius = 10 / zoom; // Standard radius for connector bends
  ctx.beginPath();
  // Move to start point
  ctx.moveTo(points[0].x, points[0].y);
  
  // Iterate through calculated points and apply rounded turns using arcTo
  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurrent = points[i];
    const pNext = points[i + 1];
    const d1 = Math.hypot(pCurrent.x - pPrev.x, pCurrent.y - pPrev.y);
    const d2 = Math.hypot(pNext.x - pCurrent.x, pNext.y - pCurrent.y);
    // Ensure the radius isn't larger than half the connecting segments
    const actualRadius = Math.min(cornerRadius, d1 / 2, d2 / 2);
    ctx.arcTo(pCurrent.x, pCurrent.y, pNext.x, pNext.y, actualRadius);
  }
  // Connect to the final point
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();

  // Draw the arrowhead at the target end point
  const lastP = points[points.length - 1];
  const prevP = points[points.length - 2] || points[0];
  const angle = Math.atan2(lastP.y - prevP.y, lastP.x - prevP.x); // Orientation angle
  const size = 10 / zoom;
  ctx.save();
  ctx.translate(lastP.x, lastP.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0); // Tip of arrowhead
  ctx.lineTo(-size, -size * 0.5); // base-left
  ctx.lineTo(-size, size * 0.5); // base-right
  ctx.closePath();
  ctx.fillStyle = strokeColor;
  ctx.fill();
  ctx.restore();
  ctx.restore();
};

/**
 * Basic pencil path drawing (series of raw coordinates).
 */
export const drawPath = (
  ctx: CanvasRenderingContext2D,
  p: { points: { x: number; y: number }[]; stroke?: string; strokeWidth?: number },
  themeStroke: string,
  zoom: number
) => {
  if (p.points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p.points[0].x, p.points[0].y);
  for (let i = 1; i < p.points.length; i++) {
    ctx.lineTo(p.points[i].x, p.points[i].y);
  }
  ctx.strokeStyle = p.stroke || themeStroke;
  ctx.lineWidth = (p.strokeWidth || 2) / zoom;
  ctx.stroke();
  ctx.restore();
};

/**
 * Renders a 'Figure' block which is a titled container for other diagrams.
 */
export const drawFigure = (
  ctx: CanvasRenderingContext2D,
  f: FigureShape,
  themeStroke: string,
  themeText: string,
  zoom: number,
  isSelected = false,
  options?: { hideTitle?: boolean }
) => {
  ctx.save();
  ctx.globalAlpha = f.opacity ?? 1;
  const strokeColor = f.stroke || themeStroke;
  const fill = f.fill || "transparent";
  
  // Background and primary border
  ctx.fillStyle = fill;
  ctx.fillRect(f.x, f.y, f.width, f.height);
  ctx.strokeStyle = strokeColor;
  const sw = f.strokeWidth !== undefined ? f.strokeWidth : 2;
  if (sw > 0) {
    ctx.lineWidth = sw / zoom;
    ctx.strokeRect(f.x, f.y, f.width, f.height);
  }
  
  // Header bar containing the title
  const headerHeight = 30 / zoom;
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(f.x, f.y - headerHeight, f.width, headerHeight);
  ctx.strokeStyle = strokeColor;
  ctx.strokeRect(f.x, f.y - headerHeight, f.width, headerHeight); // Outline the header independently
  
  if (!options?.hideTitle) {
    // Dynamic title rendering at the top of the figure
    ctx.fillStyle = themeText;
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(f.title || `Figure ${f.figureNumber}`, f.x + 8 / zoom, f.y - headerHeight / 2);
  }
  
  ctx.restore();
  // Larger selection overlay spanning both body and header
  if (isSelected) {
    drawSelectionOverlay(ctx, f.x, f.y - headerHeight, f.width, f.height + headerHeight, zoom, "figure");
  }
};
