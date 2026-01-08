import { AnchorSide, PolyShape } from "../types";

export const getAnchorDir = (anchor: AnchorSide) => {
  if (anchor === "top") return { x: 0, y: -1 };
  if (anchor === "bottom") return { x: 0, y: 1 };
  if (anchor === "left") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
};

const SELECTION_COLOR = "rgba(83,182,255,0.9)";
const HANDLE_SIZE = 8;
const SELECTION_PADDING = 4;

const drawSelectionOverlay = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number,
  isCircle = false
) => {
  const pad = SELECTION_PADDING / zoom;
  const hs = HANDLE_SIZE / zoom;
  
  ctx.save();
  ctx.strokeStyle = SELECTION_COLOR;
  ctx.lineWidth = 1.6 / zoom;
  ctx.setLineDash([4 / zoom, 2 / zoom]);
  
  const sx = x - pad;
  const sy = y - pad;
  const sw = width + pad * 2;
  const sh = height + pad * 2;

  if (isCircle) {
    ctx.beginPath();
    ctx.ellipse(x, y, width + pad, height + pad, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Bounding box for handles
    ctx.setLineDash([4/zoom, 4/zoom]);
    ctx.strokeRect(x - width - pad, y - height - pad, (width + pad) * 2, (height + pad) * 2);
  } else {
    ctx.strokeRect(sx, sy, sw, sh);
  }

  // Draw handles
  const handles = isCircle ? [
    { x: x - width - pad, y: y - height - pad },
    { x: x + width + pad, y: y - height - pad },
    { x: x - width - pad, y: y + height + pad },
    { x: x + width + pad, y: y + height + pad },
    { x: x, y: y - height - pad },
    { x: x, y: y + height + pad },
    { x: x - width - pad, y: y },
    { x: x + width + pad, y: y }
  ] : [
    { x: sx, y: sy },
    { x: sx + sw, y: sy },
    { x: sx, y: sy + sh },
    { x: sx + sw, y: sy + sh },
    { x: sx + sw / 2, y: sy },
    { x: sx + sw / 2, y: sy + sh },
    { x: sx, y: sy + sh / 2 },
    { x: sx + sw, y: sy + sh / 2 }
  ];

  ctx.fillStyle = SELECTION_COLOR;
  ctx.setLineDash([]);
  handles.forEach(h => {
    ctx.beginPath();
    ctx.rect(h.x - hs / 2, h.y - hs / 2, hs, hs);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1 / zoom;
    ctx.stroke();
  });
  ctx.restore();
};

export const drawImageItem = (
  ctx: CanvasRenderingContext2D,
  im: { src: string; x: number; y: number; width: number; height: number; opacity?: number },
  imageCache: Record<string, HTMLImageElement>,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  const tag = imageCache[im.src];
  if (tag && tag.complete && tag.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = (im.opacity ?? 1) * alpha;
    ctx.drawImage(tag, im.x, im.y, im.width, im.height);
    ctx.restore();
    if (isSelected) {
      drawSelectionOverlay(ctx, im.x, im.y, im.width, im.height, zoom);
    }
  }
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  t: {
    x: number;
    y: number;
    text: string;
    fontSize: number;
    width: number;
    height: number;
    fill?: string;
    opacity?: number;
  },
  themeText: string,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = (t.opacity ?? 1) * alpha;
  ctx.font = `${t.fontSize}px sans-serif`;
  ctx.fillStyle = t.fill || themeText;
  ctx.textBaseline = "top";
  const lines = t.text.split("\n");
  const lineHeight = t.fontSize * 1.2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, t.x, t.y + idx * lineHeight);
  });
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, t.x, t.y, t.width, t.height, zoom);
  }
};

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  r: { x: number; y: number; width: number; height: number; fill?: string; stroke?: string; opacity?: number; strokeDashArray?: number[]; strokeWidth?: number },
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = r.opacity ?? 1;
  const x = r.width < 0 ? r.x + r.width : r.x;
  const y = r.height < 0 ? r.y + r.height : r.y;
  const width = Math.abs(r.width);
  const height = Math.abs(r.height);

  if (r.fill) {
    ctx.fillStyle = r.fill;
    ctx.fillRect(x, y, width, height);
  }

  ctx.strokeStyle = r.stroke || themeStroke;
  ctx.lineWidth = (r.strokeWidth || 2) / zoom;
  ctx.setLineDash(r.strokeDashArray || []);
  ctx.strokeRect(x, y, width, height);
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, x, y, width, height, zoom);
  }
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  f: {
    x: number;
    y: number;
    width: number;
    height: number;
    frameNumber: number;
    fill?: string;
    stroke?: string;
    opacity?: number;
    strokeDashArray?: number[];
    strokeWidth?: number;
  },
  themeStroke: string,
  themeText: string,
  themeFrameBg: string,
  zoom: number,
  alpha = 1,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = (f.opacity ?? 1) * alpha;
  const x = f.width < 0 ? f.x + f.width : f.x;
  const y = f.height < 0 ? f.y + f.height : f.y;
  const width = Math.abs(f.width);
  const height = Math.abs(f.height);
  const radius = 12 / zoom;

  ctx.fillStyle = f.fill || themeFrameBg;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();

  ctx.strokeStyle = f.stroke || themeStroke;
  ctx.lineWidth = (f.strokeWidth || 1) / zoom;
  ctx.setLineDash(f.strokeDashArray || []);
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();

  ctx.fillStyle = themeText;
  ctx.font = `${11 / zoom}px sans-serif`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  ctx.fillText(`Frame ${f.frameNumber}`, x, y - 4 / zoom);
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, x, y, width, height, zoom);
  }
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  c: { x: number; y: number; rx: number; ry: number; fill?: string; stroke?: string; opacity?: number; strokeDashArray?: number[]; strokeWidth?: number },
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
  ctx.setLineDash(c.strokeDashArray || []);
  ctx.stroke();
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, c.x, c.y, c.rx, c.ry, zoom, true);
  }
};

