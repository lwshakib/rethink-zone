import React from "react";
import { X } from "lucide-react";
import {
  SelectedShape,
  Connector,
  LineShape,
  ArrowShape,
  ConnectorAnchor,
} from "../types";
import { getConnectorPoints } from "../utils/geometry";

interface LineActionsProps {
  selectedShape: SelectedShape;
  connectors: Connector[];
  lines: LineShape[];
  arrows: ArrowShape[];
  getAnchorPoint: (anchor: ConnectorAnchor) => { x: number; y: number } | null;
  getShapeBounds: (
    anchor: ConnectorAnchor
  ) => { x: number; y: number; width: number; height: number } | null;
  canvasToClient: (x: number, y: number) => { x: number; y: number };
  onDelete: () => void;
}

/**
 * LineActions - Renders a delete (X) icon at the center of selected arrows, lines, or connectors.
 */
export const LineActions: React.FC<LineActionsProps> = ({
  selectedShape,
  connectors,
  lines,
  arrows,
  getAnchorPoint,
  getShapeBounds,
  canvasToClient,
  onDelete,
}) => {
  // Only show for single selections of lines/arrows/connectors
  if (selectedShape.length !== 1) return null;

  const { kind, id, index } = selectedShape[0];
  if (!["line", "arrow"].includes(kind)) return null;

  const center = (() => {
    if (kind === "line") {
      const l = lines[index];
      if (!l) return null;
      return { x: (l.x1 + l.x2) / 2, y: (l.y1 + l.y2) / 2 };
    }
    if (kind === "arrow") {
      const a = arrows[index];
      if (!a) return null;
      return { x: (a.x1 + a.x2) / 2, y: (a.y1 + a.y2) / 2 };
    }
    if (kind === "connector") {
      const c = connectors.find((item) => item.id === id);
      if (!c) return null;

      const fromPt = getAnchorPoint(c.from);
      const toPt = getAnchorPoint(c.to);
      if (!fromPt || !toPt) return null;

      const fromBounds = getShapeBounds(c.from);
      const toBounds = getShapeBounds(c.to);

      const points = getConnectorPoints(
        fromPt,
        toPt,
        c.from.anchor,
        c.to.anchor,
        fromBounds || undefined,
        toBounds || undefined
      );

      if (points.length < 2) return null;

      // Find the visual center of the path
      let totalLength = 0;
      for (let i = 1; i < points.length; i++) {
        totalLength += Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y
        );
      }

      let currentLength = 0;
      const targetLength = totalLength / 2;
      for (let i = 1; i < points.length; i++) {
        const segLen = Math.hypot(
          points[i].x - points[i - 1].x,
          points[i].y - points[i - 1].y
        );
        if (currentLength + segLen >= targetLength) {
          const t = (targetLength - currentLength) / segLen;
          return {
            x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
            y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
          };
        }
        currentLength += segLen;
      }
      return points[Math.floor(points.length / 2)];
    }
    return null;
  })();

  if (!center) return null;

  const clientPos = canvasToClient(center.x, center.y);

  return (
    <div
      className="absolute pointer-events-auto z-[1002]"
      style={{
        left: `${clientPos.x}px`,
        top: `${clientPos.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-6 h-6 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 active:scale-95 transition-all"
        title="Delete Connection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
