import { getSignedUrlAction } from "@/actions/files";

/**
 * Traverses the Canvas data structure and replaces S3 keys in 'images' with temporary signed URLs.
 * 
 * @param canvasData - The raw canvas data including the snapshot of all shapes.
 * @returns {Promise<any>} - The canvas data with signed URLs for images.
 */
export async function signCanvasUrls(canvasData: any): Promise<any> {
  if (!canvasData || !canvasData.snapshot) return canvasData;

  const { snapshot } = canvasData;
  if (!snapshot.images || !Array.isArray(snapshot.images)) return canvasData;

  const signedImages = await Promise.all(
    snapshot.images.map(async (im: any) => {
      // If the source is an S3 key, resolve it to a signed viewing URL
      if (im.src && im.src.startsWith("workspaces/uploads/")) {
        const res = await getSignedUrlAction(im.src);
        if (res.success) {
          return {
            ...im,
            src: res.data,
            // Store the original key in a transient field for sanitization
            _s3Key: im.src,
          };
        }
      }
      return im;
    })
  );

  return {
    ...canvasData,
    snapshot: {
      ...snapshot,
      images: signedImages,
    },
  };
}

/**
 * Replaces signed URLs back with their original S3 keys before persistence.
 * 
 * @param canvasData - The canvas data containing signed URLs.
 * @returns {any} - The sanitized canvas data for storage.
 */
export function sanitizeCanvasUrls(canvasData: any): any {
  if (!canvasData || !canvasData.snapshot) return canvasData;

  const { snapshot } = canvasData;
  if (!snapshot.images || !Array.isArray(snapshot.images)) return canvasData;

  const sanitizedImages = snapshot.images.map((im: any) => {
    if (im._s3Key) {
      const { _s3Key, ...otherProps } = im;
      return {
        ...otherProps,
        src: _s3Key,
      };
    }
    return im;
  });

  return {
    ...canvasData,
    snapshot: {
      ...snapshot,
      images: sanitizedImages,
    },
  };
}