export const drawPoly = (
  ctx: CanvasRenderingContext2D,
  p: PolyShape & { strokeDashArray?: number[]; strokeWidth?: number },
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = p.opacity ?? 1;
  const { x, y, width, height, type, fill, stroke, strokeDashArray, strokeWidth } = p;
  
  ctx.beginPath();
  if (type === "Diamond") {
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width / 2, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
  } else if (type === "Triangle") {
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  } else if (type === "Parallelogram") {
    const off = width * 0.2;
    ctx.moveTo(x + off, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - off, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  } else if (type === "Trapezoid") {
    const off = width * 0.2;
    ctx.moveTo(x + off, y);
    ctx.lineTo(x + width - off, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  } else if (type === "Hexagon") {
    const qw = width * 0.25;
    ctx.moveTo(x + qw, y);
    ctx.lineTo(x + width - qw, y);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineTo(x + width - qw, y + height);
    ctx.lineTo(x + qw, y + height);
    ctx.lineTo(x, y + height / 2);
    ctx.closePath();
  } else if (type === "Star") {
    const cx = x + width / 2;
    const cy = y + height / 2;
    const rxO = width / 2;
    const ryO = height / 2;
    const rxI = width / 4;
    const ryI = height / 4;
    for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 - Math.PI / 2;
        const rx = i % 2 === 0 ? rxO : rxI;
        const ry = i % 2 === 0 ? ryO : ryI;
        const px = cx + rx * Math.cos(ang);
        const py = cy + ry * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (type === "Cylinder") {
    const rh = height * 0.15;
    ctx.ellipse(x + width / 2, y + rh, width / 2, rh, 0, 0, Math.PI * 2);
    ctx.moveTo(x, y + rh);
    ctx.lineTo(x, y + height - rh);
    ctx.ellipse(x + width / 2, y + height - rh, width / 2, rh, 0, 0, Math.PI, false);
    ctx.lineTo(x + width, y + rh);
  } else if (type === "Document") {
    const c = Math.min(width, height) * 0.2;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width - c, y);
    ctx.lineTo(x + width, y + c);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  }

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = stroke || themeStroke;
  ctx.lineWidth = (strokeWidth || 2) / zoom;
  ctx.setLineDash(strokeDashArray || []);
  ctx.stroke();

  if (type === "Document") {
    const c = Math.min(width, height) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + width - c, y);
    ctx.lineTo(x + width - c, y + c);
    ctx.lineTo(x + width, y + c);
    ctx.stroke();
  }
  ctx.restore();

  if (isSelected) {
    drawSelectionOverlay(ctx, x, y, width, height, zoom);
  }
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  l: { x1: number; y1: number; x2: number; y2: number; stroke?: string; opacity?: number; strokeDashArray?: number[]; strokeWidth?: number },
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.strokeStyle = l.stroke || themeStroke;
  ctx.lineWidth = (l.strokeWidth || 2) / zoom;
  ctx.setLineDash(l.strokeDashArray || []);
  ctx.beginPath();
  ctx.moveTo(l.x1, l.y1);
  ctx.lineTo(l.x2, l.y2);
  ctx.stroke();
  ctx.restore();

  if (isSelected) {
    ctx.save();
    const hs = HANDLE_SIZE / zoom;
    ctx.fillStyle = SELECTION_COLOR;
    [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }].forEach((h) => {
      ctx.beginPath();
      ctx.rect(h.x - hs / 2, h.y - hs / 2, hs, hs);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1/zoom;
      ctx.stroke();
    });
    ctx.restore();
  }
};

