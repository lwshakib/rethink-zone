"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * UserAvatar Component
 * A wrapper around the standard Avatar that handles the resolution of S3-based image paths
 * to provide secure, temporary signed URLs for private assets.
 * 
 * @param src - Full URL or S3 key (path) of the avatar image.
 * @param alt - Alternative text for the image.
 * @param className - Additional styling for the avatar container.
 * @param fallback - Initial characters for the placeholder.
 */
export function UserAvatar({
  src,
  alt,
  className,
  fallback = "U",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have no source, clear any previous resolved URL and stop.
    if (!src) {
      setResolvedUrl(null);
      return;
    }

    // If the source is already a full URL (legacy Cloudinary, OAuth, etc.), use it immediately.
    if (src.startsWith("http")) {
      setResolvedUrl(src);
      return;
    }

    // Otherwise, we assume it's an S3 key (path) and need a signed download URL.
    const fetchSignedUrl = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/avatar-signed-url");
        if (res.ok) {
          const data = await res.json();
          setResolvedUrl(data.url);
        }
      } catch (error) {
        console.error("Failed to resolve avatar signed URL:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [src]);

  return (
    <Avatar className={cn("relative group transition-all", className)}>
      {resolvedUrl && (
        <AvatarImage
          src={resolvedUrl}
          alt={alt}
          className={cn(
            "object-cover transition-opacity duration-300",
            loading ? "opacity-0" : "opacity-100"
          )}
        />
      )}
      <AvatarFallback className="bg-primary/5 text-primary font-bold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
