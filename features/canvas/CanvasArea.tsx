/* eslint-disable react-hooks/exhaustive-deps */
"use client"; // Indicates this is a client-side component in Next.js

import React, {
  useCallback, // Hook to memoize functions and prevent unnecessary re-renders
  useEffect, // Hook for side effects (e.g., event listeners, lifecycle methods)
  useMemo, // Hook to memoize expensive computations
  useRef, // Hook to create persistent references (e.g., to DOM elements)
  useState, // Hook to manage local state within the component
} from "react";
import { useTheme } from "next-themes"; // Hook to access and manage the current theme (light/dark)
import { Plus, X } from "lucide-react"; // Importing icons for UI elements
import {
  ShapeKind,
  AnchorSide,
  HistoryEntry,
  CanvasAreaProps,
  PlusMenuView,
  ConnectorAnchor,
  Tool,
  DiagramTemplate,
  FigureShape,
} from "./types";
import {
  getRectAnchor, // Helper to find anchor points on a rectangle
  getCircleAnchor, // Helper to find anchor points on a circle
  getAnchorPoint, // Generic helper to get an anchor point for any shape
  getShapeBounds, // Helper to calculate the bounding box of a shape
  getContentBounds, // Helper to calculate the total bounding box of all content
  getSelectionBounds, // Helper for aggregate selection box
} from "./utils/geometry";
import { measureText } from "./utils/canvas-helpers"; // Helper to calculate text dimensions on canvas
import {
  drawImageItem, // Function to render an image item on the canvas
  drawText, // Function to render text on the canvas
  drawRect, // Function to render a rectangle
  drawCircle, // Function to render a circle
  drawFrame, // Function to render a frame/container
  drawPoly, // Function to render a polygon
  drawLine, // Function to render a basic line
  drawArrow, // Function to render an arrow
  drawConnector, // Function to render a connecting line between shapes
  drawPath, // Function to render freehand paths
  drawFigure, // Function to render a complex figure
  drawSelectionOverlay, // Function to render selection indicators
} from "./utils/drawing";

// Importing custom hooks to encapsulate specific logic areas
import { useCanvasView } from "./hooks/useCanvasView"; // Logic for zooming, panning, and view transformations
import { useCanvasShapes } from "./hooks/useCanvasShapes"; // State management for all shapes on the canvas
import { useCanvasHistory } from "./hooks/useCanvasHistory"; // Logic for undo/redo functionality
import { useCanvasIcons } from "./hooks/useCanvasIcons"; // Logic for searching and loading library icons
import { useCanvasInteraction } from "./hooks/useCanvasInteraction"; // Logic for handling pointer events and tools
import { useCanvasCommands } from "./hooks/useCanvasCommands"; // Logic for actions like delete or duplicate

// Importing UI components that form the canvas interface
import { Toolbar } from "./components/Toolbar"; // The main tool selection bar
import { PlusMenu } from "./components/PlusMenu"; // The menu for adding new elements/icons
import { ZoomControls } from "./components/ZoomControls"; // Buttons for zoom in/out/reset
import { HistoryControls } from "./components/HistoryControls"; // Buttons for undo/redo
import { TextEditor } from "./components/TextEditor"; // Overlay for editing text on shapes
import { FrameButtons } from "./components/FrameButtons"; // Controls specific to frames
import { ConnectorHandles } from "./components/ConnectorHandles"; // Interactive points for creating connectors
import FloatingToolbar from "./components/FloatingToolbar"; // Context-sensitive toolbar for selected shapes
import { PencilToolbar } from "./components/PencilToolbar"; // Toolbar for freehand drawing settings
import CodeBlock from "./components/CodeBlock"; // Component to render and edit code snippets
import { LineActions } from "./components/LineActions"; // Context actions for lines and arrows
import { MiniMap } from "./components/MiniMap"; // Navigational mini-map overlay
import { ContextMenu } from "./components/ContextMenu";
import { FigureButtons } from "./components/FigureButtons";
import { FigureEditorPanel } from "./components/FigureEditorPanel";
import { parseDSL } from "./utils/dsl-parser";

/**
 * Main CanvasArea component - provides a rich, interactive infinite canvas experience.
 */
