# Termburg — структура сайта

Полная карта сайта termburg.ru: маршруты, страницы, секции, источники данных,
SEO-метаданные, иерархия навигации.

**Версия:** 2026-04-08
**Стек:** React 19 + Vite 5 + TypeScript + Tailwind 3 + WordPress headless (REST API + ACF)
**Production:** https://termburg.ru
**Staging:** https://termburg.ceosivaev.ru

## Содержание

1. [Дерево маршрутов](#дерево-маршрутов)
2. [Страницы — детальное описание](#страницы)
3. [WordPress REST endpoints](#wordpress-rest-endpoints)
4. [Глобальные компоненты](#глобальные-компоненты)
5. [Источники данных](#источники-данных)
6. [SEO-инфраструктура](#seo-инфраструктура)
7. [Деплой и сервер](#деплой-и-сервер)
8. [Что куда подключать редактору](#что-куда-подключать-редактору)

---

## Дерево маршрутов

```
/
├── /                          Главная (HomePage)
│
├── О Термбурге
│   ├── /about                 О Термбурге (концепция, команда, правила)
│   └── /termliny              Термлины (мифология/духи бань)
│
├── Услуги
│   ├── /services              Каталог услуг (массаж, парения, SPA)
│   ├── /steam-rooms           Парные и сауны (12+ видов)
│   ├── /pools                 Бассейны (термальный + спортивный)
│   ├── /jacuzzi               Джакузи
│   ├── /plunge-pools          Купели
│   ├── /family                Семейный отдых
│   ├── /cafe                  Кафетерий
│   ├── /swimming-school       Школа плавания (дети 6–12)
│   └── /steam-school          Школа парения (обучение)
│
├── Цены и записи
│   ├── /pricing               Прайс-лист (тарифы, абонементы, сертификаты)
│   ├── /pricing/calculator    Калькулятор стоимости визита
│   ├── /promotions            Акции и спецпредложения
│   └── /schedule              Расписание парений и мероприятий
│
├── Информация
│   ├── /news                  Новости (auto-import из Дзен + Telegram)
│   ├── /gallery               Фотогалерея
│   ├── /faq                   Вопросы и ответы
│   ├── /rules                 Правила посещения (137 пунктов)
│   ├── /map                   Как добраться (карта Yandex)
│   └── /contacts              Контакты
│
├── Сотрудничество
│   ├── /corporate             Корпоративный отдых
│   ├── /partners              Партнёрам
│   └── /careers               Вакансии
│
├── Юридическое
│   ├── /offer                 Договор-оферта
│   └── /privacy               Политика конфиденциальности
│
├── Личный кабинет
│   ├── /login                 Вход
│   └── /account               Личный кабинет (бронирования, заказы)
│
└── *                          NotFoundPage (404)
```

**Всего маршрутов:** 29 (28 уникальных + 1 catch-all)

### 301-редиректы со старого сайта (в .htaccess)

| Старый URL (old.termburg.ru) | Новый URL |
|---|---|
| `/about-kompany` | `/about` |
| `/cooperation` | `/partners` |
| `/publichnaya-oferta` | `/offer` |
| `/visiting-rules` | `/rules` |
| `/services/bani-bochki` | `/steam-rooms` |
| `/services/bassejn` | `/pools` |
| `/services/hammam` | `/steam-rooms` |
| `/services/individualnye-russkie-parnye` | `/steam-rooms` |
| `/services/lipovaya-sauna` | `/steam-rooms` |
| `/services/peschanaya-sauna` | `/steam-rooms` |
| `/services/russkaya-parnaya` | `/steam-rooms` |
| `/services/sauna-s-gimalajskoj-solyu` | `/steam-rooms` |
| `/services/travyanaya-sauna` | `/steam-rooms` |
| `/stranicza-bronirovaniya` | `/services` |
| `/certificates`, `/gift_boxes`, `/kupit-onlajn`, `/price-abonements`, `/price-list` | `/pricing` |
| `/product-category/*`, `/product/*` | `/pricing` |
| `/news/*` | `/news` |
| `/school-par` | `/steam-school` |
| `/timetable` | `/schedule` |
| `/profitable-offer` | `/promotions` |
| `/menyu-restorana` | `/cafe` |
| `/job`, `/vacancy/*` | `/careers` |
| `/reviews` | `/` |

---

## Страницы

### `/` — HomePage
**Файл:** `src/pages/HomePage.tsx`
**SEO:** Главная — `Термбург | термальный комплекс | Термы Москва`
**Секции (по порядку):**
- HeroSection (видео-фон, главный CTA, h1)
- InfoTicker (бегущая строка с акциями)
- ServicesPreview (карточки услуг)
- TariffCarousel (карусель тарифов)
- PricingPreviewSection (сводка цен)
- PoolsGallery
- SteamRoomsPreview
- TermlinyTeaser (тизер мифологии)
- NewsPreviewSection (последние 3 новости)
- ReviewsSection (отзывы из reviews-parser)
- GallerySection
- PartnersSection
- LocationMap (Yandex карта)
- FAQTeaser
- BookingCTA
**Источник данных:** mix WP + хардкод (перенос в WP в процессе)

### `/about` — AboutPage
**Файл:** `src/pages/AboutPage.tsx`
**SEO:** `Термальный комплекс | Термбург | О Термбурге`
**Секции:** концепция, миссия, команда, правила (краткий блок), тур по зонам, ZoneItemModal
**Источник:** хардкод + ✅ **WP page-content/about** (4 блока: концепция, что входит, команда, note)

### `/termliny` — TermlinyPage
**Файл:** `src/pages/TermlinyPage.tsx`
**SEO:** `Термлины — духи-хранители Термбурга`
**Содержимое:** карточки мифологических духов-хранителей бань с описаниями
**Источник:** `src/data/termliny.ts` (хардкод)

### `/services` — ServicesPage
**Файл:** `src/pages/ServicesPage.tsx`
**SEO:** `Услуги | Термбург | Термальный комплекс | Термы` (перенесено со старого сайта)
**Секции:** категории услуг, фильтры, карточки, ServicesGrid
**Источник:** WP `/wp-json/termburg/v1/services-list` ✅

### `/steam-rooms` — SteamRoomsPage
**Файл:** `src/pages/SteamRoomsPage.tsx`
**SEO:** `Парные и сауны | Термбург | Термальный комплекс | Термы`
**Содержимое:** все 12+ видов парных с описаниями, температурой, советами
**Источник:** `src/data/steamRooms.ts` + ✅ **WP page-content/steam-rooms**

### `/pools` — PoolsPage
**Файл:** `src/pages/PoolsPage.tsx`
**SEO:** `Бассейны Термбурга — термальные и спортивные`
**Содержимое:** два бассейна (термальный + спортивный 25 м), характеристики
**Источник:** хардкод + ✅ **WP page-content/pools**

### `/jacuzzi` — JacuzziPage
**Файл:** `src/pages/JacuzziPage.tsx`
**SEO:** `Джакузи в Термбурге`
**Источник:** хардкод + ✅ **WP page-content/jacuzzi**

### `/plunge-pools` — PlungePoolsPage
**Файл:** `src/pages/PlungePoolsPage.tsx`
**SEO:** `Купели Термбурга — холодные и контрастные`

### `/family` — FamilyPage
**Файл:** `src/pages/FamilyPage.tsx`
**SEO:** `Семейный отдых в Термбурге`
**Содержимое:** детские тарифы, школа плавания, безопасные зоны, FAQ для родителей
**Источник:** хардкод + ✅ **WP page-content/family**

### `/cafe` — CafePage
**Файл:** `src/pages/CafePage.tsx`
**SEO:** `Кафетерий Термбурга — меню и напитки`
**Источник:** WP `/wp-json/termburg/v1/cafe`

### `/swimming-school` — SwimmingSchoolPage
**Файл:** `src/pages/SwimmingSchoolPage.tsx`
**SEO:** `Школа плавания для детей в Термбурге`
**Содержимое:** программа, расписание групп, цены, форма записи (SwimmingEnrollmentModal)

### `/steam-school` — SteamSchoolPage
**Файл:** `src/pages/SteamSchoolPage.tsx`
**SEO:** `Школа парения — обучение банному мастерству`

### `/pricing` — PricingPage
**Файл:** `src/pages/PricingPage.tsx`
**SEO:** `Цены на абонементы | Термбург | Термальный комплекс | Термы` (перенесено)
**Секции:**
- PricingCards (тарифы будни/выходные с табами)
- Льготы (детские, пенсионерские)
- Что включено в посещение
- Service links
- Subscriptions (абонементы)
- Gift boxes (подарочные боксы)
- Certificates (сертификаты)
- Merch (4 товара: халат, полотенце, тапочки, шапка)
**Источник:** `src/data/pricing.ts` + WP `/wp-json/termburg/v1/pricing` (subscriptions) + ✅ **WP page-content/pricing**

### `/pricing/calculator` — псевдоним
**Маршрут:** рендерит ту же `PricingPage` с уникальным SEO для калькулятора
**SEO:** `Калькулятор стоимости посещения — Термбург`

### `/promotions` — PromotionsPage
**Файл:** `src/pages/PromotionsPage.tsx`
**SEO:** `Акции и спецпредложения Термбурга`
**Источник:** WP `/wp-json/termburg/v1/promotions`

### `/schedule` — SchedulePage
**Файл:** `src/pages/SchedulePage.tsx`
**SEO:** `Расписание парений и мероприятий | Термбург`
**Содержимое:** недельный и месячный календарь, события, парения, праздники
**Источник:** WP `/wp-json/termburg/v1/schedule` + `src/data/schedule.ts` (fallback)

### `/news` — NewsPage
**Файл:** `src/pages/NewsPage.tsx`
**SEO:** `Новости и события Термбурга`
**Источник:** WP CPT `news` + auto-import из Дзен и Telegram (`termburg-news-sync.php`, cron 12h)

### `/gallery` — GalleryPage
**Файл:** `src/pages/GalleryPage.tsx`
**SEO:** `Фотогалерея Термбурга`
**Источник:** WP `/wp-json/termburg/v1/gallery` (из admin-api-extra)
**⚠️ Изменено в этом релизе:** удалён 301-редирект `/gallery → /` который раньше блокировал страницу

### `/faq` — FAQPage
**Файл:** `src/pages/FAQPage.tsx`
**SEO:** `Вопросы и ответы — Термбург`
**Источник:** WP `/wp-json/termburg/v1/faq`

### `/rules` — RulesPage
**Файл:** `src/pages/RulesPage.tsx`
**SEO:** `Правила посещения Термбурга`
**Содержимое:** 137 пунктов правил по категориям
**Источник:** хардкод (137 пунктов в коде) + ✅ **WP page-content/rules**

### `/map` — MapPage
**Файл:** `src/pages/MapPage.tsx`
**SEO:** `Как добраться — карта Термбурга`
**⚠️ Размер чанка:** 1.1 МБ — содержит интерактивную карту Yandex Maps API

### `/contacts` — ContactsPage
**Файл:** `src/pages/ContactsPage.tsx`
**SEO:** `Контакты | Термбург | Термальный комплекс | Термы` (перенесено)
**Содержимое:** адрес, телефон, форма обратной связи, карта
**Источник:** хардкод + ✅ **WP page-content/contacts**

### `/corporate` — CorporatePage
**Файл:** `src/pages/CorporatePage.tsx`
**SEO:** `Корпоративный отдых в Термбурге`

### `/partners` — PartnersPage
**Файл:** `src/pages/PartnersPage.tsx`
**SEO:** `Партнёрам Термбурга`
**Содержимое:** условия сотрудничества, форма заявки (POST на `/wp-json/termburg/v1/partner-inquiry`)

### `/careers` — CareersPage
**Файл:** `src/pages/CareersPage.tsx`
**SEO:** `Вакансии в Термбурге — работа в Москве`
**Источник:** WP CPT `vacancy`

### `/offer` — OfferPage
**Файл:** `src/pages/OfferPage.tsx`
**SEO:** `Договор-оферта Термбурга`
**Содержимое:** статичный текст оферты

### `/privacy` — PrivacyPage
**Файл:** `src/pages/PrivacyPage.tsx`
**SEO:** `Политика конфиденциальности Термбурга`

### `/login` — LoginPage
**Файл:** `src/pages/LoginPage.tsx`
**Источник:** WP `/wp-json/termburg/v1/auth/login`

### `/account` — AccountPage
**Файл:** `src/pages/AccountPage.tsx`
**Источник:** WP `/wp-json/termburg/v1/auth/profile` + WooCommerce `/checkout/orders`

---

## WordPress REST endpoints

Все endpoints в namespace `termburg/v1`. Регистрация в:
- `wp-content/themes/termoistochnik/includes/termburg-admin-api.php`
- `wp-content/themes/termoistochnik/includes/termburg-admin-api-extra.php`
- `wp-content/themes/termoistochnik/includes/termburg-page-content.php` ✨ новый
- `wp-content/themes/termoistochnik/includes/termburg-api.php` (auth)
- `wp-content/themes/termoistochnik/includes/termburg-checkout.php` (WooCommerce)
- `wp-content/themes/termoistochnik/includes/termburg-leads.php` (формы)
- `wp-content/themes/termoistochnik/includes/termburg-news-sync.php` (auto-import)

| Endpoint | Метод | Назначение | Статус |
|---|:---:|---|:---:|
| `/settings` | GET | Глобальные настройки сайта (телефон, режим, соцсети) | ✅ |
| `/pricing` | GET | Тарифы, абонементы, сертификаты | ✅ |
| `/services-list` | GET | Услуги (массаж, парения, SPA) | ✅ |
| `/cafe` | GET | Меню кафе | ✅ |
| `/faq` | GET | FAQ по категориям | ✅ |
| `/schedule` | GET | Расписание парений и мероприятий | ✅ |
| `/team` | GET | Команда (банщики, массажисты) | ✅ |
| `/zones` | GET | Зоны комплекса для AboutPage tour | ✅ |
| `/zones-data` | GET | Расширенные данные зон | ✅ |
| `/promotions` | GET | Акции (короткий список) | ✅ |
| `/promotions-data` | GET | Расширенные данные акций | ✅ |
| `/gallery` | GET | Фотогалерея | ✅ |
| `/termliny` | GET | Термлины (мифология) | ✅ |
| `/rules` | GET | Правила посещения | ✅ |
| `/certificates` | GET | Подарочные сертификаты | ✅ |
| `/ticker` | GET | Бегущая строка с акциями | ✅ |
| `/images` | GET | Каталог изображений из медиа-библиотеки WP | ✅ |
| `/reviews-stats` | GET | Статистика отзывов | ✅ |
| `/news-sync` | POST | Запуск auto-import из Дзен/TG (cron) | ✅ |
| `/page-content/{slug}` | GET | ✨ **Контент страниц из ACF flexible content** | ✅ NEW |
| `/auth/register` | POST | Регистрация | ✅ |
| `/auth/login` | POST | Авторизация | ✅ |
| `/auth/profile` | GET | Профиль пользователя | ✅ |
| `/checkout/create` | POST | Создание заказа WooCommerce | ✅ |
| `/checkout/status/{id}` | GET | Статус заказа | ✅ |
| `/checkout/orders` | GET | История заказов пользователя | ✅ |
| `/partner-inquiry` | POST | Форма заявки от партнёров | ✅ |

### Кастомные post types

Регистрация в `wp-content/themes/termoistochnik/includes/post-types.php`:

| CPT | Slug | Назначение | Поля ACF |
|---|---|---|---|
| `news` | news | Новости/события | заголовок, дата, изображение, текст, источник (Дзен/TG) |
| `services` | services (промо) | Промо-блоки услуг | название, описание, цена, длительность, изображение |
| `otzav` | otzav | Отзывы (модерация) | автор, текст, рейтинг, дата, платформа |
| `vacancy` | vacancy | Вакансии | должность, описание, требования, контакт |

### ACF Options Pages (16+)

Глобальные настройки сайта через ACF Options:
- Главная
- О Термбурге
- Услуги (общая страница)
- Цены
- Расписание
- Кафе
- Парные
- Бассейны
- Школа плавания
- Школа парения
- Семейный отдых
- Контакты
- Партнёрам
- Вакансии
- Сертификаты
- ✨ **Контент страниц** (новая, для редактирования текстов всех страниц через flexible content)

---

## Глобальные компоненты

### Layout
- **`PageLayout`** (`src/components/layout/PageLayout.tsx`) — общий layout для всех страниц.
  Включает: Header, Footer, Helmet с per-page meta из seoConfig (фолбэк), Breadcrumbs (для не-главной),
  JSON-LD Schema.org (HealthAndBeautyBusiness, WebSite), InfoTicker, UrgentNewsBanner.
- **`Header`** (`src/components/layout/Header.tsx`) — навигация, логотип, поиск, корзина, профиль
- **`Footer`** (`src/components/layout/Footer.tsx`) — карта сайта, контакты, соцсети, копирайт

### Shared компоненты (используются на нескольких страницах)
- `Breadcrumbs.tsx` — auto-render хлебных крошек, Schema.org BreadcrumbList
- `PageHero.tsx` — hero-баннер с h1 и фоном
- `BookingModal.tsx` — модалка бронирования
- `PurchaseModal.tsx` — модалка покупки тарифа/сертификата
- `BathDetailModal.tsx` — детали парной
- `WhatToBringModal.tsx` — что взять с собой
- `ClayModal.tsx` — модалка про глиняные обертывания
- `SearchModal.tsx` — глобальный поиск по сайту
- `SwimmingEnrollmentModal.tsx` — запись в школу плавания
- `CookieConsent.tsx` — баннер cookies
- `ScrollToTop.tsx` + `ScrollToTopButton.tsx` — скролл навигация
- `UrgentNewsBanner.tsx` — баннер срочных объявлений
- `WPContentBlocks.tsx` ✨ — рендер блоков из ACF page-content
- `ImageLightbox.tsx` — лайтбокс для галерей
- `WPImage.tsx` — обёртка `<img>` с подгрузкой через WP

### Контексты
- **`AuthContext`** — авторизация пользователя
- **`BookingContext`** — глобальное состояние модалок (бронирование, покупка, что взять)
- **`CartContext`** — корзина WooCommerce

---

## Источники данных

### Локальные (`src/data/`)
| Файл | Содержимое | Статус выноса в WP |
|---|---|:---:|
| `pricing.ts` | Тарифы, абонементы, мерч | частично (subscriptions через WP) |
| `services.ts` | Услуги | через `/services-list` |
| `schedule.ts` | Расписание (fallback) | через `/schedule` |
| `termliny.ts` | Термлины | через `/termliny` |
| `steamRooms.ts` | Парные | хардкод |
| `rules.ts` | Правила (137 пунктов) | через `/rules` |
| `faq.ts` | FAQ | через `/faq` |
| `team.ts` | Команда | через `/team` |
| `zones.ts` | Зоны для AboutPage tour | через `/zones` |
| `news.ts` | Fallback новостей | через `/news` (WP CPT) |
| `promotions.ts` | Акции | через `/promotions` |
| `searchData.ts` | Индекс для поиска | хардкод (пересобирается при build) |

### Хуки для WP API (`src/hooks/useWordPressData.ts`)
- `usePricing()`, `useTeam()`, `useReviews()`, `useFAQ()`, `useSettings()`,
  `useServices()`, `useZones()`, `useSchedule()`, `usePromotions()`, `useCafe()`
- ✨ `usePageContent(slug)` — универсальный для контента страниц из ACF

### API клиент
- `src/api/wordpress.ts` — клиент WP REST с типами
- `BASE_URL = import.meta.env.VITE_API_URL || 'https://termburg.ru/wp-json/termburg/v1'`

---

## SEO-инфраструктура

### Per-page meta — `src/seo/seoConfig.ts`
Централизованный конфиг **29 маршрутов** с уникальными:
- `title` (для `<title>` и `og:title`)
- `description` (для `meta description`, `og:description`, `twitter:description`)
- `h1` (для пользователя на странице)
- `ogImage` (опциональный)

**6 страниц** имеют исторические мета, перенесённые с old.termburg.ru:
`/`, `/about`, `/pricing`, `/services`, `/steam-rooms`, `/contacts`

### Prerender — `frontend/scripts/prerender-meta.mjs`
После `vite build` для каждого маршрута создаётся `build/<route>/index.html` с:
- Уникальным `<title>` и `<meta name="description">`
- Уникальным `<link rel="canonical">`
- Уникальным `og:title`, `og:description`, `og:url`, `og:image`
- Уникальным `twitter:title`, `twitter:description`
- `<noscript>` блоком с `<h1>` и описанием для краулеров без JS

### .htaccess — prerender priority
```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI}/index.html -f
RewriteRule ^(.+?)/?$ /$1/index.html [L]
```

### QA Verifier — `frontend/scripts/verify-seo.mjs`
Проверка после билда:
- Уникальность title/description/canonical для всех HTML
- Наличие `.htaccess` в build/
- Наличие prerender'енных страниц для всех маршрутов

### Schema.org микроразметка
- **HealthAndBeautyBusiness** — главная организация (PageLayout)
- **WebSite** с SearchAction (PageLayout)
- **BreadcrumbList** — хлебные крошки (Breadcrumbs.tsx)

### sitemap.xml + robots.txt
- `public/sitemap.xml` — статический файл, обновляется вручную
- `public/robots.txt` — стандартный, разрешает индексацию

---

## Деплой и сервер

### Хостинг
- **Beget**, аккаунт `<beget-user>` (логин в пароль-менеджере команды)
- SSH: `ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech`
- Корень сайта: `/home/v/<beget-user>/termburg.ru/public_html/`
- WP установлен в корне (не в подкаталоге)

### Структура папок на сервере
```
public_html/
├── .htaccess              SPA + prerender + 30+ 301-редиректов
├── index.html             Главная (prerender'енная)
├── about/index.html       Prerender страницы /about
├── pricing/index.html     ...
├── ... (29 prerender'енных HTML)
├── assets/                JS, CSS с hash в имени (60 файлов после деплоя)
├── images/                Картинки (254 МБ — НЕ перезаливаются)
├── video/                 Видео
├── pdf/                   PDF (правила, оферта)
├── fonts/                 ikra-slab.woff2
├── favicon.ico, robots.txt, sitemap.xml
├── manifest.json
│
├── wp-admin/              WordPress админка
├── wp-content/            Темы, плагины, медиа
│   └── themes/termoistochnik/
│       ├── functions.php
│       └── includes/      (15+ PHP файлов с REST endpoints)
├── wp-includes/
├── wp-config.php
├── wp-index.php           ⚠️ entrypoint для /wp-json/* и /api/*
├── wp-login.php
└── ... (другие wp-*.php)
```

### Деплой-скрипты
- **`deploy-production.sh`** ✨ — полный продакшн-деплой через rsync с защитой WP-путей,
  snapshot для rollback, smoke-test через curl
- **`deploy.sh`** — staging деплой
- **`frontend/deploy.sh`** — staging фронта (старый)

### Команды для деплоя (быстрый цикл)
```bash
# Локально пересобрать и упаковать
cd frontend && npm run build
tar -czf /tmp/termburg-deploy.tar.gz -C build --exclude=images --exclude=video --exclude=pdf .

# Залить на сервер
scp -i ~/.ssh/beget_termburg /tmp/termburg-deploy.tar.gz \
  <beget-user>@<beget-user>.beget.tech:~/termburg-deploy.tar.gz

# Распаковать с очисткой старых assets
ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech "
  cd ~/termburg.ru/public_html
  rm -f assets/*.js assets/*.css
  tar -xzf ~/termburg-deploy.tar.gz
"
```

### Бэкапы (на сервере)
- `~/backups/htaccess-*.backup`
- `~/backups/index-*.backup`
- `~/backups/functions-*.backup`
- `~/backups/wp-db-*.sql` (mysqldump)
- `~/backups/assets-list-*.txt`

---

## Что куда подключать редактору

### Я хочу изменить...

| Что меняем | Куда идти |
|---|---|
| **Title/description страницы** | WP-админка → Контент страниц → выбрать страницу → page_title / meta_description; **или** код: `src/seo/seoConfig.ts` (требует ребилд) |
| **Текст блока «О нас»** | WP-админка → Контент страниц → about → отредактировать блоки |
| **Цены и тарифы** | WP-админка → ACF Options → Цены → таблицы тарифов |
| **Расписание парений** | WP-админка → CPT «Schedule» |
| **Новости** | WP-админка → CPT «Новости» (или авто-импорт из Дзен/TG) |
| **Услуги** | WP-админка → CPT «Услуги» |
| **Команду** | WP-админка → ACF Options → Команда |
| **Меню кафе** | WP-админка → ACF Options → Кафе |
| **FAQ** | WP-админка → ACF Options → FAQ |
| **Правила (137 пунктов)** | WP-админка → ACF Options → Правила |
| **Изображения hero страниц** | WP-админка → ACF Options → соответствующая страница |
| **Настройки контактов** | WP-админка → ACF Options → Настройки сайта |
| **Глобальный текст в шапке** | WP-админка → ACF Options → Настройки сайта → ticker |
| **301-редирект со старого URL** | `frontend/public/.htaccess` (раздел «301 Redirects from old WP URLs»), затем редеплой |

### Я хочу добавить новую страницу

1. Создать `src/pages/NewPage.tsx`
2. Добавить роут в `src/App.tsx` (lazy import + `<Route>`)
3. Добавить запись в `src/seo/seoConfig.ts` с title/description/h1
4. (если есть подстраницы) добавить родителя в `src/components/shared/Breadcrumbs.tsx → routeParents`
5. Добавить иконку в `routeIcons` там же
6. Запустить `npm run build` — prerender автоматически создаст `build/new-page/index.html`
7. Задеплоить
8. (опционально) Создать ACF контент в WP-админке для редактирования текстов

---

## Контакты разработчиков и ключевые ссылки

- **Production:** https://termburg.ru
- **Staging:** https://termburg.ceosivaev.ru
- **Старый сайт:** https://old.termburg.ru
- **WP-админка:** https://termburg.ru/wp-login.php
- **Beget панель:** https://cp.beget.com
- **Repository:** `wiki/projects/termburg/`

### Документация в проекте
- `AUDIT_FIX_REPORT.md` — отчёт по аудиту клиента (что починено и почему)
- `TG_SETUP_PROGRESS.md` — устаревший (от другого проекта)
- `wordpress-patches/termburg-page-content.php` — PHP патч с ACF + REST для контента страниц
- `wordpress-patches/seed-page-content.php` — wp eval-file скрипт для заполнения дефолтным контентом
- `wordpress-patches/PLUGINS_AUDIT.md` — инструкция по аудиту WP-плагинов
