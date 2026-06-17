/**
 * Hook for fetching data with fallback to static files
 * Allows gradual migration from static data to WordPress CMS
 */

import { useState, useEffect } from 'react';
import * as wpApi from '../services/wordpress-api';

// Static data imports (existing data files)
import { promotions as staticPromotions } from '../data/promotions';
import { scheduleEvents as staticSchedule } from '../data/schedule';
import { weekdayPricing, weekendPricing } from '../data/pricing';
import { bathTypes as staticZones } from '../data/thermalZones';
import { defaultEmployeesOfMonth as staticTeam } from '../data/employees';
import { cafeMenu as staticCafeMenu } from '../data/cafe';

// Transform static data to match API format
function transformStaticPromotions(): wpApi.Promotion[] {
  return staticPromotions.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    conditions: p.conditions,
    discount: p.discount || null,
    badge: p.badge,
    banner: p.banner,
    validUntil: p.validUntil || null,
    startDate: null,
  }));
}

function transformStaticSchedule(): wpApi.ScheduleEvent[] {
  return staticSchedule.map(e => ({
    id: e.id,
    name: e.name,
    description: e.description,
    time: e.time,
    duration: e.duration,
    day: e.day,
    type: e.type,
    price: e.price || null,
    instructor: e.instructor || null,
    location: null,
    isFree: e.type === 'free',
    highlight: e.highlight || false,
  }));
}

function transformStaticZones(): wpApi.ThermalZone[] {
  return staticZones.map(z => ({
    id: z.id,
    name: z.name,
    description: z.description,
    temperature: z.temperature,
    humidity: '',
    features: z.features,
    benefits: '',
    image: z.image,
    gallery: [],
    tips: z.tips,
    guardian: z.guardian || null,
  }));
}

function transformStaticTeam(): wpApi.TeamMember[] {
  return staticTeam.map(t => ({
    id: parseInt(t.id),
    name: t.name,
    role: t.role,
    description: t.description,
    experience: '',
    specializations: [],
    quote: t.quote,
    avatar: t.avatar || null,
  }));
}

interface UseDataWithFallbackResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  source: 'wordpress' | 'static';
}

/**
 * Generic hook that tries WordPress API first, falls back to static data
 */
function useDataWithFallback<T>(
  apiFn: () => Promise<T>,
  staticData: T
): UseDataWithFallbackResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'wordpress' | 'static'>('static');

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const result = await apiFn();
        if (mounted) {
          setData(result);
          setSource('wordpress');
        }
      } catch (err) {
        console.warn('WordPress API unavailable, using static data:', err);
        if (mounted) {
          setData(staticData);
          setSource('static');
          setError(err instanceof Error ? err : new Error('API Error'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error, source };
}

// ============== Specific Hooks with Fallback ==============

/**
 * Promotions with fallback
 */
export function usePromotionsWithFallback() {
  return useDataWithFallback(
    () => wpApi.getPromotions(),
    transformStaticPromotions()
  );
}

/**
 * Schedule with fallback
 */
export function useScheduleWithFallback() {
  return useDataWithFallback(
    () => wpApi.getSchedule(),
    transformStaticSchedule()
  );
}

/**
 * Zones with fallback
 */
export function useZonesWithFallback() {
  return useDataWithFallback(
    () => wpApi.getZonesFlat(),
    transformStaticZones()
  );
}

/**
 * Team with fallback
 */
export function useTeamWithFallback() {
  return useDataWithFallback(
    () => wpApi.getTeam(),
    transformStaticTeam()
  );
}

/**
 * Pricing with fallback
 */
export function usePricingWithFallback() {
  const staticPricing: wpApi.PricingData = {
    weekday: weekdayPricing.map(p => ({
      id: 0,
      name: p.name,
      duration: p.duration,
      adultPrice: p.adultPrice,
      childPrice: p.childPrice,
      discount: null,
      fridayWeekendAllDay: p.fridayWeekendAllDay,
      description: '',
    })),
    weekend: weekendPricing.map(p => ({
      id: 0,
      name: p.name,
      duration: p.duration,
      adultPrice: p.adultPrice,
      childPrice: p.childPrice,
      discount: null,
      fridayWeekendAllDay: p.fridayWeekendAllDay,
      description: '',
    })),
    subscriptions: [],
    certificates: [],
  };

  return useDataWithFallback(
    () => wpApi.getPricing(),
    staticPricing
  );
}

/**
 * Cafe menu with fallback
 */
export function useCafeWithFallback() {
  // Transform static cafe menu to API format
  const staticCafe: Record<string, wpApi.CafeCategory> = {};
  staticCafeMenu.forEach(cat => {
    staticCafe[cat.id] = {
      name: cat.name,
      items: cat.items.map(item => ({
        name: item.name,
        description: item.description || '',
        price: item.price,
        priceAlt: item.priceAlt || null,
        badge: item.badge || null,
        cookTime: item.cookTime || null,
        calories: item.calories || null,
        image: item.image || null,
      })),
    };
  });

  return useDataWithFallback(
    () => wpApi.getCafeMenu(),
    staticCafe
  );
}

// Export source indicator for debugging
export function useAPIStatus() {
  const [status, setStatus] = useState<{
    available: boolean;
    checked: boolean;
  }>({ available: false, checked: false });

  useEffect(() => {
    wpApi.checkAPIHealth().then(available => {
      setStatus({ available, checked: true });
    });
  }, []);

  return status;
}
