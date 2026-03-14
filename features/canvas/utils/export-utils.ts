import { ShapeCollection } from "../types";
import {
  drawRect,
  drawImageItem,
  drawText,
  drawConnector,
  drawFigure,
} from "./drawing";
import { getAnchorPoint } from "./geometry";

/**
 * Downloads a file to the user's computer.
 */
const downloadFile = (
  filename: string,
  content: string | Blob,
  contentType: string
) => {
  const blob =
    content instanceof Blob
      ? content
      : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Exports the DSL code as a text file.
 */
export const exportCode = (code: string, filename: string) => {
  downloadFile(`${filename}.txt`, code, "text/plain");
};

/**
 * Exports a ShapeCollection (parsed DSL) to a PNG image.
 */
export const exportToPNG = async (
  shapes: ShapeCollection & { width?: number; height?: number },
  filename: string,
  theme: "light" | "dark" = "dark"
) => {
  const padding = 50;
  const width = (shapes.width || 800) + padding * 2;
  const height = (shapes.height || 600) + padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Set background
  ctx.fillStyle = theme === "dark" ? "#121212" : "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(padding, padding);

  const themeStroke =
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
  const themeText = theme === "dark" ? "#ffffff" : "#000000";

  // Pre-load images
  const imageCache: Record<string, HTMLImageElement> = {};
  const allImages = [...(shapes.images || [])];

  // Wait for all images to load
  await Promise.all(
    allImages.map((im) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = im.src;
        img.onload = () => {
          imageCache[im.src] = img;
          resolve();
        };
        img.onerror = () => resolve();
      });
    })
  );

  // Drawing helper
  const drawAll = () => {
    // 1. Groups (Figures)
    (shapes.figures || []).forEach((f) =>
      drawFigure(ctx, f, themeStroke, themeText, "rgba(255,255,255,0.02)", 1)
    );

    // 2. Rectangles
    (shapes.rectangles || []).forEach((r) => drawRect(ctx, r, themeStroke, 1));

    // 3. Images
    (shapes.images || []).forEach((im) =>
      drawImageItem(ctx, im, imageCache, 1)
    );

    // 4. Texts
    (shapes.texts || []).forEach((t) => drawText(ctx, t, themeStroke, 1));

    // 5. Connectors
    (shapes.connectors || []).forEach((c) => {
      const fromPt = getAnchorPoint(c.from, shapes);
      const toPt = getAnchorPoint(c.to, shapes);
      if (fromPt && toPt) {
        drawConnector(ctx, fromPt, toPt, themeStroke, 1, {
          label: c.label,
          stroke: c.stroke,
          strokeWidth: c.strokeWidth,
          strokeDashArray: c.strokeDashArray,
          fromAnchor: c.from.anchor,
          toAnchor: c.to.anchor,
        });
      }
    });
  };

  drawAll();
  ctx.restore();

  canvas.toBlob((blob) => {
    if (blob) downloadFile(`${filename}.png`, blob, "image/png");
  });
};

/**
 * Exports a ShapeCollection (parsed DSL) to an SVG string.
 */
export const exportToSVG = (
  shapes: ShapeCollection & { width?: number; height?: number },
  filename: string,
  theme: "light" | "dark" = "dark"
) => {
  const padding = 50;
  const width = (shapes.width || 800) + padding * 2;
  const height = (shapes.height || 600) + padding * 2;
  const bgColor = theme === "dark" ? "#121212" : "#ffffff";
  const textColor = theme === "dark" ? "#ffffff" : "#000000";
  const strokeColor =
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="100%" height="100%" fill="${bgColor}" />`;
  svg += `<g transform="translate(${padding}, ${padding})">`;

  // Helper for text alignment
  const getTextAlign = (align?: string) => {
    if (align === "center") return "middle";
    if (align === "right") return "end";
    return "start";
  };

  // 1. Figures (Groups)
  (shapes.figures || []).forEach((f) => {
    svg += `<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" rx="12" fill="rgba(255,255,255,0.02)" stroke="${strokeColor}" stroke-width="1" />`;
    if (f.title) {
      svg += `<text x="${f.x + 12}" y="${f.y + 24}" fill="${textColor}" font-family="sans-serif" font-size="12" font-weight="bold">${f.title}</text>`;
    }
  });

  // 2. Rectangles
  (shapes.rectangles || []).forEach((r) => {
    const dash = r.strokeDashArray
      ? `stroke-dasharray="${r.strokeDashArray.join(",")}"`
      : "";
    svg += `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.fill || "none"}" stroke="${r.stroke || strokeColor}" stroke-width="${r.strokeWidth || 1}" ${dash} />`;
  });

  // 3. Images
  (shapes.images || []).forEach((im) => {
    svg += `<image href="${im.src}" x="${im.x}" y="${im.y}" width="${im.width}" height="${im.height}" />`;
  });

  // 4. Texts
  (shapes.texts || []).forEach((t) => {
    const x =
      t.textAlign === "center"
        ? t.x + t.width / 2
        : t.textAlign === "right"
          ? t.x + t.width
          : t.x;
    svg += `<text x="${x}" y="${t.y + t.fontSize}" fill="${t.fill || textColor}" font-family="sans-serif" font-size="${t.fontSize}" font-weight="${t.fontWeight || "normal"}" text-anchor="${getTextAlign(t.textAlign)}">${t.text}</text>`;
  });

  // 5. Connectors (Simpler representation for SVG)
  (shapes.connectors || []).forEach((c) => {
    const fromPt = getAnchorPoint(c.from, shapes);
    const toPt = getAnchorPoint(c.to, shapes);
    if (fromPt && toPt) {
      const dash = c.strokeDashArray
        ? `stroke-dasharray="${c.strokeDashArray.join(",")}"`
        : "";
      svg += `<line x1="${fromPt.x}" y1="${fromPt.y}" x2="${toPt.x}" y2="${toPt.y}" stroke="${c.stroke || strokeColor}" stroke-width="${c.strokeWidth || 1}" ${dash} />`;
      // Draw a simple arrowhead
      const angle = Math.atan2(toPt.y - fromPt.y, toPt.x - fromPt.x);
      const headSize = 8;
      const x1 = toPt.x - headSize * Math.cos(angle - Math.PI / 6);
      const y1 = toPt.y - headSize * Math.sin(angle - Math.PI / 6);
      const x2 = toPt.x - headSize * Math.cos(angle + Math.PI / 6);
      const y2 = toPt.y - headSize * Math.sin(angle + Math.PI / 6);
      svg += `<polyline points="${x1},${y1} ${toPt.x},${toPt.y} ${x2},${y2}" fill="none" stroke="${c.stroke || strokeColor}" stroke-width="${c.strokeWidth || 1}" />`;

      if (c.label) {
        const mx = (fromPt.x + toPt.x) / 2;
        const my = (fromPt.y + toPt.y) / 2;
        svg += `<text x="${mx}" y="${my - 5}" fill="${textColor}" font-family="sans-serif" font-size="10" text-anchor="middle">${c.label}</text>`;
      }
    }
  });

  svg += `</g></svg>`;
  downloadFile(`${filename}.svg`, svg, "image/svg+xml");
};
