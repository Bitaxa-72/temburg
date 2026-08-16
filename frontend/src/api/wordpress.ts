/**
 * WordPress API Client for Termburg
 * Fetches data from WordPress REST API
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'https://termburg.ru/wp-json/termburg/v1';

export function getApiUrl(endpoint: string): string {
  return `${API_BASE}${endpoint}`;
}

// Types matching WordPress API responses
export interface WPPricingItem {
  id: number | string;
  name: string;
  duration: string;
  period?: string;
  adultPrice: number;
  childPrice: number;
  discount: number | null;
  fridayWeekendAllDay?: boolean;
  availableUntil?: string;
  noticeLines?: string[];
  purchaseTimeFrom?: string;
  purchaseTimeTo?: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'gold' | 'success' | string;
}

export interface WPDiscountPricingItem {
  id: number | string;
  name: string;
  duration: string;
  price: number;
}

export interface WPSpecialWeekendDate {
  date: string;
  label: string;
}

export interface WPBookingModalContent {
  title?: string;
  typeLabel?: string;
  visitLabel?: string;
  steamingLabel?: string;
  massageLabel?: string;
  spaLabel?: string;
  certificateLabel?: string;
  subscriptionLabel?: string;
  dateLabel?: string;
  tariffLabel?: string;
  guestsLabel?: string;
  adultsLabel?: string;
  childrenLabel?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  submitLabel?: string;
  whatToBringLabel?: string;
  additionalServices?: WPModalServiceCategory[];
}

export interface WPModalServiceCategory {
  id: string;
  title: string;
  items: WPModalServiceItem[];
}

export interface WPModalServiceItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

export interface WPPurchaseModalContent {
  title?: string;
  dateLabel?: string;
  timeLabel?: string;
  adultsLabel?: string;
  childrenLabel?: string;
  childNote?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  authNotice?: string;
  submitPrefix?: string;
  processingLabel?: string;
}

export interface WPPricingContent {
  sectionTitle?: string;
  sectionSubtitle?: string;
  pageTariffsTitle?: string;
  pageTariffsSubtitle?: string;
  weekdayLabel?: string;
  weekendLabel?: string;
  specialWeekendTodayLabel?: string;
  specialWeekendTodayNote?: string;
  fridayNote?: string;
  childTitle?: string;
  childNote?: string;
  pensionerTitle?: string;
  pensionerNote?: string;
  includedTitle?: string;
  includedItems?: string[];
  subscriptionsTitle?: string;
  subscriptionsSubtitle?: string;
  giftBoxesTitle?: string;
  giftBoxesSubtitle?: string;
  merchTitle?: string;
  merchSubtitle?: string;
  bookingModal?: WPBookingModalContent;
  purchaseModal?: WPPurchaseModalContent;
}

export interface WPGiftBoxItem {
  name: string;
  description: string;
}

export interface WPGiftBox {
  id: string;
  name: string;
  subtitle: string;
  contents: string;
  items: WPGiftBoxItem[];
  price: number;
  image: string;
  badge?: string;
}

export interface WPMerchItem {
  id: string;
  name: string;
  price: number;
  description: string;
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
  pricingContent?: WPPricingContent;
  giftBoxes?: WPGiftBox[];
  merchItems?: WPMerchItem[];
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

export interface WPFAQQuickCard {
  icon: 'clock' | 'ticket' | 'users' | 'map' | string;
  title: string;
  text: string;
}

export interface WPFAQResponse {
  title: string;
  description: string;
  quickCards?: WPFAQQuickCard[];
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
    max?: string;
    telegram: string;
    instagram: string;
    youtube: string;
    whatsapp?: string;
  };
}

export interface WPHeaderCity {
  name: string;
  url?: string;
  label?: string;
  status?: 'none' | 'badge' | 'text' | 'link' | string;
  showLabel?: boolean;
  isLink?: boolean;
  active?: boolean;
  openInNewTab?: boolean;
}

export interface WPHeader {
  logoUrl: string;
  brandText: string;
  city: {
    primary: string;
    address: string;
    secondary: string;
    secondaryBadge: string;
  };
  cities?: WPHeaderCity[];
  nav: {
    about: string;
    aboutPage: string;
    termliny: string;
    steamRooms: string;
    pools: string;
    jacuzzi: string;
    faq: string;
    services: string;
    pricing: string;
    servicesPage: string;
    swimmingSchool: string;
    steamSchool: string;
    cafe: string;
    schedule: string;
    promotions: string;
    news: string;
    contacts: string;
    home: string;
    careers: string;
  };
  mobileGroups: {
    main: string;
    services: string;
    more: string;
  };
  actions: {
    searchLabel: string;
    searchAria: string;
    accountLabel: string;
    buyLabel: string;
    openMenuAria: string;
    closeMenuAria: string;
  };
  links: {
    max: string;
    vk: string;
  };
  phone: string;
}

export interface WPFooterExternalLink {
  label: string;
  url: string;
}

export interface WPFooterNav {
  about: string;
  termliny: string;
  services: string;
  swimmingSchool: string;
  steamSchool: string;
  schedule: string;
  pricing: string;
  promotions: string;
  news: string;
  cafe: string;
  contacts: string;
}

export interface WPFooterBottomLinks {
  partners: string;
  careers: string;
  offer: string;
  privacy: string;
  rules: string;
}

export interface WPFooter {
  logoUrl: string;
  brandText: string;
  description: string;
  contactsTitle: string;
  phone: string;
  email: string;
  address: string;
  metro: string;
  workingHours: string;
  linksTitle: string;
  externalLinks: WPFooterExternalLink[];
  navTitle: string;
  nav: WPFooterNav;
  mapTitle: string;
  bottomLinks: WPFooterBottomLinks;
  copyright: string;
}

export interface WPHeroSlide {
  id?: number;
  label?: string;
  title?: string;
  text?: string;
  author?: string;
  image?: string;
}

export interface WPHero {
  titleLine1: string;
  titleLine2: string;
  eyebrow: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  bottomText: string;
  ticker: {
    label: string;
    text: string;
  };
  slides: WPHeroSlide[];
}

export interface WPTermlin {
  id: number | string;
  name?: string;
  title?: string;
  element?: string;
  name_meaning?: string;
  nameMeaning?: string;
  signs?: string;
  mission?: string;
  baths?: string;
  history?: string;
  character?: string;
  habits?: string;
  expressions?: string[] | string;
  omens?: string;
  image?: string;
  image_path?: string;
}

export interface WPTermlinyContent {
  widgetTitle: string;
  widgetText: string;
  widgetButton: string;
  widgetImage: string;
}

export interface WPAdvantageCard {
  key: 'steam' | 'schedule' | 'services' | 'health' | 'family';
  title: string;
  description: string;
}

export interface WPAdvantages {
  title: string;
  subtitle: string;
  cards: WPAdvantageCard[];
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

export interface WPZonesDataItem {
  id: number;
  name: string;
  temp?: string;
  description: string;
  image: string;
  features?: string[];
}

export interface WPZonesDataCategory {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  items: WPZonesDataItem[];
}

export interface WPZonesDataResponse {
  title: string;
  subtitle: string;
  buyButtonText: string;
  whatToBringText: string;
  zones: WPZonesDataCategory[];
}

export interface WPGalleryItem {
  id: number;
  image?: string;
  caption?: string;
  category?: string;
  src?: string;
  url?: string;
  alt?: string;
  title?: string;
}

export interface WPScheduleEvent {
  id: number | string;
  date?: string;
  name?: string;
  title?: string;
  description: string;
  time: string;
  duration: string;
  day?: string[];
  weekdays?: string[];
  type?: 'free' | 'paid' | 'special' | 'closed' | string;
  location?: string;
  isFree?: boolean;
  price: number | null;
  instructor?: string;
  highlight: boolean;
  closed?: boolean;
  sanitaryDay?: boolean;
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

export interface WPCafeCategory {
  id?: string;
  name: string;
  items: WPCafeItem[];
}

export interface WPCafeMenuSlide {
  id: string;
  title: string;
  image: string;
}

export interface WPCafeResponse {
  menuTitle?: string;
  menuSubtitle?: string;
  menuSlides?: WPCafeMenuSlide[];
  categoriesTitle?: string;
  categoriesSubtitle?: string;
  categories?: WPCafeCategory[] | Record<string, WPCafeCategory>;
  [key: string]: unknown;
}

export interface WPRuleCategory {
  id: number | string;
  title: string;
  rules: string[];
}

// API Functions
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(getApiUrl(endpoint));
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

export interface WPCareersStat {
  value: string;
  label: string;
}

export interface WPCareersBenefit {
  icon?: 'graduation' | 'briefcase' | 'users' | 'party' | string;
  title: string;
  text: string;
}

export interface WPCareerVacancy {
  title: string;
  schedule?: string;
  salary?: string;
  employment?: string;
  tasksTitle?: string;
  tasks?: string[];
  perks?: string[];
  buttonLabel?: string;
}

export interface WPCareersContent {
  pageTitle?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  stats?: WPCareersStat[];
  benefits?: WPCareersBenefit[];
  vacanciesTitle?: string;
  vacanciesSubtitle?: string;
  vacancies?: WPCareerVacancy[];
  applyTitle?: string;
  formTitle?: string;
  formText?: string;
  successTitle?: string;
  successText?: string;
  directTitle?: string;
  directText?: string;
  directEmail?: string;
}

export interface WPPageContent {
  slug: string;
  title?: string;
  metaDescription?: string;
  blocks: WPPageContentBlock[];
  careers?: WPCareersContent;
}

export interface WPSchoolProgram {
  id: string;
  name: string;
  duration: string;
  price: number;
  badge?: string;
  description: string;
  fullDescription: string;
  image: string;
  includes: string[];
}

export interface WPSchoolContent {
  heroTitle?: string;
  heroSubtitle?: string;
  introTitle?: string;
  introText?: string;
  introImage?: string;
  advantages?: string[];
  programs?: WPSchoolProgram[];
  ctaTitle?: string;
  ctaText?: string;
  ctaButton?: string;
}

export interface WPSchoolsContent {
  swimming: WPSchoolContent;
  steam: WPSchoolContent;
}

export interface WPContactRouteStep {
  number: number;
  text: string;
  image?: string;
}

export interface WPContactRoute {
  id: string;
  title: string;
  icon: 'metro' | 'car' | 'bus';
  steps: WPContactRouteStep[];
}

export interface WPContactPartnerDirection {
  icon: 'building' | 'megaphone' | 'camera' | 'package' | string;
  title: string;
  description: string;
}

export interface WPContactsContent {
  heroTitle?: string;
  partnersTitle?: string;
  partnersSubtitle?: string;
  howToGet?: WPContactRoute[];
  partnerDirections?: WPContactPartnerDirection[];
}

export interface WPAboutVisitRule {
  id: number;
  title: string;
  description: string;
}

export interface WPAboutGalleryPhoto {
  id: number;
  image: string;
  alt: string;
  caption: string;
}

export interface WPAboutContent {
  visitRules?: WPAboutVisitRule[];
  galleryPhotos?: WPAboutGalleryPhoto[];
}

export interface WPFamilyService {
  id: string;
  icon: 'waves' | 'graduation' | 'thermometer' | 'heart' | 'party' | 'sparkles' | string;
  title: string;
  description: string;
  features: string[];
  image: string;
  link?: string;
  linkText?: string;
  badge?: string;
  price?: string;
  visible?: boolean;
}

export interface WPFamilyContent {
  pageTitle?: string;
  metaDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  intro?: {
    title?: string;
    text?: string;
  };
  services?: {
    title?: string;
    subtitle?: string;
    items?: WPFamilyService[];
  };
  schedule?: {
    title?: string;
    text?: string;
    buttonText?: string;
    link?: string;
  };
  safety?: {
    title?: string;
    subtitle?: string;
    rules?: string[];
    linkText?: string;
    link?: string;
  };
  cta?: {
    title?: string;
    text?: string;
    primaryButton?: string;
    secondaryButton?: string;
    secondaryLink?: string;
    phoneLabel?: string;
    phone?: string;
  };
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

  // Page-specific editable content
  getSchoolsContent: () => fetchAPI<WPSchoolsContent>('/schools-content'),
  getContactsContent: () => fetchAPI<WPContactsContent>('/contacts-content'),
  getAboutContent: () => fetchAPI<WPAboutContent>('/about-content'),
  getFamilyContent: () => fetchAPI<WPFamilyContent>('/family-content'),

  // Settings
  getSettings: () => fetchAPI<WPSettings>('/settings'),

  // Header
  getHeader: () => fetchAPI<WPHeader>('/header'),

  // Footer
  getFooter: () => fetchAPI<WPFooter>('/footer'),

  // Hero
  getHero: () => fetchAPI<WPHero>('/hero'),

  // Home advantages
  getAdvantages: () => fetchAPI<WPAdvantages>('/advantages'),

  // Services
  // На сервере endpoint называется /services-list (см. termburg-admin-api-extra.php).
  // Раньше вызов шёл на /services и стабильно отдавал 404.
  getServices: () => fetchAPI<WPServicesResponse>('/services-list'),

  // Termliny
  getTermliny: () => fetchAPI<WPTermlin[]>('/termliny'),
  getTermlinyContent: () => fetchAPI<WPTermlinyContent>('/termliny-content'),

  // Zones
  getZones: () => fetchAPI<WPZonesResponse>('/zones'),

  // Home zones preview from ACF options page "Парные и зоны"
  getZonesData: () => fetchAPI<WPZonesDataResponse>('/zones-data'),

  // Gallery
  getGallery: () => fetchAPI<WPGalleryItem[]>('/gallery'),

  // Schedule
  getSchedule: () => fetchAPI<WPScheduleEvent[]>('/schedule'),
  getTodaySchedule: () => fetchAPI<WPScheduleEvent[]>('/schedule?view=today'),

  // Promotions
  getPromotions: () => fetchAPI<WPPromotion[]>('/promotions-data'),

  // Rules
  getRules: () => fetchAPI<WPRuleCategory[]>('/rules'),

  // Cafe
  getCafe: () => fetchAPI<WPCafeResponse>('/cafe'),
};

export default api;
