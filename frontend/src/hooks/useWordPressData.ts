/**
 * React hooks for fetching data from WordPress API
 */

import { useState, useEffect, useMemo } from 'react';
import api from '../api/wordpress';
import type {
  WPPricingResponse,
  WPTeamMember,
  WPReview,
  WPFAQResponse,
  WPHeader,
  WPFooter,
  WPHero,
  WPAdvantages,
  WPSettings,
  WPServicesResponse,
  WPZonesDataResponse,
  WPZonesResponse,
  WPGalleryItem,
  WPScheduleEvent,
  WPPromotion,
  WPCafeResponse,
  WPRuleCategory,
  WPTermlin,
  WPTermlinyContent,
  WPSchoolsContent,
  WPContactsContent,
  WPAboutContent,
} from '../api/wordpress';
import { termliny as fallbackTermliny, type Termlin } from '../data/termliny';

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
    giftBoxes: [],
    merchItems: [],
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
    quickCards: [],
    categories: {},
    allItems: [],
  });
}

export function useSchoolsContent() {
  return useAPI<WPSchoolsContent>(api.getSchoolsContent, {
    swimming: {},
    steam: {},
  });
}

export function useContactsContent() {
  return useAPI<WPContactsContent>(api.getContactsContent, {
    howToGet: [],
    partnerDirections: [],
  });
}

export function useAboutContent() {
  return useAPI<WPAboutContent>(api.getAboutContent, {
    visitRules: [],
    galleryPhotos: [],
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
    socialLinks: {
      vk: 'https://vk.com/termburg',
      max: 'https://max.ru/u/f9LHodD0cOI6sfpVks80RBneR0F0vcTuG1GR1uS9Qky2HrPEneRTITCt7Lg',
      telegram: '',
      instagram: '',
      youtube: '',
    },
  });
}

export function useHeader() {
  return useAPI<WPHeader>(api.getHeader, {
    logoUrl: '',
    brandText: 'ТЕРМБУРГ',
    city: {
      primary: 'Москва',
      address: 'ул. Гурьянова, д. 30',
      secondary: 'Зеленогорск',
      secondaryBadge: 'Скоро',
    },
    cities: [
      { name: 'Москва', active: true, status: 'none', showLabel: false, isLink: false },
      { name: 'Зеленогорск', active: false, status: 'badge', label: 'Скоро', showLabel: true, isLink: false },
    ],
    nav: {
      about: 'О комплексе',
      aboutPage: 'О Термбурге',
      termliny: 'Термлины',
      steamRooms: 'Парные',
      pools: 'Бассейны',
      jacuzzi: 'Джакузи',
      faq: 'Частые вопросы',
      services: 'Услуги',
      pricing: 'Прайс-лист',
      servicesPage: 'Парения и SPA',
      swimmingSchool: 'Школа плавания',
      steamSchool: 'Школа парения',
      cafe: 'Кафетерий',
      schedule: 'Расписание',
      promotions: 'Акции',
      news: 'Новости',
      contacts: 'Контакты',
      home: 'Главная',
      careers: 'Вакансии',
    },
    mobileGroups: {
      main: 'Основное',
      services: 'Услуги и цены',
      more: 'Ещё',
    },
    actions: {
      searchLabel: 'Поиск по сайту',
      searchAria: 'Поиск',
      accountLabel: 'Личный кабинет',
      buyLabel: 'Купить',
      openMenuAria: 'Открыть меню',
      closeMenuAria: 'Закрыть меню',
    },
    links: {
      max: 'https://max.ru/u/f9LHodD0cOI6sfpVks80RBneR0F0vcTuG1GR1uS9Qky2HrPEneRTITCt7Lg',
      vk: 'https://vk.com/termburg',
    },
    phone: '+7 (909) 167-47-46',
  });
}

export function useFooter() {
  return useAPI<WPFooter>(api.getFooter, {
    logoUrl: '',
    brandText: 'ТЕРМБУРГ',
    description: 'Термальный комплекс в Москве, район Печатники',
    contactsTitle: 'Контакты',
    phone: '+7 (909) 167-47-46',
    email: 'info@termburg.ru',
    address: 'г. Москва, ул. Гурьянова, д. 30, 2 этаж',
    metro: 'м. Печатники',
    workingHours: 'Ежедневно с 9:00 до 23:00 (кроме 1-го пн месяца — сан. день)',
    linksTitle: 'Мы онлайн',
    externalLinks: [
      { label: 'ВКонтакте', url: 'https://vk.com/termburg' },
      { label: 'Max', url: 'https://max.ru/u/f9LHodD0cOI6sfpVks80RBneR0F0vcTuG1GR1uS9Qky2HrPEneRTITCt7Lg' },
      { label: 'Дзен', url: 'https://dzen.ru/id/652f7beb5939720dfbfa6bc8' },
    ],
    navTitle: 'Навигация',
    nav: {
      about: 'О Термбурге',
      termliny: 'Термлины',
      services: 'Услуги',
      swimmingSchool: 'Школа плавания',
      steamSchool: 'Школа парения',
      schedule: 'Расписание',
      pricing: 'Прайс-лист',
      promotions: 'Акции',
      news: 'Новости',
      cafe: 'Кафетерий',
      contacts: 'Контакты',
    },
    mapTitle: 'На карте',
    bottomLinks: {
      partners: 'Сотрудничество',
      careers: 'Вакансии',
      offer: 'Публичная оферта',
      privacy: 'Политика конфиденциальности',
      rules: 'Правила комплекса',
    },
    copyright: `© 2023–${new Date().getFullYear()} Термбург. Все права защищены.`,
  });
}

