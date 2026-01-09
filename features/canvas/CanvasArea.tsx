/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { Plus, X } from "lucide-react";
import {
  ShapeKind,
  AnchorSide,
  HistoryEntry,
  CanvasAreaProps,
  PlusMenuView,
  ConnectorAnchor,
  Tool,
} from "./types";
import {
  getRectAnchor,
  getCircleAnchor,
  getAnchorPoint,
  getShapeBounds,
  getContentBounds,
} from "./utils/geometry";
import { measureText } from "./utils/canvas-helpers";
import {
  drawImageItem,
  drawText,
  drawRect,
  drawCircle,
  drawFrame,
  drawPoly,
  drawLine,
  drawArrow,
  drawConnector,
  drawPath,
  drawFigure,
  drawSelectionOverlay,
} from "./utils/drawing";

import { useCanvasView } from "./hooks/useCanvasView";
import { useCanvasShapes } from "./hooks/useCanvasShapes";
import { useCanvasHistory } from "./hooks/useCanvasHistory";
import { useCanvasIcons } from "./hooks/useCanvasIcons";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";
import { useCanvasCommands } from "./hooks/useCanvasCommands";

import { Toolbar } from "./components/Toolbar";
import { PlusMenu } from "./components/PlusMenu";
import { ZoomControls } from "./components/ZoomControls";
import { HistoryControls } from "./components/HistoryControls";
import { TextEditor } from "./components/TextEditor";
import { FrameButtons } from "./components/FrameButtons";
import { ConnectorHandles } from "./components/ConnectorHandles";
import FloatingToolbar from "./components/FloatingToolbar";
import { PencilToolbar } from "./components/PencilToolbar";
import CodeBlock from "./components/CodeBlock";

