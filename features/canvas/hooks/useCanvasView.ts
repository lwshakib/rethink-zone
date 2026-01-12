import { useState, useCallback } from "react"; // React hooks
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from "../constants"; // Zoom configuration constants

/**
 * useCanvasView - Hook for managing the "camera" viewport (pan and zoom).
 * @param canvasContainerRef Ref to the DOM element containing the canvas for coordinate calculations.
 */
export const useCanvasView = (
  canvasContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [zoom, setZoom] = useState(1); // Default zoom level (100%)
  const [pan, setPan] = useState({ x: 0, y: 0 }); // Offset from the top-left origin

  /** 
   * Utility to keep zoom within defined bounds (e.g. 10% to 500%)
   */
  const clampZoom = useCallback(
    (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)),
    []
  );

  /**
   * Standard increment/decrement zoom actions
   */
  const zoomIn = useCallback(
    () => setZoom((prev) => clampZoom(prev + ZOOM_STEP)),
    [clampZoom]
  );
  const zoomOut = useCallback(
    () => setZoom((prev) => clampZoom(prev - ZOOM_STEP)),
    [clampZoom]
  );

  /**
   * Reset the camera to the origin point at 100% scale
   */
  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  /**
   * Coordinate Transformer: Canvas (world) values -> Client (pixel) values
   * Used for positioning UI overlays (like toolbars or handles) exactly on top of shapes.
   */
  const canvasToClient = useCallback(
    (x: number, y: number) => {
      return {
        x: x * zoom + pan.x,
        y: y * zoom + pan.y,
      };
    },
    [zoom, pan]
  );

  /**
   * Coordinate Transformer: Client (pixel) values -> Canvas (world) values
   * Used to determine where in the virtual world a user clicked.
   */
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
