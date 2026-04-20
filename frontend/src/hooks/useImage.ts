/**
 * React hooks for WordPress image integration
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getImageUrl,
  getImageUrlSync,
  getImageUrls,
  getResponsiveImage,
  preloadImageMapping,
  normalizeImagePath,
  toLocalUrl,
} from '@/services/imageService';

/**
 * Hook to get image URL with WordPress fallback
 * Returns local URL immediately, then updates to WordPress URL when available
 *
 * @param localPath - Local path like "saunas/russian.jpg" or "/images/saunas/russian.jpg"
 * @param size - Optional size variant
 * @returns Current best URL for the image
 */
export function useImage(
  localPath: string,
  size?: 'thumbnail' | 'medium' | 'large' | 'full' | 'webp'
): string {
  // Start with sync version (cached or local fallback)
  const [url, setUrl] = useState(() => getImageUrlSync(localPath, size));

  useEffect(() => {
    if (!localPath) return;

    let cancelled = false;

    getImageUrl(localPath, size).then((resolvedUrl) => {
      if (!cancelled && resolvedUrl !== url) {
        setUrl(resolvedUrl);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [localPath, size]);

  return url;
}

/**
 * Hook to get multiple image URLs at once
 * Useful for galleries or lists
 *
 * @param paths - Array of local paths
 * @returns Map of original path to resolved URL
 */
export function useImages(paths: string[]): Record<string, string> {
  // Initialize with sync versions
  const [urls, setUrls] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const path of paths) {
      initial[path] = getImageUrlSync(path);
    }
    return initial;
  });

  useEffect(() => {
    if (paths.length === 0) return;

    let cancelled = false;

    getImageUrls(paths).then((resolvedUrls) => {
      if (!cancelled) {
        setUrls(resolvedUrls);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paths.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return urls;
}

/**
 * Hook for responsive images with srcSet support
 *
 * @param localPath - Local path to image
 * @returns Object with src, srcSet, and webp variants
 */
export function useResponsiveImage(localPath: string): {
  src: string;
  srcSet?: string;
  webpSrc?: string;
  webpSrcSet?: string;
  loading: boolean;
} {
  const [data, setData] = useState<{
    src: string;
    srcSet?: string;
    webpSrc?: string;
    webpSrcSet?: string;
  }>(() => ({
    src: getImageUrlSync(localPath),
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localPath) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getResponsiveImage(localPath).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [localPath]);

  return { ...data, loading };
}

/**
 * Hook to preload image mapping on mount
 * Use this in App.tsx or a top-level component
 */
export function useImagePreloader(): {
  ready: boolean;
  preload: () => Promise<void>;
} {
  const [ready, setReady] = useState(false);

  const preload = useCallback(async () => {
    try {
      await preloadImageMapping();
      setReady(true);
    } catch {
      // Still mark as ready, will use fallbacks
      setReady(true);
    }
  }, []);

  useEffect(() => {
    preload();
  }, [preload]);

  return { ready, preload };
}

/**
 * Utility to resolve image path in data objects
 * Useful for transforming data from static files
 *
 * @param imagePath - Path that might be absolute (/images/...) or relative
 * @returns Normalized path ready for useImage
 */
export function resolveImagePath(imagePath: string): string {
  return normalizeImagePath(imagePath);
}

/**
 * Get local fallback URL (useful for SSR or immediate display)
 */
export function getLocalImageUrl(path: string): string {
  return toLocalUrl(path);
}

export default useImage;