export function useHero() {
  return useAPI<WPHero>(api.getHero, {
    titleLine1: 'Тепло пожаловать',
    titleLine2: 'в Термбург',
    eyebrow: 'Термальный комплекс',
    description: 'Пространство энергии, гармонии и заботы о вашем здоровье',
    primaryButtonText: 'Хочу пойти',
    secondaryButtonText: 'Узнать больше',
    bottomText: 'Ежедневно 9:00–23:00 (1-й пн месяца — сан. день) · г. Москва, ул. Гурьянова, д. 30, 2 этаж · м. Печатники',
    ticker: {
      label: 'Инфо',
      text: 'Режим работы: ежедневно 9:00–23:00 (1-й понедельник месяца — санитарный день)    ●    Адрес: Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники    ●    Телефон: +7 (909) 167-47-46    ●    Школа плавания для детей — запись по телефону',
    },
    slides: [],
  });
}

export function useAdvantages() {
  return useAPI<WPAdvantages>(api.getAdvantages, {
    title: 'Почему Термбург',
    subtitle: 'Всё для вашего здоровья и отдыха в одном месте',
    cards: [
      {
        key: 'steam',
        title: 'Более 10 видов парных',
        description: 'Русская, сибирская, травяная, хаммам, шаманская, деревенская, бани-бочки, песчаная, соляная и другие',
      },
      {
        key: 'schedule',
        title: 'Гибкое расписание',
        description: 'Бесплатные и платные коллективные парения, аквааэробика, йога и суставная гимнастика',
      },
      {
        key: 'services',
        title: 'Парения и SPA',
        description: 'Авторские парения от мастеров, SPA-процедуры, массажи и пилинги',
      },
      {
        key: 'health',
        title: 'Забота о здоровье',
        description: 'Загляните к нам в Глинвилл и получите полезные процедуры для всего тела с разнообразными глинами. Бесплатно для всех гостей нашего комплекса!',
      },
      {
        key: 'family',
        title: 'Семейный отдых',
        description: 'Детский бассейн, школа плавания, анимация и мягкие парения для всей семьи',
      },
    ],
  });
}

// Services hook
export function useServices() {
  return useAPI<WPServicesResponse>(api.getServices, {});
}

function splitLines(value: string | string[] | undefined, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  if (typeof value === 'string' && value.trim()) {
    const items = value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    return items.length ? items : fallback;
  }

  return fallback;
}

function filled(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeTermlin(row: WPTermlin, index: number): Termlin {
  const fallback = fallbackTermliny[index] || fallbackTermliny[0];

  return {
    id: fallback?.id || String(row.id),
    name: filled(row.name, fallback?.name || ''),
    title: filled(row.title, fallback?.title || ''),
    image: filled(row.image, filled(row.image_path, fallback?.image || '')),
    nameMeaning: filled(row.nameMeaning, filled(row.name_meaning, fallback?.nameMeaning || '')),
    signs: filled(row.signs, fallback?.signs || ''),
    mission: filled(row.mission, fallback?.mission || ''),
    baths: filled(row.baths, fallback?.baths || ''),
    history: filled(row.history, fallback?.history || ''),
    character: filled(row.character, fallback?.character || ''),
    habits: filled(row.habits, fallback?.habits || ''),
    expressions: splitLines(row.expressions, fallback?.expressions || []),
    omens: filled(row.omens, fallback?.omens || ''),
    element: filled(row.element, fallback?.element || 'fire'),
  };
}

export function useTermliny() {
  const result = useAPI<WPTermlin[]>(api.getTermliny, []);
  const data = useMemo(
    () => (result.data.length ? result.data.map(normalizeTermlin) : fallbackTermliny),
    [result.data],
  );

  return { ...result, data };
}

export function useTermlinyContent() {
  return useAPI<WPTermlinyContent>(api.getTermlinyContent, {
    widgetTitle: 'Познакомьтесь с Термлинами',
    widgetText: 'У каждой бани Термбурга есть свой дух-хранитель — узнайте их истории.',
    widgetButton: 'Узнать больше',
    widgetImage: '',
  });
}

// Zones hook
export function useZones() {
  return useAPI<WPZonesResponse>(api.getZones, {});
}

export function useZonesData() {
  return useAPI<WPZonesDataResponse>(api.getZonesData, {
    title: 'Наши зоны',
    subtitle: 'Парные, бассейны, купели и джакузи для вашего отдыха',
    buyButtonText: 'Купить билет',
    whatToBringText: 'Не забудьте взять с собой →',
    zones: [],
  });
}

export function useGallery() {
  return useAPI<WPGalleryItem[]>(api.getGallery, []);
}

// Schedule hook
export function useSchedule() {
  return useAPI<WPScheduleEvent[]>(api.getSchedule, []);
}

// Promotions hook
export function usePromotions() {
  return useAPI<WPPromotion[]>(api.getPromotions, []);
}

export function useRules() {
  return useAPI<WPRuleCategory[]>(api.getRules, []);
}

// Cafe hook
export function useCafe() {
  return useAPI<WPCafeResponse>(api.getCafe, {});
}
