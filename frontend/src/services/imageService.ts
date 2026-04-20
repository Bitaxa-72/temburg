/**
 * Image Service for WordPress Media Library Integration
 * Provides image URL resolution with WordPress fallback to local files
 */

// WordPress API base URL
const WP_API_BASE = import.meta.env.VITE_WP_API_URL || 'https://termburg.ru/wp-json';
const IMAGES_ENDPOINT = `${WP_API_BASE}/termburg/v1/images`;

// Local images base path (fallback)
const LOCAL_IMAGES_BASE = '/images';

// Cache for WordPress image mapping
let imageMapping: Record<string, ImageMappingEntry> | null = null;
let mappingPromise: Promise<Record<string, ImageMappingEntry>> | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface ImageMappingEntry {
  url: string;
  webp?: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  full?: string;
}

export interface ImageMapping {
  [localPath: string]: ImageMappingEntry;
}

/**
 * Normalize local path to consistent format
 * Removes leading /images/ prefix if present
 */
export function normalizeImagePath(path: string): string {
  if (!path) return '';
  // Remove leading slash and /images/ prefix
  let normalized = path.replace(/^\/+/, '');
  if (normalized.startsWith('images/')) {
    normalized = normalized.substring(7);
  }
  return normalized;
}

/**
 * Convert local path to full local URL
 */
export function toLocalUrl(path: string): string {
  const normalized = normalizeImagePath(path);
  if (!normalized) return '';
  return `${LOCAL_IMAGES_BASE}/${normalized}`;
}

/**
 * Fetch image mapping from WordPress
 */
async function fetchImageMapping(): Promise<Record<string, ImageMappingEntry>> {
  try {
    const response = await fetch(IMAGES_ENDPOINT, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image mapping: ${response.status}`);
    }

    const data = await response.json();
    return data as Record<string, ImageMappingEntry>;
  } catch (error) {
    console.warn('[ImageService] Failed to fetch WordPress images, using local fallback:', error);
    return {};
  }
}

/**
 * Get image mapping with caching
 */
async function getImageMapping(): Promise<Record<string, ImageMappingEntry>> {
  const now = Date.now();

  // Return cached mapping if valid
  if (imageMapping && now - lastFetchTime < CACHE_TTL) {
    return imageMapping;
  }

  // Avoid multiple parallel fetches
  if (mappingPromise) {
    return mappingPromise;
  }

  // Fetch new mapping
  mappingPromise = fetchImageMapping().then((mapping) => {
    imageMapping = mapping;
    lastFetchTime = Date.now();
    mappingPromise = null;
    return mapping;
  }).catch((error) => {
    mappingPromise = null;
    throw error;
  });

  return mappingPromise;
}

/**
 * Preload image mapping (call early in app lifecycle)
 */
export async function preloadImageMapping(): Promise<void> {
  await getImageMapping();
}

/**
 * Clear the image mapping cache
 */
export function clearImageCache(): void {
  imageMapping = null;
  lastFetchTime = 0;
  mappingPromise = null;
}

/**
 * Get image URL asynchronously with WordPress fallback
 * @param localPath - Local path like "saunas/russian.jpg" or "/images/saunas/russian.jpg"
 * @param size - Optional size variant: 'thumbnail', 'medium', 'large', 'full', 'webp'
 * @returns Promise resolving to the best available URL
 */
export async function getImageUrl(
  localPath: string,
  size?: 'thumbnail' | 'medium' | 'large' | 'full' | 'webp'
): Promise<string> {
  const normalized = normalizeImagePath(localPath);
  if (!normalized) return '';

  try {
    const mapping = await getImageMapping();
    const entry = mapping[normalized];

    if (entry) {
      // Return requested size or default URL
      if (size && entry[size]) {
        return entry[size] as string;
      }
      return entry.url;
    }
  } catch {
    // Fall through to local fallback
  }

  // Fallback to local
  return toLocalUrl(normalized);
}

/**
 * Get image URL synchronously (uses cached mapping or falls back to local)
 * @param localPath - Local path like "saunas/russian.jpg" or "/images/saunas/russian.jpg"
 * @param size - Optional size variant
 * @returns The best available URL (WordPress if cached, otherwise local)
 */
export function getImageUrlSync(
  localPath: string,
  size?: 'thumbnail' | 'medium' | 'large' | 'full' | 'webp'
): string {
  const normalized = normalizeImagePath(localPath);
  if (!normalized) return '';

  // Try cached mapping
  if (imageMapping) {
    const entry = imageMapping[normalized];
    if (entry) {
      if (size && entry[size]) {
        return entry[size] as string;
      }
      return entry.url;
    }
  }

  // Fallback to local
  return toLocalUrl(normalized);
}

/**
 * Get multiple image URLs at once
 * @param paths - Array of local paths
 * @returns Promise resolving to map of path -> URL
 */
export async function getImageUrls(
  paths: string[]
): Promise<Record<string, string>> {
  const mapping = await getImageMapping();
  const result: Record<string, string> = {};

  for (const path of paths) {
    const normalized = normalizeImagePath(path);
    if (!normalized) continue;

    const entry = mapping[normalized];
    result[path] = entry?.url || toLocalUrl(normalized);
  }

  return result;
}

/**
 * Check if WordPress image mapping is available
 */
export function isWordPressImagesAvailable(): boolean {
  return imageMapping !== null && Object.keys(imageMapping).length > 0;
}

/**
 * Get WebP URL if available, otherwise original
 */
export async function getWebPUrl(localPath: string): Promise<string> {
  return getImageUrl(localPath, 'webp');
}

/**
 * Get responsive image sources for srcset
 * @param localPath - Local path to image
 * @returns Object with src and srcSet for responsive images
 */
export async function getResponsiveImage(localPath: string): Promise<{
  src: string;
  srcSet?: string;
  webpSrc?: string;
  webpSrcSet?: string;
}> {
  const normalized = normalizeImagePath(localPath);
  if (!normalized) return { src: '' };

  try {
    const mapping = await getImageMapping();
    const entry = mapping[normalized];

    if (entry) {
      const result: {
        src: string;
        srcSet?: string;
        webpSrc?: string;
        webpSrcSet?: string;
      } = {
        src: entry.url,
      };

      // Build srcSet from available sizes
      const sizes: string[] = [];
      if (entry.thumbnail) sizes.push(`${entry.thumbnail} 150w`);
      if (entry.medium) sizes.push(`${entry.medium} 300w`);
      if (entry.large) sizes.push(`${entry.large} 1024w`);
      if (entry.full) sizes.push(`${entry.full} 2000w`);

      if (sizes.length > 0) {
        result.srcSet = sizes.join(', ');
      }

      // Add WebP variants if available
      if (entry.webp) {
        result.webpSrc = entry.webp;
      }

      return result;
    }
  } catch {
    // Fall through to local fallback
  }

  return { src: toLocalUrl(normalized) };
}
