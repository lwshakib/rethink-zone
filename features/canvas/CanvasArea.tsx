"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type AnchorSide = "top" | "bottom" | "left" | "right";
type Connector = {
  id: string;
  from: { kind: "rect" | "circle"; shapeId: string; anchor: AnchorSide };
  to: { kind: "rect" | "circle"; shapeId: string; anchor: AnchorSide };
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
};

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;
const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

const CanvasArea = () => {
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState("Hand");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hydratedRef = useRef(false);
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
  const [connectors, setConnectors] = useState<Connector[]>([]);
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
      | "arrow";
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
    kind: "rect" | "circle";
    shapeId: string;
    anchor: AnchorSide;
    point: { x: number; y: number };
  } | null>(null);
  const [pendingConnector, setPendingConnector] = useState<{
    from: { kind: "rect" | "circle"; shapeId: string; anchor: AnchorSide };
    previewPoint: { x: number; y: number };
  } | null>(null);
  const pointerToolRef = useRef<string>("");
  const STORAGE_KEY = "sketch-canvas-state";
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

  const getRectAnchor = useCallback((rect: RectShape, anchor: AnchorSide) => {
    const xMid = rect.x + rect.width / 2;
    const yMid = rect.y + rect.height / 2;
    if (anchor === "top") return { x: xMid, y: rect.y };
    if (anchor === "bottom") return { x: xMid, y: rect.y + rect.height };
    if (anchor === "left") return { x: rect.x, y: yMid };
    return { x: rect.x + rect.width, y: yMid };
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
    (target: {
      kind: "rect" | "circle";
      shapeId: string;
      anchor: AnchorSide;
    }) => {
      if (target.kind === "rect") {
        const r = rectangles.find((rec) => rec.id === target.shapeId);
        if (!r) return null;
        return getRectAnchor(r, target.anchor);
      }
      const c = circles.find((ci) => ci.id === target.shapeId);
      if (!c) return null;
      return getCircleAnchor(c, target.anchor);
    },
    [circles, getCircleAnchor, getRectAnchor, rectangles]
  );

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
  ]);
  const persistState = useCallback(
    (state: {
      pan: { x: number; y: number };
      zoom: number;
      snapshot: HistoryEntry;
    }) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Failed to persist canvas state", err);
      }
    },
    []
  );
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
      return null;
    },
    [arrows, circles, frames, images, lines, pushHistory, rectangles, texts]
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
    ]
  );

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        pan?: { x: number; y: number };
        zoom?: number;
        snapshot?: HistoryEntry;
      } | null;
      if (!parsed?.snapshot) return;

      applySnapshot(parsed.snapshot);
      setHistory([parsed.snapshot]);
      setHistoryIndex(0);
      if (parsed.pan) setPan(parsed.pan);
      if (parsed.zoom) setZoom(clampZoom(parsed.zoom));
      hydratedRef.current = true;
      requestAnimationFrame(() => setRerenderTick((t) => t + 1));
    } catch (err) {
      console.error("Failed to load canvas state", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // log + debounce persist on any canvas change (including pan/zoom)
  useEffect(() => {
    const currentSnapshot = snapshot();
    console.log("[Canvas] change", {
      pan,
      zoom,
      counts: {
        rectangles: currentSnapshot.rectangles.length,
        circles: currentSnapshot.circles.length,
        lines: currentSnapshot.lines.length,
        arrows: currentSnapshot.arrows.length,
        connectors: currentSnapshot.connectors.length,
        paths: currentSnapshot.paths.length,
        images: currentSnapshot.images.length,
        texts: currentSnapshot.texts.length,
        frames: currentSnapshot.frames.length,
      },
    });

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistState({ pan, zoom, snapshot: currentSnapshot });
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [snapshot, pan, zoom, persistState]);

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
        boxWidth: 120,
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

    const point = toCanvasPoint(event);

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
        }
        return null;
      })();

      const hitArrowShape = (() => {
        for (let i = arrows.length - 1; i >= 0; i--) {
          const l = arrows[i];
          const dist = distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2);
          if (dist <= 6 / zoom) return i;
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

      let picked: {
        kind:
          | "image"
          | "text"
          | "circle"
          | "rect"
          | "frame"
          | "connector"
          | "line"
          | "arrow";
        index: number;
      } | null = null;
      // Check elements first (topmost priority), then frames last
      // This allows elements inside frames to be selected before the frame itself
      if (hitImage != null) picked = { kind: "image", index: hitImage };
      else if (hitText != null) picked = { kind: "text", index: hitText };
      else if (hitCircle != null) picked = { kind: "circle", index: hitCircle };
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
          const handleSize = 12 / zoom;
          const corners = [
            { x: r.x, y: r.y, sx: -1, sy: -1 },
            { x: r.x + r.width, y: r.y, sx: 1, sy: -1 },
            { x: r.x, y: r.y + r.height, sx: -1, sy: 1 },
            { x: r.x + r.width, y: r.y + r.height, sx: 1, sy: 1 },
          ];
          const edges = [
            {
              x: r.x + r.width / 2,
              y: r.y,
              sx: 0,
              sy: -1,
              mode: "resize-rect-v" as const,
            },
            {
              x: r.x + r.width / 2,
              y: r.y + r.height,
              sx: 0,
              sy: 1,
              mode: "resize-rect-v" as const,
            },
            {
              x: r.x,
              y: r.y + r.height / 2,
              sx: -1,
              sy: 0,
              mode: "resize-rect-h" as const,
            },
            {
              x: r.x + r.width,
              y: r.y + r.height / 2,
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
          const handleSize = 10 / zoom;
          const corners = [
            {
              x: im.x + im.width,
              y: im.y + im.height,
              mode: "resize-image" as const,
              sx: 1,
              sy: 1,
            },
          ];
          const edges = [
            {
              x: im.x + im.width / 2,
              y: im.y,
              mode: "resize-image-v" as const,
              sx: 0,
              sy: -1,
            },
            {
              x: im.x + im.width / 2,
              y: im.y + im.height,
              mode: "resize-image-v" as const,
              sx: 0,
              sy: 1,
            },
            {
              x: im.x,
              y: im.y + im.height / 2,
              mode: "resize-image-h" as const,
              sx: -1,
              sy: 0,
            },
            {
              x: im.x + im.width,
              y: im.y + im.height / 2,
              mode: "resize-image-h" as const,
              sx: 1,
              sy: 0,
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
          const handleSize = 10 / zoom;
          const corners = [
            {
              x: t.x + t.width,
              y: t.y + t.height,
              mode: "resize-text" as const,
              sx: 1,
              sy: 1,
            },
          ];
          const edges = [
            {
              x: t.x + t.width / 2,
              y: t.y,
              mode: "resize-text-v" as const,
              sx: 0,
              sy: -1,
            },
            {
              x: t.x + t.width / 2,
              y: t.y + t.height,
              mode: "resize-text-v" as const,
              sx: 0,
              sy: 1,
            },
            {
              x: t.x,
              y: t.y + t.height / 2,
              mode: "resize-text-h" as const,
              sx: -1,
              sy: 0,
            },
            {
              x: t.x + t.width,
              y: t.y + t.height / 2,
              mode: "resize-text-h" as const,
              sx: 1,
              sy: 0,
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
          const handleSize = 10 / zoom;
          const corners = [
            {
              x: f.x + f.width,
              y: f.y + f.height,
              mode: "resize-frame" as const,
              sx: 1,
              sy: 1,
            },
          ];
          const edges = [
            {
              x: f.x + f.width / 2,
              y: f.y,
              mode: "resize-frame-v" as const,
              sx: 0,
              sy: -1,
            },
            {
              x: f.x + f.width / 2,
              y: f.y + f.height,
              mode: "resize-frame-v" as const,
              sx: 0,
              sy: 1,
            },
            {
              x: f.x,
              y: f.y + f.height / 2,
              mode: "resize-frame-h" as const,
              sx: -1,
              sy: 0,
            },
            {
              x: f.x + f.width,
              y: f.y + f.height / 2,
              mode: "resize-frame-h" as const,
              sx: 1,
              sy: 0,
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
      const tolerance = 12 / zoom;
      let nearest: {
        kind: "rect" | "circle";
        shapeId: string;
        anchor: AnchorSide;
        point: { x: number; y: number };
      } | null = null;
      let bestDist = tolerance;
      for (const h of anchorHandles) {
        const d = Math.hypot(point.x - h.point.x, point.y - h.point.y);
        if (d <= bestDist) {
          bestDist = d;
          nearest = h;
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
            const handleSize = 12 / zoom;
            const corners = [
              { x: r.x, y: r.y, cursor: "nw-resize" },
              { x: r.x + r.width, y: r.y, cursor: "ne-resize" },
              { x: r.x, y: r.y + r.height, cursor: "sw-resize" },
              { x: r.x + r.width, y: r.y + r.height, cursor: "se-resize" },
            ];
            const edges = [
              { x: r.x + r.width / 2, y: r.y, cursor: "n-resize" },
              { x: r.x + r.width / 2, y: r.y + r.height, cursor: "s-resize" },
              { x: r.x, y: r.y + r.height / 2, cursor: "w-resize" },
              { x: r.x + r.width, y: r.y + r.height / 2, cursor: "e-resize" },
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
            const handleSize = 10 / zoom;
            const handles = [
              { x: im.x + im.width, y: im.y + im.height, cursor: "se-resize" },
              { x: im.x + im.width / 2, y: im.y, cursor: "n-resize" },
              {
                x: im.x + im.width / 2,
                y: im.y + im.height,
                cursor: "s-resize",
              },
              { x: im.x, y: im.y + im.height / 2, cursor: "w-resize" },
              {
                x: im.x + im.width,
                y: im.y + im.height / 2,
                cursor: "e-resize",
              },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
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
            const handleSize = 10 / zoom;
            const handles = [
              { x: t.x + t.width, y: t.y + t.height, cursor: "se-resize" },
              { x: t.x + t.width / 2, y: t.y, cursor: "n-resize" },
              { x: t.x + t.width / 2, y: t.y + t.height, cursor: "s-resize" },
              { x: t.x, y: t.y + t.height / 2, cursor: "w-resize" },
              { x: t.x + t.width, y: t.y + t.height / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
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
            const handleSize = 10 / zoom;
            const handles = [
              { x: f.x + f.width, y: f.y + f.height, cursor: "se-resize" },
              { x: f.x + f.width / 2, y: f.y, cursor: "n-resize" },
              { x: f.x + f.width / 2, y: f.y + f.height, cursor: "s-resize" },
              { x: f.x, y: f.y + f.height / 2, cursor: "w-resize" },
              { x: f.x + f.width, y: f.y + f.height / 2, cursor: "e-resize" },
            ];
            const hitHandle = handles.find(
              (h) =>
                Math.abs(point.x - h.x) <= handleSize &&
                Math.abs(point.y - h.y) <= handleSize
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
        tag.src = im.src;
        imageCacheRef.current[im.src] = tag;
      }
      if (tag.complete) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.drawImage(tag, im.x, im.y, im.width, im.height);
        if (isSelected) {
          ctx.strokeStyle = "rgba(180,220,255,0.9)";
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.strokeRect(im.x, im.y, im.width, im.height);
          const handleSize = 8 / zoom;
          ctx.fillStyle = "rgba(180,220,255,1)";
          ctx.setLineDash([]);
          const handles = [
            { x: im.x + im.width, y: im.y + im.height },
            { x: im.x + im.width / 2, y: im.y },
            { x: im.x + im.width / 2, y: im.y + im.height },
            { x: im.x, y: im.y + im.height / 2 },
            { x: im.x + im.width, y: im.y + im.height / 2 },
          ];
          handles.forEach(({ x, y }) => {
            ctx.beginPath();
            ctx.rect(
              x - handleSize / 2,
              y - handleSize / 2,
              handleSize,
              handleSize
            );
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
      ctx.fillStyle = "white";
      ctx.textBaseline = "top";
      const lines = t.text.split("\n");
      const lineHeight = t.fontSize * 1.2;
      lines.forEach((line, idx) => {
        ctx.fillText(line, t.x, t.y + idx * lineHeight);
      });

      if (isSelected) {
        const pad = 4 / zoom;
        const handleSize = 7 / zoom;
        const stroke = "rgba(63,193,255,0.95)";
        const x = t.x - pad;
        const y = t.y - pad;
        const w = t.width + pad * 2;
        const h = t.height + pad * 2;

        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.6 / zoom;
        ctx.setLineDash([]);
        ctx.strokeRect(x, y, w, h);

        const corners = [
          { cx: x, cy: y },
          { cx: x + w, cy: y },
          { cx: x, cy: y + h },
          { cx: x + w, cy: y + h },
        ];
        const edges = [
          { cx: x + w / 2, cy: y },
          { cx: x + w / 2, cy: y + h },
          { cx: x, cy: y + h / 2 },
          { cx: x + w, cy: y + h / 2 },
        ];
        ctx.fillStyle = stroke;
        [...corners, ...edges].forEach(({ cx, cy }) => {
          ctx.beginPath();
          ctx.rect(
            cx - handleSize / 2,
            cy - handleSize / 2,
            handleSize,
            handleSize
          );
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
        : `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = isSelected ? 1.5 / zoom : 2 / zoom;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      if (isSelected) {
        const handleSize = 8 / zoom;
        const handleFill = "rgba(83,182,255,1)";
        const corners = [
          { cx: x, cy: y },
          { cx: x + width, cy: y },
          { cx: x, cy: y + height },
          { cx: x + width, cy: y + height },
        ];
        const edges = [
          { cx: x + width / 2, cy: y },
          { cx: x + width / 2, cy: y + height },
          { cx: x, cy: y + height / 2 },
          { cx: x + width, cy: y + height / 2 },
        ];
        ctx.fillStyle = handleFill;
        [...corners, ...edges].forEach(({ cx, cy }) => {
          ctx.beginPath();
          ctx.rect(
            cx - handleSize / 2,
            cy - handleSize / 2,
            handleSize,
            handleSize
          );
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
      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 * alpha})`;
      drawRoundedRect(x, y, width, height, radius);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isSelected
        ? `rgba(180,220,255,${0.9 * alpha})`
        : `rgba(255, 255, 255, ${0.12 * alpha})`;
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash(isSelected ? [4 / zoom, 4 / zoom] : []);
      drawRoundedRect(x, y, width, height, radius);
      ctx.stroke();

      // Draw frame label above the frame
      ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * alpha})`;
      ctx.font = `${11 / zoom}px sans-serif`;
      ctx.textBaseline = "bottom";
      ctx.textAlign = "left";
      ctx.fillText(`Frame ${f.frameNumber}`, x, y - 4 / zoom);

      if (isSelected) {
        // Draw resize handles (corners + edges)
        const handleSize = 8 / zoom;
        const handles = [
          { x: x + width, y: y + height },
          { x: x + width / 2, y: y },
          { x: x + width / 2, y: y + height },
          { x: x, y: y + height / 2 },
          { x: x + width, y: y + height / 2 },
        ];
        ctx.fillStyle = "rgba(180,220,255,1)";
        ctx.setLineDash([]);
        handles.forEach((h) => {
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

    const drawCircle = (
      c: { x: number; y: number; rx: number; ry: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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

    const drawLine = (
      l: { x1: number; y1: number; x2: number; y2: number },
      alpha = 0.8,
      isSelected = false
    ) => {
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
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
      }
    ) => {
      ctx.save();
      const fromDir = options?.fromAnchor
        ? getAnchorDir(options.fromAnchor)
        : { x: 0, y: 0 };
      const toDir = options?.toAnchor
        ? getAnchorDir(options.toAnchor)
        : { x: 0, y: 0 };
      const dx = toPt.x - fromPt.x;
      const dy = toPt.y - fromPt.y;
      const dist = Math.hypot(dx, dy) || 1;
      const tolerance = 10 / zoom;

      const horizontalAligned =
        Math.abs(dy) <= tolerance &&
        (Math.abs(fromDir.x) > 0 || Math.abs(toDir.x) > 0);
      const verticalAligned =
        Math.abs(dx) <= tolerance &&
        (Math.abs(fromDir.y) > 0 || Math.abs(toDir.y) > 0);

      const strokeColor = options?.highlight
        ? "rgba(83,182,255,0.9)"
        : `rgba(255,255,255,0.9)`;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = options?.highlight ? 2.4 / zoom : 2 / zoom;
      ctx.setLineDash(options?.highlight ? [6 / zoom, 4 / zoom] : []);

      // Straight path if well aligned
      if (horizontalAligned || verticalAligned) {
        ctx.beginPath();
        ctx.moveTo(fromPt.x, fromPt.y);
        ctx.lineTo(toPt.x, toPt.y);
        ctx.stroke();

        const angle = Math.atan2(toPt.y - fromPt.y, toPt.x - fromPt.x);
        const size = 8 / zoom;
        ctx.beginPath();
        ctx.moveTo(toPt.x, toPt.y);
        ctx.lineTo(
          toPt.x - size * Math.cos(angle - Math.PI / 6),
          toPt.y - size * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          toPt.x - size * Math.cos(angle + Math.PI / 6),
          toPt.y - size * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = strokeColor;
        ctx.fill();
        ctx.restore();
        return;
      }

      // Curved: push out of shapes along anchor normals, then blend
      const minOffset = 28 / zoom;
      const baseOffset = Math.min(Math.max(dist / 3, minOffset), 80 / zoom);
      const ctrl1 = {
        x: fromPt.x + fromDir.x * baseOffset,
        y: fromPt.y + fromDir.y * baseOffset,
      };
      const ctrl2 = {
        x: toPt.x + toDir.x * baseOffset,
        y: toPt.y + toDir.y * baseOffset,
      };

      // If no anchor dirs, fall back to gentle bend
      const fallback =
        Math.abs(fromDir.x) + Math.abs(fromDir.y) === 0 &&
        Math.abs(toDir.x) + Math.abs(toDir.y) === 0;
      const ctrlFallback = {
        x: (fromPt.x + toPt.x) / 2 - (dy / dist) * baseOffset,
        y: (fromPt.y + toPt.y) / 2 + (dx / dist) * baseOffset,
      };

      ctx.beginPath();
      ctx.moveTo(fromPt.x, fromPt.y);
      if (fallback) {
        ctx.quadraticCurveTo(ctrlFallback.x, ctrlFallback.y, toPt.x, toPt.y);
      } else {
        ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, toPt.x, toPt.y);
      }
      ctx.stroke();

      const tail = fallback ? ctrlFallback : ctrl2;
      const angle = Math.atan2(toPt.y - tail.y, toPt.x - tail.x);
      const size = 8 / zoom;
      ctx.beginPath();
      ctx.moveTo(toPt.x, toPt.y);
      ctx.lineTo(
        toPt.x - size * Math.cos(angle - Math.PI / 6),
        toPt.y - size * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toPt.x - size * Math.cos(angle + Math.PI / 6),
        toPt.y - size * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = strokeColor;
      ctx.fill();

      ctx.restore();
    };

    const drawPath = (
      p: { points: { x: number; y: number }[] },
      alpha = 0.8
    ) => {
      if (p.points.length < 2) return;
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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
      kind: "rect" | "circle";
      shapeId: string;
      anchor: AnchorSide;
      point: { x: number; y: number };
    }[] = [];

    rectangles.forEach((r) => {
      (["top", "right", "bottom", "left"] as AnchorSide[]).forEach((side) => {
        handles.push({
          kind: "rect",
          shapeId: r.id,
          anchor: side,
          point: getRectAnchor(r, side),
        });
      });
    });
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
  }, [activeTool, circles, getCircleAnchor, getRectAnchor, rectangles]);

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
          onChange={(e) =>
            setTextEditor((prev) =>
              prev ? { ...prev, value: e.target.value } : prev
            )
          }
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
            left: `${
              canvasToClient(
                textEditor.canvasX - (textEditor.pad ?? 0),
                textEditor.canvasY - (textEditor.pad ?? 0)
              ).x
            }px`,
            top: `${
              canvasToClient(
                textEditor.canvasX - (textEditor.pad ?? 0),
                textEditor.canvasY - (textEditor.pad ?? 0)
              ).y
            }px`,
            zIndex: 10,
            width: `${
              ((textEditor.boxWidth ?? 120) +
                (textEditor.pad ?? 4 / zoom) * 2) *
                zoom +
              2
            }px`,
            minWidth: `${40 * zoom}px`,
            height: "auto",
            background: "transparent",
            color: "white",
            border: "1.6px solid rgba(63,193,255,0.95)",
            outline: "none",
            borderRadius: 0,
            padding: `${(textEditor.pad ?? 4 / zoom) * zoom}px`,
            fontSize: textEditor.fontSize,
            fontFamily: "sans-serif",
            lineHeight: `${textEditor.fontSize * 1.2}px`,
            resize: "none",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
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
              left: `${clientPos.cssX ?? clientPos.x}px`,
              top: `${
                (clientPos.cssY ?? clientPos.y) - 36 / Math.max(zoom, 0.0001)
              }px`, // keep offset consistent at different zoom levels
              transform: "translateX(-100%)", // Align to right edge
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

      {activeTool === "Arrow" &&
        anchorHandles.map((h) => {
          const pos = canvasToClient(h.point.x, h.point.y);
          const isHover =
            hoverAnchor &&
            hoverAnchor.shapeId === h.shapeId &&
            hoverAnchor.kind === h.kind &&
            hoverAnchor.anchor === h.anchor;
          return (
            <div
              key={`${h.shapeId}-${h.anchor}`}
              className="absolute pointer-events-none"
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={`rounded-full border ${
                  isHover
                    ? "bg-white border-white shadow-md"
                    : "border-white/60 bg-white/20"
                }`}
                style={{
                  width: `${10}px`,
                  height: `${10}px`,
                  boxShadow: isHover
                    ? "0 0 0 6px rgba(255,255,255,0.1)"
                    : undefined,
                }}
              />
            </div>
          );
        })}

      {selectionRect && selectionOverlayStyle && (
        <div
          className="absolute pointer-events-none border border-blue-400/70 bg-blue-400/10"
          style={selectionOverlayStyle}
        />
      )}

      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-[#1b1b1b] px-2 py-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center h-9 w-9 rounded-full transition border border-white/10 ${
            canUndo
              ? "text-white/80 hover:bg-white/10"
              : "text-white/30 cursor-not-allowed"
          }`}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`flex items-center justify-center h-9 w-9 rounded-full transition border border-white/10 ${
            canRedo
              ? "text-white/80 hover:bg-white/10"
              : "text-white/30 cursor-not-allowed"
          }`}
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-[#1b1b1b] px-2 py-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <button
          onClick={() => zoomOut()}
          className="flex items-center justify-center h-9 w-9 rounded-full transition border border-white/10 text-white/80 hover:bg-white/10"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="px-3 text-xs font-semibold text-white/80 min-w-[68px] text-center">
          {zoomPercent}%
        </div>
        <button
          onClick={() => zoomIn()}
          className="flex items-center justify-center h-9 w-9 rounded-full transition border border-white/10 text-white/80 hover:bg-white/10"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="h-6 w-px bg-white/10" />
        <button
          onClick={fitToScreen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border border-white/10 hover:bg-white/10 transition"
          aria-label="Fit to screen"
        >
          <Scan className="h-4 w-4" />
          Fit
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white/80 border border-white/10 hover:bg-white/10 transition"
          aria-label="Reset zoom"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#1b1b1b] px-2 py-1 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
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
              className={`flex items-center justify-center h-9 w-9 rounded-full transition border border-white/10 ${
                isActive
                  ? "bg-[#2a2a2a] text-white shadow"
                  : "text-white/80 hover:bg-white/10"
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