export const drawArrow = (
  ctx: CanvasRenderingContext2D,
  l: { x1: number; y1: number; x2: number; y2: number; stroke?: string; opacity?: number; strokeDashArray?: number[]; strokeWidth?: number },
  themeStroke: string,
  zoom: number,
  isSelected = false
) => {
  ctx.save();
  ctx.globalAlpha = l.opacity ?? 1;
  ctx.strokeStyle = l.stroke || themeStroke;
  ctx.lineWidth = (l.strokeWidth || 2) / zoom;
  ctx.setLineDash(l.strokeDashArray || []);
  ctx.beginPath();
  ctx.moveTo(l.x1, l.y1);
  ctx.lineTo(l.x2, l.y2);
  ctx.stroke();

  const angle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
  const size = 8 / zoom;
  ctx.beginPath();
  ctx.moveTo(l.x2, l.y2);
  ctx.lineTo(l.x2 - size * Math.cos(angle - Math.PI / 6), l.y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(l.x2 - size * Math.cos(angle + Math.PI / 6), l.y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = l.stroke || themeStroke;
  ctx.fill();
  ctx.restore();

  if (isSelected) {
    ctx.save();
    const hs = HANDLE_SIZE / zoom;
    ctx.fillStyle = SELECTION_COLOR;
    [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }].forEach((h) => {
      ctx.beginPath();
      ctx.rect(h.x - hs / 2, h.y - hs / 2, hs, hs);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1/zoom;
      ctx.stroke();
    });
    ctx.restore();
  }
};

export const drawConnector = (
  ctx: CanvasRenderingContext2D,
  fromPt: { x: number; y: number },
  toPt: { x: number; y: number },
  themeStroke: string,
  zoom: number,
  options?: {
    highlight?: boolean;
    fromAnchor?: AnchorSide;
    toAnchor?: AnchorSide;
    fromBounds?: { x: number; y: number; width: number; height: number };
    toBounds?: { x: number; y: number; width: number; height: number };
  }
) => {
  ctx.save();
  const fromDir = options?.fromAnchor ? getAnchorDir(options.fromAnchor) : { x: 0, y: 0 };
  const toDir = options?.toAnchor ? getAnchorDir(options.toAnchor) : { x: 0, y: 0 };

  ctx.strokeStyle = options?.highlight ? SELECTION_COLOR : themeStroke;
  ctx.lineWidth = options?.highlight ? 2.5 / zoom : 2 / zoom;
  ctx.setLineDash(options?.highlight ? [5 / zoom, 5 / zoom] : []);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const offset = 24 / zoom;
  const points: { x: number; y: number }[] = [fromPt];
  const p1 = { x: fromPt.x + fromDir.x * offset, y: fromPt.y + fromDir.y * offset };
  if (fromDir.x !== 0 || fromDir.y !== 0) points.push(p1);
  const p4 = toPt;
  const p3 = { x: toPt.x + toDir.x * offset, y: toPt.y + toDir.y * offset };

  const isInternal = (p: { x: number; y: number }, b?: { x: number; y: number; width: number; height: number }) => {
    if (!b) return false;
    const pad = 2 / zoom;
    return p.x > b.x - pad && p.x < b.x + b.width + pad && p.y > b.y - pad && p.y < b.y + b.height + pad;
  };

  if (fromDir.x !== 0) {
    if (toDir.y !== 0) {
      const elbow = { x: p3.x, y: p1.y };
      points.push(isInternal(elbow, options?.fromBounds) || isInternal(elbow, options?.toBounds) ? { x: p1.x, y: p3.y } : elbow);
    } else {
      const midX = (p1.x + p3.x) / 2;
      points.push({ x: midX, y: p1.y }, { x: midX, y: p3.y });
    }
  } else if (fromDir.y !== 0) {
    if (toDir.x !== 0) {
      const elbow = { x: p1.x, y: p3.y };
      points.push(isInternal(elbow, options?.fromBounds) || isInternal(elbow, options?.toBounds) ? { x: p3.x, y: p1.y } : elbow);
    } else {
      const midY = (p1.y + p3.y) / 2;
      points.push({ x: p1.x, y: midY }, { x: p3.x, y: midY });
    }
  } else {
    points.push({ x: fromPt.x, y: toPt.y });
  }

  if (toDir.x !== 0 || toDir.y !== 0) points.push(p3);
  points.push(p4);

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    ctx.arcTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, 10 / zoom);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();

  // Arrowhead
  const lastP = points[points.length - 1];
  const prevP = points[points.length - 2] || points[0];
  const ang = Math.atan2(lastP.y - prevP.y, lastP.x - prevP.x);
  const size = 10 / zoom;
  ctx.save();
  ctx.translate(lastP.x, lastP.y);
  ctx.rotate(ang);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.5);
  ctx.lineTo(-size, size * 0.5);
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
  ctx.restore();
  ctx.restore();
};

export const drawPath = (
  ctx: CanvasRenderingContext2D,
  p: { points: { x: number; y: number }[]; stroke?: string; opacity?: number; strokeDashArray?: number[]; strokeWidth?: number },
  themeStroke: string,
  zoom: number,
  alpha = 0.8
) => {
  if (p.points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = (p.opacity ?? 1) * alpha;
  ctx.strokeStyle = p.stroke || themeStroke;
  ctx.lineWidth = (p.strokeWidth || 2) / zoom;
  ctx.setLineDash(p.strokeDashArray || []);
  ctx.beginPath();
  ctx.moveTo(p.points[0].x, p.points[0].y);
  p.points.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.stroke();
  ctx.restore();
};
