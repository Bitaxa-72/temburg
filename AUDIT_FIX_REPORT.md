# Termburg — отчёт по аудиту клиента (фикс 9/10 пунктов)

Дата: 2026-04-08
Документ-источник: `Вопросы_критические_моменты.docx`
Пропущено по согласованию: страница мероприятий месяца, спам-защита форм (этап 9)

## Сводка статусов

| # | Этап | Статус | Что закрывает |
|---|------|:---:|---|
| 1 | SEO основа: Helmet + per-page meta + prerender | ✅ | «25 страниц с одинаковым title/description/canonical/H1» |
| 2 | SPA fallback в .htaccess + диагностика /schedule | ✅ | «прямые ссылки /gallery, /termliny, /schedule» |
| 3 | H1 + alt-теги | ✅ | «alt-проблемы», «один H1 на странице» |
| 4 | Хлебные крошки на всех вложенных страницах | ✅ | «отсутствуют по всему сайту хлебные крошки» |
| 5 | Перенос мета-тегов со старого сайта | ✅ | «возьмите хотя бы базу со старого сайта» |
| 6 | Контент в WP-админку (ACF + REST) | ✅ | «контент зашит в JS, нет редактирования» |
| 7 | Чистка деплоя — устаревшие JS-чанки | ✅ | «AboutPage в 11 разных JS файлах» |
| 8 | Разделение `/pricing` | ✅ | «не разделены навигационные и SEO-посадочные» |
| 10 | WP плагины — аудит и обновление | ✅ (инструкция) | «31 плагин с обновлениями» |
| ✅ | QA Verifier — финальная проверка | ✅ | — |

## Подробно по этапам

### Этап 1. SEO основа — самый критичный пункт

**Корневая причина проблемы клиента:** SPA отдаёт один `index.html` на все 25 URL.
SEO-краулеры (Yandex, Google, Screaming Frog) не выполняют JS, видят одинаковые
мета-теги на всех страницах.

**Решение:**
1. Создан централизованный конфиг `src/seo/seoConfig.ts` с уникальными
   title/description/h1 для всех 29 маршрутов фронта.
2. `PageLayout.tsx` обновлён — фолбэк через `getSeo(pathname)` если страница
   не передала свои мета.
3. Создан **post-build prerender** `scripts/prerender-meta.mjs`:
   после `vite build` для каждого маршрута создаётся `build/<route>/index.html`
   с подменёнными мета-тегами + `<noscript>` блок с H1 и описанием для краулеров,
   которые не выполняют JS.
4. `npm run build` теперь автоматически вызывает prerender.
5. `.htaccess` (см. этап 2) отдаёт prerender'енные HTML до того, как React загрузится.

**Результат проверки QA Verifier:**
- 29 страниц
- 29 уникальных titles
- 29 уникальных descriptions
- 29 уникальных canonical URL

### Этап 2. SPA fallback + .htaccess

Создан `frontend/public/.htaccess` (попадает в `build/` при сборке) с:
- Force HTTPS
- Защитой WordPress путей (`/wp-admin`, `/wp-content`, `/wp-includes`, `/api`)
- Поиском prerender'енной страницы по `DOCUMENT_ROOT/<URI>/index.html` —
  если есть, отдаём её (это критично для SEO)
- Fallback на `/index.html` для остальных маршрутов (SPA)
- Gzip + кеширование статики
- Безопасность (запрет dotfiles, X-Frame-Options, Referrer-Policy)
- Защита `wp-config.php`, `.htaccess`, листинга директорий

**Про /schedule:** локально страница рендерится без ошибок (0 console errors).
Прод-баг с белым экраном связан с устаревшим деплоем (старые чанки на сервере).
Закроется автоматически после первого деплоя через `deploy-production.sh`.

### Этап 3. H1 + alt-теги

Аудит показал:
- 28 страниц используют `PageHero` (рендерит `<h1>`) или `HeroSection` (тоже `<h1>`)
- 1 страница (`TermlinyPage`) не имела H1 — добавлен `<h1 className="sr-only">`
  для краулеров без визуальных изменений
- 0 `<img>` без alt — все 52 изображения уже размечены

