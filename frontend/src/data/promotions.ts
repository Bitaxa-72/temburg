export interface Promotion {
  id: number;
  title: string;
  description: string;
  conditions: string;
  discount?: number;
  validUntil?: string;
  badge: string;
  banner: string;
}

export const promotions: Promotion[] = [
  {
    id: 1,
    title: 'Стаканчик кофе в подарок',
    description: 'При покупке любой СПА-услуги дарим стаканчик ароматного кофе. Пн–Пт с 10:00 до 13:00.',
    conditions: 'При покупке SPA-услуги',
    badge: 'SPA',
    banner: '/wp-content/uploads/2025/08/termburg_banner_kofe_560h400.jpg',
  },
  {
    id: 2,
    title: 'Скидка студентам',
    description: 'Скидка на билеты для студентов очной формы обучения после 16:00 в будние дни.',
    conditions: 'При предъявлении студенческого билета. ПН-ПТ после 16:00',
    badge: 'Студентам',
    banner: '/wp-content/uploads/2025/04/termburg_banner_studenty_skidka_560h400.jpg',
  },
  {
    id: 3,
    title: 'Подарок имениннику',
    description: 'Бесплатный вход для именинника по тарифу «Безлимит» в течение 3-х дней до или после даты рождения. 10% скидка гостям именинника (от 3 чел.), 20% скидка (от 8 чел.).',
    conditions: 'При предъявлении паспорта',
    badge: 'Именинникам',
    banner: '/wp-content/uploads/2025/01/termburg_banner_den_rozhdeniya_560h400.jpg',
  },
  {
    id: 4,
    title: 'Скидка для серебряного возраста',
    description: 'Скидка 50% при покупке безлимита по вторникам.',
    conditions: 'При предъявлении пенсионного удостоверения. Только вторник',
    badge: 'Серебряный возраст',
    banner: '/wp-content/uploads/2024/09/560h400_2.jpg',
  },
  {
    id: 5,
    title: 'Йога в Термбург',
    description: 'Вторник 10:00 — Йога для всего тела. Четверг 12:00 — Йога для всего тела. Пятница 12:00 — Массаж для лица, суставная гимнастика, разгон лимфы.',
    conditions: 'Включено в стоимость посещения',
    badge: 'Бесплатно',
    banner: '/wp-content/uploads/2025/05/joga_560h400.jpg',
  },
  {
    id: 8,
    title: 'Школа плавания для детей',
    description: 'Дети 6–12 лет. Пятница 16:00 и Воскресенье 10:00. Группы по 4–6 человек. Абонемент 4 занятия — 4 000₽, 8 занятий — 8 000₽.',
    conditions: 'Запись по телефону',
    badge: 'Детям',
    banner: '/wp-content/uploads/2025/08/termburg_banner_plavanie_560h400-1.jpg',
  },
];
