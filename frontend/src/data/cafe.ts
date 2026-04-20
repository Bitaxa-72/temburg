export interface MenuItem {
  name: string;
  price: number;
  priceAlt?: number;
  description?: string;
  image?: string;
  badge?: string;
  cookTime?: number; // минуты
  calories?: number;
}

export interface CafeCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

// 10 избранных блюд для главной витрины кафетерия
export const featuredDishes: MenuItem[] = [
  {
    name: 'Том ям с креветками',
    price: 760,
    badge: 'Острое',
    cookTime: 15,
    calories: 280,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    description: 'Согревающий тайский суп после контрастных процедур — идеальный способ разогнать кровь изнутри. Креветки, кокосовое молоко, лемонграсс и жгучий чили.',
  },
  {
    name: 'Цезарь с цыплёнком',
    price: 690,
    badge: 'Хит',
    cookTime: 10,
    calories: 420,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80',
    description: 'Классика, проверенная временем. Хрустящий романо, сочная куриная грудка и фирменный соус — лёгкий перекус между парениями.',
  },
  {
    name: 'Карбонара',
    price: 690,
    badge: 'Хит',
    cookTime: 20,
    calories: 650,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80',
    description: 'Итальянская нега в тарелке. После расслабляющего хамама побалуйте себя сливочной пастой с хрустящей гуанчиале и пармезаном.',
  },
  {
    name: 'Мясная барбекю',
    price: 970,
    badge: 'Хит',
    cookTime: 25,
    calories: 780,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    description: 'Брутальная пицца для тех, кто серьёзно пропарился. Копчёный соус BBQ и много сыра — награда после жаркой русской бани.',
  },
  {
    name: 'Крылышки барбекю',
    price: 740,
    badge: 'Хит',
    cookTime: 30,
    calories: 520,
    image: 'https://images.unsplash.com/photo-1608039829572-25e8185e7a23?w=400&q=80',
    description: 'Глазированные в медово-чесночном соусе BBQ крылышки. Хрустящая корочка снаружи, сочное мясо внутри.',
  },
  {
    name: 'Борщ с говядиной',
    price: 480,
    cookTime: 12,
    calories: 320,
    image: 'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=400&q=80',
    description: 'Наваристый борщ по бабушкиному рецепту. После прохладного бассейна — самое то, чтобы согреться.',
  },
  {
    name: 'Капучино',
    price: 290,
    cookTime: 5,
    calories: 120,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
    description: 'Бархатная пенка, насыщенный эспрессо и тёплое молоко. Момент дзена в чашке.',
  },
  {
    name: 'Свежевыжатый апельсин',
    price: 460,
    cookTime: 3,
    calories: 90,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
    description: 'Витаминный заряд прямо из-под пресса. Восполняет всё, что вы потеряли с потом в парной.',
  },
  {
    name: 'Креветки темпура',
    price: 790,
    cookTime: 15,
    calories: 380,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
    description: 'Хрустящие креветки в воздушном кляре — деликатес из японской кухни с соусом спайси-майо.',
  },
  {
    name: 'Молочный коктейль',
    price: 440,
    cookTime: 5,
    calories: 340,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80',
    description: 'Густой и сливочный милкшейк: ваниль, шоколад или клубника. Охлаждает после парной.',
  },
];