const CanvasArea = ({ initialData, onChange: _onChange }: CanvasAreaProps) => {
  // References for terminal and container elements
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Reference to the main HTML5 canvas
  const canvasContainerRef = useRef<HTMLDivElement | null>(null); // Reference to the wrapping container div
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null); // Reference to the hidden textarea for text editing

  const [rerenderTick, setRerenderTick] = useState(0); // State to force manual re-renders when needed

  // View state management: handles scaling and translation of the canvas
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    zoomIn,
    zoomOut,
    resetView,
    canvasToClient,
    toCanvasPointFromClient: _toCanvasPointFromClient,
    clampZoom,
  } = useCanvasView(canvasContainerRef);

  // Active tool and UI state for the 'Add Elements' menu
  const [activeTool, setActiveTool] = useState<Tool>("Select"); // Currently selected interaction tool
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false); // Controls visibility of the creation menu
  const [plusMenuView, setPlusMenuView] = useState<PlusMenuView>("categories"); // Tracks navigation depth within the creation menu
  const [plusMenuSubView, setSubView] = useState<string | null>(null); // Tracks specific categories in the menu
  const [iconSearchQuery, setIconSearchQuery] = useState(""); // Filter string for searching icons
  const [visibleIconsLimit, setVisibleIconsLimit] = useState(60); // Pagination/limit for icon library display
  const [pendingAddIcon, setPendingAddIcon] = useState<{
    name: string;
    src: string;
  } | null>(null); // Icon awaiting placement
  const [pendingAddShapeLabel, setPendingAddShapeLabel] = useState<
    string | null
  >(null); // Shape awaiting placement
  const [pendingAddDiagram, setPendingAddDiagram] =
    useState<DiagramTemplate | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 }); // Track canvas container size for UI positioning
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(false); // Controls visibility of the navigation mini-map
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [editingFigureId, setEditingFigureId] = useState<string | null>(null);
  const [isFigureEditorOpen, setIsFigureEditorOpen] = useState(false);

  // Centralized shape state: manages collections of all items currently on the canvas
  const {
    rectangles,
    setRectangles,
    circles,
    setCircles,
    lines,
    setLines,
    arrows,
    setArrows,
    paths,
    setPaths,
    images,
    setImages,
    texts,
    setTexts,
    frames,
    setFrames,
    polygons,
    setPolygons,
    connectors,
    setConnectors,
    figures,
    setFigures,
    codes,
    setCodes,
    selectedShape,
    setSelectedShape,
    hoverAnchor,
    setHoverAnchor,
    currentRect,
    setCurrentRect,
    currentCircle,
    setCurrentCircle,
    currentLine,
    setCurrentLine,
    currentArrow,
    setCurrentArrow,
    currentPath,
    setCurrentPath,
    currentFrame,
    setCurrentFrame,
    imageCacheRef,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
  } = useCanvasShapes(initialData);

  // Undo/Redo history management
  const {
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    pushHistory: basePushHistory,
    undo: _undo,
    redo: _redo,
    canUndo,
    canRedo,
    isUndoRedoRef,
  } = useCanvasHistory({
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
    figures,
    codes,
  });

  const [isHandPanning, setIsHandPanning] = useState(false); // Tracks if the 'Hand' tool is active for panning
  const [isSpacePanning, setIsSpacePanning] = useState(false); // Tracks if Spacebar is held for panning mode

  // Captures the current state of todos into a single HistoryEntry object
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
      figures,
      codes,
    ]
  );

  // Wraps basePushHistory to automatically use the current snapshot
  const pushHistory = useCallback(
    (overrides?: Partial<HistoryEntry>) => {
      basePushHistory(snapshot(overrides));
    },
    [basePushHistory, snapshot]
  );

  // Bulk actions like deletion and duplication
  const commands = useCanvasCommands(
    {
      rectangles,
      setRectangles,
      circles,
      setCircles,
      lines,
      setLines,
      arrows,
      setArrows,
      paths,
      setPaths,
      images,
      setImages,
      texts,
      setTexts,
      frames,
      setFrames,
      polygons,
      setPolygons,
      connectors,
      setConnectors,
      figures,
      setFigures,
      codes,
      setCodes,
      selectedShape,
      setSelectedShape,
    },
    pushHistory
  );

  const {
    copySelected,
    pasteSelected,
    cutSelected,
    selectAll,
    deleteSelected,
    duplicateSelection,
    groupSelected,
    ungroupSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = commands;

  // Logic to fetch and filter icons based on user input
  const { filteredLibraryIcons, isLibraryLoading } = useCanvasIcons(
    plusMenuView,
    plusMenuSubView,
    iconSearchQuery
  );

  // Theme-aware color calculations for drawing
  const { resolvedTheme } = useTheme();
  const themeText = resolvedTheme === "dark" ? "white" : "black"; // Text color based on theme
  const themeStroke =
    resolvedTheme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"; // Default stroke color
  const themeFrameBg = resolvedTheme === "dark" ? "#1e1e1e" : "#ffffff"; // Solid frame background color

  // Bound helper functions to find points and bounds relative to current shape state
  const margin = 2 / zoom;
  const getAnchorPointLocal = useCallback(
    (a: ConnectorAnchor) => {
      // For corner anchors, always align with the padded selection border
      if (typeof a.anchor === "string" && a.anchor.includes("-")) {
        const b = getShapeBounds(a, {
          rectangles,
          circles,
          images,
          texts,
          frames,
          polygons,
          figures,
          codes,
        });
        if (!b) return null;
        const paddedBox = {
          x: b.x - margin,
          y: b.y - margin,
          width: b.width + margin * 2,
          height: b.height + margin * 2,
        };
        return getRectAnchor(paddedBox, a.anchor as AnchorSide);
      }

      // Fallback to standard anchor resolution for sides or custom points
      return getAnchorPoint(a, {
        rectangles,
        circles,
        images,
        texts,
        frames,
        polygons,
        figures,
        codes,
      });
    },
    [rectangles, circles, images, texts, frames, polygons, figures, codes, margin]
  );
  const getShapeBoundsLocal = useCallback(
    (a: ConnectorAnchor) => {
      const b = getShapeBounds(a, {
        rectangles,
        circles,
        images,
        texts,
        frames,
        polygons,
        figures,
        codes,
      });
      if (!b) return null;
      return {
        x: b.x - margin,
        y: b.y - margin,
        width: b.width + margin * 2,
        height: b.height + margin * 2,
      };
    },
    [rectangles, circles, images, texts, frames, polygons, figures, codes, margin]
  );
  const getContentBoundsLocal = useCallback(
    () =>
      getContentBounds({
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

  // Track the actual pixel dimensions of the container for mini-map and centering logic
  useEffect(() => {
    const updateSize = () => {
      if (canvasContainerRef.current) {
        setContainerSize({
          width: canvasContainerRef.current.clientWidth,
          height: canvasContainerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    // Re-run on window resize
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Dynamically calculates where connector handles should appear based on current shapes and active tool
  const anchorHandles = useMemo(() => {
    if (activeTool !== "Arrow" && activeTool !== "Select") return [];
    const handles: {
      kind: ShapeKind;
      shapeId: string;
      anchor: AnchorSide;
      point: { x: number; y: number };
      percent?: number;
    }[] = [];

    const isArrow = activeTool === "Arrow";
    const selectedIds = new Set(selectedShape.map((s) => s.id));
    const margin = 2 / zoom;

    // SCENARIO 1: Selection Handles - collective or individual dashed border corners
    if (activeTool === "Select" && selectedShape.length > 0) {
      const bounds = getSelectionBounds(selectedShape, {
        rectangles,
        circles,
        images,
        texts,
        frames,
        polygons,
        lines,
        arrows,
        figures,
        codes,
      });
      if (bounds) {
        const paddedBox = {
          x: bounds.x - margin,
          y: bounds.y - margin,
          width: bounds.width + margin * 2,
          height: bounds.height + margin * 2,
        };
        (["top-left", "top-right", "bottom-left", "bottom-right"] as AnchorSide[]).forEach((side) => {
          handles.push({
            kind: "rect",
            shapeId: "selection",
            anchor: side,
            point: getRectAnchor(paddedBox, side),
          });
        });
      }
      return handles;
    }

    // SCENARIO 2: Arrow Snapping - nodes for all shapes to allow connections
    if (isArrow) {
      // Helper for all standard rectangular shapes
      const addPaddedRectHandles = (
        r: { id: string; x: number; y: number; width: number; height: number },
        kind: ShapeKind
      ) => {
        const paddedBox = {
          x: r.x - margin,
          y: r.y - margin,
          width: r.width + margin * 2,
          height: r.height + margin * 2,
        };
        (["top-left", "top-right", "bottom-left", "bottom-right"] as AnchorSide[]).forEach((side) => {
          handles.push({
            kind,
            shapeId: r.id,
            anchor: side,
            point: getRectAnchor(paddedBox, side),
            percent: 0.5,
          });
        });
      };

      rectangles.forEach((r) => addPaddedRectHandles(r, "rect"));
      images.forEach((im) => addPaddedRectHandles(im, "image"));
      texts.forEach((t) => addPaddedRectHandles(t, "text"));
      frames.forEach((f) => addPaddedRectHandles(f, "frame"));
      polygons.forEach((p) => addPaddedRectHandles(p, "poly"));
      figures.forEach((f) => addPaddedRectHandles(f, "figure"));
      codes.forEach((c) => addPaddedRectHandles(c, "code"));

      circles.forEach((c) => {
        const paddedBox = {
          x: c.x - c.rx - margin,
          y: c.y - c.ry - margin,
          width: c.rx * 2 + margin * 2,
          height: c.ry * 2 + margin * 2,
        };
        (["top-left", "top-right", "bottom-left", "bottom-right"] as AnchorSide[]).forEach((side) => {
          handles.push({
            kind: "circle",
            shapeId: c.id,
            anchor: side,
            point: getRectAnchor(paddedBox, side),
          });
        });
      });
    }

    return handles;
  }, [
    activeTool,
    zoom,
    circles,
    rectangles,
    images,
    texts,
    frames,
    polygons,
    figures,
    codes,
    selectedShape,
  ]);

  // Generic function to update properties of an existing shape and record history
  const onUpdateShape = useCallback(
    (kind: string, index: number, updates: Record<string, any>) => {
      const updateFn = <T extends object>(prev: T[]) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates }; // Merge updates into the specific item
        return next;
      };
      // Dispatch updates to the correct state setter based on shape type
      if (kind === "rect") {
        setRectangles((prev) => {
          const n = updateFn(prev);
          pushHistory({ rectangles: n });
          return n;
        });
      } else if (kind === "circle") {
        setCircles((prev) => {
          const n = updateFn(prev);
          pushHistory({ circles: n });
          return n;
        });
      } else if (kind === "poly") {
        setPolygons((prev) => {
          const n = updateFn(prev);
          pushHistory({ polygons: n });
          return n;
        });
      } else if (kind === "line") {
        setLines((prev) => {
          const n = updateFn(prev);
          pushHistory({ lines: n });
          return n;
        });
      } else if (kind === "arrow") {
        setArrows((prev) => {
          const n = updateFn(prev);
          pushHistory({ arrows: n });
          return n;
        });
      } else if (kind === "text") {
        setTexts((prev) => {
          const next = [...prev];
          const old = next[index];
          const updated = { ...old, ...updates }; // Deep merge for text updates
          // If text content or font changes, recalculate dimensions
          if (
            updates.fontSize !== undefined ||
            updates.text !== undefined ||
            updates.fontFamily !== undefined
          ) {
            const size = measureText(
              updated.text,
              updated.fontSize,
              updated.fontFamily
            );
            updated.width = size.width;
            updated.height = size.height;
          }
          next[index] = updated;
          pushHistory({ texts: next });
          return next;
        });
      } else if (kind === "frame") {
        setFrames((prev) => {
          const n = updateFn(prev);
          pushHistory({ frames: n });
          return n;
        });
      } else if (kind === "image") {
        setImages((prev) => {
          const n = updateFn(prev);
          pushHistory({ images: n });
          return n;
        });
      } else if (kind === "figure") {
        setFigures((prev) => {
          const n = updateFn(prev);
          pushHistory({ figures: n });
          return n;
        });
      } else if (kind === "code") {
        setCodes((prev) => {
          const n = updateFn(prev);
          pushHistory({ codes: n });
          return n;
        });
      }
    },
    [
      setRectangles,
      setCircles,
      setPolygons,
      setLines,
      setArrows,
      setTexts,
      setFrames,
      setImages,
      setFigures,
      setCodes,
      pushHistory,
    ]
  );

  // Function to change a shape from one type to another (e.g., Rect to Circle)
  const onChangeKind = useCallback(
    (kind: string, index: number, newKind: string) => {
      if (kind === newKind) return; // No change needed if types are identical
      let source: any = null;
      // Identify the source shape based on its current kind and index
      if (kind === "rect") source = rectangles[index];
      else if (kind === "circle") source = circles[index];
      else if (kind === "poly") source = polygons[index];
      else if (kind === "text") source = texts[index];
      else if (kind === "code") source = codes[index];

      if (!source) return; // Exit if the source shape couldn't be found

      // Extract common properties that should persist across shape types
      const common = {
        id: source.id,
        fill: source.fill,
        stroke: source.stroke,
        opacity: source.opacity,
        strokeDashArray: source.strokeDashArray,
      };

      // Remove the shape from its current collection
      if (kind === "rect")
        setRectangles((prev) => prev.filter((_, i) => i !== index));
      else if (kind === "circle")
        setCircles((prev) => prev.filter((_, i) => i !== index));
      else if (kind === "poly")
        setPolygons((prev) => prev.filter((_, i) => i !== index));
      else if (kind === "text")
        setTexts((prev) => prev.filter((_, i) => i !== index));
      else if (kind === "code")
        setCodes((prev) => prev.filter((_, i) => i !== index));

      // Create the new shape based on the target 'newKind'
      if (newKind === "rect") {
        // Calculate dimensions for a rectangle, potentially converting from circle radii
        const w = kind === "circle" ? source.rx * 2 : source.width;
        const h = kind === "circle" ? source.ry * 2 : source.height;
        const x = kind === "circle" ? source.x - source.rx : source.x;
        const y = kind === "circle" ? source.y - source.ry : source.y;
        setRectangles((prev) => {
          const next = [...prev, { ...common, x, y, width: w, height: h }];
          setSelectedShape([
            { kind: "rect", index: next.length - 1, id: common.id },
          ]); // Select the new shape
          pushHistory({ rectangles: next }); // Record the transformation in history
          return next;
        });
      } else if (newKind === "circle") {
        // Convert rectangular dimensions to circle radii
        const rx =
          (kind === "rect" || kind === "poly" ? source.width : 100) / 2;
        const ry =
          (kind === "rect" || kind === "poly" ? source.height : 100) / 2;
        const x = (kind === "rect" || kind === "poly" ? source.x : 0) + rx;
        const y = (kind === "rect" || kind === "poly" ? source.y : 0) + ry;
        setCircles((prev) => {
          const next = [...prev, { ...common, x, y, rx, ry }];
          setSelectedShape([
            { kind: "circle", index: next.length - 1, id: common.id },
          ]);
          pushHistory({ circles: next });
          return next;
        });
      } else if (newKind === "text") {
        // Convert code or other content to a text shape
        const val = kind === "code" ? source.code : "Text";
        setTexts((prev) => {
          const measured = measureText(val, 18); // Measure initial size
          const next = [
            ...prev,
            {
              ...common,
              x: source.x,
              y: source.y,
              text: val,
              fontSize: 18,
              width: measured.width,
              height: measured.height,
              fontFamily: "Clean" as const,
            },
          ];
          setSelectedShape([
            { kind: "text", index: next.length - 1, id: common.id },
          ]);
          pushHistory({ texts: next });
          return next;
        });
      } else if (newKind === "code") {
        // Convert text content to a code block shape
        const val =
          kind === "text" ? source.text : "// Write your code here...";
        setCodes((prev) => {
          const lineCount = val.split("\n").length;
          const estimatedHeight = Math.max(100, lineCount * 20 + 40); // Estimate height based on lines
          const next = [
            ...prev,
            {
              ...common,
              x: source.x,
              y: source.y,
              width: 300,
              height: estimatedHeight,
              code: val,
              language: "Javascript",
              fontSize: 13,
            },
          ];
          setSelectedShape([
            { kind: "code", index: next.length - 1, id: common.id },
          ]);
          pushHistory({ codes: next });
          return next;
        });
      } else if (newKind.startsWith("poly:")) {
        // Handle polygon transformation with specific types (e.g., triangle, diamond)
        const type = newKind.split(":")[1];
        const w = kind === "circle" ? source.rx * 2 : source.width;
        const h = kind === "circle" ? source.ry * 2 : source.height;
        const x = kind === "circle" ? source.x - source.rx : source.x;
        const y = kind === "circle" ? source.y - source.ry : source.y;
        setPolygons((prev) => {
          const next = [
            ...prev,
            { ...common, x, y, width: w, height: h, type },
          ];
          setSelectedShape([
            { kind: "poly", index: next.length - 1, id: common.id },
          ]);
          pushHistory({ polygons: next });
          return next;
        });
      }
    },
    [
      rectangles,
      circles,
      polygons,
      texts,
      codes,
      setRectangles,
      setCircles,
      setPolygons,
      setTexts,
      setCodes,
      setSelectedShape,
      pushHistory,
    ]
  );

  // Main hook for handling all canvas interactions (clicks, drags, tools)
  const {
    cursorStyle,
    pendingConnector,
    textEditor,
    selectionRect,
    editingCodeId,
    setPendingConnector: _setPendingConnector,
    setTextEditor,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleWheel,
    handleDrop,
    commitTextEditor,
    cancelTextEditor,
    fitToScreen,
  } = useCanvasInteraction({
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    pan,
    setPan,
    rectangles,
    setRectangles,
    circles,
    setCircles,
    lines,
    setLines,
    arrows,
    setArrows,
    paths,
    setPaths,
    images,
    setImages,
    texts,
    setTexts,
    frames,
    setFrames,
    polygons,
    setPolygons,
    connectors,
    setConnectors,
    selectedShape,
    setSelectedShape,
    figures,
    setFigures,
    codes,
    setCodes,
    currentRect,
    setCurrentRect,
    currentCircle,
    setCurrentCircle,
    currentLine,
    setCurrentLine,
    currentArrow,
    setCurrentArrow,
    currentPath,
    setCurrentPath,
    currentFrame,
    setCurrentFrame,
    pushHistory,
    isSpacePanning,
    setIsHandPanning,
    isHandPanning,
    anchorHandles,
    pendingAddIcon,
    setPendingAddIcon,
    pendingAddShapeLabel,
    setPendingAddShapeLabel,
    pendingAddDiagram,
    setPendingAddDiagram,
    isPlusMenuOpen,
    setIsPlusMenuOpen,
    canvasRef,
    getAnchorPoint: getAnchorPointLocal, // Passing local point calculations
    getShapeBounds: getShapeBoundsLocal, // Passing local bounds calculations
    getContentBounds: getContentBoundsLocal, // Passing total content bounds
    clampZoom,
    imageCacheRef,
    setHoverAnchor,
    hoverAnchor,
    setRerenderTick,
    containerRef: canvasContainerRef,
    strokeColor,
    strokeWidth,
    theme: resolvedTheme || "light",
  });

  // Helper to re-apply a specific history state to all shape collections
  const applySnapshot = useCallback(
    (entry: HistoryEntry) => {
      isUndoRedoRef.current = true; // Flag to prevent pushing history during the undo/redo itself
      setSelectedShape([]); // Clear selection when jumping in history

      // Update all individual shape states from the snapshot
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

      isUndoRedoRef.current = false; // Reset flag
      setRerenderTick((t) => t + 1); // Trigger visual redraw
    },
    [
      setRectangles,
      setCircles,
      setLines,
      setArrows,
      setPaths,
      setImages,
      setTexts,
      setFrames,
      setPolygons,
      setConnectors,
      setFigures,
      setCodes,
      setSelectedShape,
    ]
  );

  // Undo implementation: moves back one step in history
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return; // Can't undo beyond start
    const target = history[historyIndex - 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex - 1);
  }, [applySnapshot, history, historyIndex, setHistoryIndex]);

  // Redo implementation: moves forward one step in history
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return; // Can't redo beyond current state
    const target = history[historyIndex + 1];
    applySnapshot(target);
    setHistoryIndex(historyIndex + 1);
  }, [applySnapshot, history, historyIndex, setHistoryIndex]);

  // Global keyboard shortcuts (undo, redo, zoom, delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Disable shortcuts while typing in inputs or textareas
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.getAttribute("contenteditable") === "true");
      if (isTyping) return;

      // Enable spacebar-panning mode
      if (e.code === "Space" && !e.repeat) setIsSpacePanning(true);
      // Delete key for removing selected elements
      if (e.key === "Delete") {
        e.preventDefault();
        deleteSelected();
      }

      const isCmd = e.metaKey || e.ctrlKey; // Support both Mac (Cmd) and Windows (Ctrl)
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
      if (
        isCmd &&
        (e.key.toLowerCase() === "c")
      ) {
        e.preventDefault();
        copySelected();
        return;
      }
      if (
        isCmd &&
        (e.key.toLowerCase() === "v")
      ) {
        e.preventDefault();
        pasteSelected();
        return;
      }
      if (
        isCmd &&
        (e.key.toLowerCase() === "x")
      ) {
        e.preventDefault();
        cutSelected();
        return;
      }
      if (
        isCmd &&
        (e.key.toLowerCase() === "a")
      ) {
        e.preventDefault();
        selectAll();
        return;
      }
      if (
        isCmd &&
        (e.key.toLowerCase() === "d")
      ) {
        e.preventDefault();
        duplicateSelection();
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

      if (e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        bringToFront();
      } else if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        sendToBack();
      } else if (e.altKey && e.key === "]") {
        e.preventDefault();
        bringForward();
      } else if (e.altKey && e.key === "[") {
        e.preventDefault();
        sendBackward();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePanning(false); // Disable panning mode on space release
    };

    window.addEventListener("keydown", handleKeyDown); // Register listeners
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup listeners on unmount
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    deleteSelected,
    duplicateSelection,
    handleUndo,
    handleRedo,
    zoomIn,
    zoomOut,
    resetView,
    setIsSpacePanning,
  ]);

  // Initialization: load data from 'initialData' if provided (e.g., from DB)
  useEffect(() => {
    if (initialData?.snapshot) {
      applySnapshot(initialData.snapshot); // Apply saved shapes
      setHistory([initialData.snapshot]); // Initialize history with the starting state
      setHistoryIndex(0);
      if (initialData.pan) setPan(initialData.pan); // Restore view position
      if (initialData.zoom) setZoom(clampZoom(initialData.zoom)); // Restore zoom level
    }
  }, []);

  // Record the initial state into history on first mount
  useEffect(() => {
    pushHistory();
  }, []);

  // THE CANVAS DRAWING LOOP: Synchronizes React state with the HTML5 Canvas 2D context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays (Retina) for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale coordinates by pixel density
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr); // Clear previous frame

    ctx.save();
    ctx.translate(pan.x, pan.y); // Apply view translation (panning)
    ctx.scale(zoom, zoom); // Apply view scale (zooming)

    const isMulti = selectedShape.length > 1;

    // 1. Containers and backgrounds - drawn first so they appear behind contents
    frames.forEach((f, idx) =>
      drawFrame(
        ctx,
        f,
        themeStroke,
        themeText,
        themeFrameBg,
        zoom,
        1,
        !isMulti &&
          selectedShape.some((s) => s.kind === "frame" && s.index === idx)
      )
    );
    figures.forEach((f, idx) =>
      drawFigure(
        ctx,
        f,
        themeStroke,
        themeText,
        themeFrameBg,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "figure" && s.index === idx),
        {
          hideTitleText: textEditor?.kind === "figure" && textEditor?.index === idx,
          titleOverride: (textEditor?.kind === "figure" && textEditor?.index === idx) ? textEditor.value : undefined,
        }
      )
    );

    // 2. Base geometry and images
    rectangles.forEach((r, idx) =>
      drawRect(
        ctx,
        r,
        themeStroke,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "rect" && s.index === idx)
      )
    );
    circles.forEach((c, idx) =>
      drawCircle(
        ctx,
        c,
        themeStroke,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "circle" && s.index === idx)
      )
    );
    polygons.forEach((p, idx) =>
      drawPoly(
        ctx,
        p,
        themeStroke,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "poly" && s.index === idx)
      )
    );
    images.forEach((im, idx) =>
      drawImageItem(
        ctx,
        im,
        imageCacheRef.current,
        zoom,
        1,
        !isMulti &&
          selectedShape.some((s) => s.kind === "image" && s.index === idx)
      )
    );

    // 3. Freehand drawings and connections
    paths.forEach((p) => drawPath(ctx, p, themeStroke, zoom));
    lines.forEach((l, idx) =>
      drawLine(
        ctx,
        l,
        themeStroke,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "line" && s.index === idx)
      )
    );
    arrows.forEach((l, idx) =>
      drawArrow(
        ctx,
        l,
        themeStroke,
        zoom,
        !isMulti &&
          selectedShape.some((s) => s.kind === "arrow" && s.index === idx)
      )
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
        highlight:
          !isMulti &&
          selectedShape.some((s) => s.kind === "connector" && s.index === idx),
      });
    });

    // 4. Content (Texts) - drawn last to ensure readability
    texts.forEach((t, idx) => {
      if (textEditor?.index === idx) return;
      drawText(
        ctx,
        t,
        themeText,
        zoom,
        1,
        !isMulti &&
          selectedShape.some((s) => s.kind === "text" && s.index === idx)
      );
    });

    // Draw aggregate selection overlay if multiple shapes are selected
    if (isMulti) {
      const b = getSelectionBounds(selectedShape, {
        rectangles,
        circles,
        images,
        texts,
        frames,
        polygons,
        lines,
        arrows,
        figures,
        codes,
      });
      if (b) {
        drawSelectionOverlay(ctx, b.x, b.y, b.width, b.height, zoom);
      }
    }

    // Draw current drawing previews
    // Render temporary previews for shapes currently being drawn by the user
    if (currentRect)
      drawRect(ctx, { ...currentRect, id: "preview" }, themeStroke, zoom);
    if (currentCircle)
      drawCircle(ctx, { ...currentCircle, id: "preview" }, themeStroke, zoom);
    if (currentLine)
      drawLine(ctx, { ...currentLine, id: "preview" }, themeStroke, zoom);
    if (currentArrow)
      drawArrow(ctx, { ...currentArrow, id: "preview" }, themeStroke, zoom);
    if (currentPath) drawPath(ctx, { ...currentPath }, themeStroke, zoom);
    if (currentFrame)
      drawFrame(
        ctx,
        { ...currentFrame, id: "preview", frameNumber: frames.length + 1 },
        themeStroke,
        themeText,
        themeFrameBg,
        zoom
      );

    // Render a preview line if the user is in the middle of creating a connector
    if (pendingConnector) {
      const fromPt = getAnchorPointLocal(pendingConnector.from);
      if (fromPt) {
        drawConnector(
          ctx,
          fromPt,
          pendingConnector.previewPoint,
          themeStroke,
          zoom,
          {
            highlight: true,
            fromAnchor: pendingConnector.from.anchor,
            toAnchor: hoverAnchor?.anchor, // Snap to hover anchor if available
            fromBounds: getShapeBoundsLocal(pendingConnector.from) || undefined,
          }
        );
      }
    }

    ctx.restore(); // Restore context state (undoes translate/scale) for subsequent drawings
  }, [
    // Depend on all shape states and view transforms to trigger redraws
    rectangles,
    circles,
    connectors,
    getAnchorPointLocal,
    lines,
    arrows,
    paths,
    polygons,
    figures,
    codes,
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
    themeText,
    themeStroke,
    themeFrameBg,
    getShapeBoundsLocal,
    imageCacheRef,
    textEditor?.index,
    textEditor?.value,
    textEditor?.kind,
    hoverAnchor,
  ]);

  // Use a ref to store the latest onChange callback to prevent useEffect from creating infinite loops
  const onChangeRef = useRef(_onChange);
  useEffect(() => {
    onChangeRef.current = _onChange;
  }, [_onChange]);

  // Notify parent component of any state changes (shapes, zoom, or pan)
  useEffect(() => {
    onChangeRef.current?.({
      pan,
      zoom,
      snapshot: snapshot(), // Pass the full state snapshot
    });
  }, [
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
    figures,
    codes,
    pan,
    zoom,
    snapshot,
  ]);

  // Pre-load images into the cache when they appear in the 'images' state
  useEffect(() => {
    images.forEach((im) => {
      if (!imageCacheRef.current[im.src]) {
        const img = new Image();
        img.src = im.src;
        img.onload = () => setRerenderTick((t) => t + 1); // Redraw once image loads
        imageCacheRef.current[im.src] = img;
      }
    });
  }, [images]);

  // Handle window resizing to keep the canvas filling its container correctly
  useEffect(() => {
    const handleResize = () => {
      if (!canvasContainerRef.current || !canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasContainerRef.current.getBoundingClientRect();

      // Update canvas resolution based on display size and pixel density
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;

      setRerenderTick((t) => t + 1); // Force redraw after resize
    };

    handleResize();

    // Observe size changes on the container to adjust canvas dynamically
    const observer = new ResizeObserver(handleResize);
    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    return () => observer.disconnect(); // Cleanup observer on unmount
  }, []);

  const zoomPercent = Math.round(zoom * 100); // Visual zoom percentage for the UI

  // Calculate the CSS style for the selection rectangle overlay (used during 'Select' tool drag)
  const selectionOverlayStyle = useMemo(() => {
    if (!selectionRect) return undefined;
    // Normalize coordinates so width/height are positive
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

    // Transform canvas coordinates to screen (client) coordinates for CSS positioning
    const topLeft = canvasToClient(normX, normY);
    const bottomRight = canvasToClient(normX + width, normY + height);

    return {
      left: `${topLeft.x}px`,
      top: `${topLeft.y}px`,
      width: `${bottomRight.x - topLeft.x}px`,
      height: `${bottomRight.y - topLeft.y}px`,
    };
  }, [canvasToClient, selectionRect]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div
      ref={canvasContainerRef}
      className={`relative w-full h-full bg-background overflow-hidden`}
      onDragOver={handleDrop} // Enable file dragging
      onDrop={handleDrop}
    >
      {/* BACKGROUND LAYER: Renders complex React components (like CodeBlocks) that shouldn't be on 2D canvas */}
      <div
        className={`absolute inset-0 pointer-events-none ${editingCodeId ? "z-30" : "z-0"}`}
      >
        {codes.map((c, i) => (
          <CodeBlock
            key={c.id}
            codeShape={c}
            isSelected={selectedShape.some(
              (s) => s.kind === "code" && s.id === c.id
            )}
            isEditing={editingCodeId === c.id}
            onUpdate={(updates) => onUpdateShape("code", i, updates)}
            canvasToClient={canvasToClient}
            zoom={zoom}
            theme={resolvedTheme}
          />
        ))}
      </div>

      {/* CORE RENDERING LAYER: The HTML5 Canvas where shapes are drawn */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* INTERACTION LAYER: Invisibile div that captures pointer events for tools logic */}
      <div
        className="absolute inset-0 z-20 touch-none"
        onPointerDown={(e) => {
          if (isFigureEditorOpen) {
            setIsFigureEditorOpen(false);
            setEditingFigureId(null);
          }
          handlePointerDown(e as any);
        }}
        onPointerMove={handlePointerMove as any}
        onPointerUp={handlePointerUp as any}
        onPointerLeave={handlePointerUp as any}
        onDoubleClick={handleDoubleClick as any}
        onContextMenu={handleContextMenu} // Disable default right-click menu
        style={{ cursor: cursorStyle }} // Cursor changes based on active tool (e.g., crosshair, grab)
      />

      {/* UI OVERLAY LAYER: Contains menu buttons, toolbars, and absolute-positioned editors */}
      <div className="absolute inset-0 pointer-events-none z-[1000]">
        {/* Floating text editor overlay for double-clicked text/shapes */}
        <TextEditor
          textEditor={textEditor}
          setTextEditor={setTextEditor}
          textAreaRef={textAreaRef}
          canvasToClient={canvasToClient}
          zoom={zoom}
          measureText={measureText}
          commitTextEditor={commitTextEditor}
          cancelTextEditor={cancelTextEditor}
          theme={resolvedTheme}
        />

        {/* The visual selection rectangle (blue box) drawn when dragging the mouse to select multiple items */}
        {selectionOverlayStyle && (
          <div
            className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-30"
            style={selectionOverlayStyle}
          />
        )}

        {/* Secondary UI components that require pointer interactions */}
        <div className="pointer-events-auto contents">
          {/* Connector handles that appear on hover to allow linking shapes */}
          <ConnectorHandles
            activeTool={activeTool}
            anchorHandles={anchorHandles}
            hoverAnchor={hoverAnchor}
            canvasToClient={canvasToClient}
            selectedShape={selectedShape}
            connectors={connectors}
            getAnchorPoint={getAnchorPointLocal}
          />

          <FigureButtons
            figures={figures}
            canvasToClient={canvasToClient}
            zoom={zoom}
            selectedShape={selectedShape}
            editingFigureId={editingFigureId}
            onOpenEditor={(id: string) => {
              if (editingFigureId === id) {
                setEditingFigureId(null);
                setIsFigureEditorOpen(false);
              } else {
                setEditingFigureId(id);
                setIsFigureEditorOpen(true);
              }
            }}
          />

          {/* Context buttons for frames */}
          <FrameButtons
            frames={frames}
            canvasToClient={canvasToClient}
            zoom={zoom}
          />

          {/* Delete icon at the center of selected lines/connectors */}
          <LineActions
            selectedShape={selectedShape}
            connectors={connectors}
            lines={lines}
            arrows={arrows}
            rectangles={rectangles}
            circles={circles}
            images={images}
            texts={texts}
            frames={frames}
            polygons={polygons}
            figures={figures}
            codes={codes}
            getAnchorPoint={getAnchorPointLocal}
            getShapeBounds={getShapeBoundsLocal}
            canvasToClient={canvasToClient}
            onDelete={deleteSelected}
            zoom={zoom}
          />

          {/* Floating toolbar that appears near selected shapes for quick adjustments (color, delete, etc) */}
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
            onGroup={groupSelected}
            onUngroup={ungroupSelected}
            theme={resolvedTheme}
          />

          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onClose={() => setContextMenu(null)}
              onCut={cutSelected}
              onCopy={copySelected}
              onPaste={pasteSelected}
              onDuplicate={duplicateSelection}
              onSelectAll={selectAll}
              onDelete={deleteSelected}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              onBringForward={bringForward}
              onSendBackward={sendBackward}
            />
          )}

          {/* Navigation Controls Group (MiniMap + Zoom) */}
          <div className="absolute right-6 bottom-6 flex flex-col items-stretch gap-0 w-[240px] rounded-sm bg-background/80 backdrop-blur-xl border border-border/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] z-50 overflow-hidden">
            {isMiniMapOpen && (
              <MiniMap
                rectangles={rectangles}
                circles={circles}
                lines={lines}
                arrows={arrows}
                paths={paths}
                images={images}
                texts={texts}
                frames={frames}
                polygons={polygons}
                figures={figures}
                codes={codes}
                pan={pan}
                zoom={zoom}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                onPanChange={setPan}
                theme={(resolvedTheme as "light" | "dark") || "light"}
                mapWidth={240}
                mapHeight={160}
              />
            )}

            {/* Visual separator between the map and buttons */}
            {isMiniMapOpen && <div className="h-px w-full bg-border/20" />}

            {/* Inline zoom navigation controls */}
            <ZoomControls
              zoomPercent={zoomPercent}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFitToScreen={fitToScreen}
              onResetView={resetView}
              isMiniMapOpen={isMiniMapOpen}
              onToggleMiniMap={() => setIsMiniMapOpen(!isMiniMapOpen)}
              className="flex items-center justify-between gap-1 px-3 py-2"
            />
          </div>

          {/* History control buttons (Undo/Redo) */}
          <HistoryControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />

          {/* The creation menu for adding icons, shapes, and other assets */}
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
            onAddDiagram={(template) => setPendingAddDiagram(template)}
            icons={filteredLibraryIcons}
            setActiveTool={setActiveTool}
            pendingAddIcon={pendingAddIcon}
            pendingAddShapeLabel={pendingAddShapeLabel}
            pendingAddDiagram={pendingAddDiagram}
          />

          {/* Main 'Add' button to toggle the PlusMenu */}
          <button
            onPointerDown={(e) => e.stopPropagation()} // Prevent canvas from capturing the click
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
            <Plus
              className={`h-5 w-5 transition-transform duration-300 ${isPlusMenuOpen ? "rotate-45" : "rotate-0"}`}
            />
          </button>

          {/* Center-bottom toolbar for selecting tools (Select, Pencil, Rect, etc) */}
          <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />

          {/* Contextual pencil settings (color/width) shown only when pencil or eraser is active */}
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

          <FigureEditorPanel
            isOpen={isFigureEditorOpen}
            onClose={() => {
              setIsFigureEditorOpen(false);
              setEditingFigureId(null);
            }}
            figureId={editingFigureId}
            figureName={figures.find(f => f.id === editingFigureId)?.title || "Diagram Engine"}
            code={figures.find(f => f.id === editingFigureId)?.code || ""}
            onCodeChange={(newCode) => {
              if (editingFigureId) {
                const index = figures.findIndex(f => f.id === editingFigureId);
                if (index !== -1) {
                  const updatedFigures = [...figures];
                  updatedFigures[index] = { ...updatedFigures[index], code: newCode };
                  setFigures(updatedFigures);
                }
              }
            }}
            onSync={() => {
              if (!editingFigureId) return;
              const fig = figures.find(f => f.id === editingFigureId);
              if (!fig || !fig.code) return;

              // 1. Clear old shapes associated with this figure
              setRectangles(prev => prev.filter(r => r.groupId !== editingFigureId));
              setImages(prev => prev.filter(im => im.groupId !== editingFigureId));
              setTexts(prev => prev.filter(t => t.groupId !== editingFigureId));
              setFigures(prev => prev.filter(f => f.id === editingFigureId || f.groupId !== editingFigureId));
              setConnectors(prev => prev.filter(c => {
                // Connectors are tricky because they link shapes. 
                // We'll just clear all connectors for now or filter them if we can track their linked shapes.
                return true; // Simplified for now
              }));

              // 2. Parse and generate new shapes
              const generated = parseDSL(fig.code) as any;
              
              // Auto-size the editing figure
              const newWidth = generated.width + 100;
              const newHeight = generated.height + 120;
              
              setFigures(prev => prev.map(f => 
                f.id === editingFigureId 
                ? { ...f, width: newWidth, height: newHeight } 
                : f
              ));

              const offsetX = fig.x + 50;
              const offsetY = fig.y + 70;

              const applyMeta = (shapes: any[] | undefined) => 
                shapes?.map(s => ({ ...s, x: s.x + offsetX, y: s.y + offsetY, groupId: editingFigureId }));

              if (generated.rectangles) setRectangles(prev => [...prev, ...applyMeta(generated.rectangles)!]);
              if (generated.images) setImages(prev => [...prev, ...applyMeta(generated.images)!]);
              if (generated.texts) setTexts(prev => [...prev, ...applyMeta(generated.texts)!]);
              if (generated.figures) setFigures(prev => [...prev, ...applyMeta(generated.figures)!]);
              if (generated.connectors) {
                // For connectors, we need to ensure their from/to shapeIds match the new ones
                setConnectors(prev => [...prev.filter(c => true), ...generated.connectors!]);
              }
              
              pushHistory();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
