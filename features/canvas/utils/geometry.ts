import { AnchorSide, CircleShape, RectShape, ImageShape, TextShape, FrameShape, PolyShape, LineShape, ArrowShape, PathShape, ConnectorAnchor, FigureShape, CodeShape } from "../types"; // Import all shape types for consistent geometry math

/**
 * Translates an AnchorSide enum into a 2D unit vector representing the exit/entry direction.
 * @param anchor - 'top', 'bottom', 'left', 'right', or 'none'.
 * @returns {x, y} unit vector.
 */
export const getAnchorDir = (anchor?: AnchorSide | "none") => {
  if (anchor === "top") return { x: 0, y: -1 }; // Upwards
  if (anchor === "bottom") return { x: 0, y: 1 }; // Downwards
  if (anchor === "left") return { x: -1, y: 0 }; // Leftwards
  if (anchor === "right") return { x: 1, y: 0 }; // Rightwards
  return { x: 0, y: 0 }; // No specific direction
};

/**
 * Calculates a multi-point orthogonal path for a connector between two shapes.
 * It uses a simplified A* or heuristic-based routing to avoid overlapping the connected shapes.
 */
export const getConnectorPoints = (
  from: { x: number; y: number }, // Starting point
  to: { x: number; y: number }, // Ending point
  fromAnchor?: AnchorSide | "none", // Exit side
  toAnchor?: AnchorSide | "none", // Entrance side
  fromBounds?: { x: number; y: number; width: number; height: number }, // Bounding box of the source shape
  toBounds?: { x: number; y: number; width: number; height: number }, // Bounding box of the target shape
  zoom: number = 1 // Current zoom level for pixel-perfect offsets
) => {
  const fromDir = getAnchorDir(fromAnchor);
  const toDir = getAnchorDir(toAnchor);
  
  // Define initial protrusion distance from the shape boundary
  const offset = 24 / zoom;
  
  const p0 = from; // start
  // p1 is the point slightly outside the source shape
  const p1 = { x: from.x + fromDir.x * offset, y: from.y + fromDir.y * offset };
  
  const p4 = to; // end
  // p3 is the point slightly outside the target shape
  const p3 = { x: to.x + toDir.x * offset, y: to.y + toDir.y * offset };

  /**
   * Internal helper to check if a point is inside a shape's bounding box.
   */
  const isInternal = (p: { x: number; y: number }, b?: { x: number; y: number; width: number; height: number }) => {
    if (!b) return false;
    const pad = 2 / zoom; // Small tolerance
    return p.x > b.x - pad && p.x < b.x + b.width + pad && p.y > b.y - pad && p.y < b.y + b.height + pad;
  };

  /**
   * Checks if a line segment between points 'a' and 'b' intersects either the source or destination shape.
   */
  const isBlocked = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const check = (box?: { x: number; y: number; width: number; height: number }) => {
      if (!box) return false;
      const epsilon = 1 / zoom;
      const bx1 = box.x + epsilon;
      const by1 = box.y + epsilon;
      const bx2 = box.x + box.width - epsilon;
      const by2 = box.y + box.height - epsilon;

      const minX = Math.min(a.x, b.x);
      const maxX = Math.max(a.x, b.x);
      const minY = Math.min(a.y, b.y);
      const maxY = Math.max(a.y, b.y);

      // Simple intersection logic for horizontal/vertical segments
      if (Math.abs(a.x - b.x) < 0.1) { // Vertical segment
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

  // Center-point between the two padded exit/entry points
  const pMid = { x: (p1.x + p3.x) / 2, y: (p1.y + p3.y) / 2 };
  
  // List of potential routing paths to be scored
  const candidates: { x: number; y: number }[][] = [];

  // 0. Straight line (if points are naturally aligned)
  if (Math.abs(p1.x - p3.x) < 0.5 || Math.abs(p1.y - p3.y) < 0.5) {
     candidates.push([]);
  }

  // 1. L-Shapes: 1 elbow joint
  candidates.push([{ x: p3.x, y: p1.y }]);
  candidates.push([{ x: p1.x, y: p3.y }]);

  // 2. Z-Shapes: 2 elbow joints, centered between shapes
  const z1 = [{ x: pMid.x, y: p1.y }, { x: pMid.x, y: p3.y }];
  const z2 = [{ x: p1.x, y: pMid.y }, { x: p3.x, y: pMid.y }];
  candidates.push(z1, z2);

  // 3. Gap-Midpoint Z-Shapes: Routing through the exact middle of the gap between shapes
  if (fromBounds && toBounds) {
    const b1 = fromBounds; const b2 = toBounds;
    // Horizontal gap checking
    if (b1.x + b1.width < b2.x || b2.x + b2.width < b1.x) {
       const gapMidX = b1.x + b1.width < b2.x ? (b1.x + b1.width + b2.x) / 2 : (b2.x + b2.width + b1.x) / 2;
       candidates.push([{ x: gapMidX, y: p1.y }, { x: gapMidX, y: p3.y }]);
    }
    // Vertical gap checking
    if (b1.y + b1.height < b2.y || b2.y + b2.height < b1.y) {
       const gapMidY = b1.y + b1.height < b2.y ? (b1.y + b1.height + b2.y) / 2 : (b2.y + b2.height + b1.y) / 2;
       candidates.push([{ x: p1.x, y: gapMidY }, { x: p3.x, y: gapMidY }]);
    }
  }

  // 4. Around-Shapes: Routes that intentionally circle around both bounding boxes
  if (fromBounds && toBounds) {
    const margin = 40 / zoom;
    const b1 = fromBounds; const b2 = toBounds;
    const minX = Math.min(b1.x, b2.x) - margin;
    const maxX = Math.max(b1.x + b1.width, b2.x + b2.width) + margin;
    const minY = Math.min(b1.y, b2.y) - margin;
    const maxY = Math.max(b1.y + b1.height, b2.y + b2.height) + margin;

    candidates.push([{ x: maxX, y: p1.y }, { x: maxX, y: p3.y }]); // Around Right
    candidates.push([{ x: minX, y: p1.y }, { x: minX, y: p3.y }]); // Around Left
    candidates.push([{ x: p1.x, y: maxY }, { x: p3.x, y: maxY }]); // Around Bottom
    candidates.push([{ x: p1.x, y: minY }, { x: p3.x, y: minY }]); // Around Top
  }

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

  /**
   * Evaluates the "cost" of a candidate path based on length, turns, and collisions.
   */
  const getScore = (cand: { x: number; y: number }[]) => {
    // Construct the full sequence of points including start and end protrusions
    const fullPath: { x: number; y: number }[] = [p0];
    if (fromDir.x !== 0 || fromDir.y !== 0) fullPath.push(p1);
    fullPath.push(...cand);
    if (toDir.x !== 0 || toDir.y !== 0) fullPath.push(p3);
    fullPath.push(p4);

    let blocked = false;
    let length = 0;
    let turns = 0;
    let prevDir = { x: 0, y: 0 };
    
    for (let i = 0; i < fullPath.length - 1; i++) {
      const dx = fullPath[i+1].x - fullPath[i].x;
      const dy = fullPath[i+1].y - fullPath[i].y;
      const segLen = Math.hypot(dx, dy);
      
      if (segLen > 0.5) {
        // Discard the entire path if any segment passes through a shape
        if (isBlocked(fullPath[i], fullPath[i+1])) {
          blocked = true;
          break;
        }
        length += segLen;
        
        // Determine the current step direction for turn detection
        const dir = { 
          x: Math.abs(dx) > 0.1 ? Math.sign(dx) : 0, 
          y: Math.abs(dy) > 0.1 ? Math.sign(dy) : 0 
        };
        
        // If the direction changed from the previous segment, increment turn count
        if (prevDir.x !== 0 || prevDir.y !== 0) {
          if (dir.x !== prevDir.x || dir.y !== prevDir.y) turns++;
        }
        prevDir = dir;
      }
    }

    if (blocked) return Infinity; // Hard failure for collisions

    // SCORING HEURISTICS:
    // 1. Base Score: Length + significant penalty for each turn (prefer straight line)
    let score = length + turns * 200; 

    // 2. Center Bonus: Reward Z-shapes that are equidistantly split between shapes
    const isCentered = cand === z1 || cand === z2;
    if (isCentered) score -= 100;

    // 3. Symmetry Bonus: Reward segments that look balanced even if not perfectly centered
    if (cand.length === 2) {
      const d1 = Math.hypot(cand[0].x - p1.x, cand[0].y - p1.y);
      const d2 = Math.hypot(cand[1].x - p3.x, cand[1].y - p3.y);
      score += Math.abs(d1 - d2) * 0.2;
    }

    // 4. L-Shape Penalty: Prefer Z-shapes (3 segments) over L-shapes (2 segments) for better "connector" look
    if (cand.length === 1) score += 150;

    // 5. Short segment penalty: avoid visually busy tiny bends
    for (let i = 0; i < fullPath.length - 1; i++) {
        const d = Math.hypot(fullPath[i+1].x - fullPath[i].x, fullPath[i+1].y - fullPath[i].y);
        if (d < 15 / zoom) score += 500;
    }

    return score;
  };

  // Iterate through all candidates and find the one with the lowest heuristic score
  for (const cand of candidates) {
    const score = getScore(cand);
    if (score < bestScore) {
      bestScore = score;
      bestPath = cand;
    }
  }

  // Build the final point array
  const pts: { x: number; y: number }[] = [p0];
  if (fromDir.x !== 0 || fromDir.y !== 0) pts.push(p1);

  if (bestPath) {
    pts.push(...bestPath);
  } else {
    // Ultimate fallback: Use a centered vertical-first Z-path if no valid path was found
    pts.push(...z1);
  }

  if (toDir.x !== 0 || toDir.y !== 0) pts.push(p3);
  pts.push(p4);

  // Post-processing: remove identical consecutive points to prevent render artifacts
  const finalPts: { x: number; y: number }[] = [];
  for (const pt of pts) {
    if (finalPts.length === 0 || Math.hypot(pt.x - finalPts[finalPts.length - 1].x, pt.y - finalPts[finalPts.length - 1].y) > 0.5) {
      finalPts.push(pt);
    }
  }

  return finalPts;
};

/**
 * Calculates the shortest distance from a point (px, py) to a line segment (x1, y1) -> (x2, y2).
 */
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
  // Find projection t of point onto the line
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
};

/**
 * Calculates the shortest distance from a point to a path consisting of multiple segments.
 */
export const distToPolyline = (px: number, py: number, points: { x: number; y: number }[]) => {
  let minDist = Infinity;
  for (let i = 1; i < points.length; i++) {
    minDist = Math.min(minDist, distToSegment(px, py, points[i - 1].x, points[i - 1].y, points[i].x, points[i].y));
  }
  return minDist;
};

/**
 * Calculates the specific pixel coordinate of an anchor point on a rectangular shape.
 * @param percent - Decimal value [0, 1] determining the position along the edge (0.5 = center).
 */
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

/**
 * Calculates the specific pixel coordinate of an anchor point on a circular shape (quadrants).
 */
export const getCircleAnchor = (circle: CircleShape, anchor: AnchorSide) => {
  if (anchor === "top") return { x: circle.x, y: circle.y - circle.ry };
  if (anchor === "bottom") return { x: circle.x, y: circle.y + circle.ry };
  if (anchor === "left") return { x: circle.x - circle.rx, y: circle.y };
  return { x: circle.x + circle.rx, y: circle.y };
};

// Internal interface for grouping all active canvas shapes for global operations
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

/**
 * Metadata about an anchor point relative to a specific shape.
 */
interface AnchorInfo {
  kind: string; // The type of shape (e.g., 'rect', 'circle')
  shapeId: string; // Unique ID of the parent shape
  anchor: AnchorSide | "none"; // Which edge or specific point
  percent?: number; // Offset along the edge [0..1]
}

/**
 * Resolves an anchor/connector definition into concrete {x, y} world coordinates.
 * Consults the current shape library to find the exact position of the shape's boundaries.
 * 
 * @param anchor - Unified anchor object, containing either a direct point or a shape reference.
 * @param shapes - The global state of all shapes on the canvas.
 */
export const getAnchorPoint = (anchor: AnchorInfo & { point?: { x: number; y: number } }, shapes: ShapeCollection) => {
  // Direct point definition (used during dragging or for unattached connectors)
  if (anchor.kind === "point" && anchor.point) return anchor.point;
  
  // Destructure with defaults to ensure safe access
  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [], figures = [], codes = [] } = shapes;
  
  // Logic branch for Rectangular based shapes
  if (anchor.kind === "rect") {
    const r = rectangles.find((i) => i.id === anchor.shapeId);
    return r ? getRectAnchor(r, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Logic branch for Circle/Ellipse shapes
  if (anchor.kind === "circle") {
    const c = circles.find((i) => i.id === anchor.shapeId);
    return c ? getCircleAnchor(c, anchor.anchor as AnchorSide) : null;
  }
  // Image assets
  if (anchor.kind === "image") {
    const im = images.find((i) => i.id === anchor.shapeId);
    return im ? getRectAnchor(im, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Text blocks
  if (anchor.kind === "text") {
    const t = texts.find((i) => i.id === anchor.shapeId);
    return t ? getRectAnchor(t, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Group frames
  if (anchor.kind === "frame") {
    const f = frames.find((i) => i.id === anchor.shapeId);
    return f ? getRectAnchor(f, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Dynamic polygons (Triangles, Diamonds, etc.)
  if (anchor.kind === "poly") {
    const p = polygons.find((i) => i.id === anchor.shapeId);
    return p ? getRectAnchor(p, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Figure primitives
  if (anchor.kind === "figure") {
    const f = figures.find((i) => i.id === anchor.shapeId);
    return f ? getRectAnchor(f, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  // Code block wrappers
  if (anchor.kind === "code") {
    const c = codes.find((i) => i.id === anchor.shapeId);
    return c ? getRectAnchor(c, anchor.anchor as AnchorSide, anchor.percent) : null;
  }
  return null; // Anchor could not be resolved (shape was likely deleted)
};

/**
 * Retrieves the bounding box of a specific shape identified by kind and ID.
 * Useful for collision detection and routing logic.
 */
export const getShapeBounds = (anchor: { kind: string; shapeId: string }, shapes: ShapeCollection) => {
  if (anchor.kind === "point") return null;

  const { rectangles = [], circles = [], images = [], texts = [], frames = [], polygons = [], figures = [], codes = [] } = shapes;
  type HasBounds = { id: string; x: number; y: number; width: number; height: number };
  let s: HasBounds | undefined;

  // Search through categorized collections for the matching ID
  if (anchor.kind === "rect") s = rectangles.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "circle") {
    const c = circles.find((i) => i.id === anchor.shapeId);
    // Convert circle {x, y, rx, ry} to box {x, y, width, height}
    return c ? { x: c.x - c.rx, y: c.y - c.ry, width: c.rx * 2, height: c.ry * 2 } : null;
  }
  else if (anchor.kind === "image") s = images.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "text") s = texts.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "frame") s = frames.find((i) => i.id === anchor.shapeId);
  else if (anchor.kind === "poly") s = polygons.find((i) => i.id === anchor.shapeId);

  return s ? { x: s.x, y: s.y, width: s.width, height: s.height } : null;
};

/**
 * Iterates through all shapes in the collection to calculate the collective bounding box.
 * This can be used for "Zoom to Fit" or scrolling boundary calculations.
 */
export const getContentBounds = (shapes: ShapeCollection) => {
  const { rectangles = [], circles = [], lines = [], arrows = [], paths = [], images = [], texts = [], frames = [], polygons = [] } = shapes;
  
  // Accumulate every corner coordinate from every shape
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

  // Return null if there are no items to measure
  if (!xs.length || !ys.length) return null;
  // Compute min/max for to find out the extremes
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
};
