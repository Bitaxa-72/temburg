/**
 * WordPress REST API Service
 * Fetches data from WordPress CMS for React frontend
 */

// Base URL for WordPress REST API
const WP_API_BASE = import.meta.env.VITE_WP_API_URL || 'https://termburg.ru/wp-json';
const TERMBURG_API = `${WP_API_BASE}/termburg/v1`;
const WP_REST_API = `${WP_API_BASE}/wp/v2`;

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

/**
 * Generic fetch with caching and error handling
 */
async function fetchWithCache<T>(url: string, options?: RequestInit): Promise<T> {
  const cacheKey = url;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });

  if (cache.size > MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  return data as T;
}

/**
 * Clear API cache
 */
export function clearCache(): void {
  cache.clear();
}

// ============== Types ==============

export interface ServiceItem {
  id: number;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number | null;
  priceNote: string | null;
  duration: string | null;
  includes: string[];
  image: string | null;
}

export interface ServiceCategory {
  name: string;
  items: ServiceItem[];
}

export interface ScheduleEvent {
  id: number | string;
  date?: string;
  name: string;
  description: string;
  time: string;
  duration: string;
  day: string[];
  type: string;
  price: number | null;
  instructor: string | null;
  location: string | null;
  isFree: boolean;
  highlight: boolean;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  conditions: string;
  discount: number | null;
  badge: string;
  banner: string | null;
  validUntil: string | null;
  startDate: string | null;
}

export interface PricingItem {
  id: number;
  name: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  discount: number | null;
  fridayWeekendAllDay?: boolean;
  description: string;
}

export interface PricingData {
  weekday: PricingItem[];
  weekend: PricingItem[];
  subscriptions: PricingItem[];
  certificates: PricingItem[];
}

export interface ThermalZone {
  id: number;
  name: string;
  description: string;
  temperature: string;
  humidity: string;
  features: string[];
  benefits: string;
  image: string | null;
  gallery: Array<{ url: string; alt: string }>;
  tips: string[];
  guardian: string | null;
}

export interface ZoneCategory {
  name: string;
  items: ThermalZone[];
}

export interface Review {
  id: number;
  author: string;
  text: string;
  rating: number;
  date: string;
  platform: string;
  url: string | null;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  experience: string;
  specializations: string[];
  quote: string;
  avatar: string | null;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  priceAlt: number | null;
  badge: string | null;
  cookTime: number | null;
  calories: number | null;
  image: string | null;
}

export interface CafeCategory {
  name: string;
  items: MenuItem[];
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  socialLinks: {
    vk: string;
    max?: string;
    telegram: string;
    instagram: string;
    youtube: string;
  };
  homepage?: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_video: string;
    hero_image: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email?: string;
  service: string;
  date?: string;
  guests?: number;
  message?: string;
}

// ============== API Functions ==============

/**
 * Get all services grouped by category
 */
export async function getServices(): Promise<Record<string, ServiceCategory>> {
  return fetchWithCache<Record<string, ServiceCategory>>(`${TERMBURG_API}/services`);
}

/**
 * Get services as flat array
 */
export async function getServicesFlat(): Promise<ServiceItem[]> {
  const grouped = await getServices();
  return Object.values(grouped).flatMap(cat => cat.items);
}

/**
 * Get schedule events
 */
export async function getSchedule(day?: string): Promise<ScheduleEvent[]> {
  const url = day ? `${TERMBURG_API}/schedule?day=${day}` : `${TERMBURG_API}/schedule`;
  return fetchWithCache<ScheduleEvent[]>(url);
}

/**
 * Get active promotions
 */
export async function getPromotions(showAll = false): Promise<Promotion[]> {
  const url = showAll ? `${TERMBURG_API}/promotions?all=true` : `${TERMBURG_API}/promotions`;
  return fetchWithCache<Promotion[]>(url);
}

/**
 * Get pricing data grouped by category
 */
export async function getPricing(): Promise<PricingData> {
  return fetchWithCache<PricingData>(`${TERMBURG_API}/pricing`);
}

/**
 * Get thermal zones grouped by category
 */
export async function getZones(): Promise<Record<string, ZoneCategory>> {
  return fetchWithCache<Record<string, ZoneCategory>>(`${TERMBURG_API}/zones`);
}

/**
 * Get zones as flat array
 */
export async function getZonesFlat(): Promise<ThermalZone[]> {
  const grouped = await getZones();
  return Object.values(grouped).flatMap(cat => cat.items);
}

/**
 * Get reviews
 */
export async function getReviews(limit?: number, platform?: string): Promise<Review[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', String(limit));
  if (platform) params.append('platform', platform);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchWithCache<Review[]>(`${TERMBURG_API}/reviews${query}`);
}

/**
 * Get team members
 */
export async function getTeam(): Promise<TeamMember[]> {
  return fetchWithCache<TeamMember[]>(`${TERMBURG_API}/team`);
}

/**
 * Get cafe menu grouped by category
 */
export async function getCafeMenu(): Promise<Record<string, CafeCategory>> {
  return fetchWithCache<Record<string, CafeCategory>>(`${TERMBURG_API}/cafe`);
}

/**
 * Get cafe menu as flat array
 */
export async function getCafeMenuFlat(): Promise<MenuItem[]> {
  const grouped = await getCafeMenu();
  return Object.values(grouped).flatMap(cat => cat.items);
}

/**
 * Get site settings
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchWithCache<SiteSettings>(`${TERMBURG_API}/settings`);
}

/**
 * Submit contact form
 */
export async function submitContactForm(data: ContactFormData): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${TERMBURG_API}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit form');
  }

  return response.json();
}

/**
 * Submit booking form
 */
export async function submitBookingForm(data: BookingFormData): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${TERMBURG_API}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit booking');
  }

  return response.json();
}

// ============== WordPress Posts API ==============

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  slug: string;
  featured_image_url?: {
    full: string;
    large: string;
    medium: string;
    thumbnail: string;
  };
  acf?: Record<string, unknown>;
}

/**
 * Get WordPress posts (news/blog)
 */
export async function getPosts(perPage = 10, page = 1): Promise<WPPost[]> {
  return fetchWithCache<WPPost[]>(
    `${WP_REST_API}/posts?per_page=${perPage}&page=${page}&_embed`
  );
}

/**
 * Get single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await fetchWithCache<WPPost[]>(`${WP_REST_API}/posts?slug=${slug}&_embed`);
  return posts[0] || null;
}

/**
 * Get WordPress pages
 */
export async function getPage(slug: string): Promise<WPPost | null> {
  const pages = await fetchWithCache<WPPost[]>(`${WP_REST_API}/pages?slug=${slug}&_embed`);
  return pages[0] || null;
}

// ============== Utilities ==============

/**
 * Check if WordPress API is available
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${WP_API_BASE}`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Format price with Russian currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date in Russian locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