export const cafeMenu: CafeCategory[] = [
  {
    id: 'breakfast',
    name: 'Завтраки',
    items: [
      { name: 'Яичница', price: 280 },
      { name: 'Омлет', price: 290 },
    ],
  },
  {
    id: 'salads',
    name: 'Салаты',
    items: [
      { name: 'Цезарь с цыплёнком', price: 690, badge: 'Хит' },
      { name: 'Цезарь с креветками', price: 760 },
      { name: 'Коул слоу', price: 310 },
      { name: 'Овощные палочки', price: 260 },
      { name: 'Овощной салат', price: 510, badge: 'Веган' },
      { name: 'С хрустящими баклажанами', price: 640, badge: 'Веган' },
      { name: 'С томатами и авокадо', price: 640, badge: 'Веган' },
    ],
  },
  {
    id: 'poke',
    name: 'Поке',
    items: [
      { name: 'Поке с цыплёнком', price: 570 },
      { name: 'Поке с креветками', price: 680 },
      { name: 'Поке овощной с авокадо', price: 650, badge: 'Веган' },
    ],
  },
  {
    id: 'soups',
    name: 'Супы',
    items: [
      { name: 'Куриная лапша', price: 390 },
      { name: 'Солянка мясная', price: 490 },
      { name: 'Том ям с цыплёнком', price: 560 },
      { name: 'Том ям с креветками', price: 760, badge: 'Острое' },
      { name: 'Борщ с говядиной', price: 480 },
    ],
  },
  {
    id: 'hot',
    name: 'Горячие блюда',
    items: [
      { name: 'Пельмени отварные/жареные домашние', price: 420 },
      { name: 'Говяжья котлета с пюре', price: 710, badge: 'Хит' },
      { name: 'Вареники с картошкой домашние', price: 340 },
      { name: 'Картофель жареный с белыми грибами', price: 480, badge: 'Веган' },
      { name: 'Колбаски рогалик с чесноком', price: 790 },
      { name: 'Колбаска свиная с сыром', price: 790 },
      { name: 'Колбаска свиная с чесноком', price: 790 },
      { name: 'Колбаска куриная с луком', price: 760 },
      { name: 'Колбаска куриная со сливками', price: 760 },
      { name: 'Колбаска баранина с зирой', price: 890 },
    ],
  },
  {
    id: 'pasta',
    name: 'Паста',
    items: [
      { name: 'Карбонара', price: 690, badge: 'Хит' },
      { name: 'Спагетти с цыплёнком в томатно-сливочном соусе', price: 660 },
      { name: 'Паста «Помодоро»', price: 510, badge: 'Веган' },
      { name: 'Паппарделле с белыми грибами', price: 890 },
      { name: 'Пенне арабьята с беконом', price: 690 },
    ],
  },
  {
    id: 'pizza',
    name: 'Пицца',
    items: [
      { name: '4 сыра', price: 940 },
      { name: 'Мясная барбекю', price: 970, badge: 'Хит' },
      { name: 'Ветчина-грибы', price: 880 },
      { name: 'Цезарь', price: 910 },
      { name: 'Маргарита', price: 790 },
      { name: 'Пеперони', price: 860 },
      { name: 'Цыплёнок грибы', price: 860 },
      { name: 'Фокачча с пармезаном', price: 360 },
      { name: 'Фокачча с розмарином', price: 280 },
    ],
  },
  {
    id: 'pizzaAdd',
    name: 'Добавки к пицце',
    items: [
      { name: 'Филе куриное', price: 130 },
      { name: 'Ветчина', price: 130 },
      { name: 'Черри', price: 110 },
      { name: 'Халапеньо', price: 120 },
      { name: 'Моцарелла', price: 120 },
      { name: 'Пармезан', price: 130 },
      { name: 'Пеперони', price: 130 },
      { name: 'Шампиньоны', price: 110 },
      { name: 'Чиабатта', price: 130 },
      { name: 'Бекон жареный', price: 130 },
    ],
  },
  {
    id: 'burgers',
    name: 'Бургеры',
    items: [
      { name: 'GB8 гамбургер', price: 830 },
      { name: 'Инста', price: 870 },
      { name: 'Бургер с цыплёнком', price: 710 },
    ],
  },
  {
    id: 'snacks',
    name: 'Закуски',
    items: [
      { name: 'Креветки темпура', price: 790 },
      { name: 'Жареный сулугуни', price: 510 },
      { name: 'Крылышки барбекю', price: 740, badge: 'Хит' },
      { name: 'Крылышки в устричном соусе', price: 740 },
      { name: 'Креветки дор блю', price: 950 },
      { name: 'Креветки том ям', price: 950 },
      { name: 'Креветки северные варёные', price: 790 },
      { name: 'Креветки северные жареные', price: 790 },
      { name: 'Наггетсы куриные', price: 490 },
      { name: 'Гренки GB8', price: 320 },
      { name: 'Картофель фри', price: 340 },
      { name: 'Сырные палочки', price: 460 },
      { name: 'Фиш&Чипс', price: 680 },
    ],
  },
  {
    id: 'sauces',
    name: 'Соусы',
    items: [
      { name: 'Сырный / Горчичный / Кетчуп / Свит чили', price: 130 },
      { name: 'Устричный соус / Барбекю / Блю чиз / Шрирача', price: 130 },
    ],
  },
  {
    id: 'hotDrinks',
    name: 'Кофе',
    items: [
      { name: 'Эспрессо', price: 190 },
      { name: 'Двойной эспрессо', price: 290 },
      { name: 'Американо', price: 240 },
      { name: 'Капучино', price: 290 },
      { name: 'Латте', price: 310 },
      { name: 'Глясе', price: 340 },
      { name: 'Раф', price: 290 },
      { name: 'Флэт уайт', price: 310 },
    ],
  },
  {
    id: 'tea',
    name: 'Чай (стакан 0,4л)',
    items: [
      { name: 'Ассам', price: 290 },
      { name: 'Сенча', price: 290 },
      { name: 'Чай для бани', price: 290 },
      { name: 'Пуэр', price: 290 },
      { name: 'Да Хун Пао', price: 290 },
      { name: 'Эрл Грей', price: 290 },
      { name: 'Жасминовый', price: 290 },
      { name: 'Те Гуань Инь', price: 290 },
      { name: 'Молочный улун', price: 290 },
      { name: 'Наглый фрукт', price: 290 },
      { name: 'Отдых', price: 290 },
    ],
  },
  {
    id: 'teaAuthor',
    name: 'Чай авторский (чайник)',
    items: [
      { name: 'Хвойный чай', price: 420 },
      { name: 'Облепиховый', price: 420 },
      { name: 'Имбирный с мёдом', price: 420 },
      { name: 'Клюква-лимон', price: 420 },
      { name: 'Апельсин-розмарин', price: 420 },
      { name: 'Яблоко-тимьян-корица', price: 420 },
    ],
  },
  {
    id: 'coldDrinks',
    name: 'Напитки 0,4л',
    items: [
      { name: 'Добрый кола Ж/Б', price: 240 },
      { name: 'Добрый лимон-лайм Ж/Б', price: 240 },
      { name: 'Добрый апельсин Ж/Б', price: 240 },
      { name: 'Яблоко, мультик, персик, вишня, груша', price: 180 },
      { name: 'Nestle Pure Life (негазированная)', price: 180 },
      { name: 'Nestle Pure Life (газированная)', price: 180 },
      { name: 'Квас', price: 260 },
      { name: 'Лимонад', price: 240 },
      { name: 'Коктейль банщика', price: 240 },
    ],
  },
  {
    id: 'lemonades',
    name: 'Домашние лимонады 1л',
    items: [
      { name: 'Классический', price: 630 },
      { name: 'Клубника-лимон', price: 630 },
      { name: 'Облепиха-апельсин', price: 630 },
      { name: 'Коктейль банщика', price: 630 },
    ],
  },
  {
    id: 'cocktails',
    name: 'Коктейли',
    items: [
      { name: 'Смузи клубника-банан', price: 440 },
      { name: 'Ванильный коктейль', price: 440 },
      { name: 'Клубничный коктейль', price: 440 },
      { name: 'Шоколадный коктейль', price: 440 },
      { name: 'Мохито клубника', price: 430 },
      { name: 'Мохито классика', price: 420 },
    ],
  },
  {
    id: 'juice',
    name: 'Сок свежевыжатый 0,3л',
    items: [
      { name: 'Апельсин', price: 460 },
      { name: 'Грейпфрут', price: 460 },
      { name: 'Сельдерей', price: 460 },
      { name: 'Яблоко', price: 460 },
      { name: 'Морковь', price: 430 },
    ],
  },
  {
    id: 'beer',
    name: 'Разливное пиво 0,4л',
    items: [
      { name: 'GB8 Лагер', price: 340 },
      { name: 'GB8 Вайссе', price: 340 },
      { name: 'Шлиц Хель', price: 360 },
      { name: 'Пиво АНДЕГРАУНД СТАУТ (тёмное)', price: 360 },
      { name: 'Пиво MILK OF AMNESIA-V. TROPIC (фруктовое)', price: 390 },
      { name: 'Сидр', price: 390 },
      { name: 'Нат Баттер', price: 390 },
    ],
  },
];

// For backward compatibility
export type { MenuItem as MenuItemOld };
export const oldCafeMenu = {
  hotDrinks: cafeMenu.find(c => c.id === 'hotDrinks')?.items || [],
  coldDrinks: cafeMenu.find(c => c.id === 'coldDrinks')?.items || [],
  snacks: cafeMenu.find(c => c.id === 'snacks')?.items || [],
  desserts: [] as MenuItem[],
};
