import { useState, useCallback } from "react";
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "../constants";

export const useCanvasView = (
  canvasContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const clampZoom = useCallback(
    (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)),
    []
  );

  const zoomIn = useCallback(
    () => setZoom((prev) => clampZoom(prev + ZOOM_STEP)),
    [clampZoom]
  );
  const zoomOut = useCallback(
    () => setZoom((prev) => clampZoom(prev - ZOOM_STEP)),
    [clampZoom]
  );
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const canvasToClient = useCallback(
    (x: number, y: number) => {
      return {
        x: x * zoom + pan.x,
        y: y * zoom + pan.y,
      };
    },
    [zoom, pan]
  );

  const toCanvasPointFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const rect = canvasContainerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [zoom, pan, canvasContainerRef]
  );

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    zoomIn,
    zoomOut,
    resetView,
    canvasToClient,
    toCanvasPointFromClient,
    clampZoom,
  };
};
