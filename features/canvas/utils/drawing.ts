import { 
  RectShape, CircleShape, ImageShape, TextShape, FrameShape, 
  PolyShape, LineShape, ArrowShape, Connector, FigureShape, CodeShape, AnchorSide, ShapeKind 
} from "../types";

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
  ctx.strokeStyle = "rgba(63, 193, 255, 0.8)";
  ctx.lineWidth = 1.5 / zoom;
  ctx.setLineDash([4 / zoom, 2 / zoom]);
  ctx.strokeRect(x - 2 / zoom, y - 2 / zoom, width + 4 / zoom, height + 4 / zoom);
  
  // Handles
  ctx.setLineDash([]);
  ctx.fillStyle = "white";
  const hs = 6 / zoom;
  
  let handles: [number, number][] = [];
  if (kind === "code") {
    // Only horizontal handles (middle of left and right sides)
    handles = [
      [x, y + height / 2],
      [x + width, y + height / 2]
    ];
  } else {
    // Normal corners
    handles = [
      [x, y], [x + width, y], [x, y + height], [x + width, y + height]
    ];
  }

  handles.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.arc(hx, hy, hs / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
};

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
  ctx.globalAlpha = (im.opacity ?? 1) * alpha;
  if (img && img.complete) {
    ctx.drawImage(img, im.x, im.y, im.width, im.height);
  } else {
    ctx.fillStyle = "#e0e0e0";
    ctx.fillRect(im.x, im.y, im.width, im.height);
  }
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, im.x, im.y, im.width, im.height, zoom, "image");
  }
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  r: RectShape,
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = r.opacity ?? 1;
  if (r.fill) {
    ctx.fillStyle = r.fill;
    ctx.fillRect(r.x, r.y, r.width, r.height);
  }
  ctx.strokeStyle = r.stroke || themeStroke;
  ctx.lineWidth = (r.strokeWidth || 2) / zoom;
  if (r.strokeDashArray) ctx.setLineDash(r.strokeDashArray.map(v => v / zoom));
  ctx.strokeRect(r.x, r.y, r.width, r.height);
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, r.x, r.y, r.width, r.height, zoom, "rect");
  }
};

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
  ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
  if (c.fill) {
    ctx.fillStyle = c.fill;
    ctx.fill();
  }
  ctx.strokeStyle = c.stroke || themeStroke;
  ctx.lineWidth = (c.strokeWidth || 2) / zoom;
  if (c.strokeDashArray) ctx.setLineDash(c.strokeDashArray.map(v => v / zoom));
  ctx.stroke();
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, c.x - c.rx, c.y - c.ry, c.rx * 2, c.ry * 2, zoom, "circle");
  }
};

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

  const font = t.fontFamily === "Rough" ? "cursive" : t.fontFamily === "Mono" ? "monospace" : "sans-serif";
  ctx.font = `${t.fontSize}px ${font}`;
  
  ctx.fillStyle = t.fill || themeText;
  ctx.textBaseline = "top";
  
  const align = t.textAlign || "left";
  ctx.textAlign = align;

  const lines = t.text.split("\n");
  const lineHeight = t.fontSize * 1.2;
  
  lines.forEach((line, idx) => {
    let x = t.x;
    if (align === "center") x = t.x + t.width / 2;
    else if (align === "right") x = t.x + t.width;
    
    ctx.fillText(line, x, t.y + idx * lineHeight);
  });
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, t.x, t.y, t.width, t.height, zoom, "text");
  }
};

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
  
  // Frame Background
  ctx.fillStyle = f.fill || themeFrameBg;
  ctx.fillRect(f.x, f.y, f.width, f.height);
  
  // Device chrome if applicable
  if (f.deviceType) {
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 1 / zoom;
    ctx.strokeRect(f.x, f.y, f.width, f.height);
  }

  // Label
  ctx.fillStyle = themeText;
  ctx.font = `${11 / zoom}px sans-serif`;
  ctx.fillText(`Frame ${f.frameNumber}${f.deviceType ? ` (${f.deviceType})` : ''}`, f.x, f.y - 15 / zoom);
  
  ctx.strokeStyle = f.stroke || themeStroke;
  ctx.lineWidth = (f.strokeWidth || 1) / zoom;
  if (f.strokeDashArray) ctx.setLineDash(f.strokeDashArray.map(v => v / zoom));
  ctx.strokeRect(f.x, f.y, f.width, f.height);
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, f.x, f.y, f.width, f.height, zoom, "frame");
  }
};

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
  }
  
  ctx.closePath();
  if (p.fill) {
    ctx.fillStyle = p.fill;
    ctx.fill();
  }
  ctx.strokeStyle = p.stroke || themeStroke;
  ctx.lineWidth = (p.strokeWidth || 2) / zoom;
  if (p.strokeDashArray) ctx.setLineDash(p.strokeDashArray.map(v => v / zoom));
  ctx.stroke();
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, p.x, p.y, p.width, p.height, zoom, "poly");
  }
};

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
  ctx.lineWidth = (l.strokeWidth || 2) / zoom;
  if (l.strokeDashArray) ctx.setLineDash(l.strokeDashArray.map(v => v / zoom));
  ctx.stroke();
  ctx.restore();

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

  const headlen = 10 / zoom;
  const angle = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
  ctx.beginPath();
  ctx.moveTo(a.x1, a.y1);
  ctx.lineTo(a.x2, a.y2);
  ctx.lineTo(a.x2 - headlen * Math.cos(angle - Math.PI / 6), a.y2 - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(a.x2, a.y2);
  ctx.lineTo(a.x2 - headlen * Math.cos(angle + Math.PI / 6), a.y2 - headlen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
  ctx.restore();

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

export const drawConnector = (
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  themeStroke: string,
  zoom: number,
  options: {
    fromAnchor?: AnchorSide;
    toAnchor?: AnchorSide;
    fromBounds?: { x: number; y: number; width: number; height: number };
    toBounds?: { x: number; y: number; width: number; height: number };
    highlight?: boolean;
    stroke?: string;
    strokeWidth?: number;
  }
) => {
  ctx.save();
  ctx.strokeStyle = options.stroke || (options.highlight ? "#3bc1ff" : themeStroke);
  ctx.lineWidth = (options.strokeWidth || (options.highlight ? 3 : 2)) / zoom;
  
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  
  // Straight line for now, can be improved to curved/elbow later
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // Draw arrow at 'to' end
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const headlen = 10 / zoom;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI/6), to.y - headlen * Math.sin(angle - Math.PI/6));
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI/6), to.y - headlen * Math.sin(angle + Math.PI/6));
  ctx.stroke();
  
  ctx.restore();
};

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
  
  // Background/Border
  ctx.fillStyle = fill;
  ctx.fillRect(f.x, f.y, f.width, f.height);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = (f.strokeWidth || 2) / zoom;
  ctx.strokeRect(f.x, f.y, f.width, f.height);
  
  // Header
  const headerHeight = 30 / zoom;
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(f.x, f.y - headerHeight, f.width, headerHeight);
  ctx.strokeStyle = strokeColor;
  ctx.strokeRect(f.x, f.y - headerHeight, f.width, headerHeight);
  
  if (!options?.hideTitle) {
    ctx.fillStyle = themeText;
    ctx.font = `bold ${12 / zoom}px sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(f.title || `Figure ${f.figureNumber}`, f.x + 8 / zoom, f.y - headerHeight / 2);
  }
  
  ctx.restore();
  if (isSelected) {
    drawSelectionOverlay(ctx, f.x, f.y - headerHeight, f.width, f.height + headerHeight, zoom, "figure");
  }
};
