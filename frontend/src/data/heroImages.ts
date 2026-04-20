// Hero images mapping for pages
// Generated images stored in /images/heroes/

export const heroImages: Record<string, string> = {
  about: '/images/heroes/about.webp',
  termliny: '/images/heroes/termliny.webp',
  'steam-rooms': '/images/heroes/steam-rooms.webp',
  pools: '/images/heroes/pools.webp',
  jacuzzi: '/images/heroes/jacuzzi.webp',
  'plunge-pools': '/images/heroes/plunge-pools.webp',
  faq: '/images/heroes/faq.webp',
  pricing: '/images/heroes/pricing.webp',
  services: '/images/heroes/services.webp',
  'swimming-school': '/images/heroes/swimming-school.webp',
  'steam-school': '/images/heroes/steam-school.webp',
  cafe: '/images/heroes/cafe.webp',
  schedule: '/images/heroes/schedule.webp',
  promotions: '/images/heroes/promotions.webp',
  news: '/images/heroes/news.webp',
  contacts: '/images/heroes/contacts.webp',
  gallery: '/images/heroes/gallery.webp',
  family: '/images/heroes/family.webp',
  corporate: '/images/heroes/corporate.webp',
  careers: '/images/heroes/careers.webp',
  map: '/images/heroes/about.webp', // use about as fallback
  rules: '/images/heroes/faq.webp', // use faq as fallback
  offer: '/images/heroes/pricing.webp', // use pricing as fallback
  privacy: '/images/heroes/faq.webp', // use faq as fallback
  partners: '/images/heroes/corporate.webp', // use corporate as fallback
};

export function getHeroImage(pageId: string): string {
  return heroImages[pageId] || '/images/heroes/about.webp';
}
