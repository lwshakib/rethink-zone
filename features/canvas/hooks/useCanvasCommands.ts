/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { makeId } from "../utils";
import { 
  HistoryEntry, SelectedShape, SelectedShapeInfo,
  RectShape, CircleShape, LineShape, ArrowShape, PathShape, 
  ImageShape, TextShape, FrameShape, PolyShape, Connector 
} from "../types";

interface CanvasCommandsProps {
  rectangles: RectShape[];
  setRectangles: React.Dispatch<React.SetStateAction<RectShape[]>>;
  circles: CircleShape[];
  setCircles: React.Dispatch<React.SetStateAction<CircleShape[]>>;
  lines: LineShape[];
  setLines: React.Dispatch<React.SetStateAction<LineShape[]>>;
  arrows: ArrowShape[];
  setArrows: React.Dispatch<React.SetStateAction<ArrowShape[]>>;
  paths: PathShape[];
  setPaths: React.Dispatch<React.SetStateAction<PathShape[]>>;
  images: ImageShape[];
  setImages: React.Dispatch<React.SetStateAction<ImageShape[]>>;
  texts: TextShape[];
  setTexts: React.Dispatch<React.SetStateAction<TextShape[]>>;
  frames: FrameShape[];
  setFrames: React.Dispatch<React.SetStateAction<FrameShape[]>>;
  polygons: PolyShape[];
  setPolygons: React.Dispatch<React.SetStateAction<PolyShape[]>>;
  connectors: Connector[];
  setConnectors: React.Dispatch<React.SetStateAction<Connector[]>>;
  selectedShape: SelectedShape;
  setSelectedShape: React.Dispatch<React.SetStateAction<SelectedShape>>;
}

