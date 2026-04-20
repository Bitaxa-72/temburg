/**
 * Image path constants for WordPress Media Library integration
 *
 * All paths are relative to /images/ folder.
 * These will be resolved by imageService.ts to either:
 * 1. WordPress Media Library URL (if available)
 * 2. Local /images/... fallback
 */

// ============== SAUNAS ==============
export const SAUNA_IMAGES = {
  // Zone category images (generated attributes)
  zonesSteam: 'saunas/attributes/zones-steam-attr.png',
  zonesPools: 'saunas/attributes/zones-pools-attr.png',
  zonesJacuzzi: 'saunas/attributes/zones-jacuzzi-attr.png',
  // Pools (attribute style)
  mainPoolTermlin: 'saunas/attributes/main-pool-attr.png',
  kidsPoolTermlin: 'saunas/attributes/kids-pool-attr.png',
  // Jacuzzi & plunge pools (attribute style)
  outdoorPoolTermlin: 'saunas/attributes/outdoor-pool-attr.png',
  hotTubTermlin: 'saunas/attributes/hot-tub-attr.png',
  smallPoolTermlin: 'saunas/attributes/small-pool-attr.png',
  coldPlungeTermlin: 'saunas/attributes/cold-plunge-attr.png',
  // Individual saunas
  russian: 'saunas/attributes/russian-attr.jpg',
  siberian: 'saunas/attributes/siberian-attr.jpg',
  herbal: 'saunas/attributes/herbal-attr.jpg',
  hammam: 'saunas/attributes/hammam-attr.jpg',
  shaman: 'saunas/attributes/shaman-attr.jpg',
  village: 'saunas/attributes/village-attr.jpg',
  barrel: 'saunas/attributes/barrel-attr.jpg',
  sand: 'saunas/attributes/sand-attr.jpg',
  salt: 'saunas/attributes/salt-attr.jpg',
  private: 'saunas/attributes/private-attr.jpg',
  private2: 'saunas/attributes/private-attr.jpg',
  mainPool: 'saunas/attributes/main-pool-attr.png',
  kidsPool: 'saunas/attributes/kids-pool-attr.png',
  outdoorPool: 'saunas/attributes/outdoor-pool-attr.png',
  hotTub: 'saunas/attributes/hot-tub-attr.png',
  smallPool: 'saunas/attributes/small-pool-attr.png',
  coldPlunge: 'saunas/attributes/cold-plunge-attr.png',
} as const;

// ============== COMPLEX ==============
export const COMPLEX_IMAGES = {
  gallery1: 'complex/gallery1.webp',
  gallery2: 'complex/gallery2.webp',
  gallery4: 'complex/gallery4.webp',
  gallery6: 'complex/gallery6.webp',
  gallery8: 'complex/gallery8.webp',
  pool: 'complex/pool.webp',
  sauna: 'complex/sauna.webp',
  herbal: 'complex/herbal.webp',
} as const;

// ============== SERVICES ==============
export const SPA_IMAGES = {
  peeling: 'services/generated/spa-peeling.jpg',
  kids: 'services/generated/spa-kids.jpg',
  neck: 'services/generated/spa-neck.jpg',
  back: 'services/generated/spa-back-massage.jpg',
  legs: 'services/generated/spa-legs.jpg',
  head: 'services/generated/spa-head.jpg',
  sultan: 'services/generated/spa-sultan.jpg',
  tropical: 'services/generated/spa-tropical.jpg',
  chocolate: 'services/generated/spa-chocolate.jpg',
  sea: 'services/generated/spa-sea.jpg',
  aromaOil1: 'services/generated/spa-aroma-oil-1.jpg',
  aromaOil2: 'services/generated/spa-aroma-oil-2.jpg',
  fish1: 'services/generated/spa-fish-1.jpg',
  fish2: 'services/generated/spa-fish-2.jpg',
} as const;

export const STEAM_IMAGES = {
  spine: 'services/generated/steam-spine.jpg',
  back: 'services/generated/steam-back.jpg',
  russian: 'services/generated/steam-russian.jpg',
  juniper: 'services/generated/steam-juniper.jpg',
  siberian: 'services/generated/steam-siberian.jpg',
  altai: 'services/generated/steam-altai.jpg',
  phoenix: 'services/generated/steam-phoenix.jpg',
  village: 'services/generated/steam-village.jpg',
  author: 'services/generated/steam-author.jpg',
  duo: 'services/generated/steam-duo.jpg',
  massage1: 'services/generated/steam-massage-1.jpg',
  massage2: 'services/generated/steam-massage-2.jpg',
  collective1: 'services/generated/steam-collective-1.jpg',
  collective2: 'services/generated/steam-collective-2.jpg',
} as const;

