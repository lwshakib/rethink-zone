import { AnchorSide, CircleShape, RectShape, ImageShape, TextShape, FrameShape, PolyShape, LineShape, ArrowShape, PathShape } from "../types";

export const distToSegment = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
};

export const getRectAnchor = (
  rect: { x: number; y: number; width: number; height: number },
  anchor: AnchorSide,
  percent = 0.5
) => {
  if (anchor === "top") return { x: rect.x + rect.width * percent, y: rect.y };
  if (anchor === "bottom")
    return { x: rect.x + rect.width * percent, y: rect.y + rect.height };
  if (anchor === "left") return { x: rect.x, y: rect.y + rect.height * percent };
  return { x: rect.x + rect.width, y: rect.y + rect.height * percent };
};

export const getCircleAnchor = (circle: CircleShape, anchor: AnchorSide) => {
  if (anchor === "top") return { x: circle.x, y: circle.y - circle.ry };
  if (anchor === "bottom") return { x: circle.x, y: circle.y + circle.ry };
  if (anchor === "left") return { x: circle.x - circle.rx, y: circle.y };
  return { x: circle.x + circle.rx, y: circle.y };
};

interface ShapeCollection {
  rectangles?: RectShape[];
  circles?: CircleShape[];
  images?: ImageShape[];
  texts?: TextShape[];
  frames?: FrameShape[];
  polygons?: PolyShape[];
  lines?: LineShape[];
  arrows?: ArrowShape[];
  paths?: PathShape[];
}

interface AnchorInfo {
  kind: string;
  shapeId: string;
  anchor: AnchorSide;
  percent?: number;
}

export const getAnchorPoint = (anchor: AnchorInfo, shapes: ShapeCollection) => {
  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [] } = shapes;
  if (anchor.kind === "rect") {
    const r = rectangles.find((i) => i.id === anchor.shapeId);
    return r ? getRectAnchor(r, anchor.anchor, anchor.percent) : null;
  }
  if (anchor.kind === "circle") {
    const c = circles.find((i) => i.id === anchor.shapeId);
    return c ? getCircleAnchor(c, anchor.anchor) : null;
  }
  if (anchor.kind === "image") {
    const im = images.find((i) => i.id === anchor.shapeId);
    return im ? getRectAnchor(im, anchor.anchor, anchor.percent) : null;
  }
  if (anchor.kind === "text") {
    const t = texts.find((i) => i.id === anchor.shapeId);
    return t ? getRectAnchor(t, anchor.anchor, anchor.percent) : null;
  }
  if (anchor.kind === "frame") {
    const f = frames.find((i) => i.id === anchor.shapeId);
    return f ? getRectAnchor(f, anchor.anchor, anchor.percent) : null;
  }
  if (anchor.kind === "poly") {
    const p = polygons.find((i) => i.id === anchor.shapeId);
    return p ? getRectAnchor(p, anchor.anchor, anchor.percent) : null;
  }
  return null;
};

export const getShapeBounds = (anchor: { kind: string; shapeId: string }, shapes: ShapeCollection) => {
  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [] } = shapes;
  type HasBounds = { id: string; x: number; y: number; width: number; height: number };
  let s: HasBounds | undefined;
  if (anchor.kind === "rect") s = rectangles.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "circle") {
    const c = circles.find((i) => i.id === anchor.shapeId);
    return c ? { x: c.x - c.rx, y: c.y - c.ry, width: c.rx * 2, height: c.ry * 2 } : null;
  }
  else if (anchor.kind === "image") s = images.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "text") s = texts.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "frame") s = frames.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "poly") s = polygons.find((i) => i.id === anchor.shapeId);

  return s ? { x: s.x, y: s.y, width: s.width, height: s.height } : null;
};

export const getContentBounds = (shapes: ShapeCollection) => {
  const { rectangles = [], circles = [], lines = [], arrows = [], paths = [], images = [], texts = [], frames = [], polygons = [] } = shapes;
  const xs: number[] = [];
  const ys: number[] = [];

  rectangles.forEach((r) => { xs.push(r.x, r.x + r.width); ys.push(r.y, r.y + r.height); });
  circles.forEach((c) => { xs.push(c.x - c.rx, c.x + c.rx); ys.push(c.y - c.ry, c.y + c.ry); });
  lines.forEach((l) => { xs.push(l.x1, l.x2); ys.push(l.y1, l.y2); });
  arrows.forEach((a) => { xs.push(a.x1, a.x2); ys.push(a.y1, a.y2); });
  paths.forEach((p) => p.points.forEach((pt) => { xs.push(pt.x); ys.push(pt.y); }));
  images.forEach((im) => { xs.push(im.x, im.x + im.width); ys.push(im.y, im.y + im.height); });
  texts.forEach((t) => { xs.push(t.x, t.x + t.width); ys.push(t.y, t.y + t.height); });
  frames.forEach((f) => { xs.push(f.x, f.x + f.width); ys.push(f.y, f.y + f.height); });
  polygons.forEach((p) => { xs.push(p.x, p.x + (p.width ?? 0)); ys.push(p.y, p.y + (p.height ?? 0)); });

  if (!xs.length || !ys.length) return null;
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
};
