"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOMServer from "react-dom/server";
import { useTheme } from "next-themes";
import {
  Redo2,
  Undo2,
  MousePointer2,
  Square,
  Circle,
  Hand,
  Minus,
  ArrowRight,
  Type,
  Frame,
  Eraser,
  PenLine,
  Brush,
  ZoomIn,
  ZoomOut,
  Scan,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
  Binary,
  LayoutGrid,
  Shapes,
  Smile,
  Monitor,
  ChevronRight,
  Code,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Maximize,
  Diamond,
  Triangle,
  Cylinder,
  FileText,
  Hexagon,
  Star,
  ChevronLeft,
  Network,
  Activity,
  Airplay,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Anchor,
  Aperture,
  Archive,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  Smile as SmileIcon,
  Cloud,
  Layers,
  Zap,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
} from "lucide-react";

type RectShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
type CircleShape = { id: string; x: number; y: number; rx: number; ry: number };
type LineShape = { id: string; x1: number; y1: number; x2: number; y2: number };
type ArrowShape = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
type PathShape = { id: string; points: { x: number; y: number }[] };
type ImageShape = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};
type TextShape = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  width: number;
  height: number;
};
type FrameShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameNumber: number;
};
type PolyShape = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ShapeKind = "rect" | "circle" | "image" | "text" | "frame" | "poly";
type AnchorSide = "top" | "bottom" | "left" | "right";
type ConnectorAnchor = {
  kind: ShapeKind;
  shapeId: string;
  anchor: AnchorSide;
  percent?: number; // 0 to 1 along that side
};
type Connector = {
  id: string;
  from: ConnectorAnchor;
  to: ConnectorAnchor;
};

