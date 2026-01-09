import { LucideIcon } from "lucide-react";

export type RectShape = {
  id: string;
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

export type CircleShape = { 
  id: string; 
  x: number; 
  y: number; 
  rx: number; 
  ry: number;
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};
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
export type PathShape = { 
  id: string; 
  points: { x: number; y: number }[];
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};
export type ImageShape = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
};
export type TextShape = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  width: number;
  height: number;
  fill?: string;
  opacity?: number;
  fontFamily?: "Rough" | "Clean" | "Mono";
  textAlign?: "left" | "center" | "right";
};
export type FrameShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frameNumber: number;
  deviceType?: "phone" | "tablet" | "desktop" | "browser";
  fill?: string;
  stroke?: string;
  opacity?: number;
  strokeDashArray?: number[];
  strokeWidth?: number;
};
export type PolyShape = {
  id: string;
  type: string;
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

export type CodeShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  code: string;
  language: string;
  fill?: string;
  stroke?: string;
  opacity?: number;
  fontFamily?: "Rough" | "Clean" | "Mono";
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
};

export type ShapeKind = "rect" | "circle" | "image" | "text" | "frame" | "poly" | "figure" | "code";
export type AnchorSide = "top" | "bottom" | "left" | "right";
export type ConnectorAnchor = {
  kind: ShapeKind;
  shapeId: string;
  anchor: AnchorSide;
  percent?: number; // 0 to 1 along that side
};
export type Connector = {
  id: string;
  from: ConnectorAnchor;
  to: ConnectorAnchor;
};

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

export type CanvasData = {
  pan: { x: number; y: number };
  zoom: number;
  snapshot: HistoryEntry;
};

export type CanvasAreaProps = {
  initialData?: CanvasData | null;
  onChange?: (data: CanvasData) => void;
};

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

export type PlusMenuView =
  | "categories"
  | "shape"
  | "icon"
  | "cloud-icon"
  | "provider-icons"
  | "device-frame";

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
  index: number;
  id: string;
};

export type SelectedShape = SelectedShapeInfo[];

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
  | "resize-arrow";

export interface IconItem {
  name: string;
  icon: LucideIcon;
}
