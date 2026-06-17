import type { WPService, WPServicesResponse } from '@/api/wordpress';
import type { ServiceItem } from '@/data/services';

type WPServiceCategoryLike = WPServicesResponse[string] | WPService[] | undefined;

function normalizeIdPart(value: string | number | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zа-яё0-9_-]+/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getCategoryItems(category: WPServiceCategoryLike): WPService[] {
  if (Array.isArray(category)) {
    return category;
  }

  return Array.isArray(category?.items) ? category.items : [];
}

export function wpToServiceItem(wp: WPService, category = 'service', index = 0): ServiceItem {
  const baseId = wp.id ? String(wp.id) : (wp.slug || String(index + 1));
  const durationId = normalizeIdPart(wp.duration);
  const priceId = normalizeIdPart(wp.price);

  return {
    id: [category, baseId, durationId, priceId, index + 1].filter(Boolean).join('-'),
    name: wp.name,
    duration: wp.duration || '',
    price: wp.price || 0,
    priceNote: wp.priceNote || undefined,
    description: wp.description || '',
    fullDescription: wp.fullDescription || undefined,
    includes: wp.includes?.length ? wp.includes : undefined,
  };
}

export function wpServiceItems(
  services: WPServicesResponse | null | undefined,
  category: string,
  fallback: ServiceItem[],
): ServiceItem[] {
  const items = getCategoryItems(services?.[category]);
  return items?.length ? items.map((item, index) => wpToServiceItem(item, category, index)) : fallback;
}

export function wpServiceImages(services: WPServicesResponse | null | undefined): Record<string, string> {
  const images: Record<string, string> = {};

  Object.values(services || {}).forEach((category) => {
    getCategoryItems(category).forEach((service) => {
      if (service.image) {
        images[service.slug || String(service.id)] = service.image;
      }
    });
  });

  return images;
}