type HistoryEntry = {
  rectangles: RectShape[];
  circles: CircleShape[];
  lines: LineShape[];
  arrows: ArrowShape[];
  paths: PathShape[];
  images: ImageShape[];
  texts: TextShape[];
  frames: FrameShape[];
  connectors: Connector[];
  polygons: PolyShape[];
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;
const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

const GENERAL_ICONS = [
  { name: "activity", icon: Activity },
  { name: "airplay", icon: Airplay },
  { name: "alert-circle", icon: AlertCircle },
  { name: "alert-octagon", icon: AlertOctagon },
  { name: "alert-triangle", icon: AlertTriangle },
  { name: "align-center", icon: AlignCenter },
  { name: "align-justify", icon: AlignJustify },
  { name: "align-left", icon: AlignLeft },
  { name: "align-right", icon: AlignRight },
  { name: "anchor", icon: Anchor },
  { name: "aperture", icon: Aperture },
  { name: "archive", icon: Archive },
  { name: "arrow-down", icon: ArrowDown },
  { name: "arrow-down-left", icon: ArrowDownLeft },
  { name: "arrow-down-right", icon: ArrowDownRight },
  { name: "arrow-left", icon: ArrowLeftIcon },
  { name: "arrow-right", icon: ArrowRightIcon },
  { name: "arrow-up", icon: ArrowUp },
  { name: "arrow-up-left", icon: ArrowUpLeft },
  { name: "arrow-up-right", icon: ArrowUpRight },
];

type CanvasData = {
  pan: { x: number; y: number };
  zoom: number;
  snapshot: HistoryEntry;
};

type CanvasAreaProps = {
  initialData?: CanvasData | null;
  onChange?: (data: CanvasData) => void;
};

const CanvasArea = ({ initialData, onChange }: CanvasAreaProps) => {
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState("Hand");
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [plusMenuView, setPlusMenuView] = useState<
    "categories" | "shape" | "icon" | "cloud-icon" | "provider-icons"
  >("categories");
  const [plusMenuSubView, setPlusMenuSubView] = useState<string | null>(null);
  const [allIconsLibrary, setAllIconsLibrary] = useState<string[]>([]);
  const [visibleIconsLimit, setVisibleIconsLimit] = useState(60);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [pendingAddIcon, setPendingAddIcon] = useState<{
    name: string;
    src: string;
  } | null>(null);

  const { resolvedTheme } = useTheme();
  const themeStroke = resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.75)";
  const themeText = resolvedTheme === "dark" ? "white" : "black";
  const themeFrameBg = resolvedTheme === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)";

  useEffect(() => {
    setIsLibraryLoading(true);
    fetch("/icons-library/list.json")
      .then((res) => res.json())
      .then((data) => {
        setAllIconsLibrary(data);
        setIsLibraryLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load icons:", err);
        setIsLibraryLoading(false);
      });
  }, []);

  const filteredLibraryIcons = useMemo(() => {
    if (!plusMenuSubView && plusMenuView !== "provider-icons") return [];

    return allIconsLibrary.filter((path) => {
      const matchLower = path.toLowerCase();
      const matchCategory =
        (plusMenuSubView === "AWS" && matchLower.includes("aws-icons")) ||
        (plusMenuSubView === "Azure" && matchLower.includes("azure-icons")) ||
        (plusMenuSubView === "Google Cloud" && matchLower.includes("gcp-icons")) ||
        (plusMenuSubView === "Kubernetes" && matchLower.includes("kubernetes-icons")) ||
        (plusMenuSubView === "OCI" && matchLower.includes("oci-icons")) ||
        (plusMenuSubView === "Network" && matchLower.includes("networking")) ||
        (plusMenuSubView === "Tech Logo" && matchLower.includes("seti-icons"));

      if (!matchCategory) return false;

      if (iconSearchQuery) {
        const name = path.split("/").pop()?.toLowerCase() || "";
        return name.includes(iconSearchQuery.toLowerCase());
      }

      return true;
    });
  }, [allIconsLibrary, plusMenuSubView, iconSearchQuery, plusMenuView]);

  useEffect(() => {
    // Reset limit when changing view
    setVisibleIconsLimit(60);
  }, [plusMenuView, plusMenuSubView]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isHandPanning, setIsHandPanning] = useState(false);
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const tempPanRef = useRef(false);
  const [cursorStyle, setCursorStyle] = useState<string>("default");
  const [rectangles, setRectangles] = useState<RectShape[]>([]);
  const [circles, setCircles] = useState<CircleShape[]>([]);
  const [lines, setLines] = useState<LineShape[]>([]);
  const [arrows, setArrows] = useState<ArrowShape[]>([]);
  const [paths, setPaths] = useState<PathShape[]>([]);
  const [images, setImages] = useState<ImageShape[]>([]);
  const [texts, setTexts] = useState<TextShape[]>([]);
  const [frames, setFrames] = useState<FrameShape[]>([]);
  const [polygons, setPolygons] = useState<PolyShape[]>([]);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [pendingAddShapeLabel, setPendingAddShapeLabel] = useState<
    string | null
  >(null);
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      rectangles: [],
      circles: [],
      lines: [],
      arrows: [],
      paths: [],
      images: [],
      texts: [],
      frames: [],
      connectors: [],
      polygons: [],
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [currentCircle, setCurrentCircle] = useState<{
    x: number;
    y: number;
    rx: number;
    ry: number;
  } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [currentLine, setCurrentLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [currentArrow, setCurrentArrow] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [currentPath, setCurrentPath] = useState<{
    points: { x: number; y: number }[];
  } | null>(null);
  const [currentFrame, setCurrentFrame] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const rectStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawingRectRef = useRef(false);
  const isDrawingCircleRef = useRef(false);
  const isDrawingLineRef = useRef(false);
  const isDrawingArrowRef = useRef(false);
  const isDrawingPathRef = useRef(false);
  const isDrawingFrameRef = useRef(false);
  const [selectedShape, setSelectedShape] = useState<{
    kind:
    | "rect"
    | "circle"
    | "image"
    | "text"
    | "frame"
    | "connector"
    | "line"
    | "arrow"
    | "poly";
    index: number;
  } | null>(null);
  const dragModeRef = useRef<
    | "none"
    | "move"
    | "resize-br"
    | "resize-rect-h"
    | "resize-rect-v"
    | "resize-circle"
    | "resize-circle-h"
    | "resize-circle-v"
    | "resize-image"
    | "resize-image-h"
    | "resize-image-v"
    | "resize-text"
    | "resize-text-h"
    | "resize-text-v"
    | "resize-frame"
    | "resize-frame-h"
    | "resize-frame-v"
    | "resize-line"
    | "resize-arrow"
  >("none");
  const dragRectStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dragCircleStartRef = useRef<{
    x: number;
    y: number;
    rx: number;
    ry: number;
  } | null>(null);
  const dragImageStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    aspect: number;
  } | null>(null);
  const dragRectCornerRef = useRef<{ sx: number; sy: number } | null>(null);
  const dragCircleCornerRef = useRef<{ sx: number; sy: number } | null>(null);
  const dragImageCornerRef = useRef<{ sx: number; sy: number } | null>(null);
  const dragTextStartRef = useRef<{
    x: number;
    y: number;
    text: string;
    fontSize: number;
    width: number;
    height: number;
  } | null>(null);
  const dragTextCornerRef = useRef<{ sx: number; sy: number } | null>(null);
  const dragFrameStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dragPolyStartRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dragFrameCornerRef = useRef<{ sx: number; sy: number } | null>(null);
  const dragLineStartRef = useRef<LineShape | null>(null);
  const dragArrowStartRef = useRef<ArrowShape | null>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const isErasingRef = useRef(false);
  const circleStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const [rerenderTick, setRerenderTick] = useState(0);
  const editingConnectorRef = useRef<{
    index: number;
    end: "from" | "to";
  } | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{
    kind: ShapeKind;
    shapeId: string;
    anchor: AnchorSide;
    point: { x: number; y: number };
    percent?: number;
  } | null>(null);
  const [pendingConnector, setPendingConnector] = useState<{
    from: ConnectorAnchor;
    previewPoint: { x: number; y: number };
  } | null>(null);
  const pointerToolRef = useRef<string>("");

  const measureText = useCallback((text: string, fontSize: number) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const lineHeight = fontSize * 1.2;
    const lines = text.split("\n");
    if (!ctx) {
      const maxLen = Math.max(...lines.map((l) => l.length), 0);
      return {
        width: maxLen * fontSize * 0.6,
        height: lineHeight * lines.length,
      };
    }
    ctx.font = `${fontSize}px sans-serif`;
    const widths = lines.map((l) => ctx.measureText(l).width);
    const width = widths.length ? Math.max(...widths) : 0;
    return { width, height: lineHeight * Math.max(lines.length, 1) };
  }, []);
  const clampZoom = useCallback(
    (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)),
    []
  );

  const ensureRectId = useCallback(
    (items: RectShape[]) =>
      items.map((r) => (r.id ? r : { ...r, id: makeId() })),
    []
  );
  const ensureCircleId = useCallback(
    (items: CircleShape[]) =>
      items.map((c) => (c.id ? c : { ...c, id: makeId() })),
    []
  );
  const ensureImageId = useCallback(
    (items: ImageShape[]) =>
      items.map((im) => (im.id ? im : { ...im, id: makeId() })),
    []
  );
  const ensureTextId = useCallback(
    (items: TextShape[]) =>
      items.map((t) => (t.id ? t : { ...t, id: makeId() })),
    []
  );
  const ensureFrameId = useCallback(
    (items: FrameShape[]) =>
      items.map((f) => (f.id ? f : { ...f, id: makeId() })),
    []
  );
  const ensureLineId = useCallback(
    (items: LineShape[]) =>
      items.map((l) => (l.id ? l : { ...l, id: makeId() })),
    []
  );
  const ensureArrowId = useCallback(
    (items: ArrowShape[]) =>
      items.map((l) => (l.id ? l : { ...l, id: makeId() })),
    []
  );
  const ensurePathId = useCallback(
    (items: PathShape[]) =>
      items.map((p) => (p.id ? p : { ...p, id: makeId() })),
    []
  );
  const ensurePolyId = useCallback(
    (items: PolyShape[]) =>
      items.map((p) => (p.id ? p : { ...p, id: makeId() })),
    []
  );

  const distToSegment = useCallback(
    (
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
      const t = Math.max(
        0,
        Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq)
      );
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;
      return Math.hypot(px - projX, py - projY);
    },
    []
  );

  const getRectAnchor = useCallback((rect: { x: number; y: number; width: number; height: number }, anchor: AnchorSide, percent = 0.5) => {
    if (anchor === "top") return { x: rect.x + rect.width * percent, y: rect.y };
    if (anchor === "bottom") return { x: rect.x + rect.width * percent, y: rect.y + rect.height };
    if (anchor === "left") return { x: rect.x, y: rect.y + rect.height * percent };
    return { x: rect.x + rect.width, y: rect.y + rect.height * percent };
  }, []);

  const getCircleAnchor = useCallback(
    (circle: CircleShape, anchor: AnchorSide) => {
      if (anchor === "top") return { x: circle.x, y: circle.y - circle.ry };
      if (anchor === "bottom") return { x: circle.x, y: circle.y + circle.ry };
      if (anchor === "left") return { x: circle.x - circle.rx, y: circle.y };
      return { x: circle.x + circle.rx, y: circle.y };
    },
    []
  );

  const getAnchorPoint = useCallback(
    (target: ConnectorAnchor) => {
      if (target.kind === "rect") {
        const shape = rectangles.find((r) => r.id === target.shapeId);
        if (!shape) return null;
        return getRectAnchor(shape, target.anchor, target.percent);
      }
      if (target.kind === "circle") {
        const shape = circles.find((c) => c.id === target.shapeId);
        if (!shape) return null;
        return getCircleAnchor(shape, target.anchor);
      }
      if (target.kind === "image") {
        const shape = images.find((im) => im.id === target.shapeId);
        if (!shape) return null;
        return getRectAnchor(shape, target.anchor, target.percent);
      }
      if (target.kind === "text") {
        const shape = texts.find((t) => t.id === target.shapeId);
        if (!shape) return null;
        return getRectAnchor(shape, target.anchor, target.percent);
      }
      if (target.kind === "frame") {
        const shape = frames.find((f) => f.id === target.shapeId);
        if (!shape) return null;
        return getRectAnchor(shape, target.anchor, target.percent);
      }
      if (target.kind === "poly") {
        const shape = polygons.find((p) => p.id === target.shapeId);
        if (!shape) return null;
        return getRectAnchor(shape, target.anchor, target.percent);
      }
      return null;
    },
    [rectangles, circles, images, texts, frames, polygons, getRectAnchor, getCircleAnchor]
  );

  const getShapeBounds = useCallback((target: { kind: ShapeKind; shapeId: string }) => {
    if (target.kind === "rect") return rectangles.find(r => r.id === target.shapeId);
    if (target.kind === "circle") {
      const c = circles.find(ci => ci.id === target.shapeId);
      if (!c) return null;
      return { x: c.x - c.rx, y: c.y - c.ry, width: c.rx * 2, height: c.ry * 2 };
    }
    if (target.kind === "image") return images.find(im => im.id === target.shapeId);
    if (target.kind === "text") return texts.find(t => t.id === target.shapeId);
    if (target.kind === "frame") return frames.find(f => f.id === target.shapeId);
    if (target.kind === "poly") return polygons.find(p => p.id === target.shapeId);
    return null;
  }, [rectangles, circles, images, texts, frames, polygons]);

  const getAnchorDir = (anchor: AnchorSide) => {
    if (anchor === "top") return { x: 0, y: -1 };
    if (anchor === "bottom") return { x: 0, y: 1 };
    if (anchor === "left") return { x: -1, y: 0 };
    return { x: 1, y: 0 };
  };

  const applyZoom = useCallback(
    (targetZoom: number, focal?: { clientX: number; clientY: number }) => {
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      setZoom((prevZoom) => {
        const nextZoom = clampZoom(targetZoom);
        if (prevZoom === nextZoom || !rect) return nextZoom;

        setPan((prevPan) => {
          const screenX =
            (focal ? focal.clientX : rect.left + rect.width / 2) - rect.left;
          const screenY =
            (focal ? focal.clientY : rect.top + rect.height / 2) - rect.top;
          const canvasX = screenX / prevZoom - prevPan.x;
          const canvasY = screenY / prevZoom - prevPan.y;
          return {
            x: screenX / nextZoom - canvasX,
            y: screenY / nextZoom - canvasY,
          };
        });
        return nextZoom;
      });
    },
    [clampZoom]
  );

  const zoomIn = useCallback(
    (focal?: { clientX: number; clientY: number }) =>
      applyZoom(zoom + ZOOM_STEP, focal),
    [applyZoom, zoom]
  );

  const zoomOut = useCallback(
    (focal?: { clientX: number; clientY: number }) =>
      applyZoom(zoom - ZOOM_STEP, focal),
    [applyZoom, zoom]
  );

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);
  const [textEditor, setTextEditor] = useState<{
    canvasX: number;
    canvasY: number;
    value: string;
    fontSize: number;
    index: number | null;
    boxWidth?: number;
    boxHeight?: number;
    pad?: number;
  } | null>(null);
  const snapshot = useCallback(
    (overrides?: Partial<HistoryEntry>): HistoryEntry => ({
      rectangles: overrides?.rectangles ?? rectangles,
      circles: overrides?.circles ?? circles,
      lines: overrides?.lines ?? lines,
      arrows: overrides?.arrows ?? arrows,
      paths: overrides?.paths ?? paths,
      images: overrides?.images ?? images,
      texts: overrides?.texts ?? texts,
      frames: overrides?.frames ?? frames,
      connectors: overrides?.connectors ?? connectors,
      polygons: overrides?.polygons ?? polygons,
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
      connectors,
      polygons,
    ]
  );
  const getContentBounds = useCallback(() => {
    const xs: number[] = [];
    const ys: number[] = [];

    rectangles.forEach((r) => {
      const minX = Math.min(r.x, r.x + r.width);
      const maxX = Math.max(r.x, r.x + r.width);
      const minY = Math.min(r.y, r.y + r.height);
      const maxY = Math.max(r.y, r.y + r.height);
      xs.push(minX, maxX);
      ys.push(minY, maxY);
    });

    circles.forEach((c) => {
      xs.push(c.x - c.rx, c.x + c.rx);
      ys.push(c.y - c.ry, c.y + c.ry);
    });

    lines.forEach((l) => {
      xs.push(l.x1, l.x2);
      ys.push(l.y1, l.y2);
    });

    arrows.forEach((a) => {
      xs.push(a.x1, a.x2);
      ys.push(a.y1, a.y2);
    });

    paths.forEach((p) =>
      p.points.forEach((pt) => {
        xs.push(pt.x);
        ys.push(pt.y);
      })
    );

    connectors.forEach((c) => {
      const fromPt = getAnchorPoint(c.from);
      const toPt = getAnchorPoint(c.to);
      if (fromPt) {
        xs.push(fromPt.x);
        ys.push(fromPt.y);
      }
      if (toPt) {
        xs.push(toPt.x);
        ys.push(toPt.y);
      }
    });

    images.forEach((im) => {
      const minX = Math.min(im.x, im.x + im.width);
      const maxX = Math.max(im.x, im.x + im.width);
      const minY = Math.min(im.y, im.y + im.height);
      const maxY = Math.max(im.y, im.y + im.height);
      xs.push(minX, maxX);
      ys.push(minY, maxY);
    });

    texts.forEach((t) => {
      xs.push(t.x, t.x + t.width);
      ys.push(t.y, t.y + t.height);
    });

    frames.forEach((f) => {
      const minX = Math.min(f.x, f.x + f.width);
      const maxX = Math.max(f.x, f.x + f.width);
      const minY = Math.min(f.y, f.y + f.height);
      const maxY = Math.max(f.y, f.y + f.height);
      xs.push(minX, maxX);
      ys.push(minY, maxY);
    });
    polygons.forEach((p) => {
      const minX = Math.min(p.x, p.x + (p.width ?? 0));
      const maxX = Math.max(p.x, p.x + (p.width ?? 0));
      const minY = Math.min(p.y, p.y + (p.height ?? 0));
      const maxY = Math.max(p.y, p.y + (p.height ?? 0));
      xs.push(minX, maxX);
      ys.push(minY, maxY);
    });

    if (!xs.length || !ys.length) return null;
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }, [
    arrows,
    circles,
    connectors,
    getAnchorPoint,
    images,
    lines,
    paths,
    rectangles,
    texts,
    frames,
    polygons,
  ]);

  const pushHistory = useCallback(
    (overrides?: Partial<HistoryEntry>) => {
      if (isUndoRedoRef.current) return;
      const entry = snapshot(overrides);
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const updated = [...trimmed, entry];
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    },
    [historyIndex, snapshot]
  );
  const deleteSelected = useCallback(() => {
    if (!selectedShape) return;
    const { kind, index } = selectedShape;

    if (kind === "rect") {
      setRectangles((prev) => {
        const target = prev[index];
        if (!target) return prev;
        const next = prev.filter((_, i) => i !== index);
        const nextConnectors = connectors.filter(
          (c) =>
            !(
              (c.from.kind === "rect" && c.from.shapeId === target.id) ||
              (c.to.kind === "rect" && c.to.shapeId === target.id)
            )
        );
        setConnectors(nextConnectors);
        pushHistory({ rectangles: next, connectors: nextConnectors });
        return next;
      });
    } else if (kind === "circle") {
      setCircles((prev) => {
        const target = prev[index];
        if (!target) return prev;
        const next = prev.filter((_, i) => i !== index);
        const nextConnectors = connectors.filter(
          (c) =>
            !(
              (c.from.kind === "circle" && c.from.shapeId === target.id) ||
              (c.to.kind === "circle" && c.to.shapeId === target.id)
            )
        );
        setConnectors(nextConnectors);
        pushHistory({ circles: next, connectors: nextConnectors });
        return next;
      });
    } else if (kind === "image") {
      setImages((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ images: next });
        return next;
      });
    } else if (kind === "text") {
      setTexts((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ texts: next });
        return next;
      });
    } else if (kind === "frame") {
      setFrames((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ frames: next });
        return next;
      });
    } else if (kind === "line") {
      setLines((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ lines: next });
        return next;
      });
    } else if (kind === "arrow") {
      setArrows((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ arrows: next });
        return next;
      });
    } else if (kind === "connector") {
      setConnectors((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ connectors: next });
        return next;
      });
    } else if (kind === "poly") {
      setPolygons((prev) => {
        if (!prev[index]) return prev;
        const next = prev.filter((_, i) => i !== index);
        pushHistory({ polygons: next });
        return next;
      });
    }

    setSelectedShape(null);
  }, [pushHistory, selectedShape]);

  const duplicateSelection = useCallback(
    (offset = 0) => {
      if (!selectedShape) return;
      const { kind, index } = selectedShape;
      if (kind === "rect") {
        const src = rectangles[index];
        if (!src) return;
        setRectangles((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ rectangles: next });
          setSelectedShape({ kind: "rect", index: next.length - 1 });
          return next;
        });
      } else if (kind === "circle") {
        const src = circles[index];
        if (!src) return;
        setCircles((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ circles: next });
          setSelectedShape({ kind: "circle", index: next.length - 1 });
          return next;
        });
      } else if (kind === "image") {
        const src = images[index];
        if (!src) return;
        setImages((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ images: next });
          setSelectedShape({ kind: "image", index: next.length - 1 });
          return next;
        });
      } else if (kind === "text") {
        const src = texts[index];
        if (!src) return;
        setTexts((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ texts: next });
          setSelectedShape({ kind: "text", index: next.length - 1 });
          return next;
        });
      } else if (kind === "frame") {
        const src = frames[index];
        if (!src) return;
        setFrames((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ frames: next });
          setSelectedShape({ kind: "frame", index: next.length - 1 });
          return next;
        });
      } else if (kind === "line") {
        const src = lines[index];
        if (!src) return;
        setLines((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x1: src.x1 + offset,
            y1: src.y1 + offset,
            x2: src.x2 + offset,
            y2: src.y2 + offset,
          };
          const next = [...prev, clone];
          pushHistory({ lines: next });
          setSelectedShape({ kind: "line", index: next.length - 1 });
          return next;
        });
      } else if (kind === "arrow") {
        const src = arrows[index];
        if (!src) return;
        setArrows((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x1: src.x1 + offset,
            y1: src.y1 + offset,
            x2: src.x2 + offset,
            y2: src.y2 + offset,
          };
          const next = [...prev, clone];
          pushHistory({ arrows: next });
          setSelectedShape({ kind: "arrow", index: next.length - 1 });
          return next;
        });
      } else if (kind === "poly") {
        const src = polygons[index];
        if (!src) return;
        setPolygons((prev) => {
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          const next = [...prev, clone];
          pushHistory({ polygons: next });
          setSelectedShape({ kind: "poly", index: next.length - 1 });
          return next;
        });
      }
    },
    [
      arrows,
      circles,
      frames,
      images,
      lines,
      pushHistory,
      rectangles,
      selectedShape,
      texts,
    ]
  );

  const duplicateForDrag = useCallback(
    (
      picked:
        | { kind: "rect"; index: number }
        | { kind: "circle"; index: number }
        | { kind: "image"; index: number }
        | { kind: "text"; index: number }
        | { kind: "frame"; index: number }
        | { kind: "line"; index: number }
        | { kind: "arrow"; index: number }
        | { kind: "connector"; index: number }
        | { kind: "poly"; index: number }
    ) => {
      const offset = 0;
      if (picked.kind === "rect") {
        const src = rectangles[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...rectangles, clone];
        setRectangles(next);
        pushHistory({ rectangles: next });
        return { kind: "rect", index: next.length - 1 } as const;
      }
      if (picked.kind === "circle") {
        const src = circles[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...circles, clone];
        setCircles(next);
        pushHistory({ circles: next });
        return { kind: "circle", index: next.length - 1 } as const;
      }
      if (picked.kind === "image") {
        const src = images[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...images, clone];
        setImages(next);
        pushHistory({ images: next });
        return { kind: "image", index: next.length - 1 } as const;
      }
      if (picked.kind === "text") {
        const src = texts[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...texts, clone];
        setTexts(next);
        pushHistory({ texts: next });
        return { kind: "text", index: next.length - 1 } as const;
      }
      if (picked.kind === "frame") {
        const src = frames[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...frames, clone];
        setFrames(next);
        pushHistory({ frames: next });
        return { kind: "frame", index: next.length - 1 } as const;
      }
      if (picked.kind === "line") {
        const src = lines[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x1: src.x1 + offset,
          y1: src.y1 + offset,
          x2: src.x2 + offset,
          y2: src.y2 + offset,
        };
        const next = [...lines, clone];
        setLines(next);
        pushHistory({ lines: next });
        return { kind: "line", index: next.length - 1 } as const;
      }
      if (picked.kind === "arrow") {
        const src = arrows[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x1: src.x1 + offset,
          y1: src.y1 + offset,
          x2: src.x2 + offset,
          y2: src.y2 + offset,
        };
        const next = [...arrows, clone];
        setArrows(next);
        pushHistory({ arrows: next });
        return { kind: "arrow", index: next.length - 1 } as const;
      }
      if (picked.kind === "poly") {
        const src = polygons[picked.index];
        if (!src) return null;
        const clone = {
          ...src,
          id: makeId(),
          x: src.x + offset,
          y: src.y + offset,
        };
        const next = [...polygons, clone];
        setPolygons(next);
        pushHistory({ polygons: next });
        return { kind: "poly", index: next.length - 1 } as const;
      }
      return null;
    },
    [
      arrows,
      circles,
      frames,
      images,
      lines,
      polygons,
      pushHistory,
      rectangles,
      texts,
    ]
  );
  const applySnapshot = useCallback(
    (entry: HistoryEntry) => {
      isUndoRedoRef.current = true;
      setSelectedShape(null);
      const safeRectangles = ensureRectId(entry.rectangles);
      const safeCircles = ensureCircleId(entry.circles);
      const safeLines = ensureLineId(entry.lines);
      const safeArrows = ensureArrowId(entry.arrows);
      const safePaths = ensurePathId(entry.paths);
      const safeImages = ensureImageId(entry.images);
      const safeTexts = ensureTextId(entry.texts);
      const safeFrames = ensureFrameId(entry.frames);
      const safePolygons = ensurePolyId(entry.polygons);

      const rectIds = new Set(safeRectangles.map((r) => r.id));
      const circleIds = new Set(safeCircles.map((c) => c.id));
      const safeConnectors = (entry.connectors || []).filter((c) => {
        const hasFrom =
          (c.from.kind === "rect" && rectIds.has(c.from.shapeId)) ||
          (c.from.kind === "circle" && circleIds.has(c.from.shapeId));
        const hasTo =
          (c.to.kind === "rect" && rectIds.has(c.to.shapeId)) ||
          (c.to.kind === "circle" && circleIds.has(c.to.shapeId));
        return hasFrom && hasTo;
      });

      setRectangles(safeRectangles);
      setCircles(safeCircles);
      setLines(safeLines);
      setArrows(safeArrows);
      setPaths(safePaths);
      setImages(safeImages);
      setTexts(safeTexts);
      setFrames(safeFrames);
      setPolygons(safePolygons);
      setConnectors(safeConnectors);
      dragModeRef.current = "none";
      dragRectStartRef.current = null;
      dragCircleStartRef.current = null;
      dragRectCornerRef.current = null;
      dragCircleCornerRef.current = null;
      dragImageStartRef.current = null;
      dragImageCornerRef.current = null;
      dragTextStartRef.current = null;
      dragTextCornerRef.current = null;
      dragFrameStartRef.current = null;
      dragFrameCornerRef.current = null;
      dragLineStartRef.current = null;
      dragArrowStartRef.current = null;
      isUndoRedoRef.current = false;
      // Force a render tick to ensure canvas draws immediately after programmatic restores
      setRerenderTick((t) => t + 1);
    },
    [
      ensureArrowId,
      ensureCircleId,
      ensureFrameId,
      ensureImageId,
      ensureLineId,
      ensurePathId,
      ensureRectId,
      ensureTextId,
      ensurePolyId,
    ]
  );

  // log + call onChange on any canvas change (including pan/zoom)
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSnapshot = snapshot();
      onChangeRef.current?.({
        pan,
        zoom,
        snapshot: currentSnapshot,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [snapshot, pan, zoom]);

  // Initial load from initialData
  useEffect(() => {
    if (initialData?.snapshot) {
      applySnapshot(initialData.snapshot);
      setHistory([initialData.snapshot]);
      setHistoryIndex(0);
      if (initialData.pan) setPan(initialData.pan);
      if (initialData.zoom) setZoom(clampZoom(initialData.zoom));
      requestAnimationFrame(() => setRerenderTick((t) => t + 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eraseAtPoint = (point: { x: number; y: number }) => {
    // check topmost: paths -> arrows -> lines -> circles -> rects (all reversed for topmost)
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      const pts = p.points;
      for (let j = 1; j < pts.length; j++) {
        if (
          distToSegment(
            point.x,
            point.y,
            pts[j - 1].x,
            pts[j - 1].y,
            pts[j].x,
            pts[j].y
          ) <=
          5 / zoom
        ) {
          setPaths((prev) => prev.filter((_, idx) => idx !== i));
          setSelectedShape(null);
          return true;
        }
      }
    }

    for (let i = arrows.length - 1; i >= 0; i--) {
      const l = arrows[i];
      if (distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <= 5 / zoom) {
        setArrows((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = connectors.length - 1; i >= 0; i--) {
      const c = connectors[i];
      const fromPt = getAnchorPoint(c.from);
      const toPt = getAnchorPoint(c.to);
      if (!fromPt || !toPt) continue;
      if (
        distToSegment(point.x, point.y, fromPt.x, fromPt.y, toPt.x, toPt.y) <=
        6 / zoom
      ) {
        setConnectors((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i];
      if (distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <= 5 / zoom) {
        setLines((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = circles.length - 1; i >= 0; i--) {
      const c = circles[i];
      const norm =
        ((point.x - c.x) * (point.x - c.x)) / (c.rx * c.rx) +
        ((point.y - c.y) * (point.y - c.y)) / (c.ry * c.ry);
      if (norm <= 1) {
        setCircles((prev) => prev.filter((_, idx) => idx !== i));
        setConnectors((prev) =>
          prev.filter(
            (con) =>
              !(
                (con.from.kind === "circle" && con.from.shapeId === c.id) ||
                (con.to.kind === "circle" && con.to.shapeId === c.id)
              )
          )
        );
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = rectangles.length - 1; i >= 0; i--) {
      const r = rectangles[i];
      const x2 = r.x + r.width;
      const y2 = r.y + r.height;
      if (point.x >= r.x && point.x <= x2 && point.y >= r.y && point.y <= y2) {
        setRectangles((prev) => prev.filter((_, idx) => idx !== i));
        setConnectors((prev) =>
          prev.filter(
            (con) =>
              !(
                (con.from.kind === "rect" && con.from.shapeId === r.id) ||
                (con.to.kind === "rect" && con.to.shapeId === r.id)
              )
          )
        );
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = polygons.length - 1; i >= 0; i--) {
      const p = polygons[i];
      const x2 = p.x + p.width;
      const y2 = p.y + p.height;
      if (point.x >= p.x && point.x <= x2 && point.y >= p.y && point.y <= y2) {
        setPolygons((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = images.length - 1; i >= 0; i--) {
      const im = images[i];
      const x2 = im.x + im.width;
      const y2 = im.y + im.height;
      if (
        point.x >= im.x &&
        point.x <= x2 &&
        point.y >= im.y &&
        point.y <= y2
      ) {
        setImages((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const x2 = t.x + t.width;
      const y2 = t.y + t.height;
      if (point.x >= t.x && point.x <= x2 && point.y >= t.y && point.y <= y2) {
        setTexts((prev) => prev.filter((_, idx) => idx !== i));
        setSelectedShape(null);
        return true;
      }
    }

    // Frames cannot be erased - they are protected
    // Elements inside frames can still be erased above

    return false;
  };

  // Clear selection when leaving Select tool
  useEffect(() => {
    if (activeTool !== "Select") {
      setSelectedShape(null);
      dragModeRef.current = "none";
      dragRectStartRef.current = null;
      dragCircleStartRef.current = null;
      dragRectCornerRef.current = null;
      dragCircleCornerRef.current = null;
      dragImageCornerRef.current = null;
      dragTextCornerRef.current = null;
      dragFrameCornerRef.current = null;
      dragFrameStartRef.current = null;
      dragLineStartRef.current = null;
      dragArrowStartRef.current = null;
      isDrawingLineRef.current = false;
      isDrawingArrowRef.current = false;
      isDrawingPathRef.current = false;
      isDrawingFrameRef.current = false;
    }
  }, [activeTool]);

  useEffect(() => {
    if (activeTool !== "Arrow") {
      setPendingConnector(null);
      setHoverAnchor(null);
    }
  }, [activeTool]);

  useEffect(() => {
    if (!textEditor) return;
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [textEditor?.value, textEditor?.fontSize, textEditor?.boxWidth]);

  useEffect(() => {
    const el = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const updateSize = () => {
      const { clientWidth, clientHeight } = el;
      if (clientWidth && clientHeight) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(clientWidth * dpr);
        canvas.height = Math.round(clientHeight * dpr);
        canvas.style.width = `${clientWidth}px`;
        canvas.style.height = `${clientHeight}px`;
      }
    };
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // keep history in sync on first mount
  useEffect(() => {
    pushHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.getAttribute("contenteditable") === "true");
      if (isTyping) return;

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePanning(true);
      }

      if (e.key === "Delete") {
        e.preventDefault();
        deleteSelected();
      }

      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (isCmd && e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (isCmd && e.key.toLowerCase() === "c") {
        e.preventDefault();
        duplicateSelection(0);
        return;
      }
      if (isCmd && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelection(0);
        return;
      }
      if (isCmd && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        zoomIn();
      } else if (isCmd && e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (isCmd && e.key === "0") {
        e.preventDefault();
        resetView();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [deleteSelected, resetView, zoomIn, zoomOut]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const target = history[historyIndex - 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex - 1);
  }, [applySnapshot, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const target = history[historyIndex + 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex + 1);
  }, [applySnapshot, history, historyIndex]);

  const fitToScreen = useCallback(() => {
    const bounds = getContentBounds();
    const canvas = canvasRef.current;
    if (!canvas) {
      resetView();
      return;
    }
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    if (!bounds) {
      resetView();
      return;
    }

    const padding = 80;
    const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
    const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
    const zoomX = (rect.width - padding * 2) / contentWidth;
    const zoomY = (rect.height - padding * 2) / contentHeight;
    const targetZoom = clampZoom(Math.min(zoomX, zoomY));
    const centerCanvasX = bounds.minX + contentWidth / 2;
    const centerCanvasY = bounds.minY + contentHeight / 2;

    setPan({
      x: rect.width / (2 * targetZoom) - centerCanvasX,
      y: rect.height / (2 * targetZoom) - centerCanvasY,
    });
    setZoom(targetZoom);
  }, [clampZoom, getContentBounds, resetView]);

  const toCanvasPointFromClient = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    // Inverse of: translate(pan) -> scale(zoom)
    // Drawing: worldPoint -> (world * zoom) + pan = screen
    // Inverse: screen -> (screen - pan) / zoom = world
    const x = (screenX - pan.x) / zoom;
    const y = (screenY - pan.y) / zoom;
    return { x, y };
  };

  const canvasToClient = (x: number, y: number) => {
    // Forward of: translate(pan) -> scale(zoom)
    // World to Screen: screen = (world * zoom) + pan
    const cssX = x * zoom + pan.x;
    const cssY = y * zoom + pan.y;
    return { x: cssX, y: cssY, cssX, cssY };
  };

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      // Zoom with mouse wheel/trackpad; keep ctrl/meta for pinch zoom parity
      event.preventDefault();
      const isPinch = event.ctrlKey || event.metaKey;
      const step = isPinch ? 0.12 : 0.08;
      const factor = Math.exp((-event.deltaY / 100) * step);
      applyZoom(zoom * factor, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [applyZoom, zoom]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = Array.from(event.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;
    const dropPoint = toCanvasPointFromClient(event.clientX, event.clientY);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new Image();
        img.onload = () => {
          imageCacheRef.current[src] = img;
          setImages((prev) => {
            const next = [
              ...prev,
              {
                id: makeId(),
                src,
                x: dropPoint.x,
                y: dropPoint.y,
                width: img.naturalWidth,
                height: img.naturalHeight,
              },
            ];
            pushHistory({ images: next });
            return next;
          });
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toCanvasPointFromClient(event.clientX, event.clientY);

    if (activeTool === "Text") {
      const fontSize = 18;
      const pad = 4 / zoom;
      setTextEditor({
        canvasX: point.x,
        canvasY: point.y,
        value: "",
        fontSize,
        index: null,
        pad,
        boxWidth: 0,
        boxHeight: fontSize * 1.4,
      });
      setSelectedShape(null);
      event.preventDefault();
      return;
    }

    if (activeTool !== "Select") return;
    // topmost text hit
    let hit: number | null = null;
    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      const x2 = t.x + t.width;
      const y2 = t.y + t.height;
      if (point.x >= t.x && point.x <= x2 && point.y >= t.y && point.y <= y2) {
        hit = i;
        break;
      }
    }

    if (hit == null && selectedShape?.kind === "text") {
      hit = selectedShape.index;
    }

    if (hit != null) {
      const t = texts[hit];
      const pad = 4 / zoom;
      setSelectedShape({ kind: "text", index: hit });
      setTextEditor({
        canvasX: t.x,
        canvasY: t.y,
        value: t.text,
        fontSize: t.fontSize,
        index: hit,
        boxWidth: t.width,
        boxHeight: t.height,
        pad,
      });
      event.preventDefault();
    }
  };

  const commitTextEditor = () => {
    if (!textEditor) return;
    const value = textEditor.value.trim();
    if (!value) {
      setTextEditor(null);
      return;
    }
    const measured = measureText(value, textEditor.fontSize);
    if (textEditor.index == null) {
      setTexts((prev) => {
        const next = [
          ...prev,
          {
            id: makeId(),
            x: textEditor.canvasX,
            y: textEditor.canvasY,
            text: value,
            fontSize: textEditor.fontSize,
            width: measured.width,
            height: measured.height,
          },
        ];
        pushHistory({ texts: next });
        return next;
      });
      setSelectedShape({ kind: "text", index: texts.length });
    } else {
      setTexts((prev) =>
        prev.map((t, idx) =>
          idx === textEditor.index
            ? {
              ...t,
              text: value,
              fontSize: textEditor.fontSize,
              width: measured.width,
              height: measured.height,
            }
            : t
        )
      );
      pushHistory();
      setSelectedShape({ kind: "text", index: textEditor.index });
    }
    setTextEditor(null);
  };

  const cancelTextEditor = () => {
    setTextEditor(null);
  };

  const toCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) =>
    toCanvasPointFromClient(event.clientX, event.clientY);

  const startPan = (
    event: React.PointerEvent<HTMLCanvasElement>,
    isTemporary = false
  ) => {
    isPanningRef.current = true;
    tempPanRef.current = isTemporary;
    setIsHandPanning(true);
    panStartRef.current = { ...pan };
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const resolveTool = (ev?: { ctrlKey?: boolean; metaKey?: boolean }) => {
    if (ev?.ctrlKey || ev?.metaKey) return "Select";
    if (isSpacePanning) return "Hand";
    return activeTool;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const tool = resolveTool(event);
    pointerToolRef.current = tool;

    const shouldTempPan = event.button === 1;
    if (shouldTempPan) {
      startPan(event, true);
      return;
    }

    if (isPlusMenuOpen) {
      setIsPlusMenuOpen(false);
    }

    const point = toCanvasPoint(event);

    if (tool === "PlusAdd" && pendingAddShapeLabel) {
      const id = makeId();
      const label = pendingAddShapeLabel;
      const x = point.x;
      const y = point.y;

      if (label === "Rectangle") {
        const next = [
          ...rectangles,
          { id, x: x - 60, y: y - 40, width: 120, height: 80 },
        ];
        setRectangles(next);
        pushHistory({ rectangles: next });
        setSelectedShape({ kind: "rect", index: next.length - 1 });
      } else if (label === "Ellipse" || label === "Oval") {
        const rx = label === "Ellipse" ? 50 : 70;
        const ry = 50;
        const next = [...circles, { id, x, y, rx, ry }];
        setCircles(next);
        pushHistory({ circles: next });
        setSelectedShape({ kind: "circle", index: next.length - 1 });
      } else {
        const next = [
          ...polygons,
          { id, type: label, x: x - 60, y: y - 60, width: 120, height: 120 },
        ];
        setPolygons(next);
        pushHistory({ polygons: next });
        setSelectedShape({ kind: "poly", index: next.length - 1 });
      }

      setActiveTool("Select");
      setPendingAddShapeLabel(null);
      return;
    }

    if (activeTool === "IconAdd" && pendingAddIcon) {
      const id = makeId();
      const x = point.x;
      const y = point.y;
      const next = [
        ...images,
        {
          id,
          src: pendingAddIcon.src,
          x: x - 24,
          y: y - 24,
          width: 48,
          height: 48,
        },
      ];
      setImages(next);
      pushHistory({ images: next });
      setSelectedShape({ kind: "image", index: next.length - 1 });
      setActiveTool("Select");
      setPendingAddIcon(null);
      return;
    }

    if (tool === "Select") {
      // hit-test shapes from topmost: images -> texts -> circles -> rectangles
      const hitImage = (() => {
        for (let i = images.length - 1; i >= 0; i--) {
          const im = images[i];
          const x2 = im.x + im.width;
          const y2 = im.y + im.height;
          if (
            point.x >= im.x &&
            point.x <= x2 &&
            point.y >= im.y &&
            point.y <= y2
          ) {
            return i;
          }
          // Check handles if selected
          if (selectedShape?.kind === "image" && selectedShape.index === i) {
            const hs = 12 / zoom;
            const handles = [
              { x: im.x + im.width, y: im.y + im.height },
              { x: im.x + im.width / 2, y: im.y },
              { x: im.x + im.width / 2, y: im.y + im.height },
              { x: im.x, y: im.y + im.height / 2 },
              { x: im.x + im.width, y: im.y + im.height / 2 },
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitText = (() => {
        for (let i = texts.length - 1; i >= 0; i--) {
          const t = texts[i];
          const x2 = t.x + t.width;
          const y2 = t.y + t.height;
          if (
            point.x >= t.x &&
            point.x <= x2 &&
            point.y >= t.y &&
            point.y <= y2
          ) {
            return i;
          }
          // Check handles if selected
          if (selectedShape?.kind === "text" && selectedShape.index === i) {
            const pad = 4 / zoom;
            const hs = 10 / zoom;
            const x = t.x - pad;
            const y = t.y - pad;
            const w = t.width + pad * 2;
            const h = t.height + pad * 2;
            const handles = [
              { x: x + w, y: y + h },
              { x: x + w / 2, y: y },
              { x: x + w / 2, y: y + h },
              { x: x, y: y + h / 2 },
              { x: x + w, y: y + h / 2 },
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitCircle = (() => {
        for (let i = circles.length - 1; i >= 0; i--) {
          const c = circles[i];
          const dx = point.x - c.x;
          const dy = point.y - c.y;
          const norm = (dx * dx) / (c.rx * c.rx) + (dy * dy) / (c.ry * c.ry);
          const nearFill = norm <= 1.05; // small cushion inside
          // Also allow a tolerance band around the ellipse outline to make thin strokes easier to hit
          const avgR = (c.rx + c.ry) / 2;
          const distFromCenter = Math.hypot(dx, dy);
          const nearOutline = Math.abs(distFromCenter - avgR) <= 8 / zoom;

          // If this circle is selected, also check if we're clicking on a handle
          let nearCornerHandle = false;
          let nearEdgeHandle = false;
          if (selectedShape?.kind === "circle" && selectedShape.index === i) {
            const handleSize = 12 / zoom;
            const pad = 4 / zoom;
            const corners = [
              { x: c.x - c.rx - pad, y: c.y - c.ry - pad },
              { x: c.x + c.rx + pad, y: c.y - c.ry - pad },
              { x: c.x - c.rx - pad, y: c.y + c.ry + pad },
              { x: c.x + c.rx + pad, y: c.y + c.ry + pad },
            ];
            nearCornerHandle = corners.some(
              (corner) =>
                Math.abs(point.x - corner.x) <= handleSize &&
                Math.abs(point.y - corner.y) <= handleSize
            );
            const edges = [
              { x: c.x, y: c.y - c.ry - pad },
              { x: c.x, y: c.y + c.ry + pad },
              { x: c.x - c.rx - pad, y: c.y },
              { x: c.x + c.rx + pad, y: c.y },
            ];
            nearEdgeHandle = edges.some(
              (edge) =>
                Math.abs(point.x - edge.x) <= handleSize &&
                Math.abs(point.y - edge.y) <= handleSize
            );
          }

          if (nearFill || nearOutline || nearCornerHandle || nearEdgeHandle)
            return i;
        }
        return null;
      })();

      const hitLine = (() => {
        for (let i = lines.length - 1; i >= 0; i--) {
          const l = lines[i];
          const dist = distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2);
          if (dist <= 6 / zoom) return i;

          // Check handles if selected
          if (selectedShape?.kind === "line" && selectedShape.index === i) {
            const hs = 10 / zoom;
            if (Math.hypot(point.x - l.x1, point.y - l.y1) <= hs / 2 ||
              Math.hypot(point.x - l.x2, point.y - l.y2) <= hs / 2) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitArrowShape = (() => {
        for (let i = arrows.length - 1; i >= 0; i--) {
          const l = arrows[i];
          const dist = distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2);
          if (dist <= 6 / zoom) return i;

          // Check handles if selected
          if (selectedShape?.kind === "arrow" && selectedShape.index === i) {
            const hs = 10 / zoom;
            if (Math.hypot(point.x - l.x1, point.y - l.y1) <= hs / 2 ||
              Math.hypot(point.x - l.x2, point.y - l.y2) <= hs / 2) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitRect = (() => {
        for (let i = rectangles.length - 1; i >= 0; i--) {
          const r = rectangles[i];
          const x2 = r.x + r.width;
          const y2 = r.y + r.height;
          if (
            point.x >= r.x &&
            point.x <= x2 &&
            point.y >= r.y &&
            point.y <= y2
          ) {
            return i;
          }
          // Check handles if selected
          if (selectedShape?.kind === "rect" && selectedShape.index === i) {
            const hs = 12 / zoom;
            const handles = [
              { x: r.x, y: r.y }, { x: r.x + r.width, y: r.y },
              { x: r.x, y: r.y + r.height }, { x: r.x + r.width, y: r.y + r.height },
              { x: r.x + r.width / 2, y: r.y }, { x: r.x + r.width / 2, y: r.y + r.height },
              { x: r.x, y: r.y + r.height / 2 }, { x: r.x + r.width, y: r.y + r.height / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitFrame = (() => {
        for (let i = frames.length - 1; i >= 0; i--) {
          const f = frames[i];
          const x2 = f.x + f.width;
          const y2 = f.y + f.height;
          if (
            point.x >= f.x &&
            point.x <= x2 &&
            point.y >= f.y &&
            point.y <= y2
          ) {
            return i;
          }
          // Check handles if selected
          if (selectedShape?.kind === "frame" && selectedShape.index === i) {
            const hs = 12 / zoom;
            const handles = [
              { x: f.x + f.width, y: f.y + f.height },
              { x: f.x + f.width / 2, y: f.y },
              { x: f.x + f.width / 2, y: f.y + f.height },
              { x: f.x, y: f.y + f.height / 2 },
              { x: f.x + f.width, y: f.y + f.height / 2 },
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) {
              return i;
            }
          }
        }
        return null;
      })();

      const hitConnector = (() => {
        for (let i = connectors.length - 1; i >= 0; i--) {
          const c = connectors[i];
          const fromPt = getAnchorPoint(c.from);
          const toPt = getAnchorPoint(c.to);
          if (!fromPt || !toPt) continue;
          if (
            distToSegment(
              point.x,
              point.y,
              fromPt.x,
              fromPt.y,
              toPt.x,
              toPt.y
            ) <=
            6 / zoom
          ) {
            return i;
          }
        }
        return null;
      })();

      const hitPoly = (() => {
        for (let i = polygons.length - 1; i >= 0; i--) {
          const p = polygons[i];
          const x2 = p.x + p.width;
          const y2 = p.y + p.height;
          if (
            point.x >= p.x &&
            point.x <= x2 &&
            point.y >= p.y &&
            point.y <= y2
          ) {
            return i;
          }
          // Check handles if selected
          if (selectedShape?.kind === "poly" && selectedShape.index === i) {
            const pad = 4 / zoom;
            const hs = 16 / zoom; // Generous hit area for handles
            const x = p.x - pad;
            const y = p.y - pad;
            const w = p.width + pad * 2;
            const h = p.height + pad * 2;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h },
              { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) {
              return i;
            }
          }
        }
        return null;
      })();

      let picked: {
        kind:
        | "image"
        | "text"
        | "circle"
        | "rect"
        | "frame"
        | "connector"
        | "line"
        | "arrow"
        | "poly";
        index: number;
      } | null = null;
      // Check elements first (topmost priority), then frames last
      // This allows elements inside frames to be selected before the frame itself
      if (hitImage != null) picked = { kind: "image", index: hitImage };
      else if (hitText != null) picked = { kind: "text", index: hitText };
      else if (hitCircle != null) picked = { kind: "circle", index: hitCircle };
      else if (hitPoly != null) picked = { kind: "poly", index: hitPoly };
      else if (hitLine != null) picked = { kind: "line", index: hitLine };
      else if (hitArrowShape != null)
        picked = { kind: "arrow", index: hitArrowShape };
      else if (hitRect != null) picked = { kind: "rect", index: hitRect };
      else if (hitConnector != null)
        picked = { kind: "connector", index: hitConnector };
      else if (hitFrame != null) picked = { kind: "frame", index: hitFrame };

      if (picked) {
        let workingPicked = picked;
        if (event.altKey) {
          const dup = duplicateForDrag(picked);
          if (dup) workingPicked = dup;
        }

        setSelectedShape(workingPicked);
        pointerStartRef.current = { x: point.x, y: point.y };

        if (workingPicked.kind === "rect") {
          const r = rectangles[workingPicked.index];
          const handleSize = 14 / zoom;
          const pad = 4 / zoom;
          const x = r.x - pad;
          const y = r.y - pad;
          const w = r.width + pad * 2;
          const h = r.height + pad * 2;

          const corners = [
            { x: x, y: y, sx: -1, sy: -1 },
            { x: x + w, y: y, sx: 1, sy: -1 },
            { x: x, y: y + h, sx: -1, sy: 1 },
            { x: x + w, y: y + h, sx: 1, sy: 1 },
          ];
          const edges = [
            { x: x + w / 2, y: y, sx: 0, sy: -1, mode: "resize-rect-v" as const },
            { x: x + w / 2, y: y + h, sx: 0, sy: 1, mode: "resize-rect-v" as const },
            { x: x, y: y + h / 2, sx: -1, sy: 0, mode: "resize-rect-h" as const },
            { x: x + w, y: y + h / 2, sx: 1, sy: 0, mode: "resize-rect-h" as const },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize / 2 &&
              Math.abs(point.y - c.y) <= handleSize / 2
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize / 2 &&
              Math.abs(point.y - e.y) <= handleSize / 2
          );

          dragRectStartRef.current = { ...r };
          dragRectCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-br"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "circle") {
          const c = circles[workingPicked.index];
          const handleSize = 12 / zoom;
          const pad = 4 / zoom;
          const corners = [
            { x: c.x - c.rx - pad, y: c.y - c.ry - pad, sx: -1, sy: -1 },
            { x: c.x + c.rx + pad, y: c.y - c.ry - pad, sx: 1, sy: -1 },
            { x: c.x - c.rx - pad, y: c.y + c.ry + pad, sx: -1, sy: 1 },
            { x: c.x + c.rx + pad, y: c.y + c.ry + pad, sx: 1, sy: 1 },
          ];
          const edges = [
            {
              x: c.x,
              y: c.y - c.ry - pad,
              sx: 0,
              sy: -1,
              mode: "resize-circle-v" as const,
            },
            {
              x: c.x,
              y: c.y + c.ry + pad,
              sx: 0,
              sy: 1,
              mode: "resize-circle-v" as const,
            },
            {
              x: c.x - c.rx - pad,
              y: c.y,
              sx: -1,
              sy: 0,
              mode: "resize-circle-h" as const,
            },
            {
              x: c.x + c.rx + pad,
              y: c.y,
              sx: 1,
              sy: 0,
              mode: "resize-circle-h" as const,
            },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize &&
              Math.abs(point.y - c.y) <= handleSize
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize &&
              Math.abs(point.y - e.y) <= handleSize
          );

          dragCircleStartRef.current = { ...c };
          dragCircleCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-circle"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "image") {
          const im = images[workingPicked.index];
          const handleSize = 14 / zoom;
          const pad = 4 / zoom;
          const x = im.x - pad;
          const y = im.y - pad;
          const w = im.width + pad * 2;
          const h = im.height + pad * 2;

          const corners = [
            { x: x, y: y, sx: -1, sy: -1 },
            { x: x + w, y: y, sx: 1, sy: -1 },
            { x: x, y: y + h, sx: -1, sy: 1 },
            { x: x + w, y: y + h, sx: 1, sy: 1 },
          ];
          const edges = [
            { x: x + w / 2, y: y, sx: 0, sy: -1, mode: "resize-image-v" as const },
            { x: x + w / 2, y: y + h, sx: 0, sy: 1, mode: "resize-image-v" as const },
            { x: x, y: y + h / 2, sx: -1, sy: 0, mode: "resize-image-h" as const },
            { x: x + w, y: y + h / 2, sx: 1, sy: 0, mode: "resize-image-h" as const },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize / 2 &&
              Math.abs(point.y - c.y) <= handleSize / 2
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize / 2 &&
              Math.abs(point.y - e.y) <= handleSize / 2
          );

          dragImageStartRef.current = {
            ...im,
            aspect: im.width !== 0 ? im.width / im.height : 1,
          };
          dragImageCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-image"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "text") {
          const t = texts[workingPicked.index];
          const handleSize = 14 / zoom;
          const pad = 4 / zoom;
          const x = t.x - pad;
          const y = t.y - pad;
          const w = t.width + pad * 2;
          const h = t.height + pad * 2;

          const corners = [
            { x: x, y: y, sx: -1, sy: -1 },
            { x: x + w, y: y, sx: 1, sy: -1 },
            { x: x, y: y + h, sx: -1, sy: 1 },
            { x: x + w, y: y + h, sx: 1, sy: 1 },
          ];
          const edges = [
            { x: x + w / 2, y: y, sx: 0, sy: -1, mode: "resize-text-v" as const },
            { x: x + w / 2, y: y + h, sx: 0, sy: 1, mode: "resize-text-v" as const },
            { x: x, y: y + h / 2, sx: -1, sy: 0, mode: "resize-text-h" as const },
            { x: x + w, y: y + h / 2, sx: 1, sy: 0, mode: "resize-text-h" as const },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize / 2 &&
              Math.abs(point.y - c.y) <= handleSize / 2
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize / 2 &&
              Math.abs(point.y - e.y) <= handleSize / 2
          );

          dragTextStartRef.current = { ...t };
          dragTextCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-text"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "frame") {
          const f = frames[workingPicked.index];
          const handleSize = 14 / zoom;
          const pad = 4 / zoom;
          const x = f.x - pad;
          const y = f.y - pad;
          const w = f.width + pad * 2;
          const h = f.height + pad * 2;

          const corners = [
            { x: x, y: y, sx: -1, sy: -1 },
            { x: x + w, y: y, sx: 1, sy: -1 },
            { x: x, y: y + h, sx: -1, sy: 1 },
            { x: x + w, y: y + h, sx: 1, sy: 1 },
          ];
          const edges = [
            { x: x + w / 2, y: y, sx: 0, sy: -1, mode: "resize-frame-v" as const },
            { x: x + w / 2, y: y + h, sx: 0, sy: 1, mode: "resize-frame-v" as const },
            { x: x, y: y + h / 2, sx: -1, sy: 0, mode: "resize-frame-h" as const },
            { x: x + w, y: y + h / 2, sx: 1, sy: 0, mode: "resize-frame-h" as const },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize / 2 &&
              Math.abs(point.y - c.y) <= handleSize / 2
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize / 2 &&
              Math.abs(point.y - e.y) <= handleSize / 2
          );

          dragFrameStartRef.current = { ...f };
          dragFrameCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-frame"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "poly") {
          const p = polygons[workingPicked.index];
          const handleSize = 12 / zoom;
          const pad = 4 / zoom;
          const left = p.x - pad;
          const top = p.y - pad;
          const w = p.width + pad * 2;
          const h = p.height + pad * 2;

          const corners = [
            { x: left, y: top, sx: -1, sy: -1 },
            { x: left + w, y: top, sx: 1, sy: -1 },
            { x: left, y: top + h, sx: -1, sy: 1 },
            { x: left + w, y: top + h, sx: 1, sy: 1 },
          ];
          const edges = [
            {
              x: left + w / 2,
              y: top,
              sx: 0,
              sy: -1,
              mode: "resize-rect-v" as const,
            },
            {
              x: left + w / 2,
              y: top + h,
              sx: 0,
              sy: 1,
              mode: "resize-rect-v" as const,
            },
            {
              x: left,
              y: top + h / 2,
              sx: -1,
              sy: 0,
              mode: "resize-rect-h" as const,
            },
            {
              x: left + w,
              y: top + h / 2,
              sx: 1,
              sy: 0,
              mode: "resize-rect-h" as const,
            },
          ];
          const hitCorner = corners.find(
            (c) =>
              Math.abs(point.x - c.x) <= handleSize &&
              Math.abs(point.y - c.y) <= handleSize
          );
          const hitEdge = edges.find(
            (e) =>
              Math.abs(point.x - e.x) <= handleSize &&
              Math.abs(point.y - e.y) <= handleSize
          );

          dragPolyStartRef.current = { ...p };
          dragRectCornerRef.current = hitCorner
            ? { sx: hitCorner.sx, sy: hitCorner.sy }
            : hitEdge
              ? { sx: hitEdge.sx, sy: hitEdge.sy }
              : null;
          dragModeRef.current = hitCorner
            ? "resize-br"
            : hitEdge
              ? hitEdge.mode
              : "move";
        } else if (workingPicked.kind === "line") {
          const l = lines[workingPicked.index];
          const handleSize = 10 / zoom;
          const handles = [
            { x: l.x1, y: l.y1, anchor: "start" as const },
            { x: l.x2, y: l.y2, anchor: "end" as const },
          ];
          const hitHandle = handles.find(
            (h) =>
              Math.abs(point.x - h.x) <= handleSize &&
              Math.abs(point.y - h.y) <= handleSize
          );
          dragLineStartRef.current = { ...l };
          dragRectCornerRef.current = hitHandle
            ? {
              sx: hitHandle.anchor === "start" ? -1 : 1,
              sy: hitHandle.anchor === "start" ? -1 : 1,
            }
            : null;
          dragModeRef.current = hitHandle ? "resize-line" : "move";
        } else if (workingPicked.kind === "arrow") {
          const l = arrows[workingPicked.index];
          const handleSize = 10 / zoom;
          const handles = [
            { x: l.x1, y: l.y1, anchor: "start" as const },
            { x: l.x2, y: l.y2, anchor: "end" as const },
          ];
          const hitHandle = handles.find(
            (h) =>
              Math.abs(point.x - h.x) <= handleSize &&
              Math.abs(point.y - h.y) <= handleSize
          );
          dragArrowStartRef.current = { ...l };
          dragRectCornerRef.current = hitHandle
            ? {
              sx: hitHandle.anchor === "start" ? -1 : 1,
              sy: hitHandle.anchor === "start" ? -1 : 1,
            }
            : null;
          dragModeRef.current = hitHandle ? "resize-arrow" : "move";
        }

        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        return;
      } else {
        // begin marquee selection
        selectionStartRef.current = point;
        setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        setSelectedShape(null);
        return;
      }
    }

    if (tool === "Eraser") {
      isErasingRef.current = true;
      eraseAtPoint(point);
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
      return;
    }

    if (tool === "Hand") {
      startPan(event, false);
      return;
    }

    if (tool === "Rectangle") {
      const point = toCanvasPoint(event);
      rectStartRef.current = point;
      isDrawingRectRef.current = true;
      setCurrentRect({ x: point.x, y: point.y, width: 0, height: 0 });
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Circle") {
      const point = toCanvasPoint(event);
      circleStartRef.current = point;
      isDrawingCircleRef.current = true;
      setCurrentCircle({ x: point.x, y: point.y, rx: 0, ry: 0 });
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Line") {
      const point = toCanvasPoint(event);
      isDrawingLineRef.current = true;
      setCurrentLine({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Arrow") {
      const point = toCanvasPoint(event);
      const tolerance = 12 / zoom;
      const startAnchor =
        hoverAnchor ||
        anchorHandles.find(
          (h) =>
            Math.hypot(point.x - h.point.x, point.y - h.point.y) <= tolerance
        );

      if (startAnchor) {
        setPendingConnector({
          from: {
            kind: startAnchor.kind,
            shapeId: startAnchor.shapeId,
            anchor: startAnchor.anchor,
            percent: startAnchor.percent ?? 0.5,
          },
          previewPoint: startAnchor.point,
        });
      } else {
        isDrawingArrowRef.current = true;
        setCurrentArrow({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
      }
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Pencil") {
      const point = toCanvasPoint(event);
      isDrawingPathRef.current = true;
      setCurrentPath({ points: [point] });
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Frame") {
      const point = toCanvasPoint(event);
      rectStartRef.current = point;
      isDrawingFrameRef.current = true;
      setCurrentFrame({ x: point.x, y: point.y, width: 0, height: 0 });
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    if (tool === "Text") {
      const point = toCanvasPoint(event);
      const fontSize = 18;
      setTextEditor({
        canvasX: point.x,
        canvasY: point.y,
        value: "",
        fontSize,
        index: null,
      });
      setSelectedShape(null);
      return;
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = toCanvasPoint(event);

    const tool = pointerToolRef.current || resolveTool();

    // Hand tool: keep cursor stable to grab/grabbing
    if (tool === "Hand") {
      setCursorStyle(isHandPanning ? "grabbing" : "grab");
    }

    if (tool === "Arrow") {
      const tolerance = 14 / zoom;
      const borderTolerance = 20 / zoom;
      let nearest: {
        kind: ShapeKind;
        shapeId: string;
        anchor: AnchorSide;
        point: { x: number; y: number };
        percent?: number;
      } | null = null;
      let bestDist = tolerance;

      // 1. Check fixed handles first
      for (const h of anchorHandles) {
        const d = Math.hypot(point.x - h.point.x, point.y - h.point.y);
        if (d <= bestDist) {
          bestDist = d;
          nearest = h;
        }
      }

      // 2. If no fixed handle, check border proximity
      if (!nearest) {
        const allShapes = [
          ...rectangles.map(s => ({ ...s, kind: "rect" as const })),
          ...images.map(s => ({ ...s, kind: "image" as const })),
          ...texts.map(s => ({ ...s, kind: "text" as const })),
          ...frames.map(s => ({ ...s, kind: "frame" as const })),
          ...polygons.map(s => ({ ...s, kind: "poly" as const })),
        ];

        for (const s of allShapes) {
          const dx = point.x - s.x;
          const dy = point.y - s.y;

          // Check if near any of the 4 edges
          const distTop = Math.abs(point.y - s.y);
          const distBottom = Math.abs(point.y - (s.y + s.height));
          const distLeft = Math.abs(point.x - s.x);
          const distRight = Math.abs(point.x - (s.x + s.width));

          const inX = point.x >= s.x - borderTolerance && point.x <= s.x + s.width + borderTolerance;
          const inY = point.y >= s.y - borderTolerance && point.y <= s.y + s.height + borderTolerance;

          if (inX && distTop <= borderTolerance) {
            const p = Math.max(0, Math.min(1, (point.x - s.x) / s.width));
            nearest = { kind: s.kind, shapeId: s.id, anchor: "top", percent: p, point: { x: s.x + s.width * p, y: s.y } };
            break;
          }
          if (inX && distBottom <= borderTolerance) {
            const p = Math.max(0, Math.min(1, (point.x - s.x) / s.width));
            nearest = { kind: s.kind, shapeId: s.id, anchor: "bottom", percent: p, point: { x: s.x + s.width * p, y: s.y + s.height } };
            break;
          }
          if (inY && distLeft <= borderTolerance) {
            const p = Math.max(0, Math.min(1, (point.y - s.y) / s.height));
            nearest = { kind: s.kind, shapeId: s.id, anchor: "left", percent: p, point: { x: s.x, y: s.y + s.height * p } };
            break;
          }
          if (inY && distRight <= borderTolerance) {
            const p = Math.max(0, Math.min(1, (point.y - s.y) / s.height));
            nearest = { kind: s.kind, shapeId: s.id, anchor: "right", percent: p, point: { x: s.x + s.width, y: s.y + s.height * p } };
            break;
          }
        }
      }

      // 3. Circle virtual anchors
      if (!nearest) {
        for (const c of circles) {
          const dx = point.x - c.x;
          const dy = point.y - c.y;
          const distFromCenter = Math.hypot(dx, dy);
          const toleranceSq = 20 / zoom;

          // Check if mouse is near the perimeter
          const avgR = (c.rx + c.ry) / 2;
          if (Math.abs(distFromCenter - avgR) <= toleranceSq) {
            const angle = Math.atan2(dy, dx);
            const deg = (angle * 180) / Math.PI;

            // Map angle to nearest AnchorSide
            let side: AnchorSide = "right";
            if (deg > -45 && deg <= 45) side = "right";
            else if (deg > 45 && deg <= 135) side = "bottom";
            else if (deg > 135 || deg <= -135) side = "left";
            else side = "top";

            nearest = {
              kind: "circle",
              shapeId: c.id,
              anchor: side,
              point: {
                x: c.x + c.rx * Math.cos(angle),
                y: c.y + c.ry * Math.sin(angle),
              }
            };
            break;
          }
        }
      }

      setHoverAnchor(nearest);
      if (pendingConnector) {
        setPendingConnector((prev) =>
          prev
            ? {
              ...prev,
              previewPoint: nearest ? nearest.point : point,
            }
            : null
        );
      }
    } else if (hoverAnchor) {
      setHoverAnchor(null);
    }

    // Update cursor based on hover state (only in Select mode when not dragging)
    if (
      tool === "Select" &&
      ((tool === "Select" && !dragModeRef.current) ||
        dragModeRef.current === "none")
    ) {
      let newCursor = "default";

      if (selectedShape) {
        if (selectedShape.kind === "rect") {
          const r = rectangles[selectedShape.index];
          if (r) {
            const handleSize = 14 / zoom;
            const pad = 4 / zoom;
            const x = r.x - pad;
            const y = r.y - pad;
            const w = r.width + pad * 2;
            const h = r.height + pad * 2;

            const corners = [
              { x: x, y: y, cursor: "nw-resize" },
              { x: x + w, y: y, cursor: "ne-resize" },
              { x: x, y: y + h, cursor: "sw-resize" },
              { x: x + w, y: y + h, cursor: "se-resize" },
            ];
            const edges = [
              { x: x + w / 2, y: y, cursor: "n-resize" },
              { x: x + w / 2, y: y + h, cursor: "s-resize" },
              { x: x, y: y + h / 2, cursor: "w-resize" },
              { x: x + w, y: y + h / 2, cursor: "e-resize" },
            ];
            const hitCorner = corners.find(
              (c) =>
                Math.abs(point.x - c.x) <= handleSize / 2 &&
                Math.abs(point.y - c.y) <= handleSize / 2
            );
            const hitEdge = edges.find(
              (e) =>
                Math.abs(point.x - e.x) <= handleSize / 2 &&
                Math.abs(point.y - e.y) <= handleSize / 2
            );
            if (hitCorner) {
              newCursor = hitCorner.cursor;
            } else if (hitEdge) {
              newCursor = hitEdge.cursor;
            } else if (
              point.x >= r.x &&
              point.x <= r.x + r.width &&
              point.y >= r.y &&
              point.y <= r.y + r.height
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "circle") {
          const c = circles[selectedShape.index];
          if (c) {
            const handleSize = 12 / zoom;
            const pad = 4 / zoom;
            const corners = [
              { x: c.x - c.rx - pad, y: c.y - c.ry - pad, cursor: "nw-resize" },
              { x: c.x + c.rx + pad, y: c.y - c.ry - pad, cursor: "ne-resize" },
              { x: c.x - c.rx - pad, y: c.y + c.ry + pad, cursor: "sw-resize" },
              { x: c.x + c.rx + pad, y: c.y + c.ry + pad, cursor: "se-resize" },
            ];
            const edges = [
              { x: c.x, y: c.y - c.ry - pad, cursor: "n-resize" },
              { x: c.x, y: c.y + c.ry + pad, cursor: "s-resize" },
              { x: c.x - c.rx - pad, y: c.y, cursor: "w-resize" },
              { x: c.x + c.rx + pad, y: c.y, cursor: "e-resize" },
            ];
            const hitCorner = corners.find(
              (corner) =>
                Math.abs(point.x - corner.x) <= handleSize &&
                Math.abs(point.y - corner.y) <= handleSize
            );
            const hitEdge = edges.find(
              (edge) =>
                Math.abs(point.x - edge.x) <= handleSize &&
                Math.abs(point.y - edge.y) <= handleSize
            );
            if (hitCorner) {
              newCursor = hitCorner.cursor;
            } else if (hitEdge) {
              newCursor = hitEdge.cursor;
            } else {
              const dx = point.x - c.x;
              const dy = point.y - c.y;
              const norm =
                (dx * dx) / (c.rx * c.rx) + (dy * dy) / (c.ry * c.ry);
              if (norm <= 1.05) {
                newCursor = "move";
              }
            }
          }
        } else if (selectedShape.kind === "image") {
          const im = images[selectedShape.index];
          if (im) {
            const handleSize = 14 / zoom;
            const pad = 4 / zoom;
            const x = im.x - pad;
            const y = im.y - pad;
            const w = im.width + pad * 2;
            const h = im.height + pad * 2;

            const handles = [
              { x: x, y: y, cursor: "nw-resize" },
              { x: x + w, y: y, cursor: "ne-resize" },
              { x: x, y: y + h, cursor: "sw-resize" },
              { x: x + w, y: y + h, cursor: "se-resize" },
              { x: x + w / 2, y: y, cursor: "n-resize" },
              { x: x + w / 2, y: y + h, cursor: "s-resize" },
              { x: x, y: y + h / 2, cursor: "w-resize" },
              { x: x + w, y: y + h / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize / 2 &&
                Math.abs(point.y - h.y) <= handleSize / 2
            );
            if (hitHandle) {
              newCursor = hitHandle.cursor;
            } else if (
              point.x >= im.x &&
              point.x <= im.x + im.width &&
              point.y >= im.y &&
              point.y <= im.y + im.height
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "text") {
          const t = texts[selectedShape.index];
          if (t) {
            const handleSize = 14 / zoom;
            const pad = 4 / zoom;
            const x = t.x - pad;
            const y = t.y - pad;
            const w = t.width + pad * 2;
            const h = t.height + pad * 2;

            const handles = [
              { x: x, y: y, cursor: "nw-resize" },
              { x: x + w, y: y, cursor: "ne-resize" },
              { x: x, y: y + h, cursor: "sw-resize" },
              { x: x + w, y: y + h, cursor: "se-resize" },
              { x: x + w / 2, y: y, cursor: "n-resize" },
              { x: x + w / 2, y: y + h, cursor: "s-resize" },
              { x: x, y: y + h / 2, cursor: "w-resize" },
              { x: x + w, y: y + h / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize / 2 &&
                Math.abs(point.y - h.y) <= handleSize / 2
            );
            if (hitHandle) {
              newCursor = hitHandle.cursor;
            } else if (
              point.x >= t.x &&
              point.x <= t.x + t.width &&
              point.y >= t.y &&
              point.y <= t.y + t.height
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "frame") {
          const f = frames[selectedShape.index];
          if (f) {
            const handleSize = 14 / zoom;
            const pad = 4 / zoom;
            const x = f.x - pad;
            const y = f.y - pad;
            const w = f.width + pad * 2;
            const h = f.height + pad * 2;

            const handles = [
              { x: x, y: y, cursor: "nw-resize" },
              { x: x + w, y: y, cursor: "ne-resize" },
              { x: x, y: y + h, cursor: "sw-resize" },
              { x: x + w, y: y + h, cursor: "se-resize" },
              { x: x + w / 2, y: y, cursor: "n-resize" },
              { x: x + w / 2, y: y + h, cursor: "s-resize" },
              { x: x, y: y + h / 2, cursor: "w-resize" },
              { x: x + w, y: y + h / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize / 2 &&
                Math.abs(point.y - h.y) <= handleSize / 2
            );
            if (hitHandle) {
              newCursor = hitHandle.cursor;
            } else if (
              point.x >= f.x &&
              point.x <= f.x + f.width &&
              point.y >= f.y &&
              point.y <= f.y + f.height
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "line") {
          const l = lines[selectedShape.index];
          if (l) {
            const handleSize = 10 / zoom;
            const handles = [
              { x: l.x1, y: l.y1 },
              { x: l.x2, y: l.y2 },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
            );
            if (hitHandle) {
              newCursor = "crosshair";
            } else if (
              distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <=
              6 / zoom
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "arrow") {
          const l = arrows[selectedShape.index];
          if (l) {
            const handleSize = 10 / zoom;
            const handles = [
              { x: l.x1, y: l.y1 },
              { x: l.x2, y: l.y2 },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
            );
            if (hitHandle) {
              newCursor = "crosshair";
            } else if (
              distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <=
              6 / zoom
            ) {
              newCursor = "move";
            }
          }
        } else if (selectedShape.kind === "poly") {
          const p = polygons[selectedShape.index];
          if (p) {
            const handleSize = 10 / zoom;
            const pad = 4 / zoom;
            const left = p.x - pad;
            const top = p.y - pad;
            const w = p.width + pad * 2;
            const h = p.height + pad * 2;
            const handles = [
              { x: left, y: top, cursor: "nw-resize" },
              { x: left + w, y: top, cursor: "ne-resize" },
              { x: left, y: top + h, cursor: "sw-resize" },
              { x: left + w, y: top + h, cursor: "se-resize" },
              { x: left + w / 2, y: top, cursor: "n-resize" },
              { x: left + w / 2, y: top + h, cursor: "s-resize" },
              { x: left, y: top + h / 2, cursor: "w-resize" },
              { x: left + w, y: top + h / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
            );
            if (hitHandle) {
              newCursor = hitHandle.cursor;
            } else if (
              point.x >= p.x &&
              point.x <= p.x + p.width &&
              point.y >= p.y &&
              point.y <= p.y + p.height
            ) {
              newCursor = "move";
            }
          }
        }
      }

      setCursorStyle(newCursor);
    } else if (tool === "Hand") {
      setCursorStyle(isHandPanning ? "grabbing" : "grab");
    } else if (tool === "Text") {
      setCursorStyle("text");
    } else if (tool === "Eraser") {
      setCursorStyle("crosshair");
    } else {
      setCursorStyle("crosshair");
    }

    if (tool === "Eraser") {
      if (isErasingRef.current) {
        eraseAtPoint(point);
      }
      return;
    }

    if (tool === "Select" && selectedShape) {
      if (dragModeRef.current === "move") {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        if (selectedShape.kind === "rect" && dragRectStartRef.current) {
          const base = dragRectStartRef.current;
          setRectangles((prev) =>
            prev.map((r, idx) =>
              idx === selectedShape.index
                ? { ...r, x: base.x + dx, y: base.y + dy }
                : r
            )
          );
        } else if (
          selectedShape.kind === "circle" &&
          dragCircleStartRef.current
        ) {
          const base = dragCircleStartRef.current;
          setCircles((prev) =>
            prev.map((c, idx) =>
              idx === selectedShape.index
                ? { ...c, x: base.x + dx, y: base.y + dy }
                : c
            )
          );
        } else if (
          selectedShape.kind === "image" &&
          dragImageStartRef.current
        ) {
          const base = dragImageStartRef.current;
          setImages((prev) =>
            prev.map((im, idx) =>
              idx === selectedShape.index
                ? { ...im, x: base.x + dx, y: base.y + dy }
                : im
            )
          );
        } else if (selectedShape.kind === "text" && dragTextStartRef.current) {
          const base = dragTextStartRef.current;
          setTexts((prev) =>
            prev.map((t, idx) =>
              idx === selectedShape.index
                ? { ...t, x: base.x + dx, y: base.y + dy }
                : t
            )
          );
        } else if (
          selectedShape.kind === "frame" &&
          dragFrameStartRef.current
        ) {
          const base = dragFrameStartRef.current;
          setFrames((prev) =>
            prev.map((f, idx) =>
              idx === selectedShape.index
                ? { ...f, x: base.x + dx, y: base.y + dy }
                : f
            )
          );
        } else if (selectedShape.kind === "poly" && dragPolyStartRef.current) {
          const base = dragPolyStartRef.current;
          setPolygons((prev) =>
            prev.map((p, idx) =>
              idx === selectedShape.index
                ? { ...p, x: base.x + dx, y: base.y + dy }
                : p
            )
          );
        } else if (selectedShape.kind === "line" && dragLineStartRef.current) {
          const base = dragLineStartRef.current;
          setLines((prev) =>
            prev.map((l, idx) =>
              idx === selectedShape.index
                ? {
                  ...l,
                  x1: base.x1 + dx,
                  y1: base.y1 + dy,
                  x2: base.x2 + dx,
                  y2: base.y2 + dy,
                }
                : l
            )
          );
        } else if (
          selectedShape.kind === "arrow" &&
          dragArrowStartRef.current
        ) {
          const base = dragArrowStartRef.current;
          setArrows((prev) =>
            prev.map((l, idx) =>
              idx === selectedShape.index
                ? {
                  ...l,
                  x1: base.x1 + dx,
                  y1: base.y1 + dy,
                  x2: base.x2 + dx,
                  y2: base.y2 + dy,
                }
                : l
            )
          );
        }
        return;
      }

      if (
        (dragModeRef.current === "resize-br" ||
          dragModeRef.current === "resize-rect-h" ||
          dragModeRef.current === "resize-rect-v") &&
        dragRectStartRef.current
      ) {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const base = dragRectStartRef.current;
        const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
        const minSize = 4 / zoom;
        const effectiveSx =
          dragModeRef.current === "resize-rect-v" ? 0 : corner.sx;
        const effectiveSy =
          dragModeRef.current === "resize-rect-h" ? 0 : corner.sy;
        const newWidth = Math.max(
          minSize,
          base.width + dx * (effectiveSx === 0 ? 0 : effectiveSx)
        );
        const newHeight = Math.max(
          minSize,
          base.height + dy * (effectiveSy === 0 ? 0 : effectiveSy)
        );
        const newX =
          effectiveSx < 0 ? base.x + (base.width - newWidth) : base.x;
        const newY =
          effectiveSy < 0 ? base.y + (base.height - newHeight) : base.y;
        setRectangles((prev) =>
          prev.map((r, idx) =>
            idx === selectedShape.index
              ? { ...r, x: newX, y: newY, width: newWidth, height: newHeight }
              : r
          )
        );
        return;
      }

      if (
        (dragModeRef.current === "resize-circle" ||
          dragModeRef.current === "resize-circle-h" ||
          dragModeRef.current === "resize-circle-v") &&
        dragCircleStartRef.current
      ) {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const corner = dragCircleCornerRef.current ?? { sx: 1, sy: 1 };
        const minR = 2 / zoom;
        const effectiveSx =
          dragModeRef.current === "resize-circle-v" ? 0 : corner.sx;
        const effectiveSy =
          dragModeRef.current === "resize-circle-h" ? 0 : corner.sy;
        let newRx = Math.max(
          minR,
          dragCircleStartRef.current.rx +
          dx * (effectiveSx === 0 ? 0 : effectiveSx)
        );
        let newRy = Math.max(
          minR,
          dragCircleStartRef.current.ry +
          dy * (effectiveSy === 0 ? 0 : effectiveSy)
        );
        if (event.shiftKey) {
          const m = Math.max(newRx, newRy);
          newRx = m;
          newRy = m;
        }
        setCircles((prev) =>
          prev.map((c, idx) =>
            idx === selectedShape.index ? { ...c, rx: newRx, ry: newRy } : c
          )
        );
        return;
      }

      if (
        (dragModeRef.current === "resize-image" ||
          dragModeRef.current === "resize-image-h" ||
          dragModeRef.current === "resize-image-v") &&
        dragImageStartRef.current
      ) {
        const base = dragImageStartRef.current;
        const corner = dragImageCornerRef.current ?? { sx: 1, sy: 1 };
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        let newW =
          dragModeRef.current === "resize-image-v"
            ? base.width
            : base.width + dx * corner.sx;
        let newH =
          dragModeRef.current === "resize-image-h"
            ? base.height
            : base.height + dy * corner.sy;
        const minSize = 4 / zoom;
        newW = Math.max(minSize, newW);
        newH = Math.max(minSize, newH);
        if (
          event.shiftKey &&
          dragModeRef.current === "resize-image" &&
          base.aspect
        ) {
          const aspect = base.aspect || 1;
          if (newW / newH > aspect) {
            newW = newH * aspect;
          } else {
            newH = newW / aspect;
          }
        }
        const newX = corner.sx < 0 ? base.x + (base.width - newW) : base.x;
        const newY = corner.sy < 0 ? base.y + (base.height - newH) : base.y;
        setImages((prev) =>
          prev.map((im, idx) =>
            idx === selectedShape.index
              ? { ...im, x: newX, y: newY, width: newW, height: newH }
              : im
          )
        );
        return;
      }

      if (
        (dragModeRef.current === "resize-text" ||
          dragModeRef.current === "resize-text-h" ||
          dragModeRef.current === "resize-text-v") &&
        dragTextStartRef.current
      ) {
        const base = dragTextStartRef.current;
        const corner = dragTextCornerRef.current ?? { sx: 1, sy: 1 };
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        let newW =
          dragModeRef.current === "resize-text-v"
            ? base.width
            : base.width + dx * corner.sx;
        let newH =
          dragModeRef.current === "resize-text-h"
            ? base.height
            : base.height + dy * corner.sy;
        const minSize = 6 / zoom;
        newW = Math.max(minSize, newW);
        newH = Math.max(minSize, newH);
        const scaleY = newH / base.height;
        const scaleX = newW / base.width;
        let newFont: number;
        if (dragModeRef.current === "resize-text-h") {
          newFont = Math.max(8, base.fontSize * scaleX);
        } else if (dragModeRef.current === "resize-text-v") {
          newFont = Math.max(8, base.fontSize * scaleY);
        } else {
          newFont = Math.max(8, base.fontSize * scaleY);
          if (event.shiftKey) {
            const aspect = base.width / base.height || 1;
            if (newW / newH > aspect) {
              newW = newH * aspect;
            } else {
              newH = newW / aspect;
            }
            newFont = Math.max(8, (newH / base.height) * base.fontSize);
          }
        }
        const measured = measureText(base.text, newFont);
        const newX =
          corner.sx < 0 ? base.x + (base.width - measured.width) : base.x;
        const newY =
          corner.sy < 0 ? base.y + (base.height - measured.height) : base.y;
        setTexts((prev) =>
          prev.map((t, idx) =>
            idx === selectedShape.index
              ? {
                ...t,
                x: newX,
                y: newY,
                fontSize: newFont,
                width: measured.width,
                height: measured.height,
              }
              : t
          )
        );
        return;
      }

      if (
        (dragModeRef.current === "resize-frame" ||
          dragModeRef.current === "resize-frame-h" ||
          dragModeRef.current === "resize-frame-v") &&
        dragFrameStartRef.current
      ) {
        const base = dragFrameStartRef.current;
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const corner = dragFrameCornerRef.current ?? { sx: 1, sy: 1 };
        const minSize = 8 / zoom;
        const newW =
          dragModeRef.current === "resize-frame-v"
            ? Math.max(minSize, base.width)
            : Math.max(minSize, base.width + dx * corner.sx);
        const newH =
          dragModeRef.current === "resize-frame-h"
            ? Math.max(minSize, base.height)
            : Math.max(minSize, base.height + dy * corner.sy);
        const newX = corner.sx < 0 ? base.x + (base.width - newW) : base.x;
        const newY = corner.sy < 0 ? base.y + (base.height - newH) : base.y;
        setFrames((prev) =>
          prev.map((f, idx) =>
            idx === selectedShape.index
              ? { ...f, x: newX, y: newY, width: newW, height: newH }
              : f
          )
        );
        return;
      }

      if (
        (dragModeRef.current === "resize-br" ||
          dragModeRef.current === "resize-rect-h" ||
          dragModeRef.current === "resize-rect-v") &&
        dragPolyStartRef.current &&
        selectedShape.kind === "poly"
      ) {
        const base = dragPolyStartRef.current;
        const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const minSize = 4 / zoom;
        const effectiveSx =
          dragModeRef.current === "resize-rect-v" ? 0 : corner.sx;
        const effectiveSy =
          dragModeRef.current === "resize-rect-h" ? 0 : corner.sy;

        const newW = Math.max(minSize, base.width + dx * effectiveSx);
        const newH = Math.max(minSize, base.height + dy * effectiveSy);

        const newX = effectiveSx < 0 ? base.x + (base.width - newW) : base.x;
        const newY = effectiveSy < 0 ? base.y + (base.height - newH) : base.y;

        setPolygons((prev) =>
          prev.map((p, idx) =>
            idx === selectedShape.index
              ? { ...p, x: newX, y: newY, width: newW, height: newH }
              : p
          )
        );
        return;
      }

      if (dragModeRef.current === "resize-line" && dragLineStartRef.current) {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const base = dragLineStartRef.current;
        const startSelected = (dragRectCornerRef.current?.sx || 1) < 0;
        const newLine = startSelected
          ? { ...base, x1: base.x1 + dx, y1: base.y1 + dy }
          : { ...base, x2: base.x2 + dx, y2: base.y2 + dy };
        setLines((prev) =>
          prev.map((l, idx) => (idx === selectedShape?.index ? newLine : l))
        );
        return;
      }

      if (dragModeRef.current === "resize-arrow" && dragArrowStartRef.current) {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        const base = dragArrowStartRef.current;
        const startSelected = (dragRectCornerRef.current?.sx || 1) < 0;
        const newArrow = startSelected
          ? { ...base, x1: base.x1 + dx, y1: base.y1 + dy }
          : { ...base, x2: base.x2 + dx, y2: base.y2 + dy };
        setArrows((prev) =>
          prev.map((l, idx) => (idx === selectedShape?.index ? newArrow : l))
        );
        return;
      }
    }

    if (tool === "Select" && selectionStartRef.current && selectionRect) {
      const start = selectionStartRef.current;
      const width = point.x - start.x;
      const height = point.y - start.y;
      setSelectionRect({
        x: start.x,
        y: start.y,
        width,
        height,
      });
      return;
    }

    if (isPanningRef.current && (tool === "Hand" || tempPanRef.current)) {
      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx / zoom,
        y: panStartRef.current.y + dy / zoom,
      });
      return;
    }

    if (tool === "Rectangle" && isDrawingRectRef.current) {
      const dx = point.x - rectStartRef.current.x;
      const dy = point.y - rectStartRef.current.y;
      let width = dx;
      let height = dy;
      if (event.shiftKey) {
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        width = dx >= 0 ? size : -size;
        height = dy >= 0 ? size : -size;
      }
      setCurrentRect({
        x: rectStartRef.current.x,
        y: rectStartRef.current.y,
        width,
        height,
      });
    }

    if (tool === "Circle" && isDrawingCircleRef.current) {
      const start = circleStartRef.current;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      let rx = Math.max(1 / zoom, Math.abs(dx));
      let ry = Math.max(1 / zoom, Math.abs(dy));
      if (event.shiftKey) {
        const m = Math.max(rx, ry);
        rx = m;
        ry = m;
      }
      setCurrentCircle({ x: start.x, y: start.y, rx, ry });
    }

    if (tool === "Line" && isDrawingLineRef.current) {
      const snapStart = currentLine;
      const dx = snapStart ? point.x - snapStart.x1 : 0;
      const dy = snapStart ? point.y - snapStart.y1 : 0;
      let x2 = point.x;
      let y2 = point.y;
      if (event.shiftKey && snapStart) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          y2 = snapStart.y1; // horizontal
        } else {
          x2 = snapStart.x1; // vertical
        }
      }
      setCurrentLine((prev) =>
        prev
          ? {
            ...prev,
            x2,
            y2,
          }
          : null
      );
    }

    if (tool === "Arrow" && isDrawingArrowRef.current) {
      const snapStart = currentArrow;
      const dx = snapStart ? point.x - snapStart.x1 : 0;
      const dy = snapStart ? point.y - snapStart.y1 : 0;
      let x2 = point.x;
      let y2 = point.y;
      if (event.shiftKey && snapStart) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          y2 = snapStart.y1;
        } else {
          x2 = snapStart.x1;
        }
      }
      setCurrentArrow((prev) =>
        prev
          ? {
            ...prev,
            x2,
            y2,
          }
          : null
      );
    }

    if (tool === "Pencil" && isDrawingPathRef.current) {
      setCurrentPath((prev) => {
        if (!prev) return null;
        const last = prev.points[prev.points.length - 1];
        let x = point.x;
        let y = point.y;
        if (event.shiftKey && last) {
          const dx = x - last.x;
          const dy = y - last.y;
          if (Math.abs(dx) >= Math.abs(dy)) {
            y = last.y; // horizontal snap
          } else {
            x = last.x; // vertical snap
          }
        }
        return { points: [...prev.points, { x, y }] };
      });
    }

    if (tool === "Frame" && isDrawingFrameRef.current) {
      const dx = point.x - rectStartRef.current.x;
      const dy = point.y - rectStartRef.current.y;
      let width = dx;
      let height = dy;
      if (event.shiftKey) {
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        width = dx >= 0 ? size : -size;
        height = dy >= 0 ? size : -size;
      }
      setCurrentFrame({
        x: rectStartRef.current.x,
        y: rectStartRef.current.y,
        width,
        height,
      });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const tool = pointerToolRef.current || resolveTool();
    pointerToolRef.current = "";

    if (tool === "Select" && selectionRect && selectionStartRef.current) {
      const normalizeRect = (r: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => {
        const nx = r.width < 0 ? r.x + r.width : r.x;
        const ny = r.height < 0 ? r.y + r.height : r.y;
        return {
          x: nx,
          y: ny,
          width: Math.abs(r.width),
          height: Math.abs(r.height),
        };
      };
      const intersects = (
        rectA: { x: number; y: number; width: number; height: number },
        rectB: { x: number; y: number; width: number; height: number }
      ) =>
        rectA.x <= rectB.x + rectB.width &&
        rectA.x + rectA.width >= rectB.x &&
        rectA.y <= rectB.y + rectB.height &&
        rectA.y + rectA.height >= rectB.y;

      const box = normalizeRect(selectionRect);

      const findIntersecting = () => {
        // Topmost priority order
        for (let i = images.length - 1; i >= 0; i--) {
          const im = images[i];
          const r = { x: im.x, y: im.y, width: im.width, height: im.height };
          if (intersects(box, r)) return { kind: "image" as const, index: i };
        }
        for (let i = texts.length - 1; i >= 0; i--) {
          const t = texts[i];
          const r = { x: t.x, y: t.y, width: t.width, height: t.height };
          if (intersects(box, r)) return { kind: "text" as const, index: i };
        }
        for (let i = circles.length - 1; i >= 0; i--) {
          const c = circles[i];
          const r = {
            x: c.x - c.rx,
            y: c.y - c.ry,
            width: c.rx * 2,
            height: c.ry * 2,
          };
          if (intersects(box, r)) return { kind: "circle" as const, index: i };
        }
        for (let i = lines.length - 1; i >= 0; i--) {
          const l = lines[i];
          const minX = Math.min(l.x1, l.x2);
          const maxX = Math.max(l.x1, l.x2);
          const minY = Math.min(l.y1, l.y2);
          const maxY = Math.max(l.y1, l.y2);
          const r = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
          if (intersects(box, r)) return { kind: "line" as const, index: i };
        }
        for (let i = arrows.length - 1; i >= 0; i--) {
          const l = arrows[i];
          const minX = Math.min(l.x1, l.x2);
          const maxX = Math.max(l.x1, l.x2);
          const minY = Math.min(l.y1, l.y2);
          const maxY = Math.max(l.y1, l.y2);
          const r = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
          if (intersects(box, r)) return { kind: "arrow" as const, index: i };
        }
        for (let i = rectangles.length - 1; i >= 0; i--) {
          const r = rectangles[i];
          const rect = { x: r.x, y: r.y, width: r.width, height: r.height };
          if (intersects(box, rect)) return { kind: "rect" as const, index: i };
        }
        for (let i = polygons.length - 1; i >= 0; i--) {
          const p = polygons[i];
          const r = { x: p.x, y: p.y, width: p.width, height: p.height };
          if (intersects(box, r)) return { kind: "poly" as const, index: i };
        }
        for (let i = frames.length - 1; i >= 0; i--) {
          const f = frames[i];
          const r = { x: f.x, y: f.y, width: f.width, height: f.height };
          if (intersects(box, r)) return { kind: "frame" as const, index: i };
        }
        return null;
      };

      const picked = findIntersecting();
      setSelectedShape(picked);
      selectionStartRef.current = null;
      setSelectionRect(null);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      return;
    }

    if (tool === "Select" && selectedShape) {
      if (dragModeRef.current !== "none") {
        pushHistory();
        dragModeRef.current = "none";
        dragRectStartRef.current = null;
        dragCircleStartRef.current = null;
        dragRectCornerRef.current = null;
        dragCircleCornerRef.current = null;
        dragImageStartRef.current = null;
        dragImageCornerRef.current = null;
        dragTextStartRef.current = null;
        dragTextCornerRef.current = null;
        dragFrameStartRef.current = null;
        dragPolyStartRef.current = null;
        dragFrameCornerRef.current = null;
        dragLineStartRef.current = null;
        dragArrowStartRef.current = null;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        return;
      }
    }

    if (tool === "Eraser") {
      isErasingRef.current = false;
      pushHistory();
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      return;
    }

    if (isPanningRef.current && (tool === "Hand" || tempPanRef.current)) {
      isPanningRef.current = false;
      tempPanRef.current = false;
      setIsHandPanning(false);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      return;
    }

    if (tool === "Rectangle" && isDrawingRectRef.current && currentRect) {
      // Only add rectangle if it has meaningful size
      if (Math.abs(currentRect.width) > 1 || Math.abs(currentRect.height) > 1) {
        // Normalize rectangle coordinates
        const normalizedRect = {
          id: makeId(),
          x:
            currentRect.width < 0
              ? currentRect.x + currentRect.width
              : currentRect.x,
          y:
            currentRect.height < 0
              ? currentRect.y + currentRect.height
              : currentRect.y,
          width: Math.abs(currentRect.width),
          height: Math.abs(currentRect.height),
        };
        setRectangles((prev) => {
          const next = [...prev, normalizedRect];
          pushHistory({ rectangles: next });
          return next;
        });
      }
      setCurrentRect(null);
      isDrawingRectRef.current = false;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    if (tool === "Circle" && isDrawingCircleRef.current && currentCircle) {
      if (currentCircle.rx > 1 && currentCircle.ry > 1) {
        setCircles((prev) => {
          const next = [...prev, { ...currentCircle, id: makeId() }];
          pushHistory({ circles: next });
          return next;
        });
      }
      setCurrentCircle(null);
      isDrawingCircleRef.current = false;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    if (tool === "Line" && isDrawingLineRef.current && currentLine) {
      if (
        Math.hypot(
          currentLine.x2 - currentLine.x1,
          currentLine.y2 - currentLine.y1
        ) > 1
      ) {
        setLines((prev) => {
          const next = [...prev, { ...currentLine, id: makeId() }];
          pushHistory({ lines: next });
          return next;
        });
      }
      setCurrentLine(null);
      isDrawingLineRef.current = false;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    if (tool === "Arrow") {
      if (pendingConnector) {
        const endAnchor = hoverAnchor;
        if (
          endAnchor &&
          !(
            endAnchor.kind === pendingConnector.from.kind &&
            endAnchor.shapeId === pendingConnector.from.shapeId &&
            endAnchor.anchor === pendingConnector.from.anchor
          )
        ) {
          const next: Connector = {
            id: makeId(),
            from: pendingConnector.from,
            to: {
              kind: endAnchor.kind,
              shapeId: endAnchor.shapeId,
              anchor: endAnchor.anchor,
              percent: endAnchor.percent ?? 0.5,
            },
          };
          setConnectors((prev) => {
            const updated = [...prev, next];
            pushHistory({ connectors: updated });
            return updated;
          });
        }
        setPendingConnector(null);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        return;
      }

      if (isDrawingArrowRef.current && currentArrow) {
        if (
          Math.hypot(
            currentArrow.x2 - currentArrow.x1,
            currentArrow.y2 - currentArrow.y1
          ) > 1
        ) {
          setArrows((prev) => {
            const next = [...prev, { ...currentArrow, id: makeId() }];
            pushHistory({ arrows: next });
            return next;
          });
        }
        setCurrentArrow(null);
        isDrawingArrowRef.current = false;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
        return;
      }
    }

    if (tool === "Pencil" && isDrawingPathRef.current && currentPath) {
      if (currentPath.points.length > 1) {
        setPaths((prev) => {
          const next = [...prev, { ...currentPath, id: makeId() }];
          pushHistory({ paths: next });
          return next;
        });
      }
      setCurrentPath(null);
      isDrawingPathRef.current = false;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    if (tool === "Frame" && isDrawingFrameRef.current && currentFrame) {
      // Only add frame if it has meaningful size
      if (
        Math.abs(currentFrame.width) > 2 ||
        Math.abs(currentFrame.height) > 2
      ) {
        // Normalize frame coordinates
        const normalizedFrame = {
          id: makeId(),
          x:
            currentFrame.width < 0
              ? currentFrame.x + currentFrame.width
              : currentFrame.x,
          y:
            currentFrame.height < 0
              ? currentFrame.y + currentFrame.height
              : currentFrame.y,
          width: Math.abs(currentFrame.width),
          height: Math.abs(currentFrame.height),
          frameNumber: frames.length + 1,
        };
        setFrames((prev) => {
          const next = [...prev, normalizedFrame];
          pushHistory({ frames: next });
          return next;
        });
      }
      setCurrentFrame(null);
      isDrawingFrameRef.current = false;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    if (tool === "Text" && dragTextStartRef.current) {
      pushHistory();
      dragModeRef.current = "none";
      dragTextStartRef.current = null;
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations (world space)
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw shapes (translated world space)

    const drawImageItem = (
      im: { src: string; x: number; y: number; width: number; height: number },
      alpha = 1,
      isSelected = false
    ) => {
      let tag = imageCacheRef.current[im.src];
      if (!tag) {
        tag = new Image();
        tag.onload = () => {
          imageCacheRef.current[im.src] = tag;
          setRerenderTick((t) => t + 1);
        };
        tag.onerror = () => {
          imageCacheRef.current[im.src] = tag;
          setRerenderTick((t) => t + 1);
        };
        tag.src = im.src;
        imageCacheRef.current[im.src] = tag;
      }
      if (tag.complete && tag.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(tag, im.x, im.y, im.width, im.height);
        if (isSelected) {
          const pad = 4 / zoom;
          const handleSize = 8 / zoom;
          const stroke = "rgba(83,182,255,0.9)";
          const x = im.x - pad;
          const y = im.y - pad;
          const w = im.width + pad * 2;
          const h = im.height + pad * 2;

          ctx.strokeStyle = stroke;
          ctx.lineWidth = 1.6 / zoom;
          ctx.setLineDash([]);
          ctx.strokeRect(x, y, w, h);

          const handles = [
            { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
            { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h },
            { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
          ];
          ctx.fillStyle = stroke;
          handles.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.rect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
            ctx.fill();
          });
        }
        ctx.restore();
      }
    };

    const drawText = (
      t: {
        x: number;
        y: number;
        text: string;
        fontSize: number;
        width: number;
        height: number;
      },
      alpha = 1,
      isSelected = false
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${t.fontSize}px sans-serif`;
      ctx.fillStyle = themeText;
      ctx.textBaseline = "top";
      const lines = t.text.split("\n");
      const lineHeight = t.fontSize * 1.2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, t.x, t.y + idx * lineHeight);
      });

      if (isSelected) {
        const pad = 4 / zoom;
        const handleSize = 8 / zoom;
        const stroke = "rgba(83,182,255,0.9)";
        const x = t.x - pad;
        const y = t.y - pad;
        const w = t.width + pad * 2;
        const h = t.height + pad * 2;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.6 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, w, h);

        const handles = [
          { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
          { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h },
          { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
        ];
        ctx.fillStyle = stroke;
        handles.forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.rect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize);
          ctx.fill();
        });
      }

      ctx.restore();
    };

    const drawRect = (
      r: { x: number; y: number; width: number; height: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      const x = r.width < 0 ? r.x + r.width : r.x;
      const y = r.height < 0 ? r.y + r.height : r.y;
      const width = Math.abs(r.width);
      const height = Math.abs(r.height);

      ctx.strokeStyle = isSelected
        ? `rgba(83,182,255,0.9)`
        : themeStroke;
      ctx.lineWidth = isSelected ? 1.5 / zoom : 2 / zoom;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      if (isSelected) {
        const pad = 4 / zoom;
        const handleSize = 8 / zoom;
        const stroke = "rgba(83,182,255,0.9)";
        const sx = x - pad;
        const sy = y - pad;
        const sw = width + pad * 2;
        const sh = height + pad * 2;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.6 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(sx, sy, sw, sh);

        const handles = [
          { x: sx, y: sy }, { x: sx + sw, y: sy }, { x: sx, y: sy + sh }, { x: sx + sw, y: sy + sh },
          { x: sx + sw / 2, y: sy }, { x: sx + sw / 2, y: sy + sh },
          { x: sx, y: sy + sh / 2 }, { x: sx + sw, y: sy + sh / 2 }
        ];
        ctx.fillStyle = stroke;
        handles.forEach((h) => {
          ctx.beginPath();
          ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          ctx.fill();
        });
      }

      ctx.restore();
    };

    const drawFrame = (
      f: {
        x: number;
        y: number;
        width: number;
        height: number;
        frameNumber: number;
      },
      alpha = 1,
      isSelected = false
    ) => {
      ctx.save();

      // Normalize frame coordinates
      const x = f.width < 0 ? f.x + f.width : f.x;
      const y = f.height < 0 ? f.y + f.height : f.y;
      const width = Math.abs(f.width);
      const height = Math.abs(f.height);
      const radius = 12 / zoom; // Rounded corners

      // Helper function to draw rounded rectangle
      const drawRoundedRect = (
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

      // Draw background with semi-transparent white
      ctx.fillStyle = themeFrameBg;
      drawRoundedRect(x, y, width, height, radius);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isSelected
        ? `rgba(180,220,255,${0.9 * alpha})`
        : themeStroke;
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash(isSelected ? [4 / zoom, 4 / zoom] : []);
      drawRoundedRect(x, y, width, height, radius);
      ctx.stroke();

      // Draw frame label above the frame
      ctx.fillStyle = themeText;
      ctx.font = `${11 / zoom}px sans-serif`;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(`Frame ${f.frameNumber}`, x, y - 4 / zoom);

      if (isSelected) {
        const pad = 4 / zoom;
        const handleSize = 8 / zoom;
        const stroke = "rgba(83,182,255,0.9)";
        const sx = x - pad;
        const sy = y - pad;
        const sw = width + pad * 2;
        const sh = height + pad * 2;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.6 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(sx, sy, sw, sh);

        const handles = [
          { x: sx, y: sy }, { x: sx + sw, y: sy }, { x: sx, y: sy + sh }, { x: sx + sw, y: sy + sh },
          { x: sx + sw / 2, y: sy }, { x: sx + sw / 2, y: sy + sh },
          { x: sx, y: sy + sh / 2 }, { x: sx + sw, y: sy + sh / 2 }
        ];
        ctx.fillStyle = stroke;
        handles.forEach((h) => {
          ctx.beginPath();
          ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
          ctx.fill();
        });
      }

      ctx.restore();
    };

    const drawCircle = (
      c: { x: number; y: number; rx: number; ry: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      ctx.strokeStyle = isSelected
        ? "rgba(83,182,255,0.9)"
        : themeStroke;
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (isSelected) {
        // draw bounding box + corner handles similar to common design tools
        const pad = 4 / zoom;
        const left = c.x - c.rx - pad;
        const top = c.y - c.ry - pad;
        const width = c.rx * 2 + pad * 2;
        const height = c.ry * 2 + pad * 2;
        const handleSize = 8 / zoom;
        const stroke = "rgba(83,182,255,0.9)";
        const handleFill = "rgba(83,182,255,1)";

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(left, top, width, height);

        const corners = [
          { x: left, y: top },
          { x: left + width, y: top },
          { x: left, y: top + height },
          { x: left + width, y: top + height },
        ];
        const edges = [
          { x: left + width / 2, y: top },
          { x: left + width / 2, y: top + height },
          { x: left, y: top + height / 2 },
          { x: left + width, y: top + height / 2 },
        ];
        ctx.fillStyle = handleFill;
        [...corners, ...edges].forEach((pt) => {
          ctx.beginPath();
          ctx.rect(
            pt.x - handleSize / 2,
            pt.y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fill();
        });
      }

      ctx.restore();
    };

    const drawPoly = (p: PolyShape, alpha = 0.9, isSelected = false) => {
      ctx.save();
      const { x, y, width, height, type } = p;
      ctx.strokeStyle = isSelected
        ? `rgba(83,182,255,0.9)`
        : themeStroke;
      ctx.lineWidth = isSelected ? 2.4 / zoom : 2 / zoom;
      ctx.setLineDash([]);
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
      } else if (type === "Parallelo...") {
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
        const out = width / 2;
        const inn = width / 4;
        for (let i = 0; i < 10; i++) {
          const ang = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? out : inn;
          if (i === 0)
            ctx.moveTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
          else ctx.lineTo(cx + r * Math.cos(ang), cy + r * Math.sin(ang));
        }
        ctx.closePath();
      } else if (type === "Cylinder") {
        const rh = height * 0.15;
        ctx.ellipse(x + width / 2, y + rh, width / 2, rh, 0, 0, Math.PI * 2);
        ctx.moveTo(x, y + rh);
        ctx.lineTo(x, y + height - rh);
        ctx.ellipse(
          x + width / 2,
          y + height - rh,
          width / 2,
          rh,
          0,
          0,
          Math.PI,
          false
        );
        ctx.lineTo(x + width, y + rh);
      } else if (type === "Document") {
        const c = Math.min(width, height) * 0.2;
        ctx.moveTo(x, y);
        ctx.lineTo(x + width - c, y);
        ctx.lineTo(x + width, y + c);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + width - c, y);
        ctx.lineTo(x + width - c, y + c);
        ctx.lineTo(x + width, y + c);
      }

      ctx.stroke();

      if (isSelected) {
        const pad = 4 / zoom;
        const left = x - pad;
        const top = y - pad;
        const totalW = width + pad * 2;
        const totalH = height + pad * 2;
        const hs = 8 / zoom;
        const stroke = "rgba(83,182,255,0.9)";
        const hf = "rgba(83,182,255,1)";

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.6 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(left, top, totalW, totalH);

        const handles = [
          { cx: left, cy: top },
          { cx: left + totalW, cy: top },
          { cx: left, cy: top + totalH },
          { cx: left + totalW, cy: top + totalH },
          { cx: left + totalW / 2, cy: top },
          { cx: left + totalW / 2, cy: top + totalH },
          { cx: left, cy: top + totalH / 2 },
          { cx: left + totalW, cy: top + totalH / 2 },
        ];
        ctx.fillStyle = hf;
        handles.forEach((h) => {
          ctx.beginPath();
          ctx.rect(h.cx - hs / 2, h.cy - hs / 2, hs, hs);
          ctx.fill();
        });
      }
      ctx.restore();
    };

    const drawLine = (
      l: { x1: number; y1: number; x2: number; y2: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      ctx.strokeStyle = isSelected
        ? "rgba(83,182,255,0.9)"
        : themeStroke;
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      if (isSelected) {
        const handleSize = 7 / zoom;
        ctx.fillStyle = "rgba(83,182,255,1)";
        [
          { x: l.x1, y: l.y1 },
          { x: l.x2, y: l.y2 },
        ].forEach((h) => {
          ctx.beginPath();
          ctx.rect(
            h.x - handleSize / 2,
            h.y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fill();
        });
      }
      ctx.restore();
    };

    const drawArrow = (
      l: { x1: number; y1: number; x2: number; y2: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      ctx.strokeStyle = isSelected
        ? "rgba(83,182,255,0.9)"
        : themeStroke;
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();

      // arrowhead
      const angle = Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
      const size = 8 / zoom;
      ctx.beginPath();
      ctx.moveTo(l.x2, l.y2);
      ctx.lineTo(
        l.x2 - size * Math.cos(angle - Math.PI / 6),
        l.y2 - size * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        l.x2 - size * Math.cos(angle + Math.PI / 6),
        l.y2 - size * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = isSelected
        ? "rgba(83,182,255,0.9)"
        : themeStroke;
      ctx.fill();
      if (isSelected) {
        const handleSize = 7 / zoom;
        ctx.fillStyle = "rgba(83,182,255,1)";
        [
          { x: l.x1, y: l.y1 },
          { x: l.x2, y: l.y2 },
        ].forEach((h) => {
          ctx.beginPath();
          ctx.rect(
            h.x - handleSize / 2,
            h.y - handleSize / 2,
            handleSize,
            handleSize
          );
          ctx.fill();
        });
      }
      ctx.restore();
    };

    const drawConnector = (
      fromPt: { x: number; y: number },
      toPt: { x: number; y: number },
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

      const strokeColor = options?.highlight ? "rgba(83,182,255,1)" : themeStroke;
      ctx.strokeStyle = strokeColor;
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
          if (isInternal(elbow, options?.fromBounds) || isInternal(elbow, options?.toBounds)) {
            points.push({ x: p1.x, y: p3.y });
          } else {
            points.push(elbow);
          }
        } else {
          const midX = (p1.x + p3.x) / 2;
          const elbow1 = { x: midX, y: p1.y };
          const elbow2 = { x: midX, y: p3.y };
          if (isInternal(elbow1, options?.fromBounds) || isInternal(elbow2, options?.fromBounds) ||
            isInternal(elbow1, options?.toBounds) || isInternal(elbow2, options?.toBounds)) {
            const side = fromPt.y < (options?.fromBounds ? options.fromBounds.y + options.fromBounds.height / 2 : p1.y) ? -1 : 1;
            const safeY = (options?.fromBounds ? (side < 0 ? options.fromBounds.y - offset : options.fromBounds.y + options.fromBounds.height + offset) : p1.y);
            points.push({ x: p1.x, y: safeY });
            points.push({ x: p3.x, y: safeY });
          } else {
            points.push(elbow1);
            points.push(elbow2);
          }
        }
      } else if (fromDir.y !== 0) {
        if (toDir.x !== 0) {
          const elbow = { x: p1.x, y: p3.y };
          if (isInternal(elbow, options?.fromBounds) || isInternal(elbow, options?.toBounds)) {
            points.push({ x: p3.x, y: p1.y });
          } else {
            points.push(elbow);
          }
        } else {
          const midY = (p1.y + p3.y) / 2;
          const elbow1 = { x: p1.x, y: midY };
          const elbow2 = { x: p3.x, y: midY };
          if (isInternal(elbow1, options?.fromBounds) || isInternal(elbow2, options?.fromBounds) ||
            isInternal(elbow1, options?.toBounds) || isInternal(elbow2, options?.toBounds)) {
            const side = fromPt.x < (options?.fromBounds ? options.fromBounds.x + options.fromBounds.width / 2 : p1.x) ? -1 : 1;
            const safeX = (options?.fromBounds ? (side < 0 ? options.fromBounds.x - offset : options.fromBounds.x + options.fromBounds.width + offset) : p1.x);
            points.push({ x: safeX, y: p1.y });
            points.push({ x: safeX, y: p3.y });
          } else {
            points.push(elbow1);
            points.push(elbow2);
          }
        }
      } else {
        points.push({ x: fromPt.x, y: toPt.y });
      }

      if (toDir.x !== 0 || toDir.y !== 0) points.push(p3);
      points.push(p4);

      const cornerRadius = 10 / zoom;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const pPrev = points[i - 1];
        const pCurrent = points[i];
        const pNext = points[i + 1];
        const d1 = Math.hypot(pCurrent.x - pPrev.x, pCurrent.y - pPrev.y);
        const d2 = Math.hypot(pNext.x - pCurrent.x, pNext.y - pCurrent.y);
        const actualRadius = Math.min(cornerRadius, d1 / 2, d2 / 2);
        ctx.arcTo(pCurrent.x, pCurrent.y, pNext.x, pNext.y, actualRadius);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();

      const lastP = points[points.length - 1];
      const prevP = points[points.length - 2] || points[0];
      const angle = Math.atan2(lastP.y - prevP.y, lastP.x - prevP.x);
      const size = 10 / zoom;
      ctx.save();
      ctx.translate(lastP.x, lastP.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size, -size * 0.5);
      ctx.lineTo(-size, size * 0.5);
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.fill();
      ctx.restore();
      ctx.restore();
    };

    const drawPath = (
      p: { points: { x: number; y: number }[] },
      alpha = 0.8
    ) => {
      if (p.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = themeStroke;
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(p.points[0].x, p.points[0].y);
      for (let i = 1; i < p.points.length; i++) {
        ctx.lineTo(p.points[i].x, p.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    };

    images.forEach((im, idx) =>
      drawImageItem(
        im,
        1,
        selectedShape?.kind === "image" && selectedShape.index === idx
      )
    );

    rectangles.forEach((r, idx) =>
      drawRect(
        r,
        0.9,
        selectedShape?.kind === "rect" && selectedShape.index === idx
      )
    );
    circles.forEach((c, idx) =>
      drawCircle(
        c,
        0.9,
        selectedShape?.kind === "circle" && selectedShape.index === idx
      )
    );
    polygons.forEach((p, idx) =>
      drawPoly(
        p,
        0.9,
        selectedShape?.kind === "poly" && selectedShape.index === idx
      )
    );
    lines.forEach((l, idx) =>
      drawLine(
        l,
        0.9,
        selectedShape?.kind === "line" && selectedShape.index === idx
      )
    );
    arrows.forEach((l, idx) =>
      drawArrow(
        l,
        0.9,
        selectedShape?.kind === "arrow" && selectedShape.index === idx
      )
    );
    connectors.forEach((c, idx) => {
      const fromPt = getAnchorPoint(c.from);
      const toPt = getAnchorPoint(c.to);
      if (!fromPt || !toPt) return;
      drawConnector(fromPt, toPt, {
        fromAnchor: c.from.anchor,
        toAnchor: c.to.anchor,
        fromBounds: getShapeBounds(c.from) || undefined,
        toBounds: getShapeBounds(c.to) || undefined,
        highlight:
          selectedShape?.kind === "connector" && selectedShape.index === idx,
      });
    });
    paths.forEach((p) => drawPath(p, 0.9));
    texts.forEach((t, idx) => {
      if (textEditor?.index === idx) return; // hide canvas text while editing inline
      drawText(
        t,
        0.9,
        selectedShape?.kind === "text" && selectedShape.index === idx
      );
    });
    frames.forEach((f, idx) =>
      drawFrame(
        f,
        1,
        selectedShape?.kind === "frame" && selectedShape.index === idx
      )
    );

    if (currentRect) {
      drawRect(currentRect, 0.6, false);
    }
    if (currentCircle) {
      drawCircle(currentCircle, 0.6, false);
    }
    if (currentLine) {
      drawLine(currentLine, 0.6);
    }
    if (currentArrow) {
      drawArrow(currentArrow, 0.6);
    }
    if (currentPath) {
      drawPath(currentPath, 0.6);
    }
    if (pendingConnector) {
      const fromPt = getAnchorPoint(pendingConnector.from);
      if (fromPt) {
        drawConnector(fromPt, pendingConnector.previewPoint, {
          highlight: true,
          fromAnchor: pendingConnector.from.anchor,
          toAnchor: hoverAnchor?.anchor,
          fromBounds: getShapeBounds(pendingConnector.from) || undefined,
        });
      }
    }
    if (currentFrame) {
      // Draw frame preview with dashed border
      ctx.save();
      const x =
        currentFrame.width < 0
          ? currentFrame.x + currentFrame.width
          : currentFrame.x;
      const y =
        currentFrame.height < 0
          ? currentFrame.y + currentFrame.height
          : currentFrame.y;
      const width = Math.abs(currentFrame.width);
      const height = Math.abs(currentFrame.height);
      const radius = 12 / zoom;

      // Draw background preview
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Draw dashed border
      ctx.strokeStyle = "rgba(156, 163, 175, 0.8)";
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([4 / zoom, 4 / zoom]);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    // no live text in-flight; text is added immediately

    ctx.restore();
  }, [
    rectangles,
    circles,
    connectors,
    getAnchorPoint,
    lines,
    arrows,
    paths,
    polygons,
    images,
    texts,
    frames,
    currentRect,
    currentCircle,
    currentLine,
    currentArrow,
    currentPath,
    pendingConnector,
    currentFrame,
    zoom,
    pan,
    selectedShape,
    rerenderTick,
    resolvedTheme,
    themeStroke,
    themeText,
    themeFrameBg,
  ]);

  const getCursor = () => {
    if (isHandPanning || tempPanRef.current || isSpacePanning)
      return "cursor-grabbing";
    if (activeTool === "Hand" || isSpacePanning) return "cursor-grab";
    if (
      activeTool === "Rectangle" ||
      activeTool === "Circle" ||
      activeTool === "Line" ||
      activeTool === "Arrow" ||
      activeTool === "Eraser" ||
      activeTool === "Frame"
    ) {
      if (activeTool === "Eraser") {
        return "cursor-cell";
      }
      return "cursor-crosshair";
    }
    return "cursor-default";
  };

  useEffect(() => {
    // Keep cursor accurate when switching tools without moving the pointer
    if (isHandPanning || isSpacePanning) {
      setCursorStyle("grabbing");
    } else if (activeTool === "Hand") {
      setCursorStyle("grab");
    } else {
      setCursorStyle("default");
    }
  }, [activeTool, isHandPanning, isSpacePanning]);
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const zoomPercent = Math.round(zoom * 100);
  const selectionOverlayStyle = useMemo(() => {
    if (!selectionRect) return undefined;
    const normX =
      selectionRect.width < 0
        ? selectionRect.x + selectionRect.width
        : selectionRect.x;
    const normY =
      selectionRect.height < 0
        ? selectionRect.y + selectionRect.height
        : selectionRect.y;
    const width = Math.abs(selectionRect.width);
    const height = Math.abs(selectionRect.height);
    const topLeft = canvasToClient(normX, normY);
    const bottomRight = canvasToClient(normX + width, normY + height);
    return {
      left: `${topLeft.x}px`,
      top: `${topLeft.y}px`,
      width: `${bottomRight.x - topLeft.x}px`,
      height: `${bottomRight.y - topLeft.y}px`,
    };
  }, [canvasToClient, selectionRect]);

  const anchorHandles = useMemo(() => {
    if (activeTool !== "Arrow") return [];
    const handles: {
      kind: ShapeKind;
      shapeId: string;
      anchor: AnchorSide;
      point: { x: number; y: number };
      percent?: number;
    }[] = [];

    const addRectHandles = (r: { id: string; x: number; y: number; width: number; height: number }, kind: ShapeKind) => {
      (["top", "right", "bottom", "left"] as AnchorSide[]).forEach((side) => {
        handles.push({
          kind,
          shapeId: r.id,
          anchor: side,
          point: getRectAnchor(r, side),
          percent: 0.5
        });
      });
    };

    rectangles.forEach((r) => addRectHandles(r, "rect"));
    images.forEach((im) => addRectHandles(im, "image"));
    texts.forEach((t) => addRectHandles(t, "text"));
    frames.forEach((f) => addRectHandles(f, "frame"));
    polygons.forEach((p) => addRectHandles(p, "poly"));

    circles.forEach((c) => {
      (["top", "right", "bottom", "left"] as AnchorSide[]).forEach((side) => {
        handles.push({
          kind: "circle",
          shapeId: c.id,
          anchor: side,
          point: getCircleAnchor(c, side),
        });
      });
    });
    return handles;
  }, [activeTool, circles, getCircleAnchor, getRectAnchor, rectangles, images, texts, frames, polygons]);

  return (
    <div
      ref={canvasContainerRef}
      className={`relative w-full h-full bg-background overflow-hidden ${getCursor()}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onWheel={handleWheel}
    >
      {textEditor && (
        <textarea
          autoFocus
          value={textEditor.value}
          onChange={(e) => {
            const val = e.target.value;
            const measured = measureText(val, textEditor.fontSize);
            setTextEditor((prev) =>
              prev
                ? {
                  ...prev,
                  value: val,
                  boxWidth: measured.width,
                  boxHeight: measured.height,
                }
                : prev
            );
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitTextEditor();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancelTextEditor();
            }
          }}
          onBlur={commitTextEditor}
          ref={textAreaRef}
          style={{
            position: "absolute",
            left: `${canvasToClient(
              textEditor.canvasX - (textEditor.pad ?? 0),
              textEditor.canvasY - (textEditor.pad ?? 0)
            ).x
              }px`,
            top: `${canvasToClient(
              textEditor.canvasX - (textEditor.pad ?? 0),
              textEditor.canvasY - (textEditor.pad ?? 0)
            ).y
              }px`,
            zIndex: 10,
            width: `${((textEditor.boxWidth ?? 120) +
              (textEditor.pad ?? 4 / zoom) * 2) *
              zoom +
              2
              }px`,
            minWidth: `${20 * zoom}px`,
            height: `${((textEditor.boxHeight ?? textEditor.fontSize * 1.4) +
              (textEditor.pad ?? 4 / zoom) * 2) *
              zoom
              }px`,
            background: "transparent",
            color: "white",
            border: "1.6px solid rgba(63,193,255,0.95)",
            outline: "none",
            borderRadius: 0,
            padding: `${(textEditor.pad ?? 4 / zoom) * zoom}px`,
            fontSize: textEditor.fontSize * zoom,
            fontFamily: "sans-serif",
            lineHeight: `${textEditor.fontSize * 1.2 * zoom}px`,
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre",
            wordBreak: "initial",
          }}
          rows={Math.max(1, textEditor.value.split("\n").length)}
        />
      )}
      {frames.map((frame, idx) => {
        // Position button at top right corner of frame, outside the frame border
        const buttonX = frame.x + frame.width; // Right edge of frame
        const buttonY = frame.y; // Top edge of frame
        const clientPos = canvasToClient(buttonX, buttonY);
        return (
          <div
            key={`frame-button-${idx}`}
            className="absolute pointer-events-auto z-50"
            style={{
              left: `${clientPos.x}px`,
              top: `${clientPos.y}px`,
              transform: `translate(-100%, -100%) scale(${zoom})`,
              transformOrigin: "bottom right",
              paddingBottom: "8px",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement generate design functionality
                console.log(
                  "Generate Design clicked for frame",
                  frame.frameNumber
                );
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 bg-white/8 backdrop-blur-xl border border-white/12 hover:bg-white/12 transition-colors whitespace-nowrap"
              style={{ pointerEvents: "auto" }}
            >
              <Brush size={12} />
              Generate with AI
            </button>
          </div>
        );
      })}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ cursor: cursorStyle }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />

      {activeTool === "Arrow" && (() => {
        const handlesToRender = [...anchorHandles];
        if (hoverAnchor && !anchorHandles.some(h => h.shapeId === hoverAnchor.shapeId && h.anchor === hoverAnchor.anchor && Math.hypot(h.point.x - hoverAnchor.point.x, h.point.y - hoverAnchor.point.y) < 1)) {
          handlesToRender.push(hoverAnchor);
        }

        return handlesToRender.map((h, i) => {
          const pos = canvasToClient(h.point.x, h.point.y);
          const isHover =
            hoverAnchor &&
            hoverAnchor.shapeId === h.shapeId &&
            hoverAnchor.kind === h.kind &&
            hoverAnchor.anchor === h.anchor &&
            Math.hypot(hoverAnchor.point.x - h.point.x, hoverAnchor.point.y - h.point.y) < 2;

          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
                zIndex: isHover ? 20 : 10,
              }}
            >
              <div
                className={`rounded-full shadow-sm transition-all duration-150 ${isHover
                  ? "bg-white border-[2px] border-[#53b6ff] scale-125"
                  : "bg-white/40 border border-white/80"
                  }`}
                style={{
                  width: `${8}px`,
                  height: `${8}px`,
                  boxShadow: isHover
                    ? "0 0 0 6px rgba(83,182,255,0.2)"
                    : "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          );
        });
      })()}

      {selectionRect && selectionOverlayStyle && (
        <div
          className="absolute pointer-events-none border border-blue-400/70 bg-blue-400/10"
          style={selectionOverlayStyle}
        />
      )}

      <div
        onWheel={(e) => e.stopPropagation()}
        className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-card/85 backdrop-blur-md px-2 py-1 shadow-lg border border-border"
      >
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center h-9 w-9 rounded-full transition-all ${canUndo
            ? "text-foreground hover:bg-accent hover:scale-105 active:scale-95"
            : "text-muted-foreground/30 cursor-not-allowed"
            }`}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-border/50" />
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`flex items-center justify-center h-9 w-9 rounded-full transition-all ${canRedo
            ? "text-foreground hover:bg-accent hover:scale-105 active:scale-95"
            : "text-muted-foreground/30 cursor-not-allowed"
            }`}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div
        onWheel={(e) => e.stopPropagation()}
        className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-card/85 backdrop-blur-md px-2 py-1 shadow-lg border border-border"
      >
        <button
          onClick={() => zoomOut()}
          className="flex items-center justify-center h-9 w-9 rounded-full transition-all text-foreground hover:bg-accent hover:scale-105 active:scale-95"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="px-3 text-xs font-bold text-foreground min-w-[68px] text-center">
          {zoomPercent}%
        </div>
        <button
          onClick={() => zoomIn()}
          className="flex items-center justify-center h-9 w-9 rounded-full transition-all text-foreground hover:bg-accent hover:scale-105 active:scale-95"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-border/50" />
        <button
          onClick={fitToScreen}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-foreground hover:bg-accent transition-all active:scale-95 border border-transparent hover:border-border"
          aria-label="Fit to screen"
        >
          <Scan className="h-4 w-4" />
          Fit
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-foreground hover:bg-accent transition-all active:scale-95 border border-transparent hover:border-border"
          aria-label="Reset zoom"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="absolute left-4 top-4 flex items-start gap-4 z-100">
        <div className="flex flex-col items-center rounded-xl bg-card shadow-lg border border-border p-1.5">
          <button
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className={`flex items-center justify-center h-10 w-10 rounded-lg transition-all ${isPlusMenuOpen
              ? "bg-primary text-primary-foreground shadow-md scale-110"
              : "text-foreground hover:bg-accent hover:scale-105 active:scale-95"
              }`}
            aria-label="Add"
          >
            <Plus
              className={`h-5 w-5 transition-transform duration-300 ${isPlusMenuOpen ? "rotate-45" : "rotate-0"
                }`}
            />
          </button>
        </div>

        {/* Popover Menu - Sidebar style */}
        {isPlusMenuOpen && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex flex-col rounded-2xl bg-card shadow-2xl border border-border w-96 overflow-hidden backdrop-blur-xl"
          >
            {/* Search Section */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50 bg-muted/30">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Find icons, shapes, and more..."
                value={iconSearchQuery}
                onChange={(e) => {
                  setIconSearchQuery(e.target.value);
                  setVisibleIconsLimit(60); // Reset limit on search
                }}
                className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>

            <div
              onScroll={(e) => {
                const target = e.currentTarget;
                if (
                  target.scrollTop + target.clientHeight >=
                  target.scrollHeight - 20
                ) {
                  setVisibleIconsLimit((prev) => prev + 60);
                }
              }}
              className="flex-1 overflow-y-auto max-h-150 p-2 space-y-4"
            >
              {plusMenuView === "categories" ? (
                <div className="space-y-4">
                  {/* All Categories Section */}
                  <div className="space-y-1">
                    <div className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                      All Categories
                    </div>

                    <button className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl hover:bg-accent/50 transition-all text-left group">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm transition-transform group-hover:scale-105">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-foreground">
                          AI diagram
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          Generate diagram with natural language
                        </div>
                      </div>
                    </button>

                    {[
                      {
                        id: "code",
                        icon: Binary,
                        title: "Diagram as Code",
                        desc: "Create diagrams using code",
                      },
                      {
                        id: "catalog",
                        icon: LayoutGrid,
                        title: "Diagram Catalog",
                        desc: "A catalog of 100+ Eraser diagrams",
                      },
                      {
                        id: "shape",
                        icon: Shapes,
                        title: "Shape",
                        desc: "Explore our various shapes",
                      },
                      {
                        id: "icon",
                        icon: Smile,
                        title: "Icon",
                        desc: "250+ icons available",
                      },
                      {
                        id: "frame",
                        icon: Monitor,
                        title: "Device Frame",
                        desc: "Phone, tablet, browser frames",
                      },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (item.id === "shape") setPlusMenuView("shape");
                          if (item.id === "icon") setPlusMenuView("icon");
                        }}
                        className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl hover:bg-accent transition-all text-left group"
                      >
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-accent border border-border shadow-sm transition-transform group-hover:scale-110">
                          <item.icon className="h-5 w-5 text-foreground/80 group-hover:text-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-foreground">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {item.desc}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/50 transition-all" />
                      </button>
                    ))}
                  </div>

                  {/* Bottom Quick Actions */}
                  <div className="grid grid-cols-3 gap-3 px-3 pb-3">
                    {[
                      { icon: Maximize, label: "Figure" },
                      { icon: Code, label: "Code" },
                      { icon: ImageIcon, label: "Image" },
                    ].map((action, i) => (
                      <button
                        key={i}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-accent/20 border border-border/50 hover:bg-accent hover:border-border transition-all group shadow-sm active:scale-95"
                      >
                        <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : plusMenuView === "shape" ? (
                <div className="space-y-4">
                  {/* Shape Grid View */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest bg-muted/20">
                      <button
                        onClick={() => setPlusMenuView("categories")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        All Categories
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-foreground">Shape</span>
                    </div>

                    <div className="grid grid-cols-5 gap-y-4 px-2">
                      {[
                        { icon: Square, label: "Rectangle" },
                        { icon: Circle, label: "Ellipse" },
                        { icon: Diamond, label: "Diamond" },
                        { icon: Triangle, label: "Triangle" },
                        { icon: Circle, label: "Oval", stretch: true },
                        { icon: Square, label: "Parallelo...", slant: true },
                        { icon: Square, label: "Trapezoid", trapezoid: true },
                        { icon: Cylinder, label: "Cylinder" },
                        { icon: FileText, label: "Document" },
                        { icon: Hexagon, label: "Hexagon" },
                        { icon: Star, label: "Star" },
                      ].map((shape, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPendingAddShapeLabel(shape.label);
                            setActiveTool("PlusAdd");
                            setIsPlusMenuOpen(false);
                          }}
                          className="flex flex-col items-center gap-2 group p-1"
                        >
                          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-accent/50 border border-border group-hover:bg-accent group-hover:border-primary/50 group-hover:shadow-md transition-all group-active:scale-90">
                            <shape.icon
                              className={`h-5 w-5 text-foreground/70 group-hover:text-primary transition-all ${shape.stretch ? "scale-x-125" : ""
                                } ${shape.slant ? "-skew-x-12" : ""} ${shape.trapezoid
                                  ? "[clip-path:polygon(20%_0%,80%_0%,100%_100%,0%_100%)]"
                                  : ""
                                }`}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                            {shape.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : plusMenuView === "icon" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest bg-muted/20">
                      <button
                        onClick={() => {
                          setPlusMenuView("categories");
                          setPlusMenuSubView(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        All Categories
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-foreground">Icon</span>
                    </div>

                    {!plusMenuSubView && (
                      <div className="space-y-1.5 px-2">
                        {[
                          {
                            id: "custom",
                            icon: Monitor,
                            title: "Custom Icons",
                            desc: "Your team's custom icons",
                          },
                          {
                            id: "general",
                            icon: SmileIcon,
                            title: "General Icon",
                            desc: "250+ icons available",
                          },
                          {
                            id: "tech",
                            icon: Zap,
                            title: "Tech Logo",
                            desc: "Popular tools and libraries",
                            onClick: () => {
                              setPlusMenuSubView("Tech Logo");
                              setPlusMenuView("provider-icons");
                            },
                          },
                          {
                            id: "cloud",
                            icon: Cloud,
                            title: "Cloud Provider Icon",
                            desc: "AWS, Azure, Google Cloud, and more",
                            onClick: () => setPlusMenuView("cloud-icon"),
                          },
                        ].map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (cat.onClick) cat.onClick();
                              else setPlusMenuSubView(cat.id);
                            }}
                            className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl bg-muted/40 border border-border/50 hover:bg-accent hover:border-border transition-all text-left group shadow-sm"
                          >
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-background border border-border shadow-sm group-hover:scale-105 transition-transform">
                              <cat.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-foreground">
                                {cat.title}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {cat.desc}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/50 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}

                    {(!plusMenuSubView || plusMenuSubView === "general") && (
                      <div className="grid grid-cols-5 gap-y-3 px-2 pb-4">
                        {GENERAL_ICONS.map((icon, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5 group p-1">
                            <button
                              onClick={() => {
                                const svg = ReactDOMServer.renderToStaticMarkup(
                                  <icon.icon color="currentColor" size={48} />
                                );
                                const src = `data:image/svg+xml;base64,${btoa(
                                  svg
                                )}`;
                                setPendingAddIcon({ name: icon.name, src });
                                setActiveTool("IconAdd");
                              }}
                              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-accent/50 hover:bg-accent hover:border-primary/50 transition-all shadow-sm active:scale-90 group"
                            >
                              <icon.icon className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
                            </button>
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                              {icon.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : plusMenuView === "provider-icons" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest bg-muted/20 flex-wrap">
                      <button
                        onClick={() => {
                          setPlusMenuView("categories");
                          setPlusMenuSubView(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        All Categories
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <button
                        onClick={() => setPlusMenuView("icon")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Icon
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <button
                        onClick={() => setPlusMenuView("cloud-icon")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cloud
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-foreground">{plusMenuSubView}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-y-3 px-2 pb-4">
                      {isLibraryLoading ? (
                        Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5 animate-pulse p-1">
                            <div className="h-10 w-10 rounded-xl bg-accent/50 border border-border" />
                            <div className="h-2 w-8 bg-accent/30 rounded" />
                          </div>
                        ))
                      ) : (
                        filteredLibraryIcons
                          .slice(0, visibleIconsLimit)
                          .map((path, i) => {
                            const name = path.split("/").pop()?.replace(".svg", "").replace(/_/g, " ") || "icon";
                            return (
                              <div
                                key={i}
                                className="flex flex-col items-center gap-1.5 group"
                              >
                                <button
                                  onClick={() => {
                                    setPendingAddIcon({
                                      name: name,
                                      src: path,
                                    });
                                    setActiveTool("IconAdd");
                                  }}
                                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-accent/50 hover:bg-accent hover:border-primary/50 transition-all shadow-sm overflow-hidden group active:scale-90"
                                >
                                  <img
                                    src={path}
                                    alt={name}
                                    className="h-6 w-6 opacity-70 group-hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                                  />
                                </button>
                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center truncate w-full px-1 transition-colors">
                                  {name}
                                </span>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-widest bg-muted/20">
                      <button
                        onClick={() => setPlusMenuView("categories")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        All Categories
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <button
                        onClick={() => setPlusMenuView("icon")}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Icon
                      </button>
                      <span className="text-muted-foreground/30">/</span>
                      <span className="text-foreground">Cloud</span>
                    </div>

                    <div className="flex flex-col gap-2 px-3 pb-6">
                      {[
                        {
                          name: "AWS",
                          desc: "100+ official icons available",
                          src: "/icons-library/aws-icons/aws-logo.svg",
                        },
                        {
                          name: "Azure",
                          desc: "100+ official icons available",
                          src: "/icons-library/azure-icons/azure-logo.svg",
                        },
                        {
                          name: "Google Cloud",
                          desc: "100+ official icons available",
                          src: "/icons-library/gcp-icons/gcp-logo.svg",
                        },
                        {
                          name: "Kubernetes",
                          desc: "25+ official icons available",
                          src: "/icons-library/kubernetes-icons/k8s-logo.svg",
                        },
                        {
                          name: "Network",
                          desc: "Generic and Cisco icons available",
                          src: null, 
                        },
                        {
                          name: "OCI",
                          desc: "25+ official icons available",
                          src: "/icons-library/oci-icons/oci-logo.svg",
                        },
                      ].map((cloud, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPlusMenuSubView(cloud.name);
                            setPlusMenuView("provider-icons");
                          }}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50 hover:bg-accent hover:border-border transition-all group group-active:scale-[0.98] w-full text-left"
                        >
                          <div className="h-10 w-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {cloud.src ? (
                              <img
                                src={cloud.src}
                                alt={cloud.name}
                                className="max-h-full max-w-full opacity-70 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                              />
                            ) : (
                              <Network className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col min-w-0">
                            <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {cloud.name}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                              {cloud.desc}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t border-border/50">
              <div className="text-[11px] font-bold text-muted-foreground/60">
                {pendingAddIcon
                  ? pendingAddIcon.name
                  : plusMenuView === "categories"
                    ? "DIAGRAM CATALOG"
                    : plusMenuView === "shape"
                      ? "SHAPES"
                      : plusMenuView === "icon"
                        ? plusMenuSubView === "general"
                          ? "GENERAL ICONS"
                          : "CUSTOM ICONS"
                        : plusMenuView === "provider-icons"
                          ? plusMenuSubView.toUpperCase()
                          : "CLOUD PROVIDERS"}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40">
                  <div className="flex items-center bg-muted px-1 rounded border border-border/50">
                    <ArrowUp className="h-2.5 w-2.5" />
                    <ArrowDown className="h-2.5 w-2.5" />
                  </div>
                  <span>NAVIGATE</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40">
                  <div className="bg-muted px-1 rounded border border-border/50">
                    <CornerDownLeft className="h-2.5 w-2.5" />
                  </div>
                  <span>INSERT</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        onWheel={(e) => e.stopPropagation()}
        className="absolute left-4 top-20 flex flex-col items-center gap-2 rounded-xl bg-card/90 backdrop-blur-md px-1.5 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.5)] border border-white/5"
      >
        {[
          { icon: Hand, label: "Hand" },
          { icon: MousePointer2, label: "Select" },
          { icon: Square, label: "Rectangle" },
          { icon: Circle, label: "Circle" },
          { icon: Minus, label: "Line" },
          { icon: ArrowRight, label: "Arrow" },
          { icon: Type, label: "Text" },
          { icon: Frame, label: "Frame" },
          { icon: Eraser, label: "Eraser" },
          { icon: PenLine, label: "Pencil" },
        ].map(({ icon: Icon, label }) => {
          const isActive = activeTool === label;
          return (
            <button
              key={label}
              onClick={() => setActiveTool(label)}
              className={`flex items-center justify-center rounded-lg h-10 w-10 transition-all ${isActive
                ? "bg-primary text-primary-foreground shadow-lg scale-110"
                : "text-muted-foreground hover:bg-white/10 hover:text-foreground hover:scale-105 active:scale-95"
                }`}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CanvasArea;
