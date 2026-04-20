export interface SearchItem {
  title: string;
  description: string;
  url: string;
  keywords: string[];
}

export const searchData: SearchItem[] = [
  // Main Pages
  {
    title: 'Главная',
    description: 'Главная страница Термбурга',
    url: '/',
    keywords: ['главная', 'home', 'главная страница'],
  },
  {
    title: 'О Термбурге',
    description: 'История и концепция комплекса',
    url: '/about',
    keywords: ['о нас', 'about', 'информация', 'история', 'концепция'],
  },
  {
    title: 'Термлины',
    description: 'Познакомьтесь с нашими маскотами',
    url: '/termliny',
    keywords: ['термлины', 'маскоты', 'персонажи', 'герои'],
  },

  // Services
  {
    title: 'Прайс-лист',
    description: 'Цены на посещение и услуги',
    url: '/pricing',
    keywords: ['цены', 'прайс', 'стоимость', 'тарифы', 'pricing'],
  },
  {
    title: 'Парения и SPA',
    description: 'Виды парений, массажи и SPA-процедуры',
    url: '/services',
    keywords: ['парения', 'spa', 'массаж', 'услуги', 'процедуры', 'веники', 'скрабы'],
  },
  {
    title: 'Школа плавания',
    description: 'Обучение плаванию для детей и взрослых',
    url: '/swimming-school',
    keywords: ['школа плавания', 'плавание', 'бассейн', 'обучение', 'swimming'],
  },
  {
    title: 'Школа парения',
    description: 'Обучение искусству банного парения',
    url: '/steam-school',
    keywords: ['школа парения', 'обучение парению', 'банщик', 'парильщик'],
  },
  {
    title: 'Кафетерий',
    description: 'Меню и напитки в нашем кафе',
    url: '/cafe',
    keywords: ['кафе', 'еда', 'меню', 'напитки', 'кафетерий', 'чай'],
  },

  // Schedule & Promotions
  {
    title: 'Расписание',
    description: 'График работы парных и мероприятий',
    url: '/schedule',
    keywords: ['расписание', 'график', 'время работы', 'парные', 'события'],
  },
  {
    title: 'Акции',
    description: 'Специальные предложения и скидки',
    url: '/promotions',
    keywords: ['акции', 'скидки', 'предложения', 'promotions', 'выгода'],
  },

  // Info Pages
  {
    title: 'Новости',
    description: 'Последние новости и события',
    url: '/news',
    keywords: ['новости', 'события', 'мероприятия', 'news'],
  },
  {
    title: 'Контакты',
    description: 'Как нас найти и связаться с нами',
    url: '/contacts',
    keywords: ['контакты', 'адрес', 'телефон', 'как добраться', 'location', 'map'],
  },
  {
    title: 'Семейное посещение',
    description: 'Термбург для всей семьи',
    url: '/family',
    keywords: ['семья', 'дети', 'семейное посещение', 'family'],
  },
  {
    title: 'Правила посещения',
    description: 'Правила поведения в комплексе',
    url: '/rules',
    keywords: ['правила', 'как посещать', 'регламент', 'что можно', 'rules'],
  },
  {
    title: 'Карта комплекса',
    description: 'Интерактивная карта Термбурга',
    url: '/map',
    keywords: ['карта', 'план', 'схема', 'навигация', 'map'],
  },
  {
    title: 'Галерея',
    description: 'Фотографии комплекса',
    url: '/gallery',
    keywords: ['фото', 'галерея', 'pictures', 'фотографии'],
  },
  {
    title: 'Личный кабинет',
    description: 'Управление бронированиями и профилем',
    url: '/account',
    keywords: ['кабинет', 'профиль', 'аккаунт', 'account', 'бронирования'],
  },

  // Specific Services
  {
    title: 'Русская баня',
    description: 'Традиционная русская парная с вениками',
    url: '/services',
    keywords: ['русская баня', 'парная', 'веники', 'традиционная баня'],
  },
  {
    title: 'Хаммам',
    description: 'Турецкая баня с мыльным массажем',
    url: '/services',
    keywords: ['хаммам', 'турецкая баня', 'мыльный массаж', 'hammam'],
  },
  {
    title: 'Сауна',
    description: 'Сухая сауна',
    url: '/services',
    keywords: ['сауна', 'sauna', 'сухая парная'],
  },
  {
    title: 'Купели',
    description: 'Контрастные процедуры и купели',
    url: '/services',
    keywords: ['купели', 'контраст', 'холодная вода', 'закалка'],
  },
  {
    title: 'Бассейн',
    description: 'Плавательный бассейн',
    url: '/swimming-school',
    keywords: ['бассейн', 'плавание', 'pool', 'swim'],
  },

  // Additional
  {
    title: 'Вакансии',
    description: 'Работа в Термбурге',
    url: '/contacts',
    keywords: ['вакансии', 'работа', 'карьера', 'careers', 'jobs'],
  },
  {
    title: 'Партнеры',
    description: 'Наши партнеры',
    url: '/partners',
    keywords: ['партнеры', 'сотрудничество', 'partners'],
  },
  {
    title: 'Часто задаваемые вопросы',
    description: 'Ответы на популярные вопросы',
    url: '/faq',
    keywords: ['вопросы', 'faq', 'помощь', 'ответы', 'частые вопросы'],
  },
  {
    title: 'Корпоративные мероприятия',
    description: 'Организация корпоративных мероприятий',
    url: '/corporate',
    keywords: ['корпоратив', 'мероприятия', 'corporate', 'компания', 'тимбилдинг'],
  },
];
