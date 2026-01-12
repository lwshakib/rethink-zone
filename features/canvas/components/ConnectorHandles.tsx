import React from "react"; // Importing React
import { AnchorSide, ShapeKind, Connector, ConnectorAnchor, SelectedShape } from "../types"; // Importing required type definitions

// Internal interface for a single anchor handle point on a shape
interface AnchorHandle {
  kind: ShapeKind; // The type of shape this anchor belongs to (e.g., "rectangle")
  shapeId: string; // Unique ID of the parent shape
  anchor: AnchorSide; // The side/position of the anchor (e.g., "top", "bottom-left")
  point: { x: number; y: number }; // The local coordinate of the anchor point
}

// Props interface for the ConnectorHandles component
interface ConnectorHandlesProps {
  activeTool: string; // Currently selected drawing tool
  anchorHandles: AnchorHandle[]; // List of static anchors generated for selected shapes
  hoverAnchor: AnchorHandle | null; // The anchor currently being hovered by the mouse
  canvasToClient: (x: number, y: number) => { x: number; y: number }; // Coordinate transform helper
  selectedShape: SelectedShape; // Current selection state
  connectors: Connector[]; // All existing connectors in the document
  getAnchorPoint: (anchor: ConnectorAnchor) => { x: number; y: number } | null; // Resolver for global anchor points
}

/**
 * ConnectorHandles - Component that renders the interactive dots (anchors) used to 
 * connect shapes with arrows or lines.
 */
const ConnectorHandles: React.FC<ConnectorHandlesProps> = ({
  activeTool,
  anchorHandles,
  hoverAnchor,
  canvasToClient,
  selectedShape,
  connectors,
  getAnchorPoint,
}) => {
  // Filter out connectors that are part of the current user selection
  const selectedConnectors = connectors.filter(c => 
    selectedShape.some(s => s.kind === "connector" && s.id === c.id)
  );

  // Initialize the list of handles to render with the static ones
  const handlesToRender = [...anchorHandles];
  
  // Logic for drawing mode: ensure the currently hovered anchor is visible even if not in 'anchorHandles'
  if (activeTool === "Arrow") {
    if (
      hoverAnchor &&
      !anchorHandles.some(
        (h) =>
          h.shapeId === hoverAnchor.shapeId &&
          h.anchor === hoverAnchor.anchor &&
          // Use distance check to handle floating point precision
          Math.hypot(h.point.x - hoverAnchor.point.x, h.point.y - hoverAnchor.point.y) < 1
      )
    ) {
      handlesToRender.push(hoverAnchor);
    }
  }

  // Calculate visual handles for the endpoints of selected connectors
  const selectionHandles: { point: { x: number; y: number }; isSelected: boolean }[] = [];
  selectedConnectors.forEach(c => {
    const fromPt = getAnchorPoint(c.from);
    const toPt = getAnchorPoint(c.to);
    if (fromPt) selectionHandles.push({ point: fromPt, isSelected: true });
    if (toPt) selectionHandles.push({ point: toPt, isSelected: true });
  });

  return (
    <>
      {/* LAYER 1: Available Anchors for Drawing - Renders dots that snap the arrow tool */}
      {handlesToRender.map((h, i) => {
        const pos = canvasToClient(h.point.x, h.point.y); // Transform to screen pixels
        // Determine if this specific handle is being hovered
        const isHover =
          hoverAnchor &&
          hoverAnchor.shapeId === h.shapeId &&
          hoverAnchor.kind === h.kind &&
          hoverAnchor.anchor === h.anchor &&
          Math.hypot(hoverAnchor.point.x - h.point.x, hoverAnchor.point.y - h.point.y) < 2;

        return (
          <div
            key={`anchor-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: isHover ? 20 : 10, // Bring hovered handle to front
            }}
          >
            {/* The visual dot UI */}
            <div
              className={`rounded-full shadow-sm transition-all duration-150 ${
                isHover
                  ? "bg-white border-[2px] border-[#53b6ff] scale-125" // Highlighted state
                  : "bg-white/40 border border-white/80"             // Subtle/Inert state
              }`}
              style={{
                width: `${8}px`,
                height: `${8}px`,
                // Blue halo effect on hover
                boxShadow: isHover
                  ? "0 0 0 6px rgba(83,182,255,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        );
      })}

      {/* LAYER 2: Selection Handles for Editing - Renders draggable blue boxes/circles at connector ends */}
      {selectionHandles.map((h, i) => {
        const pos = canvasToClient(h.point.x, h.point.y);
        return (
          <div
            key={`selection-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: 30, // Deepest layer of handles
            }}
          >
            {/* The blue selection handle dot */}
            <div
              className="rounded-full bg-[#3b82f6] border-2 border-white shadow-md"
              style={{
                width: "10px",
                height: "10px",
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export { ConnectorHandles };
export default ConnectorHandles;
