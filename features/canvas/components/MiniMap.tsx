import React, { useRef, useEffect, useMemo } from "react";
import {
  RectShape,
  CircleShape,
  LineShape,
  PathShape,
  ImageShape,
  TextShape,
  FrameShape,
  PolyShape,
  FigureShape,
  CodeShape,
  ShapeCollection,
  ArrowShape,
} from "../types";
import { getContentBounds } from "../utils/geometry";

interface MiniMapProps {
  rectangles: RectShape[];
  circles: CircleShape[];
  lines: LineShape[];
  arrows: ArrowShape[];
  paths: PathShape[];
  images: ImageShape[];
  texts: TextShape[];
  frames: FrameShape[];
  polygons: PolyShape[];
  figures: FigureShape[];
  codes: CodeShape[];
  pan: { x: number; y: number };
  zoom: number;
  containerWidth: number;
  containerHeight: number;
  onPanChange: (newPan: { x: number; y: number }) => void;
  theme: "light" | "dark";
  mapWidth?: number;
  mapHeight?: number;
}

const MiniMap: React.FC<MiniMapProps> = ({
  rectangles,
  circles,
  lines,
  arrows,
  paths,
  images,
  texts,
  frames,
  polygons,
  figures,
  codes,
  pan,
  zoom,
  containerWidth,
  containerHeight,
  onPanChange,
  theme,
  mapWidth = 240,
  mapHeight = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate content bounds
  const shapes: ShapeCollection = useMemo(
    () => ({
      rectangles,
      circles,
      lines,
      arrows,
      paths,
      images,
      texts,
      frames,
      polygons,
      figures,
      codes,
    }),
    [
      rectangles,
      circles,
      lines,
      arrows,
      paths,
      images,
      texts,
      frames,
      polygons,
      figures,
      codes,
    ]
  );

  const bounds = useMemo(() => {
    const b = getContentBounds(shapes);
    // Even if no shapes, provide a default view
    const minPadding = 1000;
    if (!b)
      return {
        minX: -minPadding,
        maxX: minPadding,
        minY: -minPadding,
        maxY: minPadding,
        width: minPadding * 2,
        height: minPadding * 2,
      };

    // Add some padding to the bounds to ensure elements aren't right at the edge
    const padding = Math.max(minPadding, (b.maxX - b.minX) * 0.2);
    return {
      minX: b.minX - padding,
      maxX: b.maxX + padding,
      minY: b.minY - padding,
      maxY: b.maxY + padding,
      width: b.maxX - b.minX + padding * 2,
      height: b.maxY - b.minY + padding * 2,
    };
  }, [shapes]);

  // Viewport bounds in canvas space
  const viewport = useMemo(
    () => ({
      x: -pan.x / zoom,
      y: -pan.y / zoom,
      width: (containerWidth || 1) / zoom,
      height: (containerHeight || 1) / zoom,
    }),
    [pan, zoom, containerWidth, containerHeight]
  );

  // Scale everything to fit mapWidth/mapHeight
  const mapScale = useMemo(() => {
    if (!bounds) return 0.01;
    const sX = mapWidth / bounds.width;
    const sY = mapHeight / bounds.height;
    return Math.min(sX, sY);
  }, [bounds, mapWidth, mapHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use DPR for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = mapWidth * dpr;
    canvas.height = mapHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, mapWidth, mapHeight);

    if (!bounds) return;

    // Background color for map area
    ctx.fillStyle = theme === "dark" ? "#1a1a1a" : "#fafafa";
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    // Helpers for coordinate mapping
    const toMapX = (x: number) => (x - bounds.minX) * mapScale;
    const toMapY = (y: number) => (y - bounds.minY) * mapScale;

    // Draw all shapes with simplified visuals
    ctx.fillStyle =
      theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

    const drawBox = (x: number, y: number, w: number, h: number) => {
      ctx.fillRect(toMapX(x), toMapY(y), w * mapScale, h * mapScale);
    };

    rectangles.forEach((r) => drawBox(r.x, r.y, r.width, r.height));
    images.forEach((r) => drawBox(r.x, r.y, r.width, r.height));
    texts.forEach((r) => drawBox(r.x, r.y, r.width, r.height));
    frames.forEach((r) => drawBox(r.x, r.y, r.width, r.height));
    polygons.forEach((r) => drawBox(r.x, r.y, r.width ?? 0, r.height ?? 0));
    figures.forEach((r) => drawBox(r.x, r.y, r.width, r.height));
    codes.forEach((r) => drawBox(r.x, r.y, r.width, r.height));

    circles.forEach((c) => {
      ctx.beginPath();
      ctx.arc(toMapX(c.x), toMapY(c.y), c.rx * mapScale, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle =
      theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(toMapX(l.x1), toMapY(l.y1));
      ctx.lineTo(toMapX(l.x2), toMapY(l.y2));
      ctx.stroke();
    });
    arrows.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(toMapX(l.x1), toMapY(l.y1));
      ctx.lineTo(toMapX(l.x2), toMapY(l.y2));
      ctx.stroke();
    });

    // Draw viewport rectangle
    ctx.strokeStyle = "#4f46e5"; // Indigo-600
    ctx.lineWidth = 1;
    const vX = toMapX(viewport.x);
    const vY = toMapY(viewport.y);
    const vW = viewport.width * mapScale;
    const vH = viewport.height * mapScale;

    ctx.strokeRect(vX, vY, vW, vH);
    ctx.fillStyle = "rgba(79, 70, 229, 0.08)";
    ctx.fillRect(vX, vY, vW, vH);
  }, [
    bounds,
    mapScale,
    mapWidth,
    mapHeight,
    theme,
    viewport,
    rectangles,
    images,
    texts,
    frames,
    polygons,
    figures,
    codes,
    circles,
    lines,
    arrows,
  ]);

  const handlePointer = (e: React.PointerEvent) => {
    if (!bounds || !canvasRef.current || !containerWidth || !containerHeight)
      return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert map click to canvas world coordinates (centered)
    const canvasX = x / mapScale + bounds.minX;
    const canvasY = y / mapScale + bounds.minY;

    // Calculate new pan to center the viewport on this point
    const newPanX = containerWidth / 2 - canvasX * zoom;
    const newPanY = containerHeight / 2 - canvasY * zoom;

    onPanChange({ x: newPanX, y: newPanY });
  };

  return (
    <div
      onPointerDown={(e) => {
        e.stopPropagation();
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) {
          handlePointer(e);
        }
      }}
      onWheel={(e) => e.stopPropagation()}
      className="relative cursor-crosshair overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: mapWidth, height: mapHeight }}
      />
    </div>
  );
};

export { MiniMap };
export default MiniMap;
