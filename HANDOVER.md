# Termburg — Handover

**Дата актуализации:** 2026-04-08
**Production:** https://termburg.ru
**Staging:** https://termburg.ceosivaev.ru
**Старый сайт:** https://old.termburg.ru

## Содержание
1. [Доступы](#-доступы)
2. [Архитектура и стек](#️-архитектура-и-стек)
3. [Структура сайта](#-структура-сайта)
4. [WordPress: что где редактируется](#-wordpress-что-где-редактируется)
5. [Деплой и сборка](#-деплой-и-сборка)
6. [Сервер: структура папок](#️-сервер-структура-папок)
7. [REST API endpoints](#-rest-api-endpoints)
8. [Бэкапы и откаты](#-бэкапы-и-откаты)
9. [Известные ограничения](#-известные-ограничения)

---

## 🔐 Доступы

> ⚠️ Реальные логины, пароли, ключи и скрытые URL **не хранятся в этом репозитории**.
> Запросите их у владельца через защищённый канал (пароль-менеджер команды).
> Ниже — описание того, *что* нужно получить и *где* это используется.

### WordPress админка
| Параметр | Значение |
|---|---|
| URL входа | **(скрытый URL — запросите у владельца)** |
| Логин | запросите |
| Пароль | запросите |

⚠️ **Важно:** прямой доступ к `/wp-login.php` заблокирован (отдаёт 403). Стандартный URL логина скрыт плагином **WPS Hide Login** для защиты от брутфорса. Реальный URL — в пароль-менеджере.

### Beget (хостинг)
| Параметр | Значение |
|---|---|
| Панель | https://cp.beget.com |
| Логин / пароль | запросите у владельца |
| SSH хост | `<beget-user>.beget.tech` |
| SSH юзер | `<beget-user>` |
| SSH ключ | приватный ключ выдаётся отдельно (ни в коем случае не коммитить) |
| Команда | `ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech` |

### YooKassa (платежи)
| Параметр | Значение |
|---|---|
| Shop ID | в `.env` (`YOOKASSA_SHOP_ID`) / в настройках WP-плагина |
| Secret Key | в `.env` (`YOOKASSA_SECRET_KEY`) / в настройках WP-плагина |
| Настройки в WP | WP → WooCommerce → Настройки → Платежи → ЮKassa |
| Плагин | `yookassa` (active, version 2.15.0) |
| Webhook URL | `https://termburg.ru/?wc-api=yookassa` (в личном кабинете ЮKassa) |

### 1С Дельфин (интеграция)
| Параметр | Значение |
|---|---|
| Endpoint данных | `GET https://termburg.ru/wp-json/api/v1/exchange/getdata` |
| Endpoint статуса | `POST https://termburg.ru/wp-json/api/v1/exchange/setexported` |
| Auth | header `x-api-key` (значение в `wp-content/themes/termoistochnik/includes/api-ajax.php`) |
| Модель | Pull (1С сама опрашивает WP) |

### Telegram (новости / уведомления)
- Плагин `wptelegram` (4.2.12) — настройки в WP → Telegram

### Дзен / новости автоимпорт
- Cron `termburg-news-sync.php` — каждые 12h
- Endpoint ручного триггера: `POST /wp-json/termburg/v1/news-sync`

---

## 🏗️ Архитектура и стек

```
┌─────────────────────────────────────────────────────────┐
│  Браузер пользователя                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│  Apache (Beget) — termburg.ru                           │
│  .htaccess: Force HTTPS, prerender priority,            │
│  301-редиректы, защита /wp-login.php                    │
└─────┬─────────────────────────┬─────────────────────────┘
      │                         │
      │ статика + prerender     │ /wp-* и /wp-json/*
      │                         │
┌─────▼──────────────┐    ┌─────▼─────────────────────────┐
│  React SPA         │    │  WordPress (headless CMS)     │
│  Vite + TypeScript │◄───┤  + WooCommerce (заказы)       │
│  React Router      │REST│  + ACF Pro (поля)             │
│  Tailwind          │    │  + ЮKassa (платежи)           │
│  React Helmet      │    │  + WPS Hide Login (защита)    │
│                    │    │  + Wordfence (security)       │
│  Prerender:        │    │  + Mailpoet (рассылки)        │
│  29 статических    │    │  + Yoast SEO                  │
│  HTML с уник.meta  │    │  + Google Site Kit (analytics)│
└────────────────────┘    └───────────────────────────────┘
                                    │
                                    │ REST pull
                                    ▼
                          ┌────────────────────┐
                          │  1С Дельфин        │
                          │  (внешняя система) │
                          └────────────────────┘
```

### Стек
- **Frontend:** React 19, TypeScript 5.9, Vite 5, Tailwind 3, React Router 7, React Helmet Async
- **Backend:** WordPress + WooCommerce + ACF Pro + кастомная тема `termoistochnik`
- **PHP:** 7.4.33 (Beget)
- **БД:** MySQL (WordPress)
- **Хостинг:** Beget shared hosting + nginx-reuseport

---

## 🗺️ Структура сайта

29 маршрутов фронта (28 уникальных + 1 catch-all 404).

### Карта URL
```
/                          Главная
├── /about                 О Термбурге
├── /termliny              Термлины (мифология духов)
│
├── /services              Услуги (массаж, парения, SPA)
├── /steam-rooms           Парные и сауны (12+ видов)
├── /pools                 Бассейны (термальный + спортивный)
├── /jacuzzi               Джакузи
├── /plunge-pools          Купели
├── /family                Семейный отдых
├── /cafe                  Кафетерий
├── /swimming-school       Школа плавания (дети 6–12)
├── /steam-school          Школа парения
│
├── /pricing               Прайс-лист (тарифы, абонементы)
├── /pricing/calculator    Калькулятор стоимости
├── /promotions            Акции и спецпредложения
├── /schedule              Расписание парений и мероприятий
│
├── /news                  Новости (auto-import Дзен/TG)
├── /gallery               Фотогалерея
├── /faq                   Вопросы и ответы
├── /rules                 Правила посещения (137 пунктов)
├── /map                   Как добраться
├── /contacts              Контакты
│
├── /corporate             Корпоративный отдых
├── /partners              Партнёрам
├── /careers               Вакансии
│
├── /offer                 Договор-оферта
├── /privacy               Политика конфиденциальности
│
├── /login                 Вход в личный кабинет
├── /account               Личный кабинет
│
└── *                      404 (NotFoundPage)
```

### 30+ редиректов со старого сайта (в .htaccess)
Все старые URL c old.termburg.ru → новые URL (about-kompany → /about, services/* → /steam-rooms, product/* → /pricing и т.д.)

### SEO
- Каждый из 29 URL имеет **уникальный prerender'енный HTML** в `build/<route>/index.html` с title/description/canonical/og — попадает к поисковику до загрузки JS
- Главная, /about, /pricing, /services, /steam-rooms, /contacts — **исторические мета** перенесены с old.termburg.ru
- Schema.org микроразметка: `HealthAndBeautyBusiness`, `WebSite`, `BreadcrumbList`
- Хлебные крошки автоматически на всех вложенных страницах

---

## 📝 WordPress: что где редактируется

### Контент страниц (свежий ACF, добавлен в этом релизе)
**Меню → «Контент страниц»** — единое место для всех 28 страниц фронта. Для каждой можно редактировать:
- `page_title` — заголовок страницы
- `meta_description` — для SEO
- `blocks` — flexible content из 5 типов: text, heading, list, image, note

**Как работает:**
1. Открыть «Контент страниц» → выбрать страницу из списка (например, about)
2. Добавить блок (например, type=text, heading="Внимание", body="1 января комплекс закрыт")
3. Сохранить — на сайте этот блок появится в начале страницы /about без перебилда фронта (через хук `usePageContent`)

**Текущее состояние:** 28 страниц добавлены, блоки пусты (чтобы не дублировать существующий хардкод).

### ACF Options Pages (старые, для разных типов контента)
- **Главная** — hero, секции, тарифы превью
- **О Термбурге** — миссия, команда, описание
- **Услуги** — общие настройки
- **Цены** — тарифы, абонементы, льготы
- **Расписание** — события, праздники
- **Кафе** — меню
- **Парные** — описания всех 12 типов
- **Бассейны**, **Школа плавания**, **Школа парения**, **Семейный отдых**
- **Контакты**, **Партнёрам**, **Вакансии**, **Сертификаты**
- **Настройки сайта** — телефон, email, ticker

### CPT (Custom Post Types)
| CPT | Назначение | Где |
|---|---|---|
| `news` | Новости и события | WP → Новости |
| `services` | Промо-блоки услуг | WP → Услуги |
| `otzav` | Отзывы | WP → Отзывы |
| `vacancy` | Вакансии | WP → Вакансии |

### WooCommerce
- **Товары:** WP → Товары (тарифы, абонементы, сертификаты, мерч)
- **Заказы:** WP → WooCommerce → Заказы
- **Платежи:** ЮKassa (yookassa_epl gateway включён)
- **Настройки:** WP → WooCommerce → Настройки

---

## 🚀 Деплой и сборка

### Локальный dev
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Сборка
```bash
cd frontend
npm run build        # vite build + prerender 29 HTML
npm run build:no-prerender  # без prerender
node scripts/verify-seo.mjs  # QA: проверка уникальности meta
```

### Деплой на прод (Beget)
**Полный скрипт:** `wiki/projects/termburg/deploy-production.sh`

**Быстрая команда (без скрипта):**
```bash
# 1. Build
cd frontend
npm run build

# 2. Pack без media (картинки уже на сервере)
tar -czf /tmp/termburg-deploy.tar.gz -C build \
  --exclude=images --exclude=video --exclude=pdf .

# 3. Upload
scp -i ~/.ssh/beget_termburg /tmp/termburg-deploy.tar.gz \
  <beget-user>@<beget-user>.beget.tech:~/termburg-deploy.tar.gz

# 4. Extract on server (с очисткой старых JS-чанков)
ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech "
  cd ~/termburg.ru/public_html
  rm -f assets/*.js assets/*.css assets/*.js.map
  tar -xzf ~/termburg-deploy.tar.gz
"
```

⚠️ **Важно:** **НЕ деплоить вручную через FTP/файловый менеджер Beget** — иначе старые JS-чанки накопятся (как было до починки, 14 копий AboutPage). Только через rsync или tar с предварительной очисткой.

### Деплой на staging
```bash
bash deploy.sh        # из корня wiki/projects/termburg/
```
Заливает на `termburg.ceosivaev.ru` (отдельный сервер).

---

## 🗂️ Сервер: структура папок

### `~/termburg.ru/public_html/` (на Beget)
```
public_html/
├── .htaccess              SPA + prerender + 30+ редиректов + защита wp-login
├── index.html             Главная (prerender'енная с уник.meta)
├── about/index.html       Prerender /about
├── pricing/index.html     ...
├── ...                    (29 prerender'енных HTML)
├── assets/                JS, CSS с hash в имени
│   ├── index-*.js
│   ├── AboutPage-*.js     (по одному файлу — после фикса деплоя)
│   ├── vendor-*.js
│   └── ...
├── images/                254 МБ — НЕ перезаливать при обычных деплоях
├── video/                 Видео hero
├── pdf/                   Правила, оферта
├── fonts/                 ikra-slab.woff2
├── favicon.ico, robots.txt, sitemap.xml, manifest.json
│
├── wp-admin/              WordPress админка
├── wp-content/
│   ├── themes/termoistochnik/    ⭐ Кастомная тема
│   │   ├── functions.php
│   │   └── includes/
│   │       ├── theme-setup.php
│   │       ├── post-types.php
│   │       ├── acf-carbon.php
│   │       ├── enqueue.php
│   │       ├── elementor.php
│   │       ├── filters-shortcodes.php
│   │       ├── woocommerce.php
│   │       ├── api-ajax.php                    1С Дельфин endpoints
│   │       ├── termburg-admin-api.php          REST: /pricing, /faq, /team, /schedule, /zones, /promotions, /cafe, /settings
│   │       ├── termburg-admin-api-extra.php    REST: /services-list, /gallery, /termliny, /rules, /certificates
│   │       ├── termburg-page-content.php       ⭐ NEW: REST /page-content/{slug} + ACF Options
│   │       ├── termburg-api.php                Auth: register/login/profile
│   │       ├── termburg-checkout.php           WooCommerce checkout/orders
│   │       ├── termburg-news-sync.php          Авто-импорт Дзен/Telegram (cron 12h)
│   │       ├── termburg-leads.php              Форма partner-inquiry
│   │       ├── reviews-parser.php              Отзывы cron
│   │       ├── admin-cleanup.php               WP-админ UI cleanup
│   │       └── utilities.php
│   ├── plugins/           14 active, 50 inactive, 64 total
│   ├── uploads/           Медиа-библиотека
│   └── languages/
├── wp-includes/
├── wp-config.php
├── wp-index.php           ⚡ Entry для /wp-json/* и /api/*
├── wp-login.php           ⛔ ЗАБЛОКИРОВАН через <Files> в .htaccess
└── (другие wp-*.php стандартные)
```

---

## 🔌 REST API endpoints

Все в namespace `termburg/v1` если не указано иначе.

| Endpoint | Метод | Назначение |
|---|:---:|---|
| `/settings` | GET | Глобальные настройки сайта |
| `/pricing` | GET | Тарифы и абонементы |
| `/services-list` | GET | Услуги (массаж, парения, SPA) |
| `/cafe` | GET | Меню кафе |
| `/faq` | GET | Вопросы-ответы |
| `/schedule` | GET | Расписание парений |
| `/team` | GET | Команда |
| `/zones` | GET | Зоны комплекса |
| `/zones-data` | GET | Зоны (расширенные) |
| `/promotions` | GET | Акции |
| `/gallery` | GET | Фотогалерея |
| `/termliny` | GET | Термлины |
| `/rules` | GET | Правила (137 пунктов) |
| `/certificates` | GET | Сертификаты |
| `/ticker` | GET | Бегущая строка |
| `/images` | GET | Каталог изображений |
| `/reviews-stats` | GET | Статистика отзывов |
| `/page-content/{slug}` | GET | ⭐ Контент страниц (новый ACF) |
| `/auth/register` | POST | Регистрация |
| `/auth/login` | POST | Авторизация |
| `/auth/profile` | GET | Профиль (требует токен) |
| `/checkout/create` | POST | Создание заказа |
| `/checkout/status/{id}` | GET | Статус заказа |
| `/checkout/orders` | GET | История заказов (auth) |
| `/partner-inquiry` | POST | Форма заявки партнёра |
| `/news-sync` | POST | Trigger импорта новостей (cron) |
| `api/v1/exchange/getdata` | GET | 1С Дельфин: получение данных (header `x-api-key`) |
| `api/v1/exchange/setexported` | POST | 1С Дельфин: подтверждение экспорта |

---

## 💾 Бэкапы и откаты

### Что бэкапится
Все бэкапы в `~/backups/` на сервере Beget:
| Файл | Содержимое |
|---|---|
| `wp-db-*.sql` | mysqldump БД WordPress |
| `wp-plugins-pre-update-*.tar.gz` | wp-content/plugins до обновления |
| `htaccess-*.backup` | .htaccess до изменений |
| `index-*.backup` | index.html до изменений |
| `functions-*.backup` | functions.php темы до изменений |
| `assets-list-*.txt` | список файлов в assets/ для аудита |

### Откат БД
```bash
ssh -i ~/.ssh/beget_termburg <beget-user>@<beget-user>.beget.tech
cd ~/termburg.ru/public_html
wp db import ~/backups/wp-db-pre-update-YYYYMMDD-HHMM.sql
```

### Откат фронта
Через staging snapshot или из git репозитория.

---

## ⚠️ Известные ограничения

1. **PHP 7.4** на Beget — `wptelegram` 4.2.12 (новая версия требует PHP 8.0). Текущая работает.
2. **wp-cli warning** "fileperms() failed for index.php" — безобидный, появляется в каждой команде wp-cli.
3. **Beget anti-bot challenge** — при первом запросе к любому URL отдаёт JS-страницу с set-cookie. Браузеры выполняют автоматически. curl без `Cookie: beget=begetok` будет видеть только challenge.
4. **53 неактивных плагина** в wp-content/plugins — не удалены (могут хранить данные). Безопасное удаление — отдельная задача.
5. **Контент в JS на фронте** — страницы tsx по-прежнему имеют хардкод-секции. ACF контент через `usePageContent` подключён, но показывается только если в админке для slug добавлены блоки. Постепенный перенос: WP-админ добавляет блок → удаляется хардкод-секция из tsx.

---

## 📚 Документация в проекте

| Файл | Что внутри |
|---|---|
| `HANDOVER.md` | Этот файл |
| `AUDIT_FIX_REPORT.md` | Отчёт по починке 11 претензий клиента из docx |
| `SITE_STRUCTURE.md` | Подробная карта сайта (500+ строк) |
| `Вопросы_критические_моменты.docx` | Исходный документ с претензиями клиента |
| `wordpress-patches/termburg-page-content.php` | PHP-патч для ACF Options + REST |
| `wordpress-patches/seed-page-content.php` | wp eval-file для заполнения |
| `wordpress-patches/clear-blocks-keep-meta.php` | wp eval-file для очистки блоков |
| `wordpress-patches/PLUGINS_AUDIT.md` | Инструкция аудита WP плагинов |
| `deploy-production.sh` | Production деплой через rsync |
| `frontend/scripts/prerender-meta.mjs` | Post-build prerender статических HTML |
| `frontend/scripts/verify-seo.mjs` | QA verifier для уникальности meta |
| `frontend/scripts/wire-page-content.mjs` | Подключатель usePageContent ко всем 28 страницам |
| `frontend/src/seo/seoConfig.ts` | Централизованный SEO-конфиг 29 маршрутов |

---

## 🆘 Если что-то сломалось

| Симптом | Где смотреть |
|---|---|
| 500 error на странице | `tail ~/termburg.ru/logs/error_log` (если есть) или WP debug.log |
| Все 25 страниц снова с одинаковыми meta | Проверь `.htaccess` — должно быть правило prerender priority. Запусти `node frontend/scripts/verify-seo.mjs` |
| AboutPage снова в 11 копий | Кто-то задеплоил вручную через FTP. На сервере: `cd ~/termburg.ru/public_html && rm -f assets/AboutPage-*.js && tar -xzf ~/termburg-deploy.tar.gz` |
| /wp-login.php снова доступен | Проверь `<Files wp-login.php> Require all denied </Files>` в начале .htaccess |
| Не пускает в админку | Используй **скрытый URL логина** (см. раздел «Доступы»), не /wp-login.php |
| ЮКасса не принимает оплату | WP → WooCommerce → Статус → Логи → yookassa* |
| Формы не отправляются | Проверь `/wp-json/termburg/v1/partner-inquiry` через curl |
| 1С Дельфин не получает данные | Проверь header `x-api-key` в запросе со стороны 1С |
