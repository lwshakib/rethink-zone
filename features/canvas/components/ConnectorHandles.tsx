import React from "react";
import { AnchorSide, ShapeKind } from "../types";

interface AnchorHandle {
  kind: ShapeKind;
  shapeId: string;
  anchor: AnchorSide;
  point: { x: number; y: number };
}

interface ConnectorHandlesProps {
  activeTool: string;
  anchorHandles: AnchorHandle[];
  hoverAnchor: AnchorHandle | null;
  canvasToClient: (x: number, y: number) => { x: number; y: number };
}

const ConnectorHandles: React.FC<ConnectorHandlesProps> = ({
  activeTool,
  anchorHandles,
  hoverAnchor,
  canvasToClient,
}) => {
  if (activeTool !== "Arrow") return null;

  const handlesToRender = [...anchorHandles];
  if (
    hoverAnchor &&
    !anchorHandles.some(
      (h) =>
        h.shapeId === hoverAnchor.shapeId &&
        h.anchor === hoverAnchor.anchor &&
        Math.hypot(h.point.x - hoverAnchor.point.x, h.point.y - hoverAnchor.point.y) <
          1
    )
  ) {
    handlesToRender.push(hoverAnchor);
  }

  return (
    <>
      {handlesToRender.map((h, i) => {
        const pos = canvasToClient(h.point.x, h.point.y);
        const isHover =
          hoverAnchor &&
          hoverAnchor.shapeId === h.shapeId &&
          hoverAnchor.kind === h.kind &&
          hoverAnchor.anchor === h.anchor &&
          Math.hypot(hoverAnchor.point.x - h.point.x, hoverAnchor.point.y - h.point.y) <
            2;

        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -50%)",
              zIndex: isHover ? 20 : 10,
            }}
          >
            <div
              className={`rounded-full shadow-sm transition-all duration-150 ${
                isHover
                  ? "bg-white border-[2px] border-[#53b6ff] scale-125"
                  : "bg-white/40 border border-white/80"
              }`}
              style={{
                width: `${8}px`,
                height: `${8}px`,
                boxShadow: isHover
                  ? "0 0 0 6px rgba(83,182,255,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.2)",
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