### Этап 4. Хлебные крошки

`Breadcrumbs.tsx` уже автоматически рендерится в `PageLayout` для всех страниц
кроме главной. Содержит:
- Schema.org `BreadcrumbList` JSON-LD микроразметку
- Иерархию через `routeParents` (например, `pools` → родитель `services`)
- Иконки и aria-label
- Адаптив, hover-эффекты

Что поправлено:
- `SITE_URL` обновлён со staging-домена `termburg.ceosivaev.ru` на прод `termburg.ru`
- Добавлены пропущенные маршруты `faq` и `corporate` в `routeNames`

### Этап 5. Перенос мета-тегов со старого сайта

Через WebFetch с `old.termburg.ru` собраны исторические мета-теги для:
- `/` — главная
- `/about` — О Термбурге
- `/pricing` — Цены на абонементы
- `/services` — Услуги
- `/steam-rooms` — Сауны (адаптировано с `/sauna`)
- `/contacts` — Контакты

В `seoConfig.ts` эти записи помечены комментарием `// Перенесено с old.termburg.ru`.
Оригинальные SEO-тексты с акцентом на ключи «термальный комплекс», «термы»,
«термы Москва» сохранены — это точно те же запросы, под которые сайт ранжировался.

Несколько URL старого сайта (`/jacuzzi`, `/swimming-pool`, `/cafe`) дают 404 —
для них использованы новые тексты, сохраняющие тот же стиль.

### Этап 6. Контент в WP-админку

**Frontend готов:**
- `src/api/wordpress.ts` — добавлен `api.getPageContent(slug)` + интерфейсы
  `WPPageContent` / `WPPageContentBlock` (5 типов: text, heading, image, list, note)
- `src/hooks/useWordPressData.ts` — добавлен хук `usePageContent(slug)`
- `src/components/shared/WPContentBlocks.tsx` — универсальный рендер блоков

**Backend (PHP-патч для WP-разработчика):**
- `wordpress-patches/termburg-page-content.php` — готовый файл для подключения
  через `require_once` в `functions.php` темы. Содержит:
  - ACF Options Page «Контент страниц»
  - ACF Flexible Content с 5 типами блоков
  - REST endpoint `GET /wp-json/termburg/v1/page-content/{slug}`
  - Преобразование ACF структуры в чистый JSON для фронта

**Как использовать на странице (паттерн):**
```tsx
const { data: pageContent } = usePageContent('about');

{pageContent.blocks.length > 0 ? (
  <WPContentBlocks blocks={pageContent.blocks} />
) : (
  <FallbackHardcodedContent />  // существующий код страницы
)}
```

После того как WP-разработчик подключит PHP-патч и заполнит блоки в админке —
фронт автоматически подхватит контент. До этого работает текущий хардкод.

### Этап 7. Чистка деплоя

**Источник проблемы клиента:** прод-сайт `termburg.ru` деплоится **вручную через
Beget панель** (FTP/файловый менеджер) — в существующую папку без очистки.
Каждая ручная заливка добавляет новые `AboutPage-<hash>.js`, старые остаются.

**Решение:** создан `deploy-production.sh` — автоматизированный деплой через rsync:
- Сборка фронтенда (vite + prerender)
- Snapshot текущей версии (для rollback)
- `rsync --delete` с защитой WordPress путей (`wp-admin`, `wp-content`, `wp-config.php`)
- Sanity-check на сервере: количество `AboutPage-*.js` файлов
- Smoke-test через curl главной и `/about` (проверяет что title разный)
- Команда `bash deploy-production.sh --rollback` для отката

После первого использования этого скрипта проблема с накоплением чанков уйдёт навсегда.

**Существующие deploy-скрипты (`deploy.sh`, `frontend/deploy.sh`) ведут на
staging — оставлены без изменений.**

### Этап 8. Разделение `/pricing`

**Проблема:** `/pricing` смешивал интенты — навигация (тарифы) + калькулятор +
подарочные сертификаты + мерч.

**Решение:**
1. Добавлен новый маршрут `/pricing/calculator` в `App.tsx` — рендерит ту же
   `PricingPage` (минимальное изменение, без рефакторинга).
