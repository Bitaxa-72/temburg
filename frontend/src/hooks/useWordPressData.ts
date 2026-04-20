/**
 * React hooks for fetching data from WordPress API
 */

import { useState, useEffect } from 'react';
import api from '../api/wordpress';
import type {
  WPPricingResponse,
  WPTeamMember,
  WPReview,
  WPFAQResponse,
  WPSettings,
  WPServicesResponse,
  WPZonesResponse,
  WPScheduleEvent,
  WPPromotion,
  WPCafeResponse,
} from '../api/wordpress';

// Generic hook for data fetching
function useAPI<T>(
  fetchFn: () => Promise<T>,
  fallback: T
): { data: T; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchFn()
      .then((result) => {
        if (mounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('API Error:', err);
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}

// Универсальный хук для получения текстового контента страницы из ACF
// Использование в странице:
//   const { data: content, loading } = usePageContent('about');
//   if (content?.blocks?.length) { /* рендерить из WP */ } else { /* fallback на хардкод */ }
export function usePageContent(slug: string) {
  return useAPI(
    () => api.getPageContent(slug),
    { slug, blocks: [] },
  );
}

// Pricing hook
export function usePricing() {
  return useAPI<WPPricingResponse>(api.getPricing, {
    weekday: [],
    weekend: [],
    subscriptions: [],
    certificates: [],
  });
}

// Team hook
export function useTeam() {
  return useAPI<WPTeamMember[]>(api.getTeam, []);
}

// Reviews hook
export function useReviews(limit?: number) {
  return useAPI<WPReview[]>(() => api.getReviews(limit), []);
}

// FAQ hook
export function useFAQ() {
  return useAPI<WPFAQResponse>(api.getFAQ, {
    title: '',
    description: '',
    categories: {},
    allItems: [],
  });
}

// Settings hook
export function useSettings() {
  return useAPI<WPSettings>(api.getSettings, {
    siteName: 'Термбург',
    siteDescription: '',
    phone: '+7 (909) 167-47-46',
    email: 'info@termburg.ru',
    address: 'г. Москва, ул. Гурьянова, д. 30, 2 этаж',
    metro: 'м. Печатники',
    workingHours: 'Ежедневно с 9:00 до 23:00 (кроме 1-го пн месяца — сан. день)',
    socialLinks: { vk: 'https://vk.com/termburg', telegram: '', instagram: '', youtube: '' },
  });
}

// Services hook
export function useServices() {
  return useAPI<WPServicesResponse>(api.getServices, {});
}

// Zones hook
export function useZones() {
  return useAPI<WPZonesResponse>(api.getZones, {});
}

// Schedule hook
export function useSchedule() {
  return useAPI<WPScheduleEvent[]>(api.getSchedule, []);
}

// Promotions hook
export function usePromotions() {
  return useAPI<WPPromotion[]>(api.getPromotions, []);
}

// Cafe hook
export function useCafe() {
  return useAPI<WPCafeResponse>(api.getCafe, {});
}