export const useCanvasCommands = (
  props: CanvasCommandsProps,
  pushHistory: (overrides?: Partial<HistoryEntry>) => void
) => {
  const {
    rectangles, setRectangles, circles, setCircles, lines, setLines,
    arrows, setArrows, images, setImages, texts, setTexts, frames, setFrames,
    polygons, setPolygons, connectors, setConnectors, selectedShape, setSelectedShape,
    paths, setPaths
  } = props;

  const deleteSelected = useCallback(() => {
    if (selectedShape.length === 0) return;

    const idsToDeleteByKind: Record<string, Set<string>> = {
      rect: new Set(), circle: new Set(), image: new Set(), text: new Set(),
      frame: new Set(), line: new Set(), arrow: new Set(), poly: new Set(),
      connector: new Set()
    };

    selectedShape.forEach(({ kind, index }: SelectedShapeInfo) => {
      let id: string | null = null;
      if (kind === "rect") id = rectangles[index]?.id;
      else if (kind === "circle") id = circles[index]?.id;
      else if (kind === "image") id = images[index]?.id;
      else if (kind === "text") id = texts[index]?.id;
      else if (kind === "frame") id = frames[index]?.id;
      else if (kind === "line") id = lines[index]?.id;
      else if (kind === "arrow") id = arrows[index]?.id;
      else if (kind === "poly") id = polygons[index]?.id;
      else if (kind === "connector") id = connectors[index]?.id;
      if (id) idsToDeleteByKind[kind].add(id);
    });

    const allDeletedIds = new Set(Object.values(idsToDeleteByKind).flatMap(s => Array.from(s)));
    if (allDeletedIds.size === 0) return;

    const nextRects = rectangles.filter(r => !idsToDeleteByKind.rect.has(r.id));
    const nextCircles = circles.filter(c => !idsToDeleteByKind.circle.has(c.id));
    const nextImages = images.filter(i => !idsToDeleteByKind.image.has(i.id));
    const nextTexts = texts.filter(t => !idsToDeleteByKind.text.has(t.id));
    const nextFrames = frames.filter(f => !idsToDeleteByKind.frame.has(f.id));
    const nextLines = lines.filter(l => !idsToDeleteByKind.line.has(l.id));
    const nextArrows = arrows.filter(a => !idsToDeleteByKind.arrow.has(a.id));
    const nextPolys = polygons.filter(p => !idsToDeleteByKind.poly.has(p.id));
    const nextConnectors = connectors.filter(c => 
      !idsToDeleteByKind.connector.has(c.id) && 
      !allDeletedIds.has(c.from.shapeId) && 
      !allDeletedIds.has(c.to.shapeId)
    );

    setRectangles(nextRects);
    setCircles(nextCircles);
    setImages(nextImages);
    setTexts(nextTexts);
    setFrames(nextFrames);
    setLines(nextLines);
    setArrows(nextArrows);
    setPolygons(nextPolys);
    setConnectors(nextConnectors);

    pushHistory({
      rectangles: nextRects,
      circles: nextCircles,
      images: nextImages,
      texts: nextTexts,
      frames: nextFrames,
      lines: nextLines,
      arrows: nextArrows,
      polygons: nextPolys,
      connectors: nextConnectors
    });

    setSelectedShape([]);
  }, [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, connectors, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, setConnectors, pushHistory, setSelectedShape]);

  const duplicateSelection = useCallback(
    (offset = 20) => {
      if (selectedShape.length === 0) return;
      
      const newSelection: any[] = [];
      const updates: any = {};

      selectedShape.forEach(({ kind, index }) => {
        if (kind === "rect") {
          const src = rectangles[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.rectangles) updates.rectangles = [...rectangles];
          updates.rectangles.push(clone);
          newSelection.push({ kind: "rect", index: updates.rectangles.length - 1, id: clone.id });
        } else if (kind === "circle") {
          const src = circles[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.circles) updates.circles = [...circles];
          updates.circles.push(clone);
          newSelection.push({ kind: "circle", index: updates.circles.length - 1, id: clone.id });
        } else if (kind === "image") {
          const src = images[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.images) updates.images = [...images];
          updates.images.push(clone);
          newSelection.push({ kind: "image", index: updates.images.length - 1, id: clone.id });
        } else if (kind === "text") {
          const src = texts[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.texts) updates.texts = [...texts];
          updates.texts.push(clone);
          newSelection.push({ kind: "text", index: updates.texts.length - 1, id: clone.id });
        } else if (kind === "frame") {
          const src = frames[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.frames) updates.frames = [...frames];
          updates.frames.push(clone);
          newSelection.push({ kind: "frame", index: updates.frames.length - 1, id: clone.id });
        } else if (kind === "line") {
          const src = lines[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x1: src.x1 + offset, y1: src.y1 + offset, x2: src.x2 + offset, y2: src.y2 + offset };
          if (!updates.lines) updates.lines = [...lines];
          updates.lines.push(clone);
          newSelection.push({ kind: "line", index: updates.lines.length - 1, id: clone.id });
        } else if (kind === "arrow") {
          const src = arrows[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x1: src.x1 + offset, y1: src.y1 + offset, x2: src.x2 + offset, y2: src.y2 + offset };
          if (!updates.arrows) updates.arrows = [...arrows];
          updates.arrows.push(clone);
          newSelection.push({ kind: "arrow", index: updates.arrows.length - 1, id: clone.id });
        } else if (kind === "poly") {
          const src = polygons[index]; if (!src) return;
          const clone = { ...src, id: makeId(), x: src.x + offset, y: src.y + offset };
          if (!updates.polygons) updates.polygons = [...polygons];
          updates.polygons.push(clone);
          newSelection.push({ kind: "poly", index: updates.polygons.length - 1, id: clone.id });
        }
      });

      if (updates.rectangles) setRectangles(updates.rectangles);
      if (updates.circles) setCircles(updates.circles);
      if (updates.images) setImages(updates.images);
      if (updates.texts) setTexts(updates.texts);
      if (updates.frames) setFrames(updates.frames);
      if (updates.lines) setLines(updates.lines);
      if (updates.arrows) setArrows(updates.arrows);
      if (updates.polygons) setPolygons(updates.polygons);

      pushHistory(updates);
      setSelectedShape(newSelection);
    },
    [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, pushHistory, setSelectedShape]
  );

  return { deleteSelected, duplicateSelection };
};