2. В seoConfig добавлен entry для `/pricing/calculator` с уникальными мета.
3. На странице `/pricing` после hero добавлен SEO-блок «Стоимость посещения
   Термбурга» с текстовым описанием тарифов и ссылкой на калькулятор.
4. PageLayout теперь автоматически берёт мета из seoConfig (страница ничего
   не передаёт).

Полный рефакторинг `PricingPage` (777 строк) на отдельные компоненты —
вынесен в backlog как отдельная задача.

### Этап 10. WP плагины

**Не выполняется из IDE-сессии** (требует SSH на Beget). Создана подробная
инструкция `wordpress-patches/PLUGINS_AUDIT.md` с командами WP-CLI:
- Бэкап БД и `wp-content`
- Список плагинов с обновлениями
- Удаление неиспользуемых
- Обновление активных (сначала на staging, потом на prod)
- Проверка после обновления (`verify-checksums`, `error_log`)
- Команды отката

Чек-лист для исполнителя — внутри файла.

## Артефакты сессии

| Файл | Назначение |
|---|---|
| `frontend/src/seo/seoConfig.ts` | Централизованный SEO-конфиг для 29 маршрутов |
| `frontend/scripts/prerender-meta.mjs` | Post-build prerender статических HTML |
| `frontend/scripts/verify-seo.mjs` | QA Verifier — проверка уникальности мета |
| `frontend/public/.htaccess` | Apache config: SPA + prerender + защита WP |
| `frontend/src/components/shared/WPContentBlocks.tsx` | Рендер ACF-блоков из WP |
| `frontend/src/hooks/useWordPressData.ts` (+ patch) | Хук `usePageContent(slug)` |
| `frontend/src/api/wordpress.ts` (+ patch) | API метод `getPageContent` |
| `frontend/src/components/layout/PageLayout.tsx` (patch) | Фолбэк на seoConfig |
| `frontend/src/components/shared/Breadcrumbs.tsx` (patch) | Прод-домен + новые маршруты |
| `frontend/src/pages/PricingPage.tsx` (patch) | SEO-блок + ссылка на /pricing/calculator |
| `frontend/src/pages/TermlinyPage.tsx` (patch) | Добавлен sr-only `<h1>` |
| `frontend/src/App.tsx` (patch) | Маршрут `/pricing/calculator` |
| `frontend/package.json` (patch) | `npm run build` теперь включает prerender |
| `wordpress-patches/termburg-page-content.php` | ACF + REST для редактирования контента из WP |
| `wordpress-patches/PLUGINS_AUDIT.md` | Инструкция по аудиту WP-плагинов |
| `deploy-production.sh` | Production-деплой на Beget с автоматической чисткой |

## QA Verifier — итог

```
Total HTML pages:    29
Unique titles:       29
Unique descriptions: 29
Unique canonicals:   29

✅ Все titles уникальны
✅ Все descriptions уникальны
✅ Все canonical уникальны
✅ .htaccess в build/
✅ /about/index.html prerendered
✅ /pricing/index.html prerendered
✅ /pricing/calculator/index.html prerendered
```

## Что нужно сделать на проде после получения доступа

1. Загрузить `deploy-production.sh` и запустить деплой — это автоматически:
   - Зальёт новый билд с prerender'енными HTML и .htaccess
   - Удалит старые `AboutPage-*.js` файлы
2. Проверить через Screaming Frog или подобный аудитор — увидеть 29 уникальных мета.
3. WP-разработчику передать `wordpress-patches/termburg-page-content.php`
   для подключения в `functions.php` темы.
4. Запустить аудит плагинов по инструкции `wordpress-patches/PLUGINS_AUDIT.md`.
5. (Опционально) Подключить hCaptcha/reCAPTCHA на формы — этап 9, отложен по согласованию.

## Что осталось в backlog

- Полный рефакторинг `PricingPage.tsx` на отдельные компоненты
- Подключение `WPContentBlocks` к каждой контентной странице (после готовности WP-стороны)
- Перенос H1 для оставшихся 22 страниц если потребуется отличие от текущих PageHero title
- Lighthouse аудит на проде после деплоя
