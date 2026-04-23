/**
 * WordPress API Client for Termburg
 * Fetches data from WordPress REST API
 */

const API_BASE = import.meta.env.VITE_API_URL || 'https://termburg.ru/wp-json/termburg/v1';

// Types matching WordPress API responses
export interface WPPricingItem {
  id: number;
  name: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  discount: number | null;
  description?: string;
}

export interface WPDiscountPricingItem {
  id: number;
  name: string;
  duration: string;
  price: number;
}

export interface WPSpecialWeekendDate {
  date: string;
  label: string;
}

export interface WPPricingResponse {
  weekday: WPPricingItem[];
  weekend: WPPricingItem[];
  subscriptions: WPPricingItem[];
  certificates: WPPricingItem[];
  childUnder6?: number;
  pensioner?: WPDiscountPricingItem[];
  specialWeekendDates?: string[];
  specialWeekendDateDetails?: WPSpecialWeekendDate[];
  overtime?: { type: string; ratePerMin: number }[];
}

export interface WPTeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  experience: string;
  specializations: string[];
  quote: string;
  avatar: string | false;
}

export interface WPReview {
  id: number;
  author: string;
  text: string;
  rating: number;
  date: string;
  platform: string;
  url: string | null;
}

export interface WPFAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface WPFAQCategory {
  name: string;
  icon: string;
  items: WPFAQItem[];
}

export interface WPFAQResponse {
  title: string;
  description: string;
  categories: Record<string, WPFAQCategory>;
  allItems: WPFAQItem[];
}

export interface WPSettings {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  metro?: string;
  workingHours: string;
  socialLinks: {
    vk: string;
    telegram: string;
    instagram: string;
    youtube: string;
    whatsapp?: string;
  };
}

export interface WPService {
  id: number;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number | null;
  priceNote: string | null;
  duration: string | null;
  includes: string[];
  image: string | false;
}

export interface WPServicesResponse {
  [category: string]: {
    name: string;
    items: WPService[];
  };
}

export interface WPZone {
  id: number;
  name: string;
  description: string;
  temperature: string;
  humidity: string;
  features: string[];
  benefits: string;
  image: string | false;
  tips: string[];
}

export interface WPZonesResponse {
  [category: string]: {
    name: string;
    items: WPZone[];
  };
}

export interface WPScheduleEvent {
  id: number;
  title: string;
  description: string;
  time: string;
  duration: string;
  weekdays: string[];
  location: string;
  isFree: boolean;
  price: number | null;
  instructor: string;
  highlight: boolean;
}

export interface WPPromotion {
  id: number;
  title: string;
  description: string;
  conditions: string;
  discount: number | null;
  badge: string;
  banner: string | false;
  validUntil: string | null;
  startDate: string | null;
}

export interface WPCafeItem {
  name: string;
  description: string;
  price: number;
  priceAlt: number | null;
  badge: string | null;
  cookTime: number | null;
  calories: number | null;
  image: string | false;
}

export interface WPCafeResponse {
  [category: string]: {
    name: string;
    items: WPCafeItem[];
  };
}

// API Functions
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Универсальный текстовый блок страницы из ACF.
 * Используется для контента, который раньше был зашит в .tsx-страницах
 * и теперь редактируется WP-админом через ACF flexible content.
 *
 * Структура на стороне WP (см. wp-page-content.php в проекте):
 *   ACF options page «Текст страниц» с repeater по slug:
 *     - slug: 'about' | 'pricing' | 'rules' | ...
 *     - blocks: repeater из { type, heading, body, image }
 */
export interface WPPageContentBlock {
  type: 'text' | 'heading' | 'image' | 'list' | 'note';
  heading?: string;
  body?: string;
  image?: string;
  items?: string[];
}

export interface WPPageContent {
  slug: string;
  title?: string;
  metaDescription?: string;
  blocks: WPPageContentBlock[];
}

export const api = {
  // Pricing
  getPricing: () => fetchAPI<WPPricingResponse>('/pricing'),

  // Универсальный контент страницы (тексты, картинки) из ACF
  getPageContent: (slug: string) =>
    fetchAPI<WPPageContent>(`/page-content/${encodeURIComponent(slug)}`),

  // Team
  getTeam: () => fetchAPI<WPTeamMember[]>('/team'),

  // Reviews
  getReviews: (limit?: number) =>
    fetchAPI<WPReview[]>(`/reviews${limit ? `?limit=${limit}` : ''}`),

  // FAQ
  getFAQ: () => fetchAPI<WPFAQResponse>('/faq'),

  // Settings
  getSettings: () => fetchAPI<WPSettings>('/settings'),

  // Services
  // На сервере endpoint называется /services-list (см. termburg-admin-api-extra.php).
  // Раньше вызов шёл на /services и стабильно отдавал 404.
  getServices: () => fetchAPI<WPServicesResponse>('/services-list'),

  // Zones
  getZones: () => fetchAPI<WPZonesResponse>('/zones'),

  // Schedule
  getSchedule: () => fetchAPI<WPScheduleEvent[]>('/schedule'),

  // Promotions
  getPromotions: () => fetchAPI<WPPromotion[]>('/promotions'),

  // Cafe
  getCafe: () => fetchAPI<WPCafeResponse>('/cafe'),
};

export default api;
