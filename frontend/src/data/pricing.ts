export interface PricingSlot {
  id: string;
  name: string;
  duration: string;
  adultPrice: number;
  childPrice: number;
  fridayWeekendAllDay?: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  period: string;
  adultPrice: number;
  discount: number;
  description?: string;
}

export interface Certificate {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface DiscountPricing {
  id: string;
  name: string;
  duration: string;
  price: number;
}

export interface OverTimeRate {
  type: string;
  ratePerMin: number;
}

export const weekdayPricing: PricingSlot[] = [
  {
    id: 'wd-1h',
    name: '1 час',
    duration: '1 час',
    adultPrice: 540,
    childPrice: 470,
  },
  {
    id: 'wd-2h',
    name: '2 часа',
    duration: '2 часа',
    adultPrice: 1000,
    childPrice: 470,
  },
  {
    id: 'wd-3h',
    name: '3 часа',
    duration: '3 часа',
    adultPrice: 1500,
    childPrice: 470,
  },
  {
    id: 'wd-4h',
    name: '4 часа',
    duration: '4 часа',
    adultPrice: 1990,
    childPrice: 470,
  },
  {
    id: 'wd-unlimited',
    fridayWeekendAllDay: true,
    name: 'Безлимит на день',
    duration: '9:00–23:00',
    adultPrice: 2500,
    childPrice: 470,
  },
];

export const weekendPricing: PricingSlot[] = [
  {
    id: 'we-1h',
    name: '1 час',
    duration: '1 час',
    adultPrice: 760,
    childPrice: 470,
  },
  {
    id: 'we-2h',
    name: '2 часа',
    duration: '2 часа',
    adultPrice: 1450,
    childPrice: 470,
  },
  {
    id: 'we-3h',
    name: '3 часа',
    duration: '3 часа',
    adultPrice: 2150,
    childPrice: 470,
  },
  {
    id: 'we-4h',
    name: '4 часа',
    duration: '4 часа',
    adultPrice: 2850,
    childPrice: 470,
  },
  {
    id: 'we-unlimited',
    fridayWeekendAllDay: true,
    name: 'Безлимит на день',
    duration: '9:00–23:00',
    adultPrice: 3250,
    childPrice: 470,
  },
];

// Льготы для пенсионеров (до 18:00, билет можно купить до 16:00)
export const pensionerPricing: DiscountPricing[] = [
  {
    id: 'pensioner-2h',
    name: '2 часа',
    duration: '2 часа',
    price: 720,
  },
  {
    id: 'pensioner-4h',
    name: '4 часа',
    duration: '4 часа',
    price: 1080,
  },
];

// Детский тариф до 6 лет включительно
export const childUnder6Price = 470; // весь день

// Доплата за превышение времени
export const overtimeRates: OverTimeRate[] = [
  { type: 'weekday', ratePerMin: 10 },
  { type: 'weekend', ratePerMin: 15 },
  { type: 'pensioner', ratePerMin: 9 },
];

export const subscriptions: Subscription[] = [
  {
    id: 'sub-main-1',
    name: 'Основной безлимит',
    period: '1 месяц',
    adultPrice: 13500,
    discount: 0,
    description: 'Безлимитное посещение каждый день',
  },
  {
    id: 'sub-day-1',
    name: 'Дневной безлимит',
    period: '1 месяц (9:00–16:00)',
    adultPrice: 11700,
    discount: 13,
    description: 'Посещение в дневное время с 9:00 до 16:00',
  },
  {
    id: 'sub-parent-1',
    name: 'Хороший родитель',
    period: '1 месяц (1 взр. + 1 реб.)',
    adultPrice: 17600,
    discount: 0,
    description: '1 взрослый + 1 ребёнок до 13 лет',
  },
  {
    id: 'sub-family-1',
    name: 'Семейный',
    period: '1 месяц (2 взр. + 1 реб.)',
    adultPrice: 30375,
    discount: 10,
    description: '2 взрослых + 1 ребёнок',
  },
  {
    id: 'sub-trio-1',
    name: 'На троих',
    period: '1 месяц (3 взрослых)',
    adultPrice: 33750,
    discount: 17,
    description: '3 взрослых с безлимитным посещением',
  },
];

export interface GiftBoxItem {
  name: string;
  description: string;
}

export interface GiftBox {
  id: string;
  name: string;
  subtitle: string;
  contents: string;
  items: GiftBoxItem[];
  price: number;
  image: string;
  badge?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export const certificates: Certificate[] = [
  {
    id: 'cert-1000',
    name: 'Сертификат 1 000 ₽',
    price: 1000,
    description: 'Приятный подарок для знакомства с Термбургом',
  },
  {
    id: 'cert-3000',
    name: 'Сертификат 3 000 ₽',
    price: 3000,
    description: 'Идеально для первого знакомства с Термбургом',
  },
  {
    id: 'cert-5000',
    name: 'Сертификат 5 000 ₽',
    price: 5000,
    description: 'Комплексное посещение с процедурами',
  },
];

export const giftBoxes: GiftBox[] = [
  {
    id: 'box-relax',
    name: 'Бокс «Релакс»',
    subtitle: 'Идеальный подарок для первого знакомства',
    contents: 'Сертификат + халат + набор чая',
    items: [
      { name: 'Махровый халат', description: 'Премиальный хлопок с вышивкой' },
      { name: 'Набор травяных чаёв', description: '5 авторских купажей от шеф-повара' },
      { name: 'Банная шапка', description: 'Войлочная с логотипом Термбурга' },
    ],
    price: 3000,
    image: '/images/box-relax.jpg',
  },
  {
    id: 'box-premium',
    name: 'Бокс «Премиум»',
    subtitle: 'Роскошный подарок для особенного человека',
    contents: 'Сертификат + халат + SPA-набор + шампанское',
    items: [
      { name: 'Сертификат на 5 000 ₽', description: 'На любые услуги комплекса' },
      { name: 'Премиальный халат', description: 'Египетский хлопок, именная вышивка' },
      { name: 'SPA-набор', description: 'Скраб, масло, крем — натуральная косметика' },
      { name: 'Шампанское', description: 'Бутылка игристого в подарочной упаковке' },
      { name: 'Набор травяных чаёв', description: '7 эксклюзивных купажей' },
      { name: 'Ароматические свечи', description: 'Ручная работа с эфирными маслами' },
    ],
    price: 12000,
    image: '/images/box-premium.jpg',
    badge: 'Хит продаж',
  },
];

export const merchItems: MerchItem[] = [
  { id: 'merch-robe', name: 'Халат Термбург', price: 2500, description: 'Махровый халат с вышивкой логотипа' },
  { id: 'merch-towel', name: 'Полотенце Термбург', price: 1200, description: 'Банное полотенце из египетского хлопка' },
  { id: 'merch-slippers', name: 'Тапочки Термбург', price: 800, description: 'Уютные войлочные тапочки' },
  { id: 'merch-cap', name: 'Банная шапка', price: 600, description: 'Войлочная шапка для парной с логотипом' },
];
