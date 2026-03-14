/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react"; // React hook for memoized callbacks
import { makeId } from "../utils"; // Utility to generate unique IDs for clones
import {
  HistoryEntry,
  SelectedShape,
  SelectedShapeInfo,
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
  FigureShape,
  CodeShape,
} from "../types"; // Type definitions for all canvas objects

// Interface defining the dependencies required by this hook to manipulate the canvas state
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
  figures: FigureShape[];
  setFigures: React.Dispatch<React.SetStateAction<FigureShape[]>>;
  codes: CodeShape[];
  setCodes: React.Dispatch<React.SetStateAction<CodeShape[]>>;
}

/**
 * useCanvasCommands - Hook providing core canvas operations that affect multiple shapes,
 * such as deleting a selection or duplicating items.
 */
export const useCanvasCommands = (
  props: CanvasCommandsProps,
  pushHistory: (overrides?: Partial<HistoryEntry>) => void // Callback to save the new state to the history stack
) => {
  const {
    rectangles,
    setRectangles,
    circles,
    setCircles,
    lines,
    setLines,
    arrows,
    setArrows,
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
    paths,
    setPaths,
    figures,
    setFigures,
    codes,
    setCodes,
  } = props;

  /**
   * deleteSelected - Mass deletion of all shapes currently in the selection set.
   * Also handles cleaning up active connectors attached to deleted shapes.
   */
  const deleteSelected = useCallback(() => {
    if (selectedShape.length === 0) return; // Nothing to do

    // Group IDs of items to be removed by their kind
    const idsToDeleteByKind: Record<string, Set<string>> = {
      rect: new Set(),
      circle: new Set(),
      image: new Set(),
      text: new Set(),
      frame: new Set(),
      line: new Set(),
      arrow: new Set(),
      poly: new Set(),
      connector: new Set(),
      figure: new Set(),
      code: new Set(),
      path: new Set(),
    };

    // Populate the deletion lookup table
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
      else if (kind === "figure") id = figures[index]?.id;
      else if (kind === "code") id = codes[index]?.id;
      else if (kind === "path") id = paths[index]?.id;
      if (id) idsToDeleteByKind[kind].add(id);
    });

    // CASCADE DELETE: If a Figure is being deleted, also delete everything "on" it
    const selectedFigureItems = figures.filter((f) => idsToDeleteByKind.figure.has(f.id));
    if (selectedFigureItems.length > 0) {
      const isInsideAnyDeletedFigure = (x: number, y: number) => {
        return selectedFigureItems.some(
          (f) => x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.height
        );
      };

      // Check all other shapes for containment
      rectangles.forEach((r) => { if (!idsToDeleteByKind.rect.has(r.id) && isInsideAnyDeletedFigure(r.x + r.width / 2, r.y + r.height / 2)) idsToDeleteByKind.rect.add(r.id); });
      circles.forEach((c) => { if (!idsToDeleteByKind.circle.has(c.id) && isInsideAnyDeletedFigure(c.x, c.y)) idsToDeleteByKind.circle.add(c.id); });
      images.forEach((i) => { if (!idsToDeleteByKind.image.has(i.id) && isInsideAnyDeletedFigure(i.x + i.width / 2, i.y + i.height / 2)) idsToDeleteByKind.image.add(i.id); });
      texts.forEach((t) => { if (!idsToDeleteByKind.text.has(t.id) && isInsideAnyDeletedFigure(t.x + t.width / 2, t.y + t.height / 2)) idsToDeleteByKind.text.add(t.id); });
      frames.forEach((f) => { if (!idsToDeleteByKind.frame.has(f.id) && isInsideAnyDeletedFigure(f.x + f.width / 2, f.y + f.height / 2)) idsToDeleteByKind.frame.add(f.id); });
      lines.forEach((l) => { if (!idsToDeleteByKind.line.has(l.id) && isInsideAnyDeletedFigure((l.x1 + l.x2) / 2, (l.y1 + l.y2) / 2)) idsToDeleteByKind.line.add(l.id); });
      arrows.forEach((a) => { if (!idsToDeleteByKind.arrow.has(a.id) && isInsideAnyDeletedFigure((a.x1 + a.x2) / 2, (a.y1 + a.y2) / 2)) idsToDeleteByKind.arrow.add(a.id); });
      polygons.forEach((p) => { if (!idsToDeleteByKind.poly.has(p.id) && isInsideAnyDeletedFigure(p.x + p.width / 2, p.y + p.height / 2)) idsToDeleteByKind.poly.add(p.id); });
      codes.forEach((c) => { if (!idsToDeleteByKind.code.has(c.id) && isInsideAnyDeletedFigure(c.x + c.width / 2, c.y + c.height / 2)) idsToDeleteByKind.code.add(c.id); });
      paths.forEach((p) => { if (!idsToDeleteByKind.path.has(p.id) && p.points.length > 0 && isInsideAnyDeletedFigure(p.points[0].x, p.points[0].y)) idsToDeleteByKind.path.add(p.id); });
      // Also recursively delete nested figures (except the ones already being deleted)
      figures.forEach((f) => { if (!idsToDeleteByKind.figure.has(f.id) && isInsideAnyDeletedFigure(f.x + f.width / 2, f.y + f.height / 2)) idsToDeleteByKind.figure.add(f.id); });
    }

    const allDeletedIds = new Set(
      Object.values(idsToDeleteByKind).flatMap((s) => Array.from(s))
    );
    if (allDeletedIds.size === 0) return;

    // Filter out deleted items from each shape array
    const nextRects = rectangles.filter(
      (r) => !idsToDeleteByKind.rect.has(r.id)
    );
    const nextCircles = circles.filter(
      (c) => !idsToDeleteByKind.circle.has(c.id)
    );
    const nextImages = images.filter((i) => !idsToDeleteByKind.image.has(i.id));
    const nextTexts = texts.filter((t) => !idsToDeleteByKind.text.has(t.id));
    const nextFrames = frames.filter((f) => !idsToDeleteByKind.frame.has(f.id));
    const nextLines = lines.filter((l) => !idsToDeleteByKind.line.has(l.id));
    const nextArrows = arrows.filter((a) => !idsToDeleteByKind.arrow.has(a.id));
    const nextPolys = polygons.filter((p) => !idsToDeleteByKind.poly.has(p.id));
    // Specialized logic: and also remove connectors if either of their endpoint shapes were deleted
    const nextConnectors = connectors.filter(
      (c) =>
        !idsToDeleteByKind.connector.has(c.id) &&
        !allDeletedIds.has(c.from.shapeId) &&
        !allDeletedIds.has(c.to.shapeId)
    );
    const nextFigures = figures.filter(
      (f) => !idsToDeleteByKind.figure.has(f.id)
    );
    const nextCodes = codes.filter((c) => !idsToDeleteByKind.code.has(c.id));
    const nextPaths = paths.filter((p) => !idsToDeleteByKind.path.has(p.id));

    // Update active UI state
    setRectangles(nextRects);
    setCircles(nextCircles);
    setImages(nextImages);
    setTexts(nextTexts);
    setFrames(nextFrames);
    setLines(nextLines);
    setArrows(nextArrows);
    setPolygons(nextPolys);
    setConnectors(nextConnectors);
    setFigures(nextFigures);
    setCodes(nextCodes);
    setPaths(nextPaths);

    // Persist this major change to history
    pushHistory({
      rectangles: nextRects,
      circles: nextCircles,
      images: nextImages,
      texts: nextTexts,
      frames: nextFrames,
      lines: nextLines,
      arrows: nextArrows,
      polygons: nextPolys,
      connectors: nextConnectors,
      figures: nextFigures,
      codes: nextCodes,
      paths: nextPaths,
    });

    // Clear selection after deletion
    setSelectedShape([]);
  }, [
    selectedShape,
    rectangles,
    circles,
    images,
    texts,
    frames,
    lines,
    arrows,
    polygons,
    connectors,
    figures,
    codes,
    paths,
    setRectangles,
    setCircles,
    setImages,
    setTexts,
    setFrames,
    setLines,
    setArrows,
    setPolygons,
    setConnectors,
    setFigures,
    setCodes,
    setPaths,
    pushHistory,
    setSelectedShape,
  ]);

  /**
   * duplicateSelection - Clones selected objects and shifts them slightly (offset) for visual clarity.
   */
  const duplicateSelection = useCallback(
    (offset = 20) => {
      if (selectedShape.length === 0) return;

      const newSelection: any[] = [];
      const updates: any = {};

      selectedShape.forEach(({ kind, index }) => {
        // For each selected item, create a shallow copy with a new ID and shifted coordinates
        if (kind === "rect") {
          const src = rectangles[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.rectangles) updates.rectangles = [...rectangles];
          updates.rectangles.push(clone);
          newSelection.push({
            kind: "rect",
            index: updates.rectangles.length - 1,
            id: clone.id,
          });
        } else if (kind === "circle") {
          const src = circles[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.circles) updates.circles = [...circles];
          updates.circles.push(clone);
          newSelection.push({
            kind: "circle",
            index: updates.circles.length - 1,
            id: clone.id,
          });
        } else if (kind === "image") {
          const src = images[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.images) updates.images = [...images];
          updates.images.push(clone);
          newSelection.push({
            kind: "image",
            index: updates.images.length - 1,
            id: clone.id,
          });
        } else if (kind === "text") {
          const src = texts[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.texts) updates.texts = [...texts];
          updates.texts.push(clone);
          newSelection.push({
            kind: "text",
            index: updates.texts.length - 1,
            id: clone.id,
          });
        } else if (kind === "frame") {
          const src = frames[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.frames) updates.frames = [...frames];
          updates.frames.push(clone);
          newSelection.push({
            kind: "frame",
            index: updates.frames.length - 1,
            id: clone.id,
          });
        } else if (kind === "line") {
          const src = lines[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x1: src.x1 + offset,
            y1: src.y1 + offset,
            x2: src.x2 + offset,
            y2: src.y2 + offset,
          };
          if (!updates.lines) updates.lines = [...lines];
          updates.lines.push(clone);
          newSelection.push({
            kind: "line",
            index: updates.lines.length - 1,
            id: clone.id,
          });
        } else if (kind === "arrow") {
          const src = arrows[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x1: src.x1 + offset,
            y1: src.y1 + offset,
            x2: src.x2 + offset,
            y2: src.y2 + offset,
          };
          if (!updates.arrows) updates.arrows = [...arrows];
          updates.arrows.push(clone);
          newSelection.push({
            kind: "arrow",
            index: updates.arrows.length - 1,
            id: clone.id,
          });
        } else if (kind === "poly") {
          const src = polygons[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.polygons) updates.polygons = [...polygons];
          updates.polygons.push(clone);
          newSelection.push({
            kind: "poly",
            index: updates.polygons.length - 1,
            id: clone.id,
          });
        } else if (kind === "figure") {
          const src = figures[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.figures) updates.figures = [...figures];
          updates.figures.push(clone);
          newSelection.push({
            kind: "figure",
            index: updates.figures.length - 1,
            id: clone.id,
          });
        } else if (kind === "code") {
          const src = codes[index];
          if (!src) return;
          const clone = {
            ...src,
            id: makeId(),
            x: src.x + offset,
            y: src.y + offset,
          };
          if (!updates.codes) updates.codes = [...codes];
          updates.codes.push(clone);
          newSelection.push({
            kind: "code",
            index: updates.codes.length - 1,
            id: clone.id,
          });
        }
      });

      // Update state for each shape type that was duplicated
      if (updates.rectangles) setRectangles(updates.rectangles);
      if (updates.circles) setCircles(updates.circles);
      if (updates.images) setImages(updates.images);
      if (updates.texts) setTexts(updates.texts);
      if (updates.frames) setFrames(updates.frames);
      if (updates.lines) setLines(updates.lines);
      if (updates.arrows) setArrows(updates.arrows);
      if (updates.polygons) setPolygons(updates.polygons);
      if (updates.figures) setFigures(updates.figures);
      if (updates.codes) setCodes(updates.codes);

      pushHistory(updates); // Save to history
      setSelectedShape(newSelection); // Switch selection to the new clones
    },
    [
      selectedShape,
      rectangles,
      circles,
      images,
      texts,
      frames,
      lines,
      arrows,
      polygons,
      figures,
      codes,
      setRectangles,
      setCircles,
      setImages,
      setTexts,
      setFrames,
      setLines,
      setArrows,
      setPolygons,
      setFigures,
      setCodes,
      pushHistory,
      setSelectedShape,
    ]
  );

  /**
   * groupSelected - Assigns a common groupId to all currently selected shapes.
   */
  const groupSelected = useCallback(() => {
    if (selectedShape.length < 2) return;
    const newGroupId = makeId();
    const updates: any = {};
    const selectedIds = new Set(selectedShape.map((s) => s.id));

    const updateCollection = (items: any[], kind: string, setter: any) => {
      const next = items.map((item) =>
        selectedIds.has(item.id) ? { ...item, groupId: newGroupId } : item
      );
      if (JSON.stringify(next) !== JSON.stringify(items)) {
        updates[kind + "s" === "polys" ? "polygons" : kind + "s"] = next;
        setter(next);
      }
    };

    updateCollection(rectangles, "rect", setRectangles);
    updateCollection(circles, "circle", setCircles);
    updateCollection(images, "image", setImages);
    updateCollection(texts, "text", setTexts);
    updateCollection(frames, "frame", setFrames);
    updateCollection(lines, "line", setLines);
    updateCollection(arrows, "arrow", setArrows);
    updateCollection(polygons, "poly", setPolygons);
    updateCollection(figures, "figure", setFigures);
    updateCollection(codes, "code", setCodes);

    pushHistory(updates);
  }, [
    selectedShape,
    rectangles,
    circles,
    images,
    texts,
    frames,
    lines,
    arrows,
    polygons,
    figures,
    codes,
    setRectangles,
    setCircles,
    setImages,
    setTexts,
    setFrames,
    setLines,
    setArrows,
    setPolygons,
    setFigures,
    setCodes,
    pushHistory,
  ]);

  /**
   * ungroupSelected - Removes the groupId from all shapes that belong to the groups in the current selection.
   */
  const ungroupSelected = useCallback(() => {
    if (selectedShape.length === 0) return;

    // Find all groupIds in the current selection
    const groupIdsToUngroup = new Set<string>();
    selectedShape.forEach(({ kind, index }) => {
      let shape: any = null;
      if (kind === "rect") shape = rectangles[index];
      else if (kind === "circle") shape = circles[index];
      else if (kind === "image") shape = images[index];
      else if (kind === "text") shape = texts[index];
      else if (kind === "frame") shape = frames[index];
      else if (kind === "line") shape = lines[index];
      else if (kind === "arrow") shape = arrows[index];
      else if (kind === "poly") shape = polygons[index];
      else if (kind === "figure") shape = figures[index];
      else if (kind === "code") shape = codes[index];

      if (shape?.groupId) groupIdsToUngroup.add(shape.groupId);
    });

    if (groupIdsToUngroup.size === 0) return;

    const updates: any = {};
    const ungroupCollection = (items: any[], kind: string, setter: any) => {
      const next = items.map((item) =>
        item.groupId && groupIdsToUngroup.has(item.groupId)
          ? { ...item, groupId: undefined }
          : item
      );
      if (JSON.stringify(next) !== JSON.stringify(items)) {
        updates[kind + "s" === "polys" ? "polygons" : kind + "s"] = next;
        setter(next);
      }
    };

    ungroupCollection(rectangles, "rect", setRectangles);
    ungroupCollection(circles, "circle", setCircles);
    ungroupCollection(images, "image", setImages);
    ungroupCollection(texts, "text", setTexts);
    ungroupCollection(frames, "frame", setFrames);
    ungroupCollection(lines, "line", setLines);
    ungroupCollection(arrows, "arrow", setArrows);
    ungroupCollection(polygons, "poly", setPolygons);
    ungroupCollection(figures, "figure", setFigures);
    ungroupCollection(codes, "code", setCodes);

    pushHistory(updates);
  }, [
    selectedShape,
    rectangles,
    circles,
    images,
    texts,
    frames,
    lines,
    arrows,
    polygons,
    figures,
    codes,
    setRectangles,
    setCircles,
    setImages,
    setTexts,
    setFrames,
    setLines,
    setArrows,
    setPolygons,
    setFigures,
    setCodes,
    pushHistory,
  ]);

  /**
   * copySelected - Saves a deep clone of the current selection to a local clipboard.
   */
  const copySelected = useCallback(() => {
    if (selectedShape.length === 0) return;

    const copiedShapes: Partial<HistoryEntry> = {};

    selectedShape.forEach(({ kind, index }) => {
      if (kind === "rect") {
        if (!copiedShapes.rectangles) copiedShapes.rectangles = [];
        copiedShapes.rectangles.push({ ...rectangles[index] });
      } else if (kind === "circle") {
        if (!copiedShapes.circles) copiedShapes.circles = [];
        copiedShapes.circles.push({ ...circles[index] });
      } else if (kind === "image") {
        if (!copiedShapes.images) copiedShapes.images = [];
        copiedShapes.images.push({ ...images[index] });
      } else if (kind === "text") {
        if (!copiedShapes.texts) copiedShapes.texts = [];
        copiedShapes.texts.push({ ...texts[index] });
      } else if (kind === "frame") {
        if (!copiedShapes.frames) copiedShapes.frames = [];
        copiedShapes.frames.push({ ...frames[index] });
      } else if (kind === "line") {
        if (!copiedShapes.lines) copiedShapes.lines = [];
        copiedShapes.lines.push({ ...lines[index] });
      } else if (kind === "arrow") {
        if (!copiedShapes.arrows) copiedShapes.arrows = [];
        copiedShapes.arrows.push({ ...arrows[index] });
      } else if (kind === "poly") {
        if (!copiedShapes.polygons) copiedShapes.polygons = [];
        copiedShapes.polygons.push({ ...polygons[index] });
      } else if (kind === "figure") {
        if (!copiedShapes.figures) copiedShapes.figures = [];
        copiedShapes.figures.push({ ...figures[index] });
      } else if (kind === "code") {
        if (!copiedShapes.codes) copiedShapes.codes = [];
        copiedShapes.codes.push({ ...codes[index] });
      } else if (kind === "path") {
        if (!copiedShapes.paths) copiedShapes.paths = [];
        copiedShapes.paths.push({ ...paths[index] });
      }
    });

    localStorage.setItem("canvas_clipboard", JSON.stringify(copiedShapes));
  }, [
    selectedShape,
    rectangles,
    circles,
    images,
    texts,
    frames,
    lines,
    arrows,
    polygons,
    figures,
    codes,
    paths,
  ]);

  /**
   * pasteSelected - Clones items from the clipboard and places them at a slight offset.
   */
  const pasteSelected = useCallback(
    (offset = 20) => {
      const stored = localStorage.getItem("canvas_clipboard");
      if (!stored) return;

      try {
        const clipboard: Partial<HistoryEntry> = JSON.parse(stored);
        const newSelection: any[] = [];
        const updates: any = {};

        const processCollection = (
          items: any[] | undefined,
          kind: string,
          existing: any[],
          setter: any
        ) => {
          if (!items || items.length === 0) return;
          const next = [...existing];
          items.forEach((item) => {
            const clone = { ...item, id: makeId() };
            if (clone.x !== undefined) clone.x += offset;
            if (clone.y !== undefined) clone.y += offset;
            if (clone.x1 !== undefined) {
              clone.x1 += offset;
              clone.y1 += offset;
              clone.x2 += offset;
              clone.y2 += offset;
            }
            next.push(clone);
            newSelection.push({
              kind,
              index: next.length - 1,
              id: clone.id,
            });
          });
          updates[kind + "s" === "polys" ? "polygons" : kind + "s"] = next;
          setter(next);
        };

        processCollection(clipboard.rectangles, "rect", rectangles, setRectangles);
        processCollection(clipboard.circles, "circle", circles, setCircles);
        processCollection(clipboard.images, "image", images, setImages);
        processCollection(clipboard.texts, "text", texts, setTexts);
        processCollection(clipboard.frames, "frame", frames, setFrames);
        processCollection(clipboard.lines, "line", lines, setLines);
        processCollection(clipboard.arrows, "arrow", arrows, setArrows);
        processCollection(clipboard.polygons, "poly", polygons, setPolygons);
        processCollection(clipboard.figures, "figure", figures, setFigures);
        processCollection(clipboard.codes, "code", codes, setCodes);
        processCollection(clipboard.paths, "path", paths, setPaths);

      pushHistory(updates);
      setSelectedShape(newSelection);
    } catch (e) {
      console.error("Paste failed", e);
    }
  }, [
    rectangles,
    circles,
    images,
    texts,
    frames,
    lines,
    arrows,
    polygons,
    figures,
    codes,
    paths,
    setRectangles,
    setCircles,
    setImages,
    setTexts,
    setFrames,
    setLines,
    setArrows,
    setPolygons,
    setFigures,
    setCodes,
    setPaths,
    pushHistory,
    setSelectedShape,
  ]);

  /**
   * cutSelected - Combines copy and delete operations.
   */
  const cutSelected = useCallback(() => {
    copySelected();
    deleteSelected();
  }, [copySelected, deleteSelected]);

  /**
   * selectAll - Selects every shape currently present on the canvas.
   */
  const selectAll = useCallback(() => {
    const all: SelectedShape = [];
    const collect = (items: any[], kind: string) => {
      items.forEach((item, idx) => {
        all.push({ kind: kind as any, index: idx, id: item.id });
      });
    };

    collect(rectangles, "rect");
    collect(circles, "circle");
    collect(images, "image");
    collect(texts, "text");
    collect(frames, "frame");
    collect(polygons, "poly");
    collect(paths, "path");
    collect(lines, "line");
    collect(arrows, "arrow");
    collect(figures, "figure");
    collect(codes, "code");

    setSelectedShape(all);
  }, [
    rectangles,
    circles,
    images,
    texts,
    frames,
    polygons,
    paths,
    lines,
    arrows,
    figures,
    codes,
    setSelectedShape,
  ]);

  /**
   * bringToFront - Moves selected shapes to the top of their respective collection.
   */
  const bringToFront = useCallback(() => {
    if (selectedShape.length === 0) return;
    const updates: any = {};
    const kindMap: Record<string, number[]> = {};
    selectedShape.forEach((s) => {
      if (!kindMap[s.kind]) kindMap[s.kind] = [];
      kindMap[s.kind].push(s.index);
    });

    Object.entries(kindMap).forEach(([kind, indices]) => {
      indices.sort((a, b) => a - b);
      let items: any[] = [];
      let setter: any = null;
      const kindKey = kind + "s" === "polys" ? "polygons" : kind + "s";

      if (kind === "rect") { items = [...rectangles]; setter = setRectangles; }
      else if (kind === "circle") { items = [...circles]; setter = setCircles; }
      else if (kind === "image") { items = [...images]; setter = setImages; }
      else if (kind === "text") { items = [...texts]; setter = setTexts; }
      else if (kind === "frame") { items = [...frames]; setter = setFrames; }
      else if (kind === "line") { items = [...lines]; setter = setLines; }
      else if (kind === "arrow") { items = [...arrows]; setter = setArrows; }
      else if (kind === "poly") { items = [...polygons]; setter = setPolygons; }
      else if (kind === "figure") { items = [...figures]; setter = setFigures; }
      else if (kind === "code") { items = [...codes]; setter = setCodes; }
      else if (kind === "path") { items = [...paths]; setter = setPaths; }

      if (items.length && setter) {
        const selected = indices.map((i) => items[i]);
        const remaining = items.filter((_, i) => !indices.includes(i));
        const next = [...remaining, ...selected];
        updates[kindKey] = next;
        setter(next);
      }
    });
    pushHistory(updates);
  }, [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, figures, codes, paths, pushHistory, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, setFigures, setCodes, setPaths]);

  /**
   * sendToBack - Moves selected shapes to the bottom of their respective collection.
   */
  const sendToBack = useCallback(() => {
    if (selectedShape.length === 0) return;
    const updates: any = {};
    const kindMap: Record<string, number[]> = {};
    selectedShape.forEach((s) => {
      if (!kindMap[s.kind]) kindMap[s.kind] = [];
      kindMap[s.kind].push(s.index);
    });

    Object.entries(kindMap).forEach(([kind, indices]) => {
      indices.sort((a, b) => a - b);
      let items: any[] = [];
      let setter: any = null;
      const kindKey = kind + "s" === "polys" ? "polygons" : kind + "s";

      if (kind === "rect") { items = [...rectangles]; setter = setRectangles; }
      else if (kind === "circle") { items = [...circles]; setter = setCircles; }
      else if (kind === "image") { items = [...images]; setter = setImages; }
      else if (kind === "text") { items = [...texts]; setter = setTexts; }
      else if (kind === "frame") { items = [...frames]; setter = setFrames; }
      else if (kind === "line") { items = [...lines]; setter = setLines; }
      else if (kind === "arrow") { items = [...arrows]; setter = setArrows; }
      else if (kind === "poly") { items = [...polygons]; setter = setPolygons; }
      else if (kind === "figure") { items = [...figures]; setter = setFigures; }
      else if (kind === "code") { items = [...codes]; setter = setCodes; }
      else if (kind === "path") { items = [...paths]; setter = setPaths; }

      if (items.length && setter) {
        const selected = indices.map((i) => items[i]);
        const remaining = items.filter((_, i) => !indices.includes(i));
        const next = [...selected, ...remaining];
        updates[kindKey] = next;
        setter(next);
      }
    });
    pushHistory(updates);
  }, [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, figures, codes, paths, pushHistory, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, setFigures, setCodes, setPaths]);

  /**
   * bringForward - Move selected shapes one level up within their collection.
   */
  const bringForward = useCallback(() => {
    if (selectedShape.length === 0) return;
    const updates: any = {};
    const kindMap: Record<string, number[]> = {};
    selectedShape.forEach((s) => {
      if (!kindMap[s.kind]) kindMap[s.kind] = [];
      kindMap[s.kind].push(s.index);
    });

    Object.entries(kindMap).forEach(([kind, indices]) => {
      indices.sort((a, b) => b - a); // Higher indices first for upward move
      let items: any[] = [];
      let setter: any = null;
      const kindKey = kind + "s" === "polys" ? "polygons" : kind + "s";

      if (kind === "rect") { items = [...rectangles]; setter = setRectangles; }
      else if (kind === "circle") { items = [...circles]; setter = setCircles; }
      else if (kind === "image") { items = [...images]; setter = setImages; }
      else if (kind === "text") { items = [...texts]; setter = setTexts; }
      else if (kind === "frame") { items = [...frames]; setter = setFrames; }
      else if (kind === "line") { items = [...lines]; setter = setLines; }
      else if (kind === "arrow") { items = [...arrows]; setter = setArrows; }
      else if (kind === "poly") { items = [...polygons]; setter = setPolygons; }
      else if (kind === "figure") { items = [...figures]; setter = setFigures; }
      else if (kind === "code") { items = [...codes]; setter = setCodes; }
      else if (kind === "path") { items = [...paths]; setter = setPaths; }

      if (items.length && setter) {
        const next = [...items];
        indices.forEach((idx) => {
          if (idx < next.length - 1 && !indices.includes(idx + 1)) {
            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
          }
        });
        updates[kindKey] = next;
        setter(next);
      }
    });
    pushHistory(updates);
  }, [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, figures, codes, paths, pushHistory, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, setFigures, setCodes, setPaths]);

  /**
   * sendBackward - Move selected shapes one level down within their collection.
   */
  const sendBackward = useCallback(() => {
    if (selectedShape.length === 0) return;
    const updates: any = {};
    const kindMap: Record<string, number[]> = {};
    selectedShape.forEach((s) => {
      if (!kindMap[s.kind]) kindMap[s.kind] = [];
      kindMap[s.kind].push(s.index);
    });

    Object.entries(kindMap).forEach(([kind, indices]) => {
      indices.sort((a, b) => a - b); // Lower indices first for downward move
      let items: any[] = [];
      let setter: any = null;
      const kindKey = kind + "s" === "polys" ? "polygons" : kind + "s";

      if (kind === "rect") { items = [...rectangles]; setter = setRectangles; }
      else if (kind === "circle") { items = [...circles]; setter = setCircles; }
      else if (kind === "image") { items = [...images]; setter = setImages; }
      else if (kind === "text") { items = [...texts]; setter = setTexts; }
      else if (kind === "frame") { items = [...frames]; setter = setFrames; }
      else if (kind === "line") { items = [...lines]; setter = setLines; }
      else if (kind === "arrow") { items = [...arrows]; setter = setArrows; }
      else if (kind === "poly") { items = [...polygons]; setter = setPolygons; }
      else if (kind === "figure") { items = [...figures]; setter = setFigures; }
      else if (kind === "code") { items = [...codes]; setter = setCodes; }
      else if (kind === "path") { items = [...paths]; setter = setPaths; }

      if (items.length && setter) {
        const next = [...items];
        indices.forEach((idx) => {
          if (idx > 0 && !indices.includes(idx - 1)) {
            [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
          }
        });
        updates[kindKey] = next;
        setter(next);
      }
    });
    pushHistory(updates);
  }, [selectedShape, rectangles, circles, images, texts, frames, lines, arrows, polygons, figures, codes, paths, pushHistory, setRectangles, setCircles, setImages, setTexts, setFrames, setLines, setArrows, setPolygons, setFigures, setCodes, setPaths]);

  return {
    deleteSelected,
    duplicateSelection,
    groupSelected,
    ungroupSelected,
    copySelected,
    pasteSelected,
    cutSelected,
    selectAll,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  };
};
export default useCanvasCommands;
