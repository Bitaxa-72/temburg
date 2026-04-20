# Termburg

Сайт **termburg.ru** — продакшн-репозиторий для команды поддержки.

**Production:** https://termburg.ru
**Staging:** https://termburg.ceosivaev.ru
**Старый сайт:** https://old.termburg.ru (закрыт от индексации)

## Архитектура

```
Браузер → Apache (Beget) ─┬─► React SPA (Vite + Tailwind)  — витрина
                          └─► WordPress (headless CMS)     — контент, заказы
                                │
                                ├─ WooCommerce + ЮKassa   — оплаты
                                ├─ ACF Pro               — поля страниц/услуг
                                └─ REST pull              — 1С Дельфин
```

Node/Fastify-бэкенд (`backend/`) — альтернативный API-слой для будущего перехода
с WP-API на собственный бэк. Пока не в проде; схема Prisma готова.

## Структура репо

| Каталог | Назначение |
|---|---|
| `frontend/` | React SPA (Vite, TypeScript, Tailwind) |
| `backend/` | Node/Fastify + Prisma (готов, но не задеплоен) |
| `wp-theme-includes/` | Продакшн-PHP из темы `termoistochnik/includes/` |
| `wp-theme-includes/_migration-scripts/` | Исторические one-off скрипты (не запускать без причины) |
| `wordpress-patches/` | Патчи WP-контента (ACF + REST) |
| `server/` | Server-side утилиты (fetch-news.js) |
| `scripts/` | Вспомогательные CLI |
| `docs/` | Доп. документация (Dolphin, WP-структура) |
| `deploy-production.sh` | Полный продакшн-деплой (rsync + snapshot + smoke-test) |
| `deploy.sh` | Staging-деплой |
| `nginx-*.conf` | Конфиги nginx (staging / редиректы) |
| `HANDOVER.md` | **Главный документ** — доступы, деплой, API, траблшут |
| `SITE_STRUCTURE.md` | Подробная карта сайта (все 29 маршрутов) |
| `AUDIT_FIX_REPORT.md` | Отчёт по починке 11 претензий клиента |

## Быстрый старт (локальная разработка)

```bash
# Frontend
cd frontend
npm ci
cp .env.example .env      # подправьте при необходимости
npm run dev               # http://localhost:5173

# Backend (опционально, не в проде)
cd backend
npm ci
cp .env.example .env      # обязательно заполнить DATABASE_URL, JWT_SECRET, YOOKASSA_*
npx prisma migrate dev
npm run dev               # http://localhost:3001
```

## Продакшн-деплой

См. `HANDOVER.md`, раздел «Деплой и сборка».

Кратко:
```bash
cp deploy.env.example deploy.env
# заполните deploy.env: SSH_USER, SSH_HOST, REMOTE_DIR
bash deploy-production.sh
```

## 🔐 Секреты и доступы

**В этом репозитории нет реальных логинов, паролей или ключей.** Всё конфиденциальное
получайте у владельца через парольный менеджер команды:

- WP admin (скрытый URL логина, логин, пароль)
- Beget SSH (логин, приватный ключ)
- YooKassa Shop ID + Secret Key
- DB URL, JWT secret, SMTP пароль
- 1С-Дельфин API key

Плейсхолдеры и структура env-переменных:
- `backend/.env.example`
- `frontend/.env.example`
- `deploy.env.example`

**Важно:**
- `.htaccess` во `frontend/public/.htaccess` содержит плейсхолдер `HIDDEN_LOGIN_SLUG`
  для rewrite-правила скрытого URL логина. Перед деплоем замените на реальный slug,
  совпадающий с настройкой плагина **WPS Hide Login**. Реальное значение — только в пароль-менеджере.
- Если репозиторий стал публичным после того, как в истории засветился реальный slug
  или пароль — немедленно смените slug и пароли.

## Контакты

- Владелец / Tech Lead: см. внутреннюю документацию
- Вопросы по коду: issues в этом репозитории
