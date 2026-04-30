import type { WPGalleryItem } from '@/api/wordpress';

export type GalleryCategory = 'pool' | 'sauna' | 'interior' | 'spa' | 'events';

export interface GalleryDisplayItem {
  id: number;
  src: string;
  alt: string;
  category: GalleryCategory;
}

function normalizeCategory(category?: string): GalleryCategory {
  const value = (category || '').trim().toLowerCase();

  if (['pool', 'pools', 'бассейн', 'бассейны'].includes(value)) {
    return 'pool';
  }

  if (['sauna', 'steam', 'steam_rooms', 'steam-rooms', 'парная', 'парные'].includes(value)) {
    return 'sauna';
  }

  if (['spa', 'спа'].includes(value)) {
    return 'spa';
  }

  if (['event', 'events', 'мероприятие', 'мероприятия', 'события'].includes(value)) {
    return 'events';
  }

  return 'interior';
}

function filled(value: string | undefined | null): string {
  return value && value.trim() ? value.trim() : '';
}

export function mapGalleryData(
  items?: WPGalleryItem[] | null,
  fallback: GalleryDisplayItem[] = [],
): GalleryDisplayItem[] {
  const wpItems = Array.isArray(items) ? items : [];
  const mapped = wpItems
    .map((item, index) => {
      const src = filled(item.image) || filled(item.src) || filled(item.url);

      if (!src) {
        return null;
      }

      return {
        id: Number(item.id) || index + 1,
        src,
        alt: filled(item.caption) || filled(item.alt) || filled(item.title) || `Фото ${index + 1}`,
        category: normalizeCategory(item.category),
      };
    })
    .filter((item): item is GalleryDisplayItem => Boolean(item));

  return mapped.length ? mapped : fallback;
}