export const SCHOOL_IMAGES = {
  swimming: '/images/swimming-school.jpg',
  steamAuthor: '/images/services/steam-school-course.webp',
  steamCouple: '/images/services/steam-school-beginner.webp',
  steamKids: '/images/services/steam-school-master.webp',
} as const;

// ============== TERMLINY ==============
export const TERMLIN_IMAGES = {
  yaromir: '/images/termliny/yaromir.webp',
  valkiriya: '/images/termliny/valkiriya.webp',
  pereslav: '/images/termliny/pereslav.webp',
  kazimir: '/images/termliny/kazimir.webp',
  vedagor: '/images/termliny/vedagor.webp',
  milovan: '/images/termliny/milovan.webp',
  lelya: '/images/termliny/lelya.webp',
} as const;

// ============== PROMO & CERTIFICATES ==============
export const PROMO_IMAGES = {
  boxPremium: 'box-premium.jpg',
  boxRelax: 'box-relax.jpg',
} as const;

export const LOGO_IMAGES = {
  termburg: 'termburg-logo.svg',
  termlinyDark: 'termliny-logo-dark.svg',
  termlinyHorizDark: 'termliny-logo-horiz-dark.svg',
  termlinySymbol: 'termliny-symbol.svg',
  termlinyTextDark: 'termliny-text-dark.svg',
} as const;

// ============== HERO ==============
export const HERO_IMAGES = {
  bg: 'hero-bg.webp',
} as const;

/**
 * Helper to convert relative path to absolute /images/ path
 * Use this when you need the full path for static references
 */
export function toAbsolutePath(relativePath: string): string {
  if (relativePath.startsWith('/')) {
    return relativePath;
  }
  return `/images/${relativePath}`;
}

/**
 * Get image ID to path mapping for services
 * Used in ServicesPage.tsx
 */
export function getSpaImageMap(): Record<string, string> {
  return {
    'spa-peeling': toAbsolutePath(SPA_IMAGES.peeling),
    'spa-kids': toAbsolutePath(SPA_IMAGES.kids),
    'spa-neck': toAbsolutePath(SPA_IMAGES.neck),
    'spa-back': toAbsolutePath(SPA_IMAGES.back),
    'spa-legs': toAbsolutePath(SPA_IMAGES.legs),
    'spa-head': toAbsolutePath(SPA_IMAGES.head),
    'spa-sultan': toAbsolutePath(SPA_IMAGES.sultan),
    'spa-tropical': toAbsolutePath(SPA_IMAGES.tropical),
    'spa-chocolate': toAbsolutePath(SPA_IMAGES.chocolate),
    'spa-sea': toAbsolutePath(SPA_IMAGES.sea),
    'spa-aroma-oil-30': toAbsolutePath(SPA_IMAGES.aromaOil1),
    'spa-aroma-oil-60': toAbsolutePath(SPA_IMAGES.aromaOil2),
    'spa-fish-5': toAbsolutePath(SPA_IMAGES.fish1),
    'spa-fish-10': toAbsolutePath(SPA_IMAGES.fish2),
  };
}

export function getSteamImageMap(): Record<string, string> {
  return {
    'steam-spine': toAbsolutePath(STEAM_IMAGES.spine),
    'steam-back': toAbsolutePath(STEAM_IMAGES.back),
    'steam-russian': toAbsolutePath(STEAM_IMAGES.russian),
    'steam-juniper': toAbsolutePath(STEAM_IMAGES.juniper),
    'steam-siberian': toAbsolutePath(STEAM_IMAGES.siberian),
    'steam-altai': toAbsolutePath(STEAM_IMAGES.altai),
    'steam-phoenix': toAbsolutePath(STEAM_IMAGES.phoenix),
    'steam-village': toAbsolutePath(STEAM_IMAGES.village),
    'steam-author': toAbsolutePath(STEAM_IMAGES.author),
    'steam-duo': toAbsolutePath(STEAM_IMAGES.duo),
    'steam-massage-wd': toAbsolutePath(STEAM_IMAGES.massage1),
    'steam-massage-we': toAbsolutePath(STEAM_IMAGES.massage2),
    'steam-aroma': toAbsolutePath(STEAM_IMAGES.collective1),
    'steam-aroma-group': toAbsolutePath(STEAM_IMAGES.collective2),
  };
}
