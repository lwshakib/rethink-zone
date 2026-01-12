/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useRef, useState, Dispatch, SetStateAction, useEffect } from "react";
import { 
  Tool, AnchorSide, ShapeKind, ConnectorAnchor, HistoryEntry, 
  RectShape, CircleShape, SelectedShape, SelectedShapeInfo, DragMode, PolyShape, Connector, LineShape, ArrowShape, PathShape, ImageShape, TextShape, FrameShape, FigureShape, CodeShape
} from "../types";
import { makeId } from "../utils";
import { distToSegment, getConnectorPoints, distToPolyline } from "../utils/geometry";
import { measureText } from "../utils/canvas-helpers";
import { uploadFileToCloudinary } from "../utils/upload";

type InteractionProps = {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pan: { x: number; y: number };
  setPan: (p: { x: number; y: number }) => void;
  rectangles: RectShape[];
  setRectangles: React.Dispatch<React.SetStateAction<RectShape[]>>;
  circles: CircleShape[];
  setCircles: React.Dispatch<React.SetStateAction<CircleShape[]>>;
  lines: LineShape[];
  setLines: React.Dispatch<React.SetStateAction<LineShape[]>>;
  arrows: ArrowShape[];
  setArrows: React.Dispatch<React.SetStateAction<ArrowShape[]>>;
  paths: PathShape[];
  setPaths: React.Dispatch<React.SetStateAction<PathShape[]>>;
  images: ImageShape[];
  setImages: React.Dispatch<React.SetStateAction<ImageShape[]>>;
  texts: TextShape[];
  setTexts: React.Dispatch<React.SetStateAction<TextShape[]>>;
  frames: FrameShape[];
  setFrames: React.Dispatch<React.SetStateAction<FrameShape[]>>;
  polygons: PolyShape[];
  setPolygons: React.Dispatch<React.SetStateAction<PolyShape[]>>;
  connectors: Connector[];
  setConnectors: React.Dispatch<React.SetStateAction<Connector[]>>;
  selectedShape: SelectedShape;
  setSelectedShape: React.Dispatch<React.SetStateAction<SelectedShape>>;
  figures: FigureShape[];
  setFigures: React.Dispatch<React.SetStateAction<FigureShape[]>>;
  codes: CodeShape[];
  setCodes: React.Dispatch<React.SetStateAction<CodeShape[]>>;
  currentRect: any;
  setCurrentRect: (r: { x: number; y: number; width: number; height: number } | null) => void;
  currentCircle: any;
  setCurrentCircle: (c: { x: number; y: number; rx: number; ry: number } | null) => void;
  currentLine: any;
  setCurrentLine: Dispatch<SetStateAction<{ x1: number; y1: number; x2: number; y2: number } | null>>;
  currentArrow: any;
  setCurrentArrow: Dispatch<SetStateAction<{ x1: number; y1: number; x2: number; y2: number } | null>>;
  currentPath: any;
  setCurrentPath: Dispatch<SetStateAction<{ points: { x: number; y: number }[]; stroke?: string; strokeWidth?: number } | null>>;
  currentFrame: any;
  setCurrentFrame: (f: { x: number; y: number; width: number; height: number } | null) => void;
  pushHistory: (overrides?: Partial<HistoryEntry>) => void;
  isSpacePanning: boolean;
  setIsHandPanning: (b: boolean) => void;
  isHandPanning: boolean;
  anchorHandles: any[];
  pendingAddIcon: any;
  setPendingAddIcon: (i: any) => void;
  pendingAddShapeLabel: string | null;
  setPendingAddShapeLabel: (l: string | null) => void;
  isPlusMenuOpen: boolean;
  setIsPlusMenuOpen: (b: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getAnchorPoint: (anchor: ConnectorAnchor) => { x: number; y: number } | null;
  getShapeBounds: (anchor: ConnectorAnchor) => { x: number; y: number; width: number; height: number } | null;
  getContentBounds: () => { minX: number; maxX: number; minY: number; maxY: number } | null;
  clampZoom: (z: number) => number;
  imageCacheRef: React.RefObject<Record<string, HTMLImageElement>>;
  setHoverAnchor: (a: {
    kind: ShapeKind;
    shapeId: string;
    anchor: AnchorSide;
    percent?: number;
    point: { x: number; y: number };
  } | null) => void;
  hoverAnchor: {
    kind: ShapeKind;
    shapeId: string;
    anchor: AnchorSide;
    percent?: number;
    point: { x: number; y: number };
  } | null;
  setRerenderTick: React.Dispatch<React.SetStateAction<number>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  strokeColor: string;
  strokeWidth: number;
  theme: string;
};

export const useCanvasInteraction = (props: InteractionProps) => {
  const {
    activeTool, setActiveTool, zoom, setZoom, pan, setPan,
    rectangles, setRectangles, circles, setCircles, lines, setLines,
    arrows, setArrows, paths, setPaths, images, setImages,
    texts, setTexts, frames, setFrames, polygons, setPolygons,
    connectors, setConnectors, selectedShape, setSelectedShape,
    setCurrentRect, setCurrentCircle,
    currentLine, setCurrentLine, currentArrow, setCurrentArrow,
    currentPath, setCurrentPath, setCurrentFrame,
    figures, setFigures, codes, setCodes,
    pushHistory, isSpacePanning, setIsHandPanning, isHandPanning,
    anchorHandles, pendingAddIcon, setPendingAddIcon, pendingAddShapeLabel, setPendingAddShapeLabel,
    isPlusMenuOpen, setIsPlusMenuOpen, canvasRef,
    getAnchorPoint, getShapeBounds, getContentBounds, clampZoom,    imageCacheRef, setHoverAnchor, hoverAnchor, setRerenderTick, containerRef,
    strokeColor, strokeWidth, theme
  } = props;

  const isPanningRef = useRef(false);
  const tempPanRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const rectStartRef = useRef({ x: 0, y: 0 });
  const circleStartRef = useRef({ x: 0, y: 0 });
  const isDrawingRectRef = useRef(false);
  const isDrawingCircleRef = useRef(false);
  const isDrawingLineRef = useRef(false);
  const isDrawingArrowRef = useRef(false);
  const isDrawingPathRef = useRef(false);
  const isDrawingFrameRef = useRef(false);
  const isErasingRef = useRef(false);
  const dragModeRef = useRef<DragMode>("none");
  const dragRectStartRef = useRef<RectShape | null>(null);
  const dragCircleStartRef = useRef<CircleShape | null>(null);
  const dragImageStartRef = useRef<any>(null);
  const dragRectCornerRef = useRef<any>(null);
  const dragCircleCornerRef = useRef<any>(null);
  const dragImageCornerRef = useRef<any>(null);
  const dragTextStartRef = useRef<any>(null);
  const dragTextCornerRef = useRef<any>(null);
  const dragFrameStartRef = useRef<any>(null);
  const dragPolyStartRef = useRef<any>(null);
  const dragFrameCornerRef = useRef<any>(null);
  const dragLineStartRef = useRef<any>(null);
  const dragArrowStartRef = useRef<any>(null);
  const dragShapesStartRef = useRef<HistoryEntry | null>(null);
  const dragConnectorStartRef = useRef<any>(null);
  const dragConnectorOriginalAnchorRef = useRef<any>(null);
  const selectionStartRef = useRef<any>(null);
  const pointerToolRef = useRef<Tool | "">("");
  const pendingMoveUpdateRef = useRef<number | null>(null);
  const selectedShapeRef = useRef(selectedShape);
  const stateRef = useRef({
    rectangles, circles, lines, arrows, paths, images, texts, frames, polygons, connectors, anchorHandles, figures, codes
  });

  useEffect(() => {
    selectedShapeRef.current = selectedShape;
  }, [selectedShape]);

  useEffect(() => {
    stateRef.current = {
      rectangles, circles, lines, arrows, paths, images, texts, frames, polygons, connectors, anchorHandles, figures, codes
    };
  }, [rectangles, circles, lines, arrows, paths, images, texts, frames, polygons, connectors, anchorHandles, figures, codes]);

  const [cursorStyle, setCursorStyle] = useState("default");
  const cursorStyleRef = useRef(cursorStyle);
  const hoverAnchorRef = useRef(hoverAnchor);

  useEffect(() => {
    cursorStyleRef.current = cursorStyle;
  }, [cursorStyle]);

  useEffect(() => {
    hoverAnchorRef.current = hoverAnchor;
  }, [hoverAnchor]);
  const [pendingConnector, setPendingConnector] = useState<{
    from: ConnectorAnchor;
    previewPoint: { x: number; y: number };
  } | null>(null);
  const [textEditor, setTextEditor] = useState<any>(null);
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<any>(null);

  const canvasToClient = useCallback((x: number, y: number) => {
    return { x: x * zoom + pan.x, y: y * zoom + pan.y };
  }, [pan, zoom]);

  const toCanvasPointFromClient = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;
    return { x: (screenX - pan.x) / zoom, y: (screenY - pan.y) / zoom };
  }, [canvasRef, pan, zoom]);

  const startPan = useCallback((event: React.PointerEvent<HTMLCanvasElement>, isTemporary = false) => {
    isPanningRef.current = true;
    tempPanRef.current = isTemporary;
    setIsHandPanning(true);
    panStartRef.current = { ...pan };
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }, [pan, setIsHandPanning]);

  const resolveTool = useCallback((ev?: { ctrlKey?: boolean; metaKey?: boolean }) => {
    if (ev?.ctrlKey || ev?.metaKey) return "Select" as Tool;
    if (isSpacePanning) return "Hand" as Tool;
    return activeTool;
  }, [activeTool, isSpacePanning]);

  const eraseAtPoint = useCallback((point: { x: number; y: number }) => {
    // Make erasing area slightly larger than the visual stroke weight for better feel
    const tolerance = (strokeWidth / 2 + 10) / zoom;
    setPaths(prev => prev.filter(path => {
      return !path.points.some(p => {
        const dx = p.x - point.x;
        const dy = p.y - point.y;
        return Math.sqrt(dx * dx + dy * dy) <= tolerance;
      });
    }));
  }, [zoom, setPaths, strokeWidth]);

  const duplicateForDrag = useCallback((items: SelectedShape) => {
    if (items.length === 0) return null;

    const newRects = [...rectangles];
    const newCircles = [...circles];
    const newLines = [...lines];
    const newArrows = [...arrows];
    const newPaths = [...paths];
    const newImages = [...images];
    const newTexts = [...texts];
    const newFrames = [...frames];
    const newPolys = [...polygons];
    const newConnectors = [...connectors];
    const newFigures = [...figures];
    const newCodes = [...codes];

    const newSelection: SelectedShape = [];

    for (const item of items) {
      if (item.kind === "rect") {
        const src = rectangles[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newRects.push(dup);
          newSelection.push({ kind: "rect", index: newRects.length - 1, id: dup.id });
        }
      } else if (item.kind === "circle") {
        const src = circles[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newCircles.push(dup);
          newSelection.push({ kind: "circle", index: newCircles.length - 1, id: dup.id });
        }
      } else if (item.kind === "image") {
        const src = images[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newImages.push(dup);
          newSelection.push({ kind: "image", index: newImages.length - 1, id: dup.id });
        }
      } else if (item.kind === "text") {
        const src = texts[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newTexts.push(dup);
          newSelection.push({ kind: "text", index: newTexts.length - 1, id: dup.id });
        }
      } else if (item.kind === "frame") {
        const src = frames[item.index];
        if (src) {
          const dup = { ...src, id: makeId(), frameNumber: frames.length + newFrames.length - frames.length + 1 };
          newFrames.push(dup);
          newSelection.push({ kind: "frame", index: newFrames.length - 1, id: dup.id });
        }
      } else if (item.kind === "figure") {
        const src = figures[item.index];
        if (src) {
          const dup = { ...src, id: makeId(), figureNumber: figures.length + newFigures.length - figures.length + 1 };
          newFigures.push(dup);
          newSelection.push({ kind: "figure", index: newFigures.length - 1, id: dup.id });
        }
      } else if (item.kind === "code") {
        const src = codes[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newCodes.push(dup);
          newSelection.push({ kind: "code", index: newCodes.length - 1, id: dup.id });
        }
      } else if (item.kind === "poly") {
        const src = polygons[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newPolys.push(dup);
          newSelection.push({ kind: "poly", index: newPolys.length - 1, id: dup.id });
        }
      } else if (item.kind === "line") {
        const src = lines[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newLines.push(dup);
          newSelection.push({ kind: "line", index: newLines.length - 1, id: dup.id });
        }
      } else if (item.kind === "arrow") {
        const src = arrows[item.index];
        if (src) {
          const dup = { ...src, id: makeId() };
          newArrows.push(dup);
          newSelection.push({ kind: "arrow", index: newArrows.length - 1, id: dup.id });
        }
      }
    }

    if (newSelection.length === 0) return null;

    setRectangles(newRects);
    setCircles(newCircles);
    setLines(newLines);
    setArrows(newArrows);
    setPaths(newPaths);
    setImages(newImages);
    setTexts(newTexts);
    setFrames(newFrames);
    setPolygons(newPolys);
    setFigures(newFigures);
    setCodes(newCodes);
    setConnectors(newConnectors);

    const nextState: HistoryEntry = {
      rectangles: newRects,
      circles: newCircles,
      lines: newLines,
      arrows: newArrows,
      paths: newPaths,
      images: newImages,
      texts: newTexts,
      frames: newFrames,
      polygons: newPolys,
      figures: newFigures,
      codes: newCodes,
      connectors: newConnectors,
    };

    pushHistory(nextState);
    return { selection: newSelection, state: nextState };
  }, [rectangles, circles, lines, arrows, paths, images, texts, frames, polygons, connectors, figures, codes, setRectangles, setCircles, setLines, setArrows, setPaths, setImages, setTexts, setFrames, setPolygons, setFigures, setCodes, setConnectors, pushHistory]);

  const commitTextEditor = useCallback(() => {
    if (!textEditor) return;
    const val = textEditor.value.trim();
    if (!val) { setTextEditor(null); return; }
    const size = measureText(val, textEditor.fontSize, textEditor.fontFamily);
    
    if (textEditor.kind === "figure") {
      const next = figures.map((f, i) => i === textEditor.index ? { ...f, title: val } : f);
      setFigures(next);
      pushHistory({ figures: next });
    } else if (textEditor.index === null) {
      const next: any[] = [...texts, { 
        id: makeId(), 
        x: textEditor.canvasX, 
        y: textEditor.canvasY, 
        text: val, 
        fontSize: textEditor.fontSize, 
        width: size.width, 
        height: size.height,
        fontFamily: textEditor.fontFamily,
        textAlign: textEditor.textAlign
      }];
      setTexts(next); pushHistory({ texts: next });
    } else {
      const next = texts.map((t, i) => i === textEditor.index ? { 
        ...t, 
        text: val, 
        width: size.width, 
        height: size.height,
        fontFamily: textEditor.fontFamily,
        textAlign: textEditor.textAlign
      } : t);
      setTexts(next); pushHistory({ texts: next });
    }
    setTextEditor(null);
  }, [textEditor, texts, setTexts, figures, setFigures, pushHistory]);

  const cancelTextEditor = useCallback(() => setTextEditor(null), []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const tool = resolveTool(event);
    pointerToolRef.current = tool;

    if (editingCodeId) setEditingCodeId(null);
    if (textEditor) commitTextEditor();

    if (event.button === 1) {
      startPan(event, true);
      return;
    }

    if (isPlusMenuOpen) {
      setIsPlusMenuOpen(false);
    }

    const point = toCanvasPointFromClient(event.clientX, event.clientY);

    if (tool === "PlusAdd" && pendingAddShapeLabel) {
      const label = pendingAddShapeLabel;
      if (label === "Rectangle") {
        const next = [
          ...rectangles,
          { id: makeId(), x: point.x - 60, y: point.y - 40, width: 120, height: 80 },
        ];
        setRectangles(next);
        pushHistory({ rectangles: next });
        setSelectedShape([{ kind: "rect", index: next.length - 1, id: next[next.length - 1].id }]);
      } else if (label === "Ellipse" || label === "Oval") {
        const next = [
          ...circles,
          { id: makeId(), x: point.x, y: point.y, rx: label === "Ellipse" ? 50 : 70, ry: 50 },
        ];
        setCircles(next);
        pushHistory({ circles: next });
        setSelectedShape([{ kind: "circle", index: next.length - 1, id: next[next.length - 1].id }]);
      } else if (label === "Figure") {
        const next = [
          ...figures,
          { id: makeId(), x: point.x - 150, y: point.y - 120, width: 300, height: 240, figureNumber: figures.length + 1 }
        ];
        setFigures(next);
        pushHistory({ figures: next });
        setSelectedShape([{ kind: "figure", index: next.length - 1, id: next[next.length - 1].id }]);
      } else if (label === "Code") {
        const next = [
          ...codes,
          { id: makeId(), x: point.x - 150, y: point.y - 150, width: 300, height: 300, code: "// Write your code here...", language: "javascript", fontSize: 13 }
        ];
        setCodes(next);
        pushHistory({ codes: next });
        setSelectedShape([{ kind: "code", index: next.length - 1, id: next[next.length - 1].id }]);
      } else if (label.startsWith("Device:")) {
        const type = label.split(":")[1] as any;
        let width = 120;
        let height = 200;
        if (type === "phone") { width = 180; height = 360; }
        else if (type === "tablet") { width = 400; height = 550; }
        else if (type === "desktop") { width = 600; height = 450; }
        else if (type === "browser") { width = 600; height = 400; }

        const next = [
          ...frames,
          { 
            id: makeId(), 
            x: point.x - width / 2, 
            y: point.y - height / 2, 
            width, 
            height, 
            frameNumber: frames.length + 1,
            deviceType: type
          },
        ];
        setFrames(next);
        pushHistory({ frames: next });
        setSelectedShape([{ kind: "frame", index: next.length - 1, id: next[next.length - 1].id }]);
      } else {
        const next = [
          ...polygons,
          { id: makeId(), type: label, x: point.x - 60, y: point.y - 60, width: 120, height: 120 },
        ];
        setPolygons(next);
        pushHistory({ polygons: next });
        setSelectedShape([{ kind: "poly", index: next.length - 1, id: next[next.length - 1].id }]);
      }
      setActiveTool("Select");
      setPendingAddShapeLabel(null);
      return;
    }

    if (activeTool === "IconAdd" && pendingAddIcon) {
      const next = [
        ...images,
        {
          id: makeId(),
          src: pendingAddIcon.src,
          x: point.x - 24,
          y: point.y - 24,
          width: 48,
          height: 48,
        },
      ];
      setImages(next);
      pushHistory({ images: next });
      setSelectedShape([{ kind: "image", index: next.length - 1, id: next[next.length - 1].id }]);
      setActiveTool("Select");
      setPendingAddIcon(null);
      return;
    }

    if (tool === "Select") {
      const hitImage = (() => {
        for (let i = images.length -1; i >=0; i--) {
          const im = images[i];
          if (point.x >= im.x && point.x <= im.x + im.width && point.y >= im.y && point.y <= im.y + im.height) return i;
          if (selectedShape.some(s => s.kind === "image" && s.index === i)) {
            const hs = 14 / zoom;
            const pad = 0;
            const x = im.x - pad;
            const y = im.y - pad;
            const w = im.width + pad * 2;
            const h = im.height + pad * 2;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitText = (() => {
        for (let i = texts.length - 1; i >= 0; i--) {
          const t = texts[i];
          if (point.x >= t.x && point.x <= t.x + t.width && point.y >= t.y && point.y <= t.y + t.height) return i;
          if (selectedShape.some(s => s.kind === "text" && s.index === i)) {
            const hs = 14 / zoom;
            const pad = 0;
            const x = t.x - pad;
            const y = t.y - pad;
            const w = t.width + pad * 2;
            const h = t.height + pad * 2;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitCircle = (() => {
        for (let i = circles.length - 1; i >= 0; i--) {
          const c = circles[i];
          const dx = (point.x - c.x) / c.rx;
          const dy = (point.y - c.y) / c.ry;
          if (dx * dx + dy * dy <= 1.1) return i;
          if (selectedShape.some(s => s.kind === "circle" && s.index === i)) {
            const hs = 12 / zoom;
            const pad = 0;
            const handles = [
              { x: c.x - c.rx - pad, y: c.y - c.ry - pad }, { x: c.x + c.rx + pad, y: c.y - c.ry - pad },
              { x: c.x - c.rx - pad, y: c.y + c.ry + pad }, { x: c.x + c.rx + pad, y: c.y + c.ry + pad },
              { x: c.x, y: c.y - c.ry - pad }, { x: c.x, y: c.y + c.ry + pad },
              { x: c.x - c.rx - pad, y: c.y }, { x: c.x + c.rx + pad, y: c.y }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs && Math.abs(point.y - h.y) <= hs)) return i;
          }
        }
        return null;
      })();

      const hitRect = (() => {
        for (let i = rectangles.length - 1; i >= 0; i--) {
          const r = rectangles[i];
          if (point.x >= r.x && point.x <= r.x + r.width && point.y >= r.y && point.y <= r.y + r.height) return i;
          if (selectedShape.some(s => s.kind === "rect" && s.index === i)) {
            const hs = 14 / zoom;
            const pad = 0;
            const x = r.x - pad;
            const y = r.y - pad;
            const w = r.width + pad * 2;
            const h = r.height + pad * 2;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitLine = (() => {
        for (let i = lines.length - 1; i >= 0; i--) {
          const l = lines[i];
          if (distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <= 6 / zoom) return i;
          if (selectedShape.some(s => s.kind === "line" && s.index === i)) {
            const hs = 10 / zoom;
            if (Math.abs(point.x - l.x1) <= hs && Math.abs(point.y - l.y1) <= hs) return i;
            if (Math.abs(point.x - l.x2) <= hs && Math.abs(point.y - l.y2) <= hs) return i;
          }
        }
        return null;
      })();

      const hitArrowShape = (() => {
        for (let i = arrows.length - 1; i >= 0; i--) {
          const a = arrows[i];
          if (distToSegment(point.x, point.y, a.x1, a.y1, a.x2, a.y2) <= 6 / zoom) return i;
          if (selectedShape.some(s => s.kind === "arrow" && s.index === i)) {
            const hs = 10 / zoom;
            if (Math.abs(point.x - a.x1) <= hs && Math.abs(point.y - a.y1) <= hs) return i;
            if (Math.abs(point.x - a.x2) <= hs && Math.abs(point.y - a.y2) <= hs) return i;
          }
        }
        return null;
      })();

      const hitFrame = (() => {
        for (let i = frames.length - 1; i >= 0; i--) {
          const f = frames[i];
          if (point.x >= f.x && point.x <= f.x + f.width && point.y >= f.y && point.y <= f.y + f.height) return i;
          if (selectedShape.some(s => s.kind === "frame" && s.index === i)) {
            const hs = 14 / zoom;
            const x = f.x, y = f.y, w = f.width, h = f.height;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitFigure = (() => {
        for (let i = figures.length - 1; i >= 0; i--) {
          const f = figures[i];
          if (point.x >= f.x && point.x <= f.x + f.width && point.y >= f.y && point.y <= f.y + f.height) return i;
          if (selectedShape.some(s => s.kind === "figure" && s.index === i)) {
            const hs = 14 / zoom;
            const x = f.x, y = f.y, w = f.width, h = f.height;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitCode = (() => {
        for (let i = codes.length - 1; i >= 0; i--) {
          const c = codes[i];
          if (point.x >= c.x && point.x <= c.x + c.width && point.y >= c.y && point.y <= c.y + c.height) return i;
          if (selectedShape.some(s => s.kind === "code" && s.index === i)) {
            const hs = 14 / zoom;
            const x = c.x, y = c.y, w = c.width, h = c.height;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs / 2 && Math.abs(point.y - h.y) <= hs / 2)) return i;
          }
        }
        return null;
      })();

      const hitPoly = (() => {
        for (let i = polygons.length - 1; i >= 0; i--) {
          const p = polygons[i];
          if (point.x >= p.x && point.x <= p.x + p.width && point.y >= p.y && point.y <= p.y + p.height) return i;
          if (selectedShape.some(s => s.kind === "poly" && s.index === i)) {
            const hs = 12 / zoom;
            const pad = 0;
            const x = p.x - pad;
            const y = p.y - pad;
            const w = p.width + pad * 2;
            const h = p.height + pad * 2;
            const handles = [
              { x: x, y: y }, { x: x + w, y: y }, { x: x, y: y + h }, { x: x + w, y: y + h },
              { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }, { x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }
            ];
            if (handles.some(h => Math.abs(point.x - h.x) <= hs && Math.abs(point.y - h.y) <= hs)) return i;
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
          const fromBounds = getShapeBounds(c.from);
          const toBounds = getShapeBounds(c.to);
          const points = getConnectorPoints(fromPt, toPt, c.from.anchor, c.to.anchor, fromBounds || undefined, toBounds || undefined, zoom);
          if (distToPolyline(point.x, point.y, points) <= 10 / zoom) return i;
        }
        return null;
      })();

      let picked: SelectedShapeInfo | null = null;
      if (hitImage != null) picked = { kind: "image", index: hitImage, id: images[hitImage].id };
      else if (hitText != null) picked = { kind: "text", index: hitText, id: texts[hitText].id };
      else if (hitCircle != null) picked = { kind: "circle", index: hitCircle, id: circles[hitCircle].id };
      else if (hitPoly != null) picked = { kind: "poly", index: hitPoly, id: polygons[hitPoly].id };
      else if (hitLine != null) picked = { kind: "line", index: hitLine, id: lines[hitLine].id };
      else if (hitArrowShape != null) picked = { kind: "arrow", index: hitArrowShape, id: arrows[hitArrowShape].id };
      else if (hitRect != null) picked = { kind: "rect", index: hitRect, id: rectangles[hitRect].id };
      else if (hitConnector != null) picked = { kind: "connector", index: hitConnector, id: connectors[hitConnector].id };
      else if (hitFrame !== null) picked = { kind: "frame", index: hitFrame, id: frames[hitFrame].id };
      else if (hitFigure !== null) picked = { kind: "figure", index: hitFigure, id: figures[hitFigure].id };
      else if (hitCode !== null) picked = { kind: "code", index: hitCode, id: codes[hitCode].id };

      if (picked) {
        let workingPicked = picked;
        let workingState: HistoryEntry | null = null;
        
        if (event.altKey) {
          const isAlreadySelected = selectedShape.some(s => s.kind === picked.kind && s.id === picked.id);
          const toDuplicate = isAlreadySelected ? selectedShape : [picked];
          const result = duplicateForDrag(toDuplicate);
          if (result) {
            workingPicked = result.selection.find(s => s.id === result.selection[result.selection.length - 1].id) || result.selection[0];
            workingState = result.state;
            setSelectedShape(result.selection);
          }
        }

        if (!workingState) {
          const isAlreadySelected = selectedShape.some(s => s.kind === workingPicked.kind && s.id === workingPicked.id);
          if (!isAlreadySelected) {
            setSelectedShape([workingPicked]);
          }
        }

        pointerStartRef.current = { x: point.x, y: point.y };
        dragShapesStartRef.current = workingState || {
          rectangles: [...rectangles],
          circles: [...circles],
          lines: [...lines],
          arrows: [...arrows],
          paths: [...paths],
          images: [...images],
          texts: [...texts],
          frames: [...frames],
          connectors: [...connectors],
          polygons: [...polygons],
          figures: [...figures],
          codes: [...codes],
        };

        // Setup Drag Modes
        const s_rects = workingState ? workingState.rectangles : rectangles;
        const s_circles = workingState ? workingState.circles : circles;
        const s_images = workingState ? workingState.images : images;
        const s_texts = workingState ? workingState.texts : texts;
        const s_frames = workingState ? workingState.frames : frames;
        const s_polygons = workingState ? workingState.polygons : polygons;
        const s_lines = workingState ? workingState.lines : lines;
        const s_arrows = workingState ? workingState.arrows : arrows;
        const s_figures = workingState ? workingState.figures : figures;
        const s_codes = workingState ? workingState.codes : codes;
        const s_connectors = workingState ? workingState.connectors : connectors;

        if (workingPicked.kind === "rect") {
          const r = s_rects[workingPicked.index];
          if (!r) return;
          const hs = 14 / zoom;
          const corners = [ 
            { x: r.x, y: r.y, sx: -1, sy: -1 }, 
            { x: r.x + r.width, y: r.y, sx: 1, sy: -1 }, 
            { x: r.x, y: r.y + r.height, sx: -1, sy: 1 }, 
            { x: r.x + r.width, y: r.y + r.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragRectStartRef.current = { ...r };
          if (hitCorner) {
            dragRectCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-nwse";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - r.y) <= tol && point.x >= r.x - tol && point.x <= r.x + r.width + tol;
            const onBottom = Math.abs(point.y - (r.y + r.height)) <= tol && point.x >= r.x - tol && point.x <= r.x + r.width + tol;
            const onLeft = Math.abs(point.x - r.x) <= tol && point.y >= r.y - tol && point.y <= r.y + r.height + tol;
            const onRight = Math.abs(point.x - (r.x + r.width)) <= tol && point.y >= r.y - tol && point.y <= r.y + r.width + tol;
            
            if (onTop || onBottom) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-v";
            } else if (onLeft || onRight) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "circle") {
          const c = s_circles[workingPicked.index];
          if (!c) return;
          const hs = 12 / zoom;
          const corners = [ 
            { x: c.x - c.rx, y: c.y - c.ry, sx: -1, sy: -1 }, 
            { x: c.x + c.rx, y: c.y - c.ry, sx: 1, sy: -1 }, 
            { x: c.x - c.rx, y: c.y + c.ry, sx: -1, sy: 1 }, 
            { x: c.x + c.rx, y: c.y + c.ry, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(cn => Math.abs(point.x - cn.x) <= hs && Math.abs(point.y - cn.y) <= hs);
          
          dragCircleStartRef.current = { ...c };
          if (hitCorner) {
            dragCircleCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-circle";
          } else {
            const tol = 10 / zoom;
            const b = { x: c.x - c.rx, y: c.y - c.ry, w: c.rx * 2, h: c.ry * 2 };
            const onTop = Math.abs(point.y - b.y) <= tol && point.x >= b.x - tol && point.x <= b.x + b.w + tol;
            const onBottom = Math.abs(point.y - (b.y + b.h)) <= tol && point.x >= b.x - tol && point.x <= b.x + b.w + tol;
            const onLeft = Math.abs(point.x - b.x) <= tol && point.y >= b.y - tol && point.y <= b.y + b.h + tol;
            const onRight = Math.abs(point.x - (b.x + b.w)) <= tol && point.y >= b.y - tol && point.y <= b.y + b.h + tol;

            if (onTop || onBottom) {
              dragCircleCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-circle-v";
            } else if (onLeft || onRight) {
              dragCircleCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-circle-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "image") {
          const im = s_images[workingPicked.index];
          if (!im) return;
          const hs = 14 / zoom;
          const corners = [ 
            { x: im.x, y: im.y, sx: -1, sy: -1 }, 
            { x: im.x + im.width, y: im.y, sx: 1, sy: -1 }, 
            { x: im.x, y: im.y + im.height, sx: -1, sy: 1 }, 
            { x: im.x + im.width, y: im.y + im.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragImageStartRef.current = { ...im, aspect: im.width / im.height };
          if (hitCorner) {
            dragImageCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-image";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - im.y) <= tol && point.x >= im.x - tol && point.x <= im.x + im.width + tol;
            const onBottom = Math.abs(point.y - (im.y + im.height)) <= tol && point.x >= im.x - tol && point.x <= im.x + im.width + tol;
            const onLeft = Math.abs(point.x - im.x) <= tol && point.y >= im.y - tol && point.y <= im.y + im.height + tol;
            const onRight = Math.abs(point.x - (im.x + im.width)) <= tol && point.y >= im.y - tol && point.y <= im.y + im.width + tol;
            
            if (onTop || onBottom) {
              dragImageCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-image-v";
            } else if (onLeft || onRight) {
              dragImageCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-image-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "text") {
          const t = s_texts[workingPicked.index];
          if (!t) return;
          const hs = 14 / zoom;
          const corners = [ 
            { x: t.x, y: t.y, sx: -1, sy: -1 }, 
            { x: t.x + t.width, y: t.y, sx: 1, sy: -1 }, 
            { x: t.x, y: t.y + t.height, sx: -1, sy: 1 }, 
            { x: t.x + t.width, y: t.y + t.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragTextStartRef.current = { ...t };
          if (hitCorner) {
            dragTextCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-text";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - t.y) <= tol && point.x >= t.x - tol && point.x <= t.x + t.width + tol;
            const onBottom = Math.abs(point.y - (t.y + t.height)) <= tol && point.x >= t.x - tol && point.x <= t.x + t.width + tol;
            const onLeft = Math.abs(point.x - t.x) <= tol && point.y >= t.y - tol && point.y <= t.y + t.height + tol;
            const onRight = Math.abs(point.x - (t.x + t.width)) <= tol && point.y >= t.y - tol && point.y <= t.y + t.width + tol;
            
            if (onTop || onBottom) {
              dragTextCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-text-v";
            } else if (onLeft || onRight) {
              dragTextCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-text-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "frame") {
          const f = s_frames[workingPicked.index];
          if (!f) return;
          const hs = 14 / zoom;
          const corners = [ 
            { x: f.x, y: f.y, sx: -1, sy: -1 }, 
            { x: f.x + f.width, y: f.y, sx: 1, sy: -1 }, 
            { x: f.x, y: f.y + f.height, sx: -1, sy: 1 }, 
            { x: f.x + f.width, y: f.y + f.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragFrameStartRef.current = { ...f };
          if (hitCorner) {
            dragFrameCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-nwse";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - f.y) <= tol && point.x >= f.x - tol && point.x <= f.x + f.width + tol;
            const onBottom = Math.abs(point.y - (f.y + f.height)) <= tol && point.x >= f.x - tol && point.x <= f.x + f.width + tol;
            const onLeft = Math.abs(point.x - f.x) <= tol && point.y >= f.y - tol && point.y <= f.y + f.height + tol;
            const onRight = Math.abs(point.x - (f.x + f.width)) <= tol && point.y >= f.y - tol && point.y <= f.y + f.width + tol;
            
            if (onTop || onBottom) {
              dragFrameCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-v";
            } else if (onLeft || onRight) {
              dragFrameCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "poly") {
          const p = s_polygons[workingPicked.index];
          if (!p) return;
          const hs = 12 / zoom;
          const corners = [ 
            { x: p.x, y: p.y, sx: -1, sy: -1 }, 
            { x: p.x + p.width, y: p.y, sx: 1, sy: -1 }, 
            { x: p.x, y: p.y + p.height, sx: -1, sy: 1 }, 
            { x: p.x + p.width, y: p.y + p.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragPolyStartRef.current = { ...p } as any; // hack
          if (hitCorner) {
            dragRectCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-nwse";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - p.y) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onBottom = Math.abs(point.y - (p.y + p.height)) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onLeft = Math.abs(point.x - p.x) <= tol && point.y >= p.y - tol && point.y <= p.y + p.height + tol;
            const onRight = Math.abs(point.x - (p.x + p.width)) <= tol && point.y >= p.y - tol && point.y <= p.y + p.width + tol;
            
            if (onTop || onBottom) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-v";
            } else if (onLeft || onRight) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "figure") {
          const p = s_figures[workingPicked.index];
          if (!p) return;
          const hs = 12 / zoom;
          const corners = [ 
            { x: p.x, y: p.y, sx: -1, sy: -1 }, 
            { x: p.x + p.width, y: p.y, sx: 1, sy: -1 }, 
            { x: p.x, y: p.y + p.height, sx: -1, sy: 1 }, 
            { x: p.x + p.width, y: p.y + p.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragPolyStartRef.current = { ...p } as any;
          if (hitCorner) {
            dragRectCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-nwse";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - p.y) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onBottom = Math.abs(point.y - (p.y + p.height)) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onLeft = Math.abs(point.x - p.x) <= tol && point.y >= p.y - tol && point.y <= p.y + p.height + tol;
            const onRight = Math.abs(point.x - (p.x + p.width)) <= tol && point.y >= p.y - tol && point.y <= p.y + p.height + tol;
            
            if (onTop || onBottom) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-v";
            } else if (onLeft || onRight) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "code") {
          const p = s_codes[workingPicked.index];
          if (!p) return;
          const hs = 12 / zoom;
          const corners = [ 
            { x: p.x, y: p.y, sx: -1, sy: -1 }, 
            { x: p.x + p.width, y: p.y, sx: 1, sy: -1 }, 
            { x: p.x, y: p.y + p.height, sx: -1, sy: 1 }, 
            { x: p.x + p.width, y: p.y + p.height, sx: 1, sy: 1 } 
          ];
          const hitCorner = corners.find(c => Math.abs(point.x - c.x) <= hs / 2 && Math.abs(point.y - c.y) <= hs / 2);
          
          dragPolyStartRef.current = { ...p } as any;
          if (hitCorner) {
            dragRectCornerRef.current = { sx: hitCorner.sx, sy: hitCorner.sy };
            dragModeRef.current = "resize-nwse";
          } else {
            const tol = 10 / zoom;
            const onTop = Math.abs(point.y - p.y) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onBottom = Math.abs(point.y - (p.y + p.height)) <= tol && point.x >= p.x - tol && point.x <= p.x + p.width + tol;
            const onLeft = Math.abs(point.x - p.x) <= tol && point.y >= p.y - tol && point.y <= p.y + p.height + tol;
            const onRight = Math.abs(point.x - (p.x + p.width)) <= tol && point.y >= p.y - tol && point.y <= p.y + p.height + tol;
            
            if (onTop || onBottom) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : (onRight ? 1 : 0)), sy: (onTop ? -1 : 1) };
              dragModeRef.current = "resize-v";
            } else if (onLeft || onRight) {
              dragRectCornerRef.current = { sx: (onLeft ? -1 : 1), sy: 0 };
              dragModeRef.current = "resize-h";
            } else {
              dragModeRef.current = "move";
            }
          }
        } else if (workingPicked.kind === "line" || workingPicked.kind === "arrow") {
          const l = workingPicked.kind === "line" ? s_lines[workingPicked.index] : s_arrows[workingPicked.index];
          if (!l) return;
          const hs = 14 / zoom;
          const hitStart = Math.hypot(point.x - l.x1, point.y - l.y1) <= hs / 2;
          const hitEnd = Math.hypot(point.x - l.x2, point.y - l.y2) <= hs / 2;
          
          if (workingPicked.kind === "line") {
            dragLineStartRef.current = { ...l };
          } else {
            dragArrowStartRef.current = { ...l };
          }

          if (hitStart || hitEnd) {
            // sx: -1 for start, 1 for end
            dragRectCornerRef.current = { sx: hitStart ? -1 : 1, sy: 0 };
            dragModeRef.current = workingPicked.kind === "line" ? "resize-line" : "resize-arrow";
          } else {
            dragModeRef.current = "move";
          }
        } else if (workingPicked.kind === "connector") {
          const c = s_connectors[workingPicked.index];
          if (!c) return;
          const fromPt = getAnchorPoint(c.from);
          const toPt = getAnchorPoint(c.to);
          const hs = 14 / zoom;
          
          dragConnectorStartRef.current = { ...c };
          const hitFrom = fromPt && Math.hypot(point.x - fromPt.x, point.y - fromPt.y) <= hs / 2;
          const hitTo = toPt && Math.hypot(point.x - toPt.x, point.y - toPt.y) <= hs / 2;
          
          if (hitFrom || hitTo) {
            dragRectCornerRef.current = { sx: hitFrom ? -1 : 1, sy: 0 }; // sx -1 means from, 1 means to
            dragConnectorOriginalAnchorRef.current = hitFrom ? c.from : c.to;
            dragModeRef.current = "resize-connector";
          } else {
            dragModeRef.current = "move";
          }
        }
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        return;
      } else {
        dragShapesStartRef.current = null;
        selectionStartRef.current = point;
        setSelectionRect({ x: point.x, y: point.y, width: 0, height: 0 });
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        setSelectedShape([]);
        return;
      }
    }

    if (tool === "Eraser") { isErasingRef.current = true; eraseAtPoint(point); (event.target as HTMLElement).setPointerCapture(event.pointerId); return; }
    if (tool === "Hand") { startPan(event, false); return; }
    if (tool === "Rectangle") { rectStartRef.current = point; isDrawingRectRef.current = true; setCurrentRect({ x: point.x, y: point.y, width: 0, height: 0 }); (event.target as HTMLElement).setPointerCapture(event.pointerId); }
    else if (tool === "Circle") { circleStartRef.current = point; isDrawingCircleRef.current = true; setCurrentCircle({ x: point.x, y: point.y, rx: 0, ry: 0 }); (event.target as HTMLElement).setPointerCapture(event.pointerId); }
    else if (tool === "Line") { isDrawingLineRef.current = true; setCurrentLine({ x1: point.x, y1: point.y, x2: point.x, y2: point.y }); (event.target as HTMLElement).setPointerCapture(event.pointerId); }
    else if (tool === "Arrow") {
      const tolerance = 12 / zoom;
      const startAnchor = hoverAnchor || anchorHandles.find(h => Math.hypot(point.x - h.point.x, point.y - h.point.y) <= tolerance);
      if (startAnchor) {
        setPendingConnector({ from: { kind: startAnchor.kind, shapeId: startAnchor.shapeId, anchor: startAnchor.anchor, percent: startAnchor.percent ?? 0.5 }, previewPoint: startAnchor.point });
      } else {
        isDrawingArrowRef.current = true;
        setCurrentArrow({ x1: point.x, y1: point.y, x2: point.x, y2: point.y });
      }
      (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }
    else if (tool === "Pencil") { isDrawingPathRef.current = true; setCurrentPath({ points: [point], stroke: strokeColor, strokeWidth: strokeWidth }); (event.target as HTMLElement).setPointerCapture(event.pointerId); }
    else if (tool === "Frame") { rectStartRef.current = point; isDrawingFrameRef.current = true; setCurrentFrame({ x: point.x, y: point.y, width: 0, height: 0 }); (event.target as HTMLElement).setPointerCapture(event.pointerId); }
    else if (tool === "Text") {
      const initialFontSize = 18;
      const measured = measureText("", initialFontSize);
      setTextEditor({ 
        canvasX: point.x, 
        canvasY: point.y, 
        value: "", 
        fontSize: initialFontSize, 
        boxWidth: measured.width || 20,
        boxHeight: measured.height || 25,
        index: null 
      });
      setSelectedShape([]);
      setActiveTool("Select");
    }
  }, [resolveTool, startPan, isPlusMenuOpen, setIsPlusMenuOpen, toCanvasPointFromClient, pendingAddShapeLabel, rectangles, setRectangles, pushHistory, setSelectedShape, circles, setCircles, polygons, setPolygons, setActiveTool, setPendingAddShapeLabel, activeTool, pendingAddIcon, setImages, images, setPendingAddIcon, setSelectionRect, zoom, texts, lines, arrows, frames, duplicateForDrag, setCurrentRect, setCurrentCircle, setCurrentLine, setCurrentArrow, setCurrentPath, setCurrentFrame, setTextEditor, eraseAtPoint, selectedShape, anchorHandles, hoverAnchor, setPendingConnector, connectors, getAnchorPoint, strokeColor, strokeWidth, theme, figures, setFigures, codes, setCodes, isPanningRef, panStartRef, pointerStartRef, textEditor, commitTextEditor, editingCodeId]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = toCanvasPointFromClient(event.clientX, event.clientY);
    const tool = resolveTool(event);

    const isDragging = dragModeRef.current !== "none" || isErasingRef.current || isDrawingRectRef.current || isDrawingCircleRef.current || isDrawingLineRef.current || isDrawingArrowRef.current || isDrawingPathRef.current || isDrawingFrameRef.current;

    // Cursor Styling & Hover State
    let nextCursor = "default";
    if (isHandPanning || isPanningRef.current) {
      nextCursor = "grabbing";
    } else if (tool === "Hand") {
      nextCursor = "grab";
    } else if (tool === "Eraser") {
      const radius = Math.max(8, strokeWidth);
      const cursorSize = radius * 2;
      const color = theme === "dark" ? "%23ffffff" : "%23000000";
      const svg = `<svg width='${cursorSize}' height='${cursorSize}' viewBox='0 0 ${cursorSize} ${cursorSize}' xmlns='http://www.w3.org/2000/svg'><circle cx='${radius}' cy='${radius}' r='${radius-2}' fill='${color}' stroke='white' stroke-width='1'/></svg>`;
      nextCursor = `url("data:image/svg+xml,${svg}") ${radius} ${radius}, auto`;
    } else if (tool === "Pencil") {
      const color = theme === "dark" ? "%23ffffff" : "%23000000";
      const svg = `<svg width='24' height='24' viewBox='-5 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M18.344 4.781l-3.406 3.063s1.125 0.688 2.156 1.656c1 0.969 1.719 2.063 1.719 2.063l2.906-3.469s-0.031-0.625-1.406-1.969c-1.406-1.344-1.969-1.344-1.969-1.344zM7.25 21.938l-0.156 1.5 10.813-11.25s-0.719-1-1.594-1.844c-0.906-0.875-1.938-1.563-1.938-1.563l-10.813 11.25 1.688-0.094 0.188 1.813zM0 26.719l2.688-5.5 1.5-0.125 0.125 1.719 1.813 0.25-0.188 1.375-5.438 2.75z' fill='${color}'/></svg>`;
      nextCursor = `url("data:image/svg+xml,${svg}") 3 20, auto`;
    } else if (tool !== "Select") {
      nextCursor = "crosshair";
    } else if (dragModeRef.current !== "none") {
      if (dragModeRef.current === "move") {
        nextCursor = "move";
      } else if (dragModeRef.current.includes("-h")) nextCursor = "ew-resize";
      else if (dragModeRef.current.includes("-v")) nextCursor = "ns-resize";
      else nextCursor = "nwse-resize";
    } else {
      const { rectangles, circles, images, texts, frames, polygons, lines, arrows, figures, codes } = stateRef.current;
      if (selectedShapeRef.current.length > 0) {
        const { kind, index } = selectedShapeRef.current[0];
        let s: any = null;
        if (kind === "rect") s = rectangles[index];
        else if (kind === "circle") s = circles[index];
        else if (kind === "image") s = images[index];
        else if (kind === "text") s = texts[index];
        else if (kind === "frame") s = frames[index];
        else if (kind === "poly") s = polygons[index];
        else if (kind === "line") s = lines[index];
        else if (kind === "arrow") s = arrows[index];
        else if (kind === "figure") s = figures[index];
        else if (kind === "code") s = codes[index];

        if (s) {
          let b = { x: 0, y: 0, w: 0, h: 0 };
          if (kind === "circle") { b = { x: s.x - s.rx, y: s.y - s.ry, w: s.rx * 2, h: s.ry * 2 }; }
          else if (kind === "line" || kind === "arrow") {
            const x = Math.min(s.x1, s.x2); const y = Math.min(s.y1, s.y2);
            b = { x, y, w: Math.max(1, Math.abs(s.x2 - s.x1)), h: Math.max(1, Math.abs(s.y2 - s.y1)) };
          } else { b = { x: s.x, y: s.y, w: s.width, h: s.height }; }

          const tol = 10 / zoom;
          const onLeft = Math.abs(point.x - b.x) <= tol;
          const onRight = Math.abs(point.x - (b.x + b.w)) <= tol;
          const onTop = Math.abs(point.y - b.y) <= tol;
          const onBottom = Math.abs(point.y - (b.y + b.h)) <= tol;
          const inX = point.x >= b.x - tol && point.x <= b.x + b.w + tol;
          const inY = point.y >= b.y - tol && point.y <= b.y + b.h + tol;

          if (inX && inY) {
            if (kind === "code") {
              // Code Block: only horizontal resizing
              if ((onLeft || onRight) && !(onTop || onBottom)) { 
                 nextCursor = "ew-resize";
              } else {
                 nextCursor = "move"; // Don't show resize cursor for corners or top/bottom
              }
            } else {
              if ((onLeft && onTop) || (onRight && onBottom)) nextCursor = "nwse-resize";
              else if ((onRight && onTop) || (onLeft && onBottom)) nextCursor = "nesw-resize";
              else if (onLeft || onRight) nextCursor = "ew-resize";
              else if (onTop || onBottom) nextCursor = "ns-resize";
              else nextCursor = "move";
            }
          }
        }
      }
      
        const hitNormal = [...rectangles, ...circles, ...images, ...texts, ...frames, ...polygons, ...codes, ...figures].some(s => {
          if ("rx" in s) {
            const dx = (point.x - s.x) / s.rx; const dy = (point.y - s.y) / s.ry;
            return dx * dx + dy * dy <= 1.05;
          }
          return point.x >= s.x && point.x <= s.x + (s.width || 0) && point.y >= s.y && point.y <= s.y + (s.height || 0);
        }) || [...lines, ...arrows].some(l => distToSegment(point.x, point.y, l.x1, l.y1, l.x2, l.y2) <= 8 / zoom);
        
        if (hitNormal) nextCursor = "move";
      }
    if (nextCursor !== cursorStyleRef.current) {
      setCursorStyle(nextCursor);
    }

    // Anchor Detection for Arrows
    let nearest: any = null;
    if (tool === "Arrow" && !isDragging) {
      const { rectangles, images, texts, frames, polygons, circles, anchorHandles } = stateRef.current;
      const tolerance = 14 / zoom;
      const borderTolerance = 20 / zoom;
      let bestDist = tolerance;

      for (const h of anchorHandles) {
        const d = Math.hypot(point.x - h.point.x, point.y - h.point.y);
        if (d <= bestDist) { bestDist = d; nearest = h; }
      }

      if (!nearest) {
        const allShapes = [
          ...rectangles.map(s => ({ ...s, kind: "rect" as const })),
          ...images.map(s => ({ ...s, kind: "image" as const })),
          ...texts.map(s => ({ ...s, kind: "text" as const })),
          ...frames.map(s => ({ ...s, kind: "frame" as const })),
          ...polygons.map(s => ({ ...s, kind: "poly" as const })),
        ];

        for (const s of allShapes) {
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

      if (!nearest) {
        for (const c of circles) {
          const dx = point.x - c.x; const dy = point.y - c.y; const distFromCenter = Math.hypot(dx, dy);
          const toleranceSq = 20 / zoom; const avgR = (c.rx + c.ry) / 2;
          if (Math.abs(distFromCenter - avgR) <= toleranceSq) {
            const angle = Math.atan2(dy, dx); const deg = (angle * 180) / Math.PI;
            let side: AnchorSide = "right";
            if (deg > -45 && deg <= 45) side = "right"; else if (deg > 45 && deg <= 135) side = "bottom"; else if (deg > 135 || deg <= -135) side = "left"; else side = "top";
            nearest = { kind: "circle", shapeId: c.id, anchor: side, point: { x: c.x + c.rx * Math.cos(angle), y: c.y + c.ry * Math.sin(angle) } };
            break;
          }
        }
      }

      if (pendingConnector) setPendingConnector((prev) => prev ? { ...prev, previewPoint: nearest ? nearest.point : point } : null);
    }
    
    // Final Hover Anchor update - only if changes from current ref
    const hasChanged = 
      (nearest === null && hoverAnchorRef.current !== null) ||
      (nearest !== null && hoverAnchorRef.current === null) ||
      (nearest?.shapeId !== hoverAnchorRef.current?.shapeId) || 
      (nearest?.anchor !== hoverAnchorRef.current?.anchor) || 
      (nearest?.percent !== hoverAnchorRef.current?.percent) ||
      (nearest?.point?.x !== hoverAnchorRef.current?.point?.x) ||
      (nearest?.point?.y !== hoverAnchorRef.current?.point?.y);

    if (hasChanged) {
      setHoverAnchor(nearest);
    }

    if (isPanningRef.current) {
      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;
      setPan({ x: panStartRef.current.x + dx / zoom, y: panStartRef.current.y + dy / zoom });
      return;
    }

    if (tool === "Eraser" && isErasingRef.current) {
      eraseAtPoint(point);
      return;
    }

    if (tool === "Select" && selectedShapeRef.current.length > 0) {
      if (dragModeRef.current === "move" && dragShapesStartRef.current) {
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;
        
        // Only update if there's actual movement
        if (dx === 0 && dy === 0) return;
        
        const startState = dragShapesStartRef.current;

        const selKinds = new Set(selectedShapeRef.current.map(s => s.kind));

        if (selKinds.has("rect")) {
          setRectangles(prev => prev.map(r => {
            const sel = selectedShapeRef.current.find(s => s.kind === "rect" && s.id === r.id);
            if (sel) {
              const startR = startState.rectangles.find(sr => sr.id === r.id);
              if (startR) return { ...r, x: startR.x + dx, y: startR.y + dy };
            }
            return r;
          }));
        }

        if (selKinds.has("circle")) {
          setCircles(prev => prev.map(c => {
            const sel = selectedShapeRef.current.find(s => s.kind === "circle" && s.id === c.id);
            if (sel) {
              const startC = startState.circles.find(sc => sc.id === c.id);
              if (startC) return { ...c, x: startC.x + dx, y: startC.y + dy };
            }
            return c;
          }));
        }

        if (selKinds.has("image")) {
          setImages(prev => prev.map(im => {
            const sel = selectedShapeRef.current.find(s => s.kind === "image" && s.id === im.id);
            if (sel) {
              const startIm = startState.images.find(sim => sim.id === im.id);
              if (startIm) return { ...im, x: startIm.x + dx, y: startIm.y + dy };
            }
            return im;
          }));
        }

        if (selKinds.has("text")) {
          setTexts(prev => prev.map(t => {
            const sel = selectedShapeRef.current.find(s => s.kind === "text" && s.id === t.id);
            if (sel) {
              const startT = startState.texts.find(st => st.id === t.id);
              if (startT) return { ...t, x: startT.x + dx, y: startT.y + dy };
            }
            return t;
          }));
        }

        if (selKinds.has("frame")) {
          setFrames(prev => prev.map(f => {
            const sel = selectedShapeRef.current.find(s => s.kind === "frame" && s.id === f.id);
            if (sel) {
              const startF = startState.frames.find(sf => sf.id === f.id);
              if (startF) return { ...f, x: startF.x + dx, y: startF.y + dy };
            }
            return f;
          }));
        }

        if (selKinds.has("poly")) {
          setPolygons(prev => prev.map(p => {
            const sel = selectedShapeRef.current.find(s => s.kind === "poly" && s.id === p.id);
            if (sel) {
              const startP = startState.polygons.find(sp => sp.id === p.id);
              if (startP) return { ...p, x: startP.x + dx, y: startP.y + dy };
            }
            return p;
          }));
        }

        if (selKinds.has("line")) {
          setLines(prev => prev.map(l => {
            const sel = selectedShapeRef.current.find(s => s.kind === "line" && s.id === l.id);
            if (sel) {
              const startL = startState.lines.find(sl => sl.id === l.id);
              if (startL) return { ...l, x1: startL.x1 + dx, y1: startL.y1 + dy, x2: startL.x2 + dx, y2: startL.y2 + dy };
            }
            return l;
          }));
        }

        if (selKinds.has("arrow")) {
          setArrows(prev => prev.map(a => {
            const sel = selectedShapeRef.current.find(s => s.kind === "arrow" && s.id === a.id);
            if (sel) {
              const startA = startState.arrows.find(sa => sa.id === a.id);
              if (startA) return { ...a, x1: startA.x1 + dx, y1: startA.y1 + dy, x2: startA.x2 + dx, y2: startA.y2 + dy };
            }
            return a;
          }));
        }

        if (selKinds.has("figure")) {
          setFigures(prev => prev.map(f => {
            const sel = selectedShapeRef.current.find(s => s.kind === "figure" && s.id === f.id);
            if (sel) {
              const startF = startState.figures.find(sf => sf.id === f.id);
              if (startF) return { ...f, x: startF.x + dx, y: startF.y + dy };
            }
            return f;
          }));
        }

        if (selKinds.has("code")) {
          setCodes(prev => prev.map(c => {
            const sel = selectedShapeRef.current.find(s => s.kind === "code" && s.id === c.id);
            if (sel) {
              const startC = startState.codes.find(sc => sc.id === c.id);
              if (startC) return { ...c, x: startC.x + dx, y: startC.y + dy };
            }
            return c;
          }));
        }

        return;
      }


      // Resizing Logic
      const dx = point.x - pointerStartRef.current.x;
      const dy = point.y - pointerStartRef.current.y;
      
      if (dragModeRef.current.startsWith("resize-") && selectedShape.length > 0) {
        const { kind, index } = selectedShape[0];
        const cornerPattern = dragModeRef.current;
        const isH = cornerPattern.endsWith("-h");
        const isV = cornerPattern.endsWith("-v");
        const dx = point.x - pointerStartRef.current.x;
        const dy = point.y - pointerStartRef.current.y;

        if (kind === "rect" && dragRectStartRef.current) {
          const base = dragRectStartRef.current; const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
          const minSize = 4 / zoom;
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          const newW = Math.max(minSize, base.width + dx * eSx);
          const newH = Math.max(minSize, base.height + dy * eSy);
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setRectangles(prev => prev.map((r, i) => i === index ? { ...r, x: newX, y: newY, width: newW, height: newH } : r));
        } else if (kind === "circle" && dragCircleStartRef.current) {
          const corner = dragCircleCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          let newRx = Math.max(2 / zoom, dragCircleStartRef.current.rx + dx * (eSx || 0));
          let newRy = Math.max(2 / zoom, dragCircleStartRef.current.ry + dy * (eSy || 0));
          if (event.shiftKey) { const m = Math.max(newRx, newRy); newRx = m; newRy = m; }
          setCircles(prev => prev.map((c, i) => i === index ? { ...c, rx: newRx, ry: newRy } : c));
        } else if (kind === "image" && dragImageStartRef.current) {
          const base = dragImageStartRef.current; const corner = dragImageCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          let newW = Math.max(4/zoom, base.width + dx * eSx);
          let newH = Math.max(4/zoom, base.height + dy * eSy);
          if (event.shiftKey && base.aspect) { if (newW / newH > base.aspect) newW = newH * base.aspect; else newH = newW / base.aspect; }
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setImages(prev => prev.map((im, i) => i === index ? { ...im, x: newX, y: newY, width: newW, height: newH } : im));
        } else if (kind === "text" && dragTextStartRef.current) {
          const base = dragTextStartRef.current; const corner = dragTextCornerRef.current ?? { sx: 1, sy: 1 };
          const eSy = isH ? 0 : corner.sy;
          const newH = Math.max(6/zoom, base.height + dy * eSy);
          const newFont = Math.max(8, base.fontSize * (newH / base.height));
          const measured = measureText(base.text, newFont);
          const newX = corner.sx < 0 ? base.x + (base.width - measured.width) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - measured.height) : base.y;
          setTexts(prev => prev.map((t, i) => i === index ? { ...t, x: newX, y: newY, fontSize: newFont, width: measured.width, height: measured.height } : t));
        } else if (kind === "frame" && dragFrameStartRef.current) {
          const base = dragFrameStartRef.current; const corner = dragFrameCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          const newW = Math.max(8/zoom, base.width + dx * eSx);
          const newH = Math.max(8/zoom, base.height + dy * eSy);
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setFrames(prev => prev.map((f, i) => i === index ? { ...f, x: newX, y: newY, width: newW, height: newH } : f));
        } else if (kind === "poly" && dragPolyStartRef.current) {
          const base = dragPolyStartRef.current; const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          const newW = Math.max(4/zoom, base.width + dx * eSx);
          const newH = Math.max(4/zoom, base.height + dy * eSy);
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setPolygons(prev => prev.map((p, i) => i === index ? { ...p, x: newX, y: newY, width: newW, height: newH } : p));
        } else if (kind === "line" && dragLineStartRef.current && cornerPattern === "resize-line") {
          const base = dragLineStartRef.current;
          const isStart = (dragRectCornerRef.current?.sx || 1) < 0;
          setLines(prev => prev.map((l, i) => i === index ? 
            (isStart ? { ...l, x1: point.x, y1: point.y } : { ...l, x2: point.x, y2: point.y }) 
          : l));
        } else if (kind === "arrow" && dragArrowStartRef.current && cornerPattern === "resize-arrow") {
          const base = dragArrowStartRef.current;
          const isStart = (dragRectCornerRef.current?.sx || 1) < 0;
          setArrows(prev => prev.map((l, i) => i === index ? 
            (isStart ? { ...l, x1: point.x, y1: point.y } : { ...l, x2: point.x, y2: point.y }) 
          : l));
        } else if (kind === "figure" && dragPolyStartRef.current) {
          const base = dragPolyStartRef.current; const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx; const eSy = isH ? 0 : corner.sy;
          const newW = Math.max(20/zoom, base.width + dx * eSx);
          const newH = Math.max(20/zoom, base.height + dy * eSy);
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setFigures(prev => prev.map((f, i) => i === index ? { ...f, x: newX, y: newY, width: newW, height: newH } : f));
        } else if (kind === "code" && dragPolyStartRef.current) {
          const base = dragPolyStartRef.current; 
          const corner = dragRectCornerRef.current ?? { sx: 1, sy: 1 };
          const eSx = isV ? 0 : corner.sx;
          const eSy = isH ? 0 : corner.sy;
          const newW = Math.max(40/zoom, base.width + dx * eSx);
          const newH = Math.max(20/zoom, base.height + dy * eSy);
          const newX = eSx < 0 ? base.x + (base.width - newW) : base.x;
          const newY = eSy < 0 ? base.y + (base.height - newH) : base.y;
          setCodes(prev => prev.map((c, i) => i === index ? { ...c, x: newX, y: newY, width: newW, height: newH } : c));
        } else if (kind === "connector" && dragConnectorStartRef.current && cornerPattern === "resize-connector") {
          const base = dragConnectorStartRef.current;
          const isFrom = (dragRectCornerRef.current?.sx || 1) < 0;
          
          // Find nearest anchor
          const { rectangles, images, texts, frames, polygons, circles, anchorHandles, figures, codes } = stateRef.current;
          const tolerance = 20 / zoom;
          let nearestAnchor: any = null;
          let bestDist = tolerance;

          // Check explicit handles
          for (const h of anchorHandles) {
            const d = Math.hypot(point.x - h.point.x, point.y - h.point.y);
            if (d <= bestDist) { bestDist = d; nearestAnchor = h; }
          }

          // If no handle, check shape borders
          if (!nearestAnchor) {
            const allShapes = [
              ...rectangles.map(r => ({ ...r, kind: "rect" as const })),
              ...images.map(r => ({ ...r, kind: "image" as const })),
              ...texts.map(r => ({ ...r, kind: "text" as const })),
              ...frames.map(r => ({ ...r, kind: "frame" as const })),
              ...polygons.map(r => ({ ...r, kind: "poly" as const })),
              ...figures.map(r => ({ ...r, kind: "figure" as const })),
              ...codes.map(r => ({ ...r, kind: "code" as const })),
            ];

            for (const s of allShapes) {
              const b = { x: s.x, y: s.y, w: s.width, h: s.height };
              const dists = [
                { d: Math.abs(point.y - b.y), a: "top" as const, p: (point.x - b.x) / b.w },
                { d: Math.abs(point.y - (b.y + b.h)), a: "bottom" as const, p: (point.x - b.x) / b.w },
                { d: Math.abs(point.x - b.x), a: "left" as const, p: (point.y - b.y) / b.h },
                { d: Math.abs(point.x - (b.x + b.w)), a: "right" as const, p: (point.y - b.y) / b.h },
              ];

              for (const hit of dists) {
                if (hit.d <= bestDist && hit.p >= -0.1 && hit.p <= 1.1) {
                  bestDist = hit.d;
                  nearestAnchor = {
                    kind: s.kind,
                    shapeId: s.id,
                    anchor: hit.a,
                    percent: Math.max(0, Math.min(1, hit.p)),
                    point: { x: point.x, y: point.y } // Temp point for hover
                  };
                }
              }
            }

            // Circles as well
            for (const c of circles) {
              const b = { x: c.x - c.rx, y: c.y - c.ry, w: c.rx * 2, h: c.ry * 2 };
              const dists = [
                { d: Math.hypot(point.x - c.x, point.y - b.y), a: "top" as const },
                { d: Math.hypot(point.x - c.x, point.y - (b.y + b.h)), a: "bottom" as const },
                { d: Math.hypot(point.x - b.x, point.y - c.y), a: "left" as const },
                { d: Math.hypot(point.x - (b.x + b.w), point.y - c.y), a: "right" as const },
              ];
              for (const hit of dists) {
                if (hit.d <= bestDist) {
                  bestDist = hit.d;
                  nearestAnchor = { kind: "circle", shapeId: c.id, anchor: hit.a, point: { x: point.x, y: point.y } };
                }
              }
            }
          }

          let newAnchor: ConnectorAnchor;
          if (nearestAnchor) {
            newAnchor = {
              kind: nearestAnchor.kind as ShapeKind,
              shapeId: nearestAnchor.shapeId,
              anchor: nearestAnchor.anchor as AnchorSide,
              percent: nearestAnchor.percent
            };
          } else {
            newAnchor = {
              kind: "point",
              shapeId: "floating",
              anchor: "none",
              point: { x: point.x, y: point.y }
            };
          }

          setConnectors(prev => prev.map((c, i) => i === index ? {
            ...c,
            [isFrom ? 'from' : 'to']: newAnchor
          } : c));
          setHoverAnchor(nearestAnchor || null);
        }
      }
    }

    if (tool === "Select" && selectionStartRef.current) {
      setSelectionRect({ x: selectionStartRef.current.x, y: selectionStartRef.current.y, width: point.x - selectionStartRef.current.x, height: point.y - selectionStartRef.current.y });
    }

    // Drawing Logic
    if (tool === "Rectangle" && isDrawingRectRef.current) {
      let width = point.x - rectStartRef.current.x; let height = point.y - rectStartRef.current.y;
      if (event.shiftKey) { const size = Math.max(Math.abs(width), Math.abs(height)); width = width >= 0 ? size : -size; height = height >= 0 ? size : -size; }
      setCurrentRect({ x: rectStartRef.current.x, y: rectStartRef.current.y, width, height });
    } else if (tool === "Circle" && isDrawingCircleRef.current) {
      let rx = Math.max(1/zoom, Math.abs(point.x - circleStartRef.current.x));
      let ry = Math.max(1/zoom, Math.abs(point.y - circleStartRef.current.y));
      if (event.shiftKey) { const m = Math.max(rx, ry); rx = m; ry = m; }
      setCurrentCircle({ x: circleStartRef.current.x, y: circleStartRef.current.y, rx, ry });
    } else if (tool === "Line" && isDrawingLineRef.current) {
      setCurrentLine(prev => {
        if (!prev) return null;
        let x2 = point.x; let y2 = point.y;
        if (event.shiftKey) { if (Math.abs(x2 - prev.x1) >= Math.abs(y2 - prev.y1)) y2 = prev.y1; else x2 = prev.x1; }
        return { ...prev, x2, y2 };
      });
    } else if (tool === "Arrow" && isDrawingArrowRef.current) {
      setCurrentArrow(prev => {
        if (!prev) return null;
        let x2 = point.x; let y2 = point.y;
        if (event.shiftKey) { if (Math.abs(x2 - prev.x1) >= Math.abs(y2 - prev.y1)) y2 = prev.y1; else x2 = prev.x1; }
        return { ...prev, x2, y2 };
      });
    } else if (tool === "Pencil" && isDrawingPathRef.current) {
      setCurrentPath(prev => {
        if (!prev) return null;
        const last = prev.points[prev.points.length - 1];
        let { x, y } = point;
        if (event.shiftKey && last) { if (Math.abs(x - last.x) >= Math.abs(y - last.y)) y = last.y; else x = last.x; }
        return { ...prev, points: [...prev.points, { x, y }] };
      });
    } else if (tool === "Frame" && isDrawingFrameRef.current) {
      let width = point.x - rectStartRef.current.x; let height = point.y - rectStartRef.current.y;
      if (event.shiftKey) { const size = Math.max(Math.abs(width), Math.abs(height)); width = width >= 0 ? size : -size; height = height >= 0 ? size : -size; }
      setCurrentFrame({ x: rectStartRef.current.x, y: rectStartRef.current.y, width, height });
    } else if (isErasingRef.current) {
      eraseAtPoint(point);
    }
  }, [toCanvasPointFromClient, resolveTool, isHandPanning, zoom, pendingConnector, setHoverAnchor, setRectangles, setCircles, setImages, setTexts, setFrames, setPolygons, setArrows, setLines, isPanningRef, panStartRef, pointerStartRef, setPan, isErasingRef, eraseAtPoint, isDrawingRectRef, rectStartRef, setCurrentRect, isDrawingCircleRef, circleStartRef, setCurrentCircle, isDrawingLineRef, setCurrentLine, isDrawingArrowRef, setCurrentArrow, isDrawingPathRef, setCurrentPath, isDrawingFrameRef, setCurrentFrame, setSelectionRect, theme, strokeWidth, figures, codes, setFigures, setCodes, selectedShape, setConnectors]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const tool = pointerToolRef.current || resolveTool(event);
    pointerToolRef.current = "";

    if (isPanningRef.current) { 
      isPanningRef.current = false; 
      setIsHandPanning(false); 
      (event.target as HTMLElement).releasePointerCapture(event.pointerId); 
      return; 
    }
    if (isErasingRef.current) { 
      isErasingRef.current = false; 
      pushHistory(); 
      (event.target as HTMLElement).releasePointerCapture(event.pointerId); 
      return; 
    }
    
    if (tool === "Select") {
      if (selectionRect) {
        const normX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
        const normY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
        const normW = Math.abs(selectionRect.width);
        const normH = Math.abs(selectionRect.height);

        const newSelection: SelectedShape = [];

        rectangles.forEach((s, i) => {
          if (s.x >= normX && s.x + s.width <= normX + normW && s.y >= normY && s.y + s.height <= normY + normH) {
            newSelection.push({ kind: "rect", index: i, id: s.id });
          }
        });
        circles.forEach((s, i) => {
          if (s.x - s.rx >= normX && s.x + s.rx <= normX + normW && s.y - s.ry >= normY && s.y + s.ry <= normY + normH) {
            newSelection.push({ kind: "circle", index: i, id: s.id });
          }
        });
        images.forEach((s, i) => {
          if (s.x >= normX && s.x + s.width <= normX + normW && s.y >= normY && s.y + s.height <= normY + normH) {
            newSelection.push({ kind: "image", index: i, id: s.id });
          }
        });
        texts.forEach((s, i) => {
          if (s.x >= normX && s.x + s.width <= normX + normW && s.y >= normY && s.y + s.height <= normY + normH) {
            newSelection.push({ kind: "text", index: i, id: s.id });
          }
        });
        frames.forEach((s, i) => {
          if (s.x >= normX && s.x + s.width <= normX + normW && s.y >= normY && s.y + s.height <= normY + normH) {
            newSelection.push({ kind: "frame", index: i, id: s.id });
          }
        });
        polygons.forEach((s, i) => {
          if (s.x >= normX && s.x + s.width <= normX + normW && s.y >= normY && s.y + s.height <= normY + normH) {
            newSelection.push({ kind: "poly", index: i, id: s.id });
          }
        });
        lines.forEach((s, i) => {
          const xmin = Math.min(s.x1, s.x2); const xmax = Math.max(s.x1, s.x2);
          const ymin = Math.min(s.y1, s.y2); const ymax = Math.max(s.y1, s.y2);
          if (xmin >= normX && xmax <= normX + normW && ymin >= normY && ymax <= normY + normH) {
            newSelection.push({ kind: "line", index: i, id: s.id });
          }
        });
        arrows.forEach((s, i) => {
          const xmin = Math.min(s.x1, s.x2); const xmax = Math.max(s.x1, s.x2);
          const ymin = Math.min(s.y1, s.y2); const ymax = Math.max(s.y1, s.y2);
          if (xmin >= normX && xmax <= normX + normW && ymin >= normY && ymax <= normY + normH) {
            newSelection.push({ kind: "arrow", index: i, id: s.id });
          }
        });

        setSelectedShape(newSelection);
        setSelectionRect(null); 
        selectionStartRef.current = null;
      } else if (selectedShape.length > 0) {


        if (dragModeRef.current !== "none") { 
          dragModeRef.current = "none"; 
          pushHistory(); 
        }
      }
    } else if (tool === "Rectangle" && isDrawingRectRef.current) {
      isDrawingRectRef.current = false;
      const rect = { 
        id: makeId(), 
        x: rectStartRef.current.x, 
        y: rectStartRef.current.y, 
        width: (event.clientX - canvasRef.current!.getBoundingClientRect().left - pan.x)/zoom - rectStartRef.current.x, 
        height: (event.clientY - canvasRef.current!.getBoundingClientRect().top - pan.y)/zoom - rectStartRef.current.y 
      };
      // Normalize rect
      if (rect.width < 0) { rect.x += rect.width; rect.width = Math.abs(rect.width); }
      if (rect.height < 0) { rect.y += rect.height; rect.height = Math.abs(rect.height); }
      if (rect.width > 2 && rect.height > 2) {
        const next = [...rectangles, rect]; 
        setRectangles(next); 
        pushHistory({ rectangles: next }); 
        setSelectedShape([{ kind: "rect", index: next.length - 1, id: rect.id }]);
        setActiveTool("Select");
      }
      setCurrentRect(null);
    } else if (tool === "Circle" && isDrawingCircleRef.current) {
      isDrawingCircleRef.current = false;
      const point = toCanvasPointFromClient(event.clientX, event.clientY);
      const rx = Math.abs(point.x - circleStartRef.current.x);
      const ry = Math.abs(point.y - circleStartRef.current.y);
      if (rx > 2 && ry > 2) {
        const next = [...circles, { id: makeId(), x: circleStartRef.current.x, y: circleStartRef.current.y, rx, ry }];
        setCircles(next); pushHistory({ circles: next }); setSelectedShape([{ kind: "circle", index: next.length - 1, id: next[next.length - 1].id }]);
        setActiveTool("Select");
      }
      setCurrentCircle(null);
    } else if (tool === "Line" && isDrawingLineRef.current) {
      isDrawingLineRef.current = false;
      const point = toCanvasPointFromClient(event.clientX, event.clientY);
      if (Math.hypot(point.x - currentLine?.x1 || 0, point.y - currentLine?.y1 || 0) > 4) {
        const next = [...lines, { id: makeId(), x1: currentLine!.x1, y1: currentLine!.y1, x2: point.x, y2: point.y }];
        setLines(next); pushHistory({ lines: next }); setSelectedShape([{ kind: "line", index: next.length - 1, id: next[next.length - 1].id }]);
        setActiveTool("Select");
      }
      setCurrentLine(null);
    } else if (tool === "Arrow") {
      if (pendingConnector) {
        const point = toCanvasPointFromClient(event.clientX, event.clientY);
        const toAnchor: ConnectorAnchor = hoverAnchor 
          ? { kind: hoverAnchor.kind, shapeId: hoverAnchor.shapeId, anchor: hoverAnchor.anchor, percent: hoverAnchor.percent ?? 0.5 }
          : { kind: "point", shapeId: "floating", anchor: "none", point };

        const next = [...connectors, { id: makeId(), from: pendingConnector.from, to: toAnchor }];
        setConnectors(next); 
        pushHistory({ connectors: next });
        setActiveTool("Select");
        setPendingConnector(null);
      } else if (isDrawingArrowRef.current) {
        isDrawingArrowRef.current = false;
        const point = toCanvasPointFromClient(event.clientX, event.clientY);
        if (Math.hypot(point.x - currentArrow!.x1, point.y - currentArrow!.y1) > 4) {
          const next = [...arrows, { id: makeId(), x1: currentArrow!.x1, y1: currentArrow!.y1, x2: point.x, y2: point.y }];
          setArrows(next); pushHistory({ arrows: next }); setSelectedShape([{ kind: "arrow", index: next.length - 1, id: next[next.length - 1].id }]);
          setActiveTool("Select");
        }
        setCurrentArrow(null);
      }
    } else if (tool === "Pencil" && isDrawingPathRef.current) {
      isDrawingPathRef.current = false;
      if (currentPath && currentPath.points.length > 2) {
        const next = [...paths, { 
          id: makeId(), 
          points: currentPath.points,
          stroke: currentPath.stroke || strokeColor,
          strokeWidth: currentPath.strokeWidth || strokeWidth
        }];
        setPaths(next); pushHistory({ paths: next });
      }
      setCurrentPath(null);
    } else if (tool === "Frame" && isDrawingFrameRef.current) {
      isDrawingFrameRef.current = false;
      const point = toCanvasPointFromClient(event.clientX, event.clientY);
      let w = point.x - rectStartRef.current.x; let h = point.y - rectStartRef.current.y;
      let x = rectStartRef.current.x; let y = rectStartRef.current.y;
      if (w < 0) { x += w; w = Math.abs(w); } if (h < 0) { y += h; h = Math.abs(h); }
      if (w > 10 && h > 10) {
        const next = [...frames, { id: makeId(), x, y, width: w, height: h, frameNumber: frames.length + 1 }];
        setFrames(next); pushHistory({ frames: next }); setSelectedShape([{ kind: "frame", index: next.length - 1, id: next[next.length - 1].id }]);
        setActiveTool("Select");
      }
      setCurrentFrame(null);
    }
    
    setRerenderTick(t => t + 1);
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }, [resolveTool, setIsHandPanning, pushHistory, selectionRect, selectedShape, rectangles, setRectangles, pan, zoom, canvasRef, setCurrentRect, setCurrentCircle, setCurrentLine, setCurrentArrow, setCurrentPath, setCurrentFrame, circles, setCircles, lines, setLines, arrows, setArrows, paths, setPaths, frames, setFrames, connectors, setConnectors, pendingConnector, hoverAnchor, toCanvasPointFromClient, currentLine, currentArrow, currentPath, setRerenderTick, strokeColor, strokeWidth, theme, figures, setFigures, codes, setCodes]);

  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toCanvasPointFromClient(event.clientX, event.clientY);
    const tool = resolveTool(event as any);

    if (tool === "Select" || tool === "Hand") {
      const hitFigIndex = figures.findIndex(f => 
        point.x >= f.x && point.x <= f.x + f.width && 
        point.y >= f.y - 30/zoom && point.y <= f.y + 10/zoom
      );
      if (hitFigIndex !== -1) {
        const f = figures[hitFigIndex];
        const initialText = f.title || `Figure ${f.figureNumber}`;
        const measured = measureText(initialText, 12 / zoom);
        setTextEditor({ 
          canvasX: f.x, 
          canvasY: f.y - 20/zoom, 
          value: initialText, 
          fontSize: 12/zoom, 
          fill: theme === "dark" ? "white" : "black",
          boxWidth: measured.width,
          boxHeight: measured.height,
          index: hitFigIndex, 
          kind: "figure" 
        } as any);
        return;
      }

      const hitTextIndex = texts.findIndex(t => 
        point.x >= t.x && point.x <= t.x + t.width && 
        point.y >= t.y && point.y <= t.y + t.height
      );
      if (hitTextIndex !== -1) {
        const t = texts[hitTextIndex];
        const measured = measureText(t.text, t.fontSize, t.fontFamily);
        setTextEditor({ 
          canvasX: t.x, 
          canvasY: t.y, 
          value: t.text, 
          fontSize: t.fontSize, 
          fontFamily: t.fontFamily,
          textAlign: t.textAlign,
          fill: t.fill,
          boxWidth: measured.width,
          boxHeight: measured.height,
          index: hitTextIndex 
        });
        setSelectedShape([]);
        return;
      }

      const hitCodeIndex = codes.findIndex(c => 
        point.x >= c.x && point.x <= c.x + c.width && 
        point.y >= c.y && point.y <= c.y + c.height
      );
      if (hitCodeIndex !== -1) {
        setEditingCodeId(codes[hitCodeIndex].id);
        setSelectedShape([{ kind: "code", index: hitCodeIndex, id: codes[hitCodeIndex].id }]);
        setActiveTool("Select");
        return;
      }
    }
  }, [activeTool, figures, texts, codes, zoom, toCanvasPointFromClient, resolveTool, setTextEditor, setEditingCodeId, setSelectedShape]);

  const handleWheel = useCallback((event: WheelEvent) => {
    // Crucial: calling on the native event to prevent browser zoom
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp((-event.deltaY / 100) * 0.12);
      const nextZoom = clampZoom(zoom * factor);
      const actualFactor = nextZoom / zoom;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      setPan({
        x: mouseX - (mouseX - pan.x) * actualFactor,
        y: mouseY - (mouseY - pan.y) * actualFactor,
      });
      setZoom(nextZoom);
    } else {
      setPan({ x: pan.x - event.deltaX, y: pan.y - event.deltaY });
    }
  }, [zoom, clampZoom, setZoom, pan, setPan, canvasRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // We use a native event listener with passive: false to properly preventDefault() 
    // and stop the browser's default zoom behavior.
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [containerRef, handleWheel]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    const point = toCanvasPointFromClient(event.clientX, event.clientY);
    
    // We'll process files sequentially or in parallel, but here allow parallel
    // We need to fetch the helpers inside the loop or ensure we have recent state.
    // However, setImages etc are state setters, so they are fine.
    // CAUTION: Using 'images' from closure might be stale if we await.
    // Let's use functional state updates.

    for (const file of files) {
       // 1. Create a placeholder text for "Uploading..."
       const placeholderId = makeId();
       const placeholderText: TextShape = {
          id: placeholderId,
          x: point.x,
          y: point.y,
          width: 200,
          height: 50,
          text: "Uploading... 0%",
          fontSize: 18,
          fontFamily: "Clean",
          fill: "#ffffff",
       };

       setTexts(prev => [...prev, placeholderText]);

       try {
         const result = await uploadFileToCloudinary(file, (percent) => {
            setTexts(prev => prev.map(t => t.id === placeholderId ? { ...t, text: `Uploading... ${percent}%` } : t));
         });

         // 2. On success, remove placeholder and add image
         setTexts(prev => prev.filter(t => t.id !== placeholderId));

         const img = new Image();
         img.onload = () => {
             if (imageCacheRef.current) imageCacheRef.current[result.secureUrl] = img;
             setImages(prev => {
                const next = [...prev, {
                   id: makeId(),
                   src: result.secureUrl,
                   x: point.x,
                   y: point.y,
                   width: img.naturalWidth / 2, // Default to half size as generic images can be huge
                   height: img.naturalHeight / 2 // Default to half size
                }];
                pushHistory({ images: next });
                return next;
             });
         };
         img.src = result.secureUrl;

       } catch (err) {
         console.error("Upload failed", err);
         setTexts(prev => prev.map(t => t.id === placeholderId ? { ...t, text: "Upload Failed", fill: "#ff0000" } : t));
         // Remove after 3 seconds
         setTimeout(() => {
            setTexts(prev => prev.filter(t => t.id !== placeholderId));
         }, 3000);
       }
    }
  }, [toCanvasPointFromClient, setTexts, setImages, pushHistory, imageCacheRef]);


  const fitToScreen = useCallback(() => {
    const bounds = getContentBounds();
    if (!bounds || !canvasRef.current) return;
    const canvasWidth = canvasRef.current.width / window.devicePixelRatio;
    const canvasHeight = canvasRef.current.height / window.devicePixelRatio;
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const nextZoom = clampZoom(Math.min((canvasWidth - 80) / contentWidth, (canvasHeight - 80) / contentHeight, 1));
    setZoom(nextZoom);
    setPan({ x: (canvasWidth / nextZoom - contentWidth) / 2 - bounds.minX, y: (canvasHeight / nextZoom - contentHeight) / 2 - bounds.minY });
  }, [getContentBounds, canvasRef, clampZoom, setZoom, setPan]);

  return {
    cursorStyle, hoverAnchor, pendingConnector, textEditor, selectionRect, editingCodeId,
    setHoverAnchor, setPendingConnector, setTextEditor, setSelectionRect, setEditingCodeId,
    toCanvasPointFromClient, canvasToClient, startPan, resolveTool, setCursorStyle, 
    handlePointerDown, handlePointerMove, handlePointerUp, handleDoubleClick, handleWheel, handleDrop,
    commitTextEditor, cancelTextEditor, fitToScreen
  };
};


