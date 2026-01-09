import { AnchorSide, CircleShape, RectShape, ImageShape, TextShape, FrameShape, PolyShape, LineShape, ArrowShape, PathShape, ConnectorAnchor, FigureShape, CodeShape } from "../types";

export const getAnchorDir = (anchor?: AnchorSide | "none") => {
  if (anchor === "top") return { x: 0, y: -1 };
  if (anchor === "bottom") return { x: 0, y: 1 };
  if (anchor === "left") return { x: -1, y: 0 };
  if (anchor === "right") return { x: 1, y: 0 };
  return { x: 0, y: 0 };
};

export const getConnectorPoints = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  fromAnchor?: AnchorSide | "none",
  toAnchor?: AnchorSide | "none",
  fromBounds?: { x: number; y: number; width: number; height: number },
  toBounds?: { x: number; y: number; width: number; height: number },
  zoom: number = 1
) => {
  const fromDir = getAnchorDir(fromAnchor);
  const toDir = getAnchorDir(toAnchor);
  const offset = 24 / zoom;
  
  const p0 = from;
  const p1 = { x: from.x + fromDir.x * offset, y: from.y + fromDir.y * offset };
  const p4 = to;
  const p3 = { x: to.x + toDir.x * offset, y: to.y + toDir.y * offset };

  const isInternal = (p: { x: number; y: number }, b?: { x: number; y: number; width: number; height: number }) => {
    if (!b) return false;
    const pad = 2 / zoom;
    return p.x > b.x - pad && p.x < b.x + b.width + pad && p.y > b.y - pad && p.y < b.y + b.height + pad;
  };

  const isBlocked = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    const check = (box?: { x: number; y: number; width: number; height: number }) => {
      if (!box) return false;
      const pad = 4 / zoom; // Slightly larger padding for better clearance
      const bx1 = box.x - pad;
      const by1 = box.y - pad;
      const bx2 = box.x + box.width + pad;
      const by2 = box.y + box.height + pad;

      if (a.x === b.x) { // Vertical segment
        if (a.x > bx1 && a.x < bx2) {
          return minY < by2 && maxY > by1;
        }
      } else { // Horizontal segment
        if (a.y > by1 && a.y < by2) {
          return minX < bx2 && maxX > bx1;
        }
      }
      return false;
    };

    return check(fromBounds) || check(toBounds);
  };

  const pMid = { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
  
  // Try different paths between p1 and p3
  const candidates: { x: number; y: number }[][] = [];

  // 0. Straight line (if possible)
  if (Math.abs(p1.x - p3.x) < 0.5 || Math.abs(p1.y - p3.y) < 0.5) {
     candidates.push([]);
  }

  // 1. L-Shapes (1 elbow)
  candidates.push([{ x: p3.x, y: p1.y }]);
  candidates.push([{ x: p1.x, y: p3.y }]);

  // 2. Z-Shapes (2 elbows, balanced)
  candidates.push([{ x: pMid.x, y: p1.y }, { x: pMid.x, y: p3.y }]);
  candidates.push([{ x: p1.x, y: pMid.y }, { x: p3.x, y: pMid.y }]);

  // Extra Z-Shapes (using gap midpoints if boxes are provided)
  if (fromBounds && toBounds) {
    const b1 = fromBounds; const b2 = toBounds;
    // Horizontal gap
    if (b1.x + b1.width < b2.x || b2.x + b2.width < b1.x) {
       const gapMidX = b1.x + b1.width < b2.x ? (b1.x + b1.width + b2.x) / 2 : (b2.x + b2.width + b1.x) / 2;
       candidates.push([{ x: gapMidX, y: p1.y }, { x: gapMidX, y: p3.y }]);
    }
    // Vertical gap
    if (b1.y + b1.height < b2.y || b2.y + b2.height < b1.y) {
       const gapMidY = b1.y + b1.height < b2.y ? (b1.y + b1.height + b2.y) / 2 : (b2.y + b2.height + b1.y) / 2;
       candidates.push([{ x: p1.x, y: gapMidY }, { x: p3.x, y: gapMidY }]);
    }
  }

  // 3. Around-Shapes (Go around the bounding box of both)
  if (fromBounds && toBounds) {
    const margin = 40 / zoom;
    const b1 = fromBounds;
    const b2 = toBounds;
    const minX = Math.min(b1.x, b2.x) - margin;
    const maxX = Math.max(b1.x + b1.width, b2.x + b2.width) + margin;
    const minY = Math.min(b1.y, b2.y) - margin;
    const maxY = Math.max(b1.y + b1.height, b2.y + b2.height) + margin;

    candidates.push([{ x: maxX, y: p1.y }, { x: maxX, y: p3.y }]);
    candidates.push([{ x: minX, y: p1.y }, { x: minX, y: p3.y }]);
    candidates.push([{ x: p1.x, y: maxY }, { x: p3.x, y: maxY }]);
    candidates.push([{ x: p1.x, y: minY }, { x: p3.x, y: minY }]);
  }

  let bestPath: { x: number; y: number }[] | null = null;
  let bestScore = Infinity;

  const getScore = (cand: { x: number; y: number }[]) => {
    const fullPath = [p1, ...cand, p3];
    let blocked = false;
    let length = 0;
    let turns = 0;
    
    for (let i = 0; i < fullPath.length - 1; i++) {
      const segLen = Math.hypot(fullPath[i+1].x - fullPath[i].x, fullPath[i+1].y - fullPath[i].y);
      if (segLen > 0.5) {
        if (isBlocked(fullPath[i], fullPath[i+1])) {
          blocked = true;
          break;
        }
        length += segLen;
        if (i > 0) turns++;
      }
    }

    if (blocked) return Infinity;

    // High penalty for turns, even higher for L-shapes if Z is possible? 
    // Actually just a solid turn penalty is enough.
    let score = length + turns * 300; 
    
    // Penalize narrow gaps / short segments unless they are start/end
    for (let i = 1; i < fullPath.length - 1; i++) {
        const d = Math.hypot(fullPath[i+1].x - fullPath[i].x, fullPath[i+1].y - fullPath[i].y);
        if (d < 20 / zoom) score += 1000;
    }

    return score;
  };

  for (const cand of candidates) {
    const score = getScore(cand);
    if (score < bestScore) {
      bestScore = score;
      bestPath = cand;
    }
  }

  const pts: { x: number; y: number }[] = [p0];
  if (fromDir.x !== 0 || fromDir.y !== 0) pts.push(p1);

  if (bestPath) {
    pts.push(...bestPath);
  } else {
    // Ultimate fallback: simple Z-path
    pts.push({ x: pMid.x, y: p1.y }, { x: pMid.x, y: p3.y });
  }

  if (toDir.x !== 0 || toDir.y !== 0) pts.push(p3);
  pts.push(p4);

  // Eliminate redundant points
  const finalPts: { x: number; y: number }[] = [];
  for (const pt of pts) {
    if (finalPts.length === 0 || Math.hypot(pt.x - finalPts[finalPts.length - 1].x, pt.y - finalPts[finalPts.length - 1].y) > 0.5) {
      finalPts.push(pt);
    }
  }

  return finalPts;
};

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

