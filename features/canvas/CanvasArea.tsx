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
    polygons, setPolygons, connectors, setConnectors, selectedShape, setSelectedShape,
    currentRect, setCurrentRect, currentCircle, setCurrentCircle, currentLine, setCurrentLine,
    currentArrow, setCurrentArrow, currentPath, setCurrentPath, currentFrame, setCurrentFrame,
    imageCacheRef, setHoverAnchor, hoverAnchor
  } = useCanvasShapes(initialData);

  const {
    history, setHistory, historyIndex, setHistoryIndex, pushHistory: basePushHistory,
    undo: _undo, redo: _redo, canUndo, canRedo, isUndoRedoRef
  } = useCanvasHistory({
    rectangles, circles, lines, arrows, paths, images, texts, frames, connectors, polygons
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
    }),
    [rectangles, circles, lines, arrows, paths, images, texts, frames, connectors, polygons]
  );

  const pushHistory = useCallback((overrides?: Partial<HistoryEntry>) => {
    basePushHistory(snapshot(overrides));
  }, [basePushHistory, snapshot]);

  // Commands
  const { deleteSelected, duplicateSelection } = useCanvasCommands({
    rectangles, setRectangles, circles, setCircles, lines, setLines, arrows, setArrows,
    paths, setPaths, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, selectedShape, setSelectedShape
  }, pushHistory);

  // Icons library
  const { filteredLibraryIcons, isLibraryLoading } = useCanvasIcons(plusMenuView, plusMenuSubView, iconSearchQuery);

  const { resolvedTheme } = useTheme();
  const themeText = resolvedTheme === "dark" ? "white" : "black";
  const themeStroke = resolvedTheme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const themeFrameBg = resolvedTheme === "dark" ? "rgba(30,30,30,0.5)" : "rgba(240,240,240,0.5)";

  const getAnchorPointLocal = useCallback((a: ConnectorAnchor) => getAnchorPoint(a, { rectangles, circles, images, texts, frames, polygons }), [rectangles, circles, images, texts, frames, polygons]);
  const getShapeBoundsLocal = useCallback((a: ConnectorAnchor) => getShapeBounds(a, { rectangles, circles, images, texts, frames, polygons }), [rectangles, circles, images, texts, frames, polygons]);
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
  }, [activeTool, circles, rectangles, images, texts, frames, polygons]);

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
    else if (kind === "text") { setTexts((prev) => { const n = updateFn(prev); pushHistory({ texts: n }); return n; }); }
    else if (kind === "frame") { setFrames((prev) => { const n = updateFn(prev); pushHistory({ frames: n }); return n; }); }
    else if (kind === "image") { setImages((prev) => { const n = updateFn(prev); pushHistory({ images: n }); return n; }); }
  }, [setRectangles, setCircles, setPolygons, setLines, setArrows, setTexts, setFrames, setImages, pushHistory]);

  const onChangeKind = useCallback((kind: string, index: number, newKind: string) => {
    if (kind === newKind) return;
    let source: any = null;
    if (kind === "rect") source = rectangles[index];
    else if (kind === "circle") source = circles[index];
    else if (kind === "poly") source = polygons[index];
    
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
  }, [rectangles, circles, polygons, setRectangles, setCircles, setPolygons, setSelectedShape, pushHistory]);

  const {
    cursorStyle, pendingConnector, textEditor, selectionRect,
    setPendingConnector: _setPendingConnector, setTextEditor, 
    handlePointerDown, handlePointerMove, handlePointerUp, handleDoubleClick, handleWheel, handleDrop,
    commitTextEditor, cancelTextEditor, fitToScreen
  } = useCanvasInteraction({
    activeTool, setActiveTool, zoom, setZoom, pan, setPan,
    rectangles, setRectangles, circles, setCircles, lines, setLines, arrows, setArrows,
    paths, setPaths, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, selectedShape, setSelectedShape,
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
    containerRef: canvasContainerRef
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
      
      isUndoRedoRef.current = false;
      setRerenderTick((t) => t + 1);
    },
    [setRectangles, setCircles, setLines, setArrows, setPaths, setImages, setTexts, setFrames, setPolygons, setConnectors, setSelectedShape]
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

    // Draw current drawing previews
    if (currentRect) drawRect(ctx, currentRect, themeStroke, zoom);
    if (currentCircle) drawCircle(ctx, currentCircle, themeStroke, zoom);
    if (currentLine) drawLine(ctx, currentLine, themeStroke, zoom);
    if (currentArrow) drawArrow(ctx, currentArrow, themeStroke, zoom);
    if (currentPath) drawPath(ctx, currentPath, themeStroke, zoom);
    if (currentFrame) drawFrame(ctx, { ...currentFrame, frameNumber: frames.length + 1 }, themeStroke, themeText, themeFrameBg, zoom);

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

  return (
    <div
      ref={canvasContainerRef}
      className={`relative w-full h-full bg-background overflow-hidden`}
      onDragOver={handleDrop} // Placeholder if needed
      onDrop={handleDrop}
    >
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
        canvasToClient={canvasToClient}
        onUpdateShape={onUpdateShape}
        onChangeKind={onChangeKind}
        onDelete={deleteSelected}
        onDuplicate={() => duplicateSelection(20)}
      />

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full block touch-none bg-background transition-colors duration-500`}
        style={{ cursor: cursorStyle }}
      />

      {selectionOverlayStyle && (
        <div
          className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none"
          style={selectionOverlayStyle}
        />
      )}

      <ConnectorHandles
        activeTool={activeTool}
        anchorHandles={anchorHandles}
        hoverAnchor={hoverAnchor}
        canvasToClient={canvasToClient}
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
        className={`absolute left-6 top-6 h-10 w-10 flex items-center justify-center rounded-sm border transition-all duration-300 z-[1002] ${
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
    </div>
  );
};

export default CanvasArea;
