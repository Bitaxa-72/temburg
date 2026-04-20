/**
 * React hooks for WordPress API integration
 * Provides data fetching with loading/error states and caching
 */

import { useState, useEffect, useCallback } from 'react';
import * as wpApi from '../services/wordpress-api';

// ============== Generic Hook ==============

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useQuery<T>(
  fetchFn: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, ...deps]);

  useEffect(() => {
    let cancelled = false;
    const originalSetData = setData;
    const originalSetError = setError;
    const originalSetLoading = setLoading;

    (async () => {
      originalSetLoading(true);
      originalSetError(null);
      try {
        const result = await fetchFn();
        if (!cancelled) originalSetData(result);
      } catch (err) {
        if (!cancelled) originalSetError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        if (!cancelled) originalSetLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ============== Specific Hooks ==============

/**
 * Hook for fetching services
 */
export function useServices() {
  return useQuery(() => wpApi.getServices());
}

/**
 * Hook for fetching services as flat array
 */
export function useServicesFlat() {
  return useQuery(() => wpApi.getServicesFlat());
}

/**
 * Hook for fetching schedule events
 */
export function useSchedule(day?: string) {
  return useQuery(() => wpApi.getSchedule(day), [day]);
}

/**
 * Hook for fetching promotions
 */
export function usePromotions(showAll = false) {
  return useQuery(() => wpApi.getPromotions(showAll), [showAll]);
}

/**
 * Hook for fetching pricing
 */
export function usePricing() {
  return useQuery(() => wpApi.getPricing());
}

/**
 * Hook for fetching thermal zones
 */
export function useZones() {
  return useQuery(() => wpApi.getZones());
}

/**
 * Hook for fetching zones as flat array
 */
export function useZonesFlat() {
  return useQuery(() => wpApi.getZonesFlat());
}

/**
 * Hook for fetching reviews
 */
export function useReviews(limit?: number, platform?: string) {
  return useQuery(() => wpApi.getReviews(limit, platform), [limit, platform]);
}

/**
 * Hook for fetching team members
 */
export function useTeam() {
  return useQuery(() => wpApi.getTeam());
}

/**
 * Hook for fetching cafe menu
 */
export function useCafeMenu() {
  return useQuery(() => wpApi.getCafeMenu());
}

/**
 * Hook for fetching cafe menu as flat array
 */
export function useCafeMenuFlat() {
  return useQuery(() => wpApi.getCafeMenuFlat());
}

/**
 * Hook for fetching site settings
 */
export function useSiteSettings() {
  return useQuery(() => wpApi.getSiteSettings());
}

/**
 * Hook for fetching WordPress posts (news)
 */
export function usePosts(perPage = 10, page = 1) {
  return useQuery(() => wpApi.getPosts(perPage, page), [perPage, page]);
}

/**
 * Hook for fetching single post by slug
 */
export function usePost(slug: string) {
  return useQuery(() => wpApi.getPostBySlug(slug), [slug]);
}

/**
 * Hook for fetching page by slug
 */
export function usePage(slug: string) {
  return useQuery(() => wpApi.getPage(slug), [slug]);
}

// ============== Mutation Hooks ==============

interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T>;
  loading: boolean;
  error: Error | null;
  data: T | null;
}

function useMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>
): UseMutationResult<T, V> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (variables: V) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error, data };
}

/**
 * Hook for submitting contact form
 */
export function useContactForm() {
  return useMutation(wpApi.submitContactForm);
}

/**
 * Hook for submitting booking form
 */
export function useBookingForm() {
  return useMutation(wpApi.submitBookingForm);
}

// ============== Combined Data Hook ==============

/**
 * Hook for fetching all homepage data in one call
 */
export function useHomepageData() {
  const [data, setData] = useState<{
    services: Awaited<ReturnType<typeof wpApi.getServices>> | null;
    promotions: Awaited<ReturnType<typeof wpApi.getPromotions>> | null;
    zones: Awaited<ReturnType<typeof wpApi.getZones>> | null;
    reviews: Awaited<ReturnType<typeof wpApi.getReviews>> | null;
    settings: Awaited<ReturnType<typeof wpApi.getSiteSettings>> | null;
  }>({
    services: null,
    promotions: null,
    zones: null,
    reviews: null,
    settings: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        const [services, promotions, zones, reviews, settings] = await Promise.all([
          wpApi.getServices(),
          wpApi.getPromotions(),
          wpApi.getZones(),
          wpApi.getReviews(6),
          wpApi.getSiteSettings(),
        ]);
        if (mounted) setData({ services, promotions, zones, reviews, settings });
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}

// ============== Data Source Context ==============

/**
 * Check if should use WordPress API or static data
 * Can be used to gradually migrate components
 */
export function useDataSource(): 'wordpress' | 'static' {
  const [source, setSource] = useState<'wordpress' | 'static'>('static');

  useEffect(() => {
    let mounted = true;
    wpApi.checkAPIHealth().then((available) => {
      if (mounted) setSource(available ? 'wordpress' : 'static');
    });
    return () => { mounted = false; };
  }, []);

  return source;
}
