import { LucideIcon } from "lucide-react";

/** 
 * RectShape - Properties for a rectangular element on the canvas
 */
export type RectShape = {
  id: string;      // Unique identifier
  x: number;       // Left coordinate in canvas space
  y: number;       // Top coordinate in canvas space
  width: number; 
  height: number;
  fill?: string;   // Optional fill color (Hex or transparent)
  stroke?: string; // Optional border color
  opacity?: number; 
  strokeDashArray?: number[]; // Used for dashed or dotted borders
  strokeWidth?: number;
};

/** 
 * CircleShape - Properties for elliptical/circular elements
 */
export type CircleShape = { 
  id: string; 
  x: number;  // Center X
  y: number;  // Center Y
  rx: number; // Radius X
  ry: number; // Radius Y
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * LineShape - Simple straight vector line between two points
 */
export type LineShape = { 
  id: string; 
  x1: number; 
  y1: number; 
  x2: number; 
  y2: number;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * ArrowShape - Vector line with a directional head at the end point (x2, y2)
 */
export type ArrowShape = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * PathShape - Freehand drawing data (Pencil tool)
 */
export type PathShape = { 
  id: string; 
  points: { x: number; y: number }[]; // Array of points defining the path
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * ImageShape - Properties for hosted images or library icons placed on canvas
 */
export type ImageShape = {
  id: string;
  src: string; // URL or Data URI of the image
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
};

/** 
 * TextShape - Rich-formatted text block
 */
export type TextShape = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  width: number; // Measured width of the text block
  height: number; // Measured height of the text block
  fill?: string;
  opacity?: number;
  fontFamily?: "Rough" | "Clean" | "Mono"; // Hand-drawn vs Standard vs Monospace
  textAlign?: "left" | "center" | "right";
};

/** 
 * FrameShape - Containers that group other elements or represent viewport bounds (Browser, Phone, etc)
 */
export type FrameShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameNumber: number; // Sequential ID displayed on the UI
  deviceType?: "phone" | "tablet" | "desktop" | "browser"; // Influences visual decoration (notch, bars)
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * PolyShape - Multi-sided geometric shapes (Triangle, Diamond, Hexagon)
 */
export type PolyShape = {
  id: string;
  type: string; // "triangle", "diamond", etc.
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};

/** 
 * FigureShape - Specialized schematic elements
 */
export type FigureShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  figureNumber: number;
  title?: string;
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeWidth?: number;
};

/** 
 * CodeShape - Syntax-highlighted code blocks on the canvas
 */
export type CodeShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;     // The raw source code
  language: string; // "javascript", "python", etc.
  fill?: string;
  stroke?: string;
  opacity?: number;
  fontFamily?: "Rough" | "Clean" | "Mono";
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
};

// Kind identifiers for categorizing different shape types
export type ShapeKind = "rect" | "circle" | "image" | "text" | "frame" | "poly" | "figure" | "code";

// Anchor sides for smart connectors (arrows that snap to shapes)
export type AnchorSide = "top" | "bottom" | "left" | "right";

/** 
 * ConnectorAnchor - Defines where one end of a connector line is attached
 */
export type ConnectorAnchor = {
  kind: ShapeKind | "point"; // Can be attached to a shape or a free-floating point
  shapeId: string; // The ID of the shape it's attached to (ignored if kind is "point")
  anchor: AnchorSide | "none"; // Snap side
  percent?: number; // Precise offset along the side (%)
  point?: { x: number; y: number }; // Relative coordinate if kind is "point"
};

/** 
 * Connector - A semantic link (line/arrow) between two shapes or points
 */
export type Connector = {
  id: string;
  from: ConnectorAnchor;
  to: ConnectorAnchor;
};

/** 
 * HistoryEntry - A complete snapshot of all shapes at a specific point in time
 */
export type HistoryEntry = {
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
  figures: FigureShape[];
  codes: CodeShape[];
};

/** 
 * CanvasData - The full state required to persist or restore a canvas session
 */
export type CanvasData = {
  pan: { x: number; y: number }; // Current camera position
  zoom: number;                  // Current camera zoom
  snapshot: HistoryEntry;        // All current elements
};

// Props for the main Canvas component
export type CanvasAreaProps = {
  initialData?: CanvasData | null; // Data to load on mount
  onChange?: (data: CanvasData) => void; // Sync callback for persistence
};

// Enumeration of all interactive tools available in the UI
export type Tool =
  | "Hand"
  | "Select"
  | "Rectangle"
  | "Circle"
  | "Line"
  | "Arrow"
  | "Text"
  | "Frame"
  | "Eraser"
  | "Pencil"
  | "PlusAdd"
  | "IconAdd";

// Views available within the item insertion menu (PlusMenu)
export type PlusMenuView =
  | "categories"
  | "shape"
  | "icon"
  | "cloud-icon"
  | "provider-icons"
  | "device-frame";

/** 
 * SelectedShapeInfo - Metadata about a shape currently targeted by the selection tool
 */
export type SelectedShapeInfo = {
  kind:
    | "rect"
    | "circle"
    | "image"
    | "text"
    | "frame"
    | "connector"
    | "line"
    | "arrow"
    | "poly"
    | "figure"
    | "code";
  index: number; // Position in relevant collection array
  id: string;    // Raw individual ID
};

export type SelectedShape = SelectedShapeInfo[]; // Array to support multi-selection

// Interaction modes for the mouse while dragging (Influences cursor and logic)
export type DragMode =
  | "none"
  | "move"
  | "resize-nwse"
  | "resize-h"
  | "resize-v"
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
  | "resize-connector";

// Simple UI wrapper for general icons
export interface IconItem {
  name: string;
  icon: LucideIcon;
}
