import { getSignedUrlAction } from "@/actions/files";

/**
 * Traverses the BlockNote document structure and replaces S3 keys with temporary signed URLs.
 * 
 * @param content - The raw document data (array of blocks).
 * @returns {Promise<unknown>} - The document data with signed URLs.
 */
export async function signDocumentUrls(content: unknown): Promise<unknown> {
  if (!Array.isArray(content)) return content;

  // We use Promise.all to handle concurrent signing for performance
  return await Promise.all(
    content.map(async (block: any) => {
      let updatedBlock = { ...block };

      // Handle media blocks (image, video, audio)
      if (
        ["image", "video", "audio"].includes(block.type) &&
        block.props?.url &&
        block.props.url.startsWith("workspaces/uploads/")
      ) {
        const res = await getSignedUrlAction(block.props.url);
        if (res.success) {
          updatedBlock.props = {
            ...block.props,
            url: res.data,
            // Store the original key in a custom metadata field for easy sanitization later
            _s3Key: block.props.url,
          };
        }
      }

      // Recursively handle nested blocks (e.g., in lists or containers)
      if (block.content && Array.isArray(block.content)) {
        updatedBlock.content = await signDocumentUrls(block.content);
      }

      if (block.children && Array.isArray(block.children)) {
        updatedBlock.children = await signDocumentUrls(block.children);
      }

      return updatedBlock;
    })
  );
}

/**
 * Replaces signed URLs back with their original S3 keys before persistence.
 * 
 * @param content - The document data containing signed URLs.
 * @returns {unknown} - The sanitized document data for storage.
 */
export function sanitizeDocumentUrls(content: unknown): unknown {
  if (!Array.isArray(content)) return content;

  return content.map((block: any) => {
    let updatedBlock = { ...block };

    // If we have a stored S3 key, use it to replace the transient signed URL
    if (block.props?._s3Key) {
      const { _s3Key, ...otherProps } = block.props;
      updatedBlock.props = {
        ...otherProps,
        url: _s3Key,
      };
    }

    // Recursively handle nested blocks
    if (block.content && Array.isArray(block.content)) {
      updatedBlock.content = sanitizeDocumentUrls(block.content);
    }

    if (block.children && Array.isArray(block.children)) {
      updatedBlock.children = sanitizeDocumentUrls(block.children);
    }

    return updatedBlock;
  });
}
