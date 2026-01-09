import { makeId } from "./index";
import {
  RectShape,
  CircleShape,
  ImageShape,
  TextShape,
  FrameShape,
  LineShape,
  ArrowShape,
  PathShape,
  PolyShape,
} from "../types";

export const measureText = (text: string, fontSize: number, fontFamily?: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const lineHeight = fontSize * 1.2;
  const lines = text.split("\n");
  if (!ctx) {
    const maxLen = Math.max(...lines.map((l) => l.length), 0);
    return {
      width: maxLen * fontSize * 0.6,
      height: lineHeight * lines.length,
    };
  }
  const font = fontFamily === "Rough" ? "cursive" : fontFamily === "Mono" ? "monospace" : "sans-serif";
  ctx.font = `${fontSize}px ${font}`;
  const widths = lines.map((l) => ctx.measureText(l).width);
  const width = widths.length ? Math.max(...widths) : 0;
  return { width, height: lineHeight * Math.max(lines.length, 1) };
};

export const ensureRectId = (items: RectShape[]) =>
  items.map((r) => (r.id ? r : { ...r, id: makeId() }));

export const ensureCircleId = (items: CircleShape[]) =>
  items.map((c) => (c.id ? c : { ...c, id: makeId() }));

export const ensureImageId = (items: ImageShape[]) =>
  items.map((im) => (im.id ? im : { ...im, id: makeId() }));

export const ensureTextId = (items: TextShape[]) =>
  items.map((t) => (t.id ? t : { ...t, id: makeId() }));

export const ensureFrameId = (items: FrameShape[]) =>
  items.map((f) => (f.id ? f : { ...f, id: makeId() }));

export const ensureLineId = (items: LineShape[]) =>
  items.map((l) => (l.id ? l : { ...l, id: makeId() }));

export const ensureArrowId = (items: ArrowShape[]) =>
  items.map((l) => (l.id ? l : { ...l, id: makeId() }));

export const ensurePathId = (items: PathShape[]) =>
  items.map((p) => (p.id ? p : { ...p, id: makeId() }));

export const ensurePolyId = (items: PolyShape[]) =>
  items.map((p) => (p.id ? p : { ...p, id: makeId() }));