const CanvasArea = ({ initialData, onChange: _onChange }: CanvasAreaProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const [rerenderTick, setRerenderTick] = useState(0);

  // View state
  const { 
    zoom, setZoom, pan, setPan, zoomIn, zoomOut, resetView, 
    canvasToClient, toCanvasPointFromClient: _toCanvasPointFromClient, clampZoom 
  } = useCanvasView(canvasContainerRef);

  // Tools state
  const [activeTool, setActiveTool] = useState<Tool>("Select");
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [plusMenuView, setPlusMenuView] = useState<PlusMenuView>("categories");
  const [plusMenuSubView, setSubView] = useState<string | null>(null);
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const [visibleIconsLimit, setVisibleIconsLimit] = useState(60);
  const [pendingAddIcon, setPendingAddIcon] = useState<{ name: string; src: string } | null>(null);
  const [pendingAddShapeLabel, setPendingAddShapeLabel] = useState<string | null>(null);

  // Shapes and History state
  const {
    rectangles, setRectangles, circles, setCircles, lines, setLines, arrows, setArrows,
    paths, setPaths, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, figures, setFigures, codes, setCodes,
    selectedShape, setSelectedShape, hoverAnchor, setHoverAnchor,
    currentRect, setCurrentRect, currentCircle, setCurrentCircle,
    currentLine, setCurrentLine, currentArrow, setCurrentArrow,
    currentPath, setCurrentPath, currentFrame, setCurrentFrame,
    imageCacheRef, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth
  } = useCanvasShapes(initialData);

  const {
    history, setHistory, historyIndex, setHistoryIndex, pushHistory: basePushHistory,
    undo: _undo, redo: _redo, canUndo, canRedo, isUndoRedoRef
  } = useCanvasHistory({
    rectangles, circles, lines, arrows, paths, images, texts, frames, connectors, polygons, figures, codes
  });

  const [isHandPanning, setIsHandPanning] = useState(false);
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  // Snapshot logic
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
      figures: overrides?.figures ?? figures,
      codes: overrides?.codes ?? codes,
    }),
    [rectangles, circles, lines, arrows, paths, images, texts, frames, connectors, polygons, figures, codes]
  );

  const pushHistory = useCallback((overrides?: Partial<HistoryEntry>) => {
    basePushHistory(snapshot(overrides));
  }, [basePushHistory, snapshot]);

  // Commands
  const { deleteSelected, duplicateSelection } = useCanvasCommands({
    rectangles, setRectangles, circles, setCircles, lines, setLines, arrows, setArrows,
    paths, setPaths, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, figures, setFigures, codes, setCodes, selectedShape, setSelectedShape
  }, pushHistory);

  // Icons library
  const { filteredLibraryIcons, isLibraryLoading } = useCanvasIcons(plusMenuView, plusMenuSubView, iconSearchQuery);

  const { resolvedTheme } = useTheme();
  const themeText = resolvedTheme === "dark" ? "white" : "black";
  const themeStroke = resolvedTheme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const themeFrameBg = resolvedTheme === "dark" ? "rgba(30,30,30,0.5)" : "rgba(240,240,240,0.5)";

  const getAnchorPointLocal = useCallback((a: ConnectorAnchor) => getAnchorPoint(a, { rectangles, circles, images, texts, frames, polygons, figures, codes }), [rectangles, circles, images, texts, frames, polygons, figures, codes]);
  const getShapeBoundsLocal = useCallback((a: ConnectorAnchor) => getShapeBounds(a, { rectangles, circles, images, texts, frames, polygons, figures, codes }), [rectangles, circles, images, texts, frames, polygons, figures, codes]);
  const getContentBoundsLocal = useCallback(() => getContentBounds({ rectangles, circles, lines, arrows, paths, images, texts, frames, polygons }), [rectangles, circles, lines, arrows, paths, images, texts, frames, polygons]);

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
    figures.forEach((f) => addRectHandles(f, "figure"));
    codes.forEach((c) => addRectHandles(c, "code"));

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
  }, [activeTool, circles, rectangles, images, texts, frames, polygons, figures, codes]);

  const onUpdateShape = useCallback((kind: string, index: number, updates: Record<string, any>) => {
    const updateFn = <T extends object>(prev: T[]) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    };
    if (kind === "rect") { setRectangles((prev) => { const n = updateFn(prev); pushHistory({ rectangles: n }); return n; }); }
    else if (kind === "circle") { setCircles((prev) => { const n = updateFn(prev); pushHistory({ circles: n }); return n; }); }
    else if (kind === "poly") { setPolygons((prev) => { const n = updateFn(prev); pushHistory({ polygons: n }); return n; }); }
    else if (kind === "line") { setLines((prev) => { const n = updateFn(prev); pushHistory({ lines: n }); return n; }); }
    else if (kind === "arrow") { setArrows((prev) => { const n = updateFn(prev); pushHistory({ arrows: n }); return n; }); }
    else if (kind === "text") { 
      setTexts((prev) => { 
        const next = [...prev]; 
        const old = next[index];
        const updated = { ...old, ...updates };
        if (updates.fontSize !== undefined || updates.text !== undefined || updates.fontFamily !== undefined) {
           const size = measureText(updated.text, updated.fontSize, updated.fontFamily);
           updated.width = size.width;
           updated.height = size.height;
        }
        next[index] = updated;
        pushHistory({ texts: next }); 
        return next; 
      }); 
    }
    else if (kind === "frame") { setFrames((prev) => { const n = updateFn(prev); pushHistory({ frames: n }); return n; }); }
    else if (kind === "image") { setImages((prev) => { const n = updateFn(prev); pushHistory({ images: n }); return n; }); }
    else if (kind === "figure") { setFigures((prev) => { const n = updateFn(prev); pushHistory({ figures: n }); return n; }); }
    else if (kind === "code") { setCodes((prev) => { const n = updateFn(prev); pushHistory({ codes: n }); return n; }); }
  }, [setRectangles, setCircles, setPolygons, setLines, setArrows, setTexts, setFrames, setImages, setFigures, setCodes, pushHistory]);

  const onChangeKind = useCallback((kind: string, index: number, newKind: string) => {
    if (kind === newKind) return;
    let source: any = null;
    if (kind === "rect") source = rectangles[index];
    else if (kind === "circle") source = circles[index];
    else if (kind === "poly") source = polygons[index];
    else if (kind === "text") source = texts[index];
    else if (kind === "code") source = codes[index];
    
    if (!source) return;

    const common = { 
      id: source.id, 
      fill: source.fill, 
      stroke: source.stroke, 
      opacity: source.opacity,
      strokeDashArray: source.strokeDashArray
    };

    // Prepare removal from current kind
    if (kind === "rect") setRectangles(prev => prev.filter((_, i) => i !== index));
    else if (kind === "circle") setCircles(prev => prev.filter((_, i) => i !== index));
    else if (kind === "poly") setPolygons(prev => prev.filter((_, i) => i !== index));
    else if (kind === "text") setTexts(prev => prev.filter((_, i) => i !== index));
    else if (kind === "code") setCodes(prev => prev.filter((_, i) => i !== index));

    // Handle new kind
    if (newKind === "rect") {
      const w = kind === "circle" ? source.rx * 2 : source.width;
      const h = kind === "circle" ? source.ry * 2 : source.height;
      const x = kind === "circle" ? source.x - source.rx : source.x;
      const y = kind === "circle" ? source.y - source.ry : source.y;
      setRectangles(prev => {
        const next = [...prev, { ...common, x, y, width: w, height: h }];
        setSelectedShape([{ kind: "rect", index: next.length - 1, id: common.id }]);
        pushHistory({ rectangles: next });
        return next;
      });
    } else if (newKind === "circle") {
      const rx = (kind === "rect" || kind === "poly" ? source.width : 100) / 2;
      const ry = (kind === "rect" || kind === "poly" ? source.height : 100) / 2;
      const x = (kind === "rect" || kind === "poly" ? source.x : 0) + rx;
      const y = (kind === "rect" || kind === "poly" ? source.y : 0) + ry;
      setCircles(prev => {
        const next = [...prev, { ...common, x, y, rx, ry }];
        setSelectedShape([{ kind: "circle", index: next.length - 1, id: common.id }]);
        pushHistory({ circles: next });
        return next;
      });
    } else if (newKind === "text") {
      const val = kind === "code" ? source.code : "Text";
      setTexts(prev => {
        const measured = measureText(val, 18);
        const next = [...prev, { ...common, x: source.x, y: source.y, text: val, fontSize: 18, width: measured.width, height: measured.height, fontFamily: "Clean" as const }];
        setSelectedShape([{ kind: "text", index: next.length - 1, id: common.id }]);
        pushHistory({ texts: next });
        return next;
      });
    } else if (newKind === "code") {
      const val = kind === "text" ? source.text : "// Write your code here...";
      setCodes(prev => {
        const lineCount = val.split('\n').length;
        const estimatedHeight = Math.max(100, lineCount * 20 + 40);
        const next = [...prev, { ...common, x: source.x, y: source.y, width: 300, height: estimatedHeight, code: val, language: "Javascript" }];
        setSelectedShape([{ kind: "code", index: next.length - 1, id: common.id }]);
        pushHistory({ codes: next });
        return next;
      });
    } else if (newKind.startsWith("poly:")) {
      const type = newKind.split(":")[1];
      const w = kind === "circle" ? source.rx * 2 : source.width;
      const h = kind === "circle" ? source.ry * 2 : source.height;
      const x = kind === "circle" ? source.x - source.rx : source.x;
      const y = kind === "circle" ? source.y - source.ry : source.y;
      setPolygons(prev => {
        const next = [...prev, { ...common, x, y, width: w, height: h, type }];
        setSelectedShape([{ kind: "poly", index: next.length - 1, id: common.id }]);
        pushHistory({ polygons: next });
        return next;
      });
    }
  }, [rectangles, circles, polygons, texts, codes, setRectangles, setCircles, setPolygons, setTexts, setCodes, setSelectedShape, pushHistory]);

  const {
    cursorStyle, pendingConnector, textEditor, selectionRect, editingCodeId,
    setPendingConnector: _setPendingConnector, setTextEditor, 
    handlePointerDown, handlePointerMove, handlePointerUp, handleDoubleClick, handleWheel, handleDrop,
    commitTextEditor, cancelTextEditor, fitToScreen
  } = useCanvasInteraction({
    activeTool, setActiveTool, zoom, setZoom, pan, setPan,
    rectangles, setRectangles, circles, setCircles, lines, setLines, arrows, setArrows,
    paths, setPaths, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, selectedShape, setSelectedShape,
    figures, setFigures, codes, setCodes,
    currentRect, setCurrentRect, currentCircle, setCurrentCircle, currentLine, setCurrentLine,
    currentArrow, setCurrentArrow, currentPath, setCurrentPath, currentFrame, setCurrentFrame,
    pushHistory, isSpacePanning,
    setIsHandPanning, isHandPanning, anchorHandles,
    pendingAddIcon, setPendingAddIcon, pendingAddShapeLabel, setPendingAddShapeLabel,
    isPlusMenuOpen, setIsPlusMenuOpen, canvasRef,
    getAnchorPoint: getAnchorPointLocal,
    getShapeBounds: getShapeBoundsLocal,
    getContentBounds: getContentBoundsLocal,
    clampZoom, imageCacheRef, setHoverAnchor, hoverAnchor, setRerenderTick,
    containerRef: canvasContainerRef,
    strokeColor, strokeWidth,
    theme: resolvedTheme || "light"
  });

  const applySnapshot = useCallback(
    (entry: HistoryEntry) => {
      isUndoRedoRef.current = true;
      setSelectedShape([]);
      
      setRectangles(entry.rectangles || []);
      setCircles(entry.circles || []);
      setLines(entry.lines || []);
      setArrows(entry.arrows || []);
      setPaths(entry.paths || []);
      setImages(entry.images || []);
      setTexts(entry.texts || []);
      setFrames(entry.frames || []);
      setPolygons(entry.polygons || []);
      setConnectors(entry.connectors || []);
      setFigures(entry.figures || []);
      setCodes(entry.codes || []);
      
      isUndoRedoRef.current = false;
      setRerenderTick((t) => t + 1);
    },
    [setRectangles, setCircles, setLines, setArrows, setPaths, setImages, setTexts, setFrames, setPolygons, setConnectors, setFigures, setCodes, setSelectedShape]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const target = history[historyIndex - 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex - 1);
  }, [applySnapshot, history, historyIndex, setHistoryIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const target = history[historyIndex + 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex + 1);
  }, [applySnapshot, history, historyIndex, setHistoryIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.getAttribute("contenteditable") === "true");
      if (isTyping) return;

      if (e.code === "Space" && !e.repeat) setIsSpacePanning(true);
      if (e.key === "Delete") { e.preventDefault(); deleteSelected(); }

      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key.toLowerCase() === "z") { e.preventDefault(); handleUndo(); return; }
      if (isCmd && e.key.toLowerCase() === "r") { e.preventDefault(); handleRedo(); return; }
      if (isCmd && (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "d")) {
        e.preventDefault(); duplicateSelection(0); return;
      }
      if (isCmd && (e.key === "+" || e.key === "=")) { e.preventDefault(); zoomIn(); }
      else if (isCmd && e.key === "-") { e.preventDefault(); zoomOut(); }
      else if (isCmd && e.key === "0") { e.preventDefault(); resetView(); }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePanning(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [deleteSelected, duplicateSelection, handleUndo, handleRedo, zoomIn, zoomOut, resetView, setIsSpacePanning]);

  useEffect(() => {
    if (initialData?.snapshot) {
      applySnapshot(initialData.snapshot);
      setHistory([initialData.snapshot]);
      setHistoryIndex(0);
      if (initialData.pan) setPan(initialData.pan);
      if (initialData.zoom) setZoom(clampZoom(initialData.zoom));
    }
  }, []);

  useEffect(() => {
    pushHistory();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw all shapes using extracted drawing functions
    images.forEach((im, idx) =>
      drawImageItem(ctx, im, imageCacheRef.current, zoom, 1, selectedShape.some(s => s.kind === "image" && s.index === idx))
    );
    rectangles.forEach((r, idx) =>
      drawRect(ctx, r, themeStroke, zoom, selectedShape.some(s => s.kind === "rect" && s.index === idx))
    );
    circles.forEach((c, idx) =>
      drawCircle(ctx, c, themeStroke, zoom, selectedShape.some(s => s.kind === "circle" && s.index === idx))
    );
    polygons.forEach((p, idx) =>
      drawPoly(ctx, p, themeStroke, zoom, selectedShape.some(s => s.kind === "poly" && s.index === idx))
    );
    lines.forEach((l, idx) =>
      drawLine(ctx, l, themeStroke, zoom, selectedShape.some(s => s.kind === "line" && s.index === idx))
    );
    arrows.forEach((l, idx) =>
      drawArrow(ctx, l, themeStroke, zoom, selectedShape.some(s => s.kind === "arrow" && s.index === idx))
    );
    connectors.forEach((c, idx) => {
      const fromPt = getAnchorPointLocal(c.from);
      const toPt = getAnchorPointLocal(c.to);
      if (!fromPt || !toPt) return;
      drawConnector(ctx, fromPt, toPt, themeStroke, zoom, {
        fromAnchor: c.from.anchor,
        toAnchor: c.to.anchor,
        fromBounds: getShapeBoundsLocal(c.from) || undefined,
        toBounds: getShapeBoundsLocal(c.to) || undefined,
        highlight: selectedShape.some(s => s.kind === "connector" && s.index === idx),
      });
    });
    paths.forEach((p) => drawPath(ctx, p, themeStroke, zoom));
    texts.forEach((t, idx) => {
      if (textEditor?.index === idx) return;
      drawText(ctx, t, themeText, zoom, 1, selectedShape.some(s => s.kind === "text" && s.index === idx));
    });
    frames.forEach((f, idx) =>
      drawFrame(ctx, f, themeStroke, themeText, themeFrameBg, zoom, 1, selectedShape.some(s => s.kind === "frame" && s.index === idx))
    );
    figures.forEach((f, idx) =>
      drawFigure(ctx, f, themeStroke, themeText, zoom, selectedShape.some(s => s.kind === "figure" && s.index === idx), {
        hideTitle: textEditor?.kind === "figure" && textEditor?.index === idx
      })
    );
    // codes.forEach((c, idx) => {
    //   if (selectedShape.some(s => s.kind === "code" && s.id === c.id)) {
    //     drawSelectionOverlay(ctx, c.x, c.y, c.width, c.height, zoom, "code");
    //   }
    // });

    // Draw current drawing previews
    if (currentRect) drawRect(ctx, { ...currentRect, id: "preview" }, themeStroke, zoom);
    if (currentCircle) drawCircle(ctx, { ...currentCircle, id: "preview" }, themeStroke, zoom);
    if (currentLine) drawLine(ctx, { ...currentLine, id: "preview" }, themeStroke, zoom);
    if (currentArrow) drawArrow(ctx, { ...currentArrow, id: "preview" }, themeStroke, zoom);
    if (currentPath) drawPath(ctx, { ...currentPath }, themeStroke, zoom);
    if (currentFrame) drawFrame(ctx, { ...currentFrame, id: "preview", frameNumber: frames.length + 1 }, themeStroke, themeText, themeFrameBg, zoom);

    if (pendingConnector) {
      const fromPt = getAnchorPointLocal(pendingConnector.from);
      if (fromPt) {
        drawConnector(ctx, fromPt, pendingConnector.previewPoint, themeStroke, zoom, {
          highlight: true,
          fromAnchor: pendingConnector.from.anchor,
          toAnchor: hoverAnchor?.anchor,
          fromBounds: getShapeBoundsLocal(pendingConnector.from) || undefined,
        });
      }
    }

    ctx.restore();
  }, [
    rectangles, circles, connectors, getAnchorPointLocal, lines, arrows, paths, polygons,
    images, texts, frames, currentRect, currentCircle, currentLine, currentArrow,
    currentPath, pendingConnector, currentFrame, zoom, pan, selectedShape,
    rerenderTick, resolvedTheme, themeText, themeStroke, themeFrameBg, getShapeBoundsLocal, imageCacheRef, textEditor?.index, hoverAnchor
  ]);

  // Store onChange in a ref to avoid infinite loops
  const onChangeRef = useRef(_onChange);
  useEffect(() => {
    onChangeRef.current = _onChange;
  }, [_onChange]);

  useEffect(() => {
    onChangeRef.current?.({
      pan,
      zoom,
      snapshot: snapshot()
    });
  }, [rectangles, circles, lines, arrows, paths, images, texts, frames, connectors, polygons, pan, zoom, snapshot]);

  useEffect(() => {
    images.forEach((im) => {
      if (!imageCacheRef.current[im.src]) {
        const img = new Image();
        img.src = im.src;
        img.onload = () => setRerenderTick((t) => t + 1);
        imageCacheRef.current[im.src] = img;
      }
    });
  }, [images]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasContainerRef.current || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasContainerRef.current.getBoundingClientRect();
      
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      
      // Force redraw
      setRerenderTick(t => t + 1);
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const zoomPercent = Math.round(zoom * 100);
  
  const selectionOverlayStyle = useMemo(() => {
    if (!selectionRect) return undefined;
    const normX = selectionRect.width < 0 ? selectionRect.x + selectionRect.width : selectionRect.x;
    const normY = selectionRect.height < 0 ? selectionRect.y + selectionRect.height : selectionRect.y;
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

  return (
    <div
      ref={canvasContainerRef}
      className={`relative w-full h-full bg-background overflow-hidden`}
      onDragOver={handleDrop}
      onDrop={handleDrop}
    >
      {/* Background Layer (Visual) */}
      <div className={`absolute inset-0 pointer-events-none ${editingCodeId ? "z-30" : "z-0"}`}>
        {codes.map((c, i) => (
          <CodeBlock
            key={c.id}
            codeShape={c}
            isSelected={selectedShape.some((s) => s.kind === "code" && s.id === c.id)}
            isEditing={editingCodeId === c.id}
            onUpdate={(updates) => onUpdateShape("code", i, updates)}
            canvasToClient={canvasToClient}
            zoom={zoom}
          />
        ))}
      </div>

      {/* Rendering Layer (Canvas) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* Interaction Layer */}
      <div
        className="absolute inset-0 z-20 touch-none"
        onPointerDown={handlePointerDown as any}
        onPointerMove={handlePointerMove as any}
        onPointerUp={handlePointerUp as any}
        onPointerLeave={handlePointerUp as any}
        onDoubleClick={handleDoubleClick as any}
        onContextMenu={(e) => e.preventDefault()}
        style={{ cursor: cursorStyle }}
      />

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none z-[1000]">
        <TextEditor
          textEditor={textEditor}
          setTextEditor={setTextEditor}
          textAreaRef={textAreaRef}
          canvasToClient={canvasToClient}
          zoom={zoom}
          measureText={measureText}
          commitTextEditor={commitTextEditor}
          cancelTextEditor={cancelTextEditor}
        />

        {selectionOverlayStyle && (
          <div
            className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-30"
            style={selectionOverlayStyle}
          />
        )}

        <div className="pointer-events-auto contents">
          <ConnectorHandles
            activeTool={activeTool}
            anchorHandles={anchorHandles}
            hoverAnchor={hoverAnchor}
            canvasToClient={canvasToClient}
            selectedShape={selectedShape}
            connectors={connectors}
            getAnchorPoint={getAnchorPointLocal}
          />

          <FrameButtons
            frames={frames}
            canvasToClient={canvasToClient}
            zoom={zoom}
          />

          <FloatingToolbar
            selectedShape={selectedShape}
            rectangles={rectangles}
            circles={circles}
            images={images}
            texts={texts}
            frames={frames}
            polygons={polygons}
            lines={lines}
            arrows={arrows}
            codes={codes}
            connectors={connectors}
            canvasToClient={canvasToClient}
            onUpdateShape={onUpdateShape}
            onChangeKind={onChangeKind}
            onDelete={deleteSelected}
            onDuplicate={() => duplicateSelection(20)}
          />

          <HistoryControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          <ZoomControls
            zoomPercent={zoomPercent}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onFitToScreen={fitToScreen}
            onResetView={resetView}
          />

          <PlusMenu
            isOpen={isPlusMenuOpen}
            onClose={() => setIsPlusMenuOpen(false)}
            setIsOpen={setIsPlusMenuOpen}
            view={plusMenuView}
            setView={setPlusMenuView}
            subView={plusMenuSubView}
            setSubView={setSubView}
            searchQuery={iconSearchQuery}
            setSearchQuery={setIconSearchQuery}
            visibleIconsLimit={visibleIconsLimit}
            setVisibleIconsLimit={setVisibleIconsLimit}
            isLoading={isLibraryLoading}
            setIsLoading={() => {}} // Hook manages its own state
            onAddIcon={(name, src) => setPendingAddIcon({ name, src })}
            onAddShape={(label) => setPendingAddShapeLabel(label)}
            icons={filteredLibraryIcons}
            setActiveTool={setActiveTool}
            pendingAddIcon={pendingAddIcon}
            pendingAddShapeLabel={pendingAddShapeLabel}
          />

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              if (isPlusMenuOpen) {
                setIsPlusMenuOpen(false);
              } else {
                setPlusMenuView("categories");
                setSubView(null);
                setIsPlusMenuOpen(true);
              }
            }}
            className={`absolute left-6 top-6 h-10 w-10 flex items-center justify-center rounded-sm border transition-all duration-300 ${
              isPlusMenuOpen 
                ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                : "bg-background/80 backdrop-blur-xl border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground shadow-lg"
            }`}
            title={isPlusMenuOpen ? "Close Menu" : "Add Elements"}
          >
            <Plus className={`h-5 w-5 transition-transform duration-300 ${isPlusMenuOpen ? 'rotate-45' : 'rotate-0'}`} />
          </button>

          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />

          {(activeTool === "Pencil" || activeTool === "Eraser") && (
            <PencilToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              strokeColor={strokeColor}
              setStrokeColor={setStrokeColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
