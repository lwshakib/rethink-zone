import { useState, useRef } from "react"; // React hooks for state and references
import {
  RectShape,
  CircleShape,
  LineShape,
  ArrowShape,
  PathShape,
  ImageShape,
  TextShape,
  FrameShape,
  PolyShape,
  Connector,
  SelectedShape,
  CanvasData,
  AnchorSide,
  ShapeKind,
  FigureShape,
  CodeShape,
} from "../types"; // Interface definitions for various canvas objects

// Interfaces for temporary preview shapes being drawn in real-time
interface CurrentRect { x: number; y: number; width: number; height: number }
interface CurrentCircle { x: number; y: number; rx: number; ry: number }
interface CurrentLine { x1: number; y1: number; x2: number; y2: number }
interface CurrentArrow { x1: number; y1: number; x2: number; y2: number }
interface CurrentPath { points: { x: number; y: number }[] }
interface CurrentFrame { x: number; y: number; width: number; height: number }

/**
 * useCanvasShapes - Centralized hook for managing the state of all objects present on the canvas.
 * It initializes shape collections from the provided initial data and provides setters for modifications.
 */
export const useCanvasShapes = (initialData: CanvasData | null | undefined) => {
  // Collections of persistent shapes stored in the current snapshot
  const [rectangles, setRectangles] = useState<RectShape[]>(
    initialData?.snapshot?.rectangles || []
  );
  const [circles, setCircles] = useState<CircleShape[]>(
    initialData?.snapshot?.circles || []
  );
  const [lines, setLines] = useState<LineShape[]>(
    initialData?.snapshot?.lines || []
  );
  const [arrows, setArrows] = useState<ArrowShape[]>(
    initialData?.snapshot?.arrows || []
  );
  const [paths, setPaths] = useState<PathShape[]>(
    initialData?.snapshot?.paths || []
  );
  const [images, setImages] = useState<ImageShape[]>(
    initialData?.snapshot?.images || []
  );
  const [texts, setTexts] = useState<TextShape[]>(
    initialData?.snapshot?.texts || []
  );
  const [frames, setFrames] = useState<FrameShape[]>(
    initialData?.snapshot?.frames || []
  );
  const [polygons, setPolygons] = useState<PolyShape[]>(
    initialData?.snapshot?.polygons || []
  );
  const [connectors, setConnectors] = useState<Connector[]>(
    initialData?.snapshot?.connectors || []
  );
  const [figures, setFigures] = useState<FigureShape[]>(
    initialData?.snapshot?.figures || []
  );
  const [codes, setCodes] = useState<CodeShape[]>(
    initialData?.snapshot?.codes || []
  );

  // Tracks which shapes are currently selected by the user
  const [selectedShape, setSelectedShape] = useState<SelectedShape>([]);
  
  // Tracks which connection point the user's mouse is currently hovering over
  const [hoverAnchor, setHoverAnchor] = useState<{
    kind: ShapeKind;
    shapeId: string;
    anchor: AnchorSide;
    percent?: number;
    point: { x: number; y: number };
  } | null>(null);

  // States for "ghost" shapes being rendered while the user is actively dragging to create them
  const [currentRect, setCurrentRect] = useState<CurrentRect | null>(null);
  const [currentCircle, setCurrentCircle] = useState<CurrentCircle | null>(null);
  const [currentLine, setCurrentLine] = useState<CurrentLine | null>(null);
  const [currentArrow, setCurrentArrow] = useState<CurrentArrow | null>(null);
  const [currentPath, setCurrentPath] = useState<CurrentPath | null>(null);
  const [currentFrame, setCurrentFrame] = useState<CurrentFrame | null>(null);

  // Reference for caching loaded HTMLImageElement objects to prevent flickering during redraws
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  // Active pencil/stroke settings
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);

  return {
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
    figures,
    setFigures,
    codes,
    setCodes,
    imageCacheRef,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
  };
};