export const distToPolyline = (px: number, py: number, points: { x: number; y: number }[]) => {
  let minDist = Infinity;
  for (let i = 1; i < points.length; i++) {
    minDist = Math.min(minDist, distToSegment(px, py, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y));
  }
  return minDist;
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
  figures?: FigureShape[];
  codes?: CodeShape[];
}

interface AnchorInfo {
  kind: string;
  shapeId: string;
  anchor: AnchorSide | "none";
  percent?: number;
}

export const getAnchorPoint = (anchor: AnchorInfo & { point?: { x: number; y: number } }, shapes: ShapeCollection) => {
  if (anchor.kind === "point" && anchor.point) return anchor.point;
  
  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [], figures = [], codes = [] } = shapes;
  if (anchor.kind === "rect") {
    const r = rectangles.find((i) => i.id === anchor.shapeId);
    return r ? getRectAnchor(r, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "circle") {
    const c = circles.find((i) => i.id === anchor.shapeId);
    return c ? getCircleAnchor(c, anchor.anchor as AnchorSide) : null;
  }
  if (anchor.kind === "image") {
    const im = images.find((i) => i.id === anchor.shapeId);
    return im ? getRectAnchor(im, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "text") {
    const t = texts.find((i) => i.id === anchor.shapeId);
    return t ? getRectAnchor(t, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "frame") {
    const f = frames.find((i) => i.id === anchor.shapeId);
    return f ? getRectAnchor(f, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "poly") {
    const p = polygons.find((i) => i.id === anchor.shapeId);
    return p ? getRectAnchor(p, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "figure") {
    const f = figures.find((i) => i.id === anchor.shapeId);
    return f ? getRectAnchor(f, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  if (anchor.kind === "code") {
    const c = codes.find((i) => i.id === anchor.shapeId);
    return c ? getRectAnchor(c, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  return null;
};

export const getShapeBounds = (anchor: { kind: string; shapeId: string }, shapes: ShapeCollection) => {
  if (anchor.kind === "point") return null;

  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [], figures = [], codes = [] } = shapes;
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
