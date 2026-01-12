import { makeId } from "./index"; // Import the unique ID generator
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
} from "../types"; // Import shape type definitions for type safety

/**
 * Calculates the bounding box (width and height) of a given text string based on font properties.
 * It handles multi-line text by splitting by newline characters and finding the maximum line width.
 * 
 * @param text - The string content to measure.
 * @param fontSize - Vertical size of the font in pixels.
 * @param fontFamily - Optional font style name.
 * @returns Object containing the calculated width and total height.
 */
export const measureText = (text: string, fontSize: number, fontFamily?: string) => {
  // Create a hidden off-screen canvas element for measurement
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  // Define a standard line height ratio (1.2x font size)
  const lineHeight = fontSize * 1.2;
  
  // Split the input text into an array of individual lines
  const lines = text.split("\n");

  // Fallback estimation if Canvas 2D context is unavailable (e.g., in a non-browser environment or restricted context)
  if (!ctx) {
    // Find the longest string in the array
    const maxLen = Math.max(...lines.map((l) => l.length), 0);
    return {
      // Estimate width at roughly 60% of font size per character
      width: maxLen * fontSize * 0.6,
      // Total height is line height times number of lines
      height: lineHeight * lines.length,
    };
  }

  // Map our internal font labels to standard CSS font-family categories
  const font = fontFamily === "Rough" ? "cursive" : fontFamily === "Mono" ? "monospace" : "sans-serif";
  
  // Apply the font settings to the context before measuring
  ctx.font = `${fontSize}px ${font}`;
  
  // Use the native measureText method to get precise pixel widths for each line
  const widths = lines.map((l) => ctx.measureText(l).width);
  
  // The final width is the widest single line in the group
  const width = widths.length ? Math.max(...widths) : 0;
  
  // Total height accounts for at least one line height even if the text is empty
  return { width, height: lineHeight * Math.max(lines.length, 1) };
};

/**
 * Ensures every individual shape object within its respective collection has a unique 'id' attribute.
 * If a shape lacks an ID, it generates a new one. This is crucial for React keys and selection tracking.
 */

// Helper to sanitize rectangle collections by injecting missing IDs
export const ensureRectId = (items: RectShape[]) =>
  items.map((r) => (r.id ? r : { ...r, id: makeId() }));

// Helper to sanitize circle collections by injecting missing IDs
export const ensureCircleId = (items: CircleShape[]) =>
  items.map((c) => (c.id ? c : { ...c, id: makeId() }));

// Helper to sanitize image collections by injecting missing IDs
export const ensureImageId = (items: ImageShape[]) =>
  items.map((im) => (im.id ? im : { ...im, id: makeId() }));

// Helper to sanitize text collections by injecting missing IDs
export const ensureTextId = (items: TextShape[]) =>
  items.map((t) => (t.id ? t : { ...t, id: makeId() }));

// Helper to sanitize frame collections by injecting missing IDs
export const ensureFrameId = (items: FrameShape[]) =>
  items.map((f) => (f.id ? f : { ...f, id: makeId() }));

// Helper to sanitize line collections by injecting missing IDs
export const ensureLineId = (items: LineShape[]) =>
  items.map((l) => (l.id ? l : { ...l, id: makeId() }));

// Helper to sanitize arrow collections by injecting missing IDs
export const ensureArrowId = (items: ArrowShape[]) =>
  items.map((l) => (l.id ? l : { ...l, id: makeId() }));

// Helper to sanitize pencil path collections by injecting missing IDs
export const ensurePathId = (items: PathShape[]) =>
  items.map((p) => (p.id ? p : { ...p, id: makeId() }));

// Helper to sanitize polygon collections by injecting missing IDs
export const ensurePolyId = (items: PolyShape[]) =>
  items.map((p) => (p.id ? p : { ...p, id: makeId() }));
