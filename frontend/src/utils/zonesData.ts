import type { WPZonesDataCategory } from '@/api/wordpress';
import { zoneCategories as localZoneCategories, type ZoneCategory } from '@/data/zoneCategories';

function filled(value: string | undefined | null, fallback: string): string {
  return value && value.trim() ? value : fallback;
}

function filledImage(value: string | number | boolean | undefined | null, fallback: string): string {
  if (typeof value !== 'string') return fallback;

  const image = value.trim();
  if (!image || image === '0' || image === 'false' || /^\d+$/.test(image)) return fallback;

  const isKnownImagePath = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(image);
  const isResolvableLocalPath = !/^https?:\/\//i.test(image) && !image.startsWith('//');

  if (isKnownImagePath || isResolvableLocalPath) {
    return image;
  }

  return fallback;
}

function normalize(value: string | number | undefined | null): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/g, '');
}

function findFallbackZone(zone: WPZonesDataCategory, index: number): ZoneCategory | undefined {
  const byId = localZoneCategories.find((category) => category.id === String(zone.id));
  if (byId) return byId;

  const zoneName = normalize(zone.name);
  const byName = localZoneCategories.find((category) => normalize(category.name) === zoneName);
  return byName || localZoneCategories[index];
}

function findFallbackItem(
  fallback: ZoneCategory | undefined,
  itemName: string | undefined,
  index: number,
) {
  if (!fallback) return undefined;

  const normalizedName = normalize(itemName);
  const byName = normalizedName
    ? fallback.items.find((item) => normalize(item.name) === normalizedName)
    : undefined;

  return byName || fallback.items[index];
}

function mapZoneFromWp(zone: WPZonesDataCategory, fallback?: ZoneCategory): ZoneCategory {
  return {
    id: fallback?.id || String(zone.id),
    name: filled(zone.name, fallback?.name || ''),
    subtitle: filled(zone.subtitle, fallback?.subtitle || ''),
    description: filled(zone.description, fallback?.description || ''),
    image: filledImage(zone.image, fallback?.image || ''),
    items: zone.items?.length
      ? zone.items.map((item, index) => {
          const fallbackItem = findFallbackItem(fallback, item.name, index);

          return {
            name: filled(item.name, fallbackItem?.name || ''),
            temp: filled(item.temp, fallbackItem?.temp || ''),
            desc: filled(item.description, fallbackItem?.desc || ''),
            image: filledImage(item.image, fallbackItem?.image || ''),
            features: item.features?.length ? item.features : fallbackItem?.features || [],
          };
        })
      : fallback?.items || [],
  };
}

export function mapZonesDataToCategories(zones?: WPZonesDataCategory[]): ZoneCategory[] {
  const wpZones = Array.isArray(zones) ? zones : [];

  if (!wpZones.length) {
    return localZoneCategories;
  }

  return wpZones.map((zone, index) => mapZoneFromWp(zone, findFallbackZone(zone, index)));
}

export function findZoneCategory(categories: ZoneCategory[], id: string): ZoneCategory | undefined {
  return categories.find((category) => category.id === id);
}
