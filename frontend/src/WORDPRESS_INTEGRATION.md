# WordPress CMS Integration Guide

Этот документ описывает как использовать WordPress CMS для управления контентом сайта Termburg.

## Архитектура

```
┌─────────────────┐     REST API      ┌─────────────────┐
│  React Frontend │ ◄───────────────► │  WordPress CMS  │
│   (Vite/TS)     │                   │  (Headless)     │
└─────────────────┘                   └─────────────────┘
        │                                     │
        │ Fallback                           │
        ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│  Static Data    │                  │  MySQL Database │
│  (data/*.ts)    │                  │                 │
└─────────────────┘                  └─────────────────┘
```

## Быстрый старт

### 1. Настройка WordPress

```bash
cd wordpress
docker-compose up -d
# Откройте http://localhost:8080 и завершите установку
# Активируйте тему "Termburg"
# Установите плагин ACF (Advanced Custom Fields)
```

### 2. Настройка React

Создайте файл `.env` в папке `frontend/`:

```env
VITE_WP_API_URL=http://localhost:8080/wp-json
```

### 3. Использование в компонентах

#### Вариант A: Только WordPress (для production)

```tsx
import { usePromotions, useSchedule, useZones } from '@/hooks/useWordPress';

function PromotionsPage() {
  const { data, loading, error } = usePromotions();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.map(promo => (
        <PromotionCard key={promo.id} {...promo} />
      ))}
    </div>
  );
}
```

#### Вариант B: С fallback на статические данные (рекомендуется для миграции)

```tsx
import { usePromotionsWithFallback } from '@/hooks/useDataWithFallback';

function PromotionsPage() {
  const { data, loading, source } = usePromotionsWithFallback();

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Показать источник данных в dev-режиме */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-400">
          Источник: {source === 'wordpress' ? '📦 CMS' : '📄 Static'}
        </div>
      )}

      {data?.map(promo => (
        <PromotionCard key={promo.id} {...promo} />
      ))}
    </div>
  );
}
```

## Доступные хуки

### Из `useWordPress.ts` (чистый API)

| Hook | Описание |
|------|----------|
| `useServices()` | Услуги по категориям |
| `useServicesFlat()` | Все услуги списком |
| `useSchedule(day?)` | Расписание (можно фильтровать по дню) |
| `usePromotions(showAll?)` | Акции (по умолчанию только активные) |
| `usePricing()` | Цены (будни, выходные, абонементы) |
| `useZones()` | Термальные зоны по категориям |
| `useZonesFlat()` | Все зоны списком |
| `useReviews(limit?, platform?)` | Отзывы |
| `useTeam()` | Команда |
| `useCafeMenu()` | Меню кафе |
| `useSiteSettings()` | Настройки сайта |
| `usePosts(perPage, page)` | Новости/блог |
| `usePost(slug)` | Одна новость |
| `usePage(slug)` | Страница |
| `useContactForm()` | Отправка формы контактов |
| `useBookingForm()` | Отправка формы бронирования |

### Из `useDataWithFallback.ts` (с fallback)

| Hook | Описание |
|------|----------|
| `usePromotionsWithFallback()` | Акции с fallback |
| `useScheduleWithFallback()` | Расписание с fallback |
| `useZonesWithFallback()` | Зоны с fallback |
| `useTeamWithFallback()` | Команда с fallback |
| `usePricingWithFallback()` | Цены с fallback |
| `useAPIStatus()` | Проверка доступности API |

## API Endpoints

### Custom (termburg/v1)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/termburg/v1/services` | GET | Все услуги |
| `/termburg/v1/schedule` | GET | Расписание |
| `/termburg/v1/promotions` | GET | Акции |
| `/termburg/v1/pricing` | GET | Цены |
| `/termburg/v1/zones` | GET | Термальные зоны |
| `/termburg/v1/reviews` | GET | Отзывы |
| `/termburg/v1/team` | GET | Команда |
| `/termburg/v1/cafe` | GET | Меню кафе |
| `/termburg/v1/settings` | GET | Настройки |
| `/termburg/v1/contact` | POST | Форма контактов |
| `/termburg/v1/booking` | POST | Бронирование |

### Стандартные WordPress (wp/v2)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/wp/v2/posts` | GET | Записи (новости) |
| `/wp/v2/pages` | GET | Страницы |

## Пошаговая миграция компонентов

### Шаг 1: Найти компонент, использующий статические данные

```tsx
// До миграции
import { promotions } from '@/data/promotions';

function PromotionsSection() {
  return (
    <div>
      {promotions.map(promo => (
        <Card key={promo.id} title={promo.title} />
      ))}
    </div>
  );
}
```

### Шаг 2: Заменить на хук с fallback

```tsx
// После миграции
import { usePromotionsWithFallback } from '@/hooks';

function PromotionsSection() {
  const { data: promotions, loading } = usePromotionsWithFallback();

  if (loading) return <Skeleton />;

  return (
    <div>
      {promotions?.map(promo => (
        <Card key={promo.id} title={promo.title} />
      ))}
    </div>
  );
}
```

### Шаг 3: После полной миграции - удалить fallback

```tsx
// Production (без fallback)
import { usePromotions } from '@/hooks';

function PromotionsSection() {
  const { data: promotions, loading, error } = usePromotions();

  if (loading) return <Skeleton />;
  if (error) return <ErrorBoundary error={error} />;

  return (
    <div>
      {promotions?.map(promo => (
        <Card key={promo.id} title={promo.title} />
      ))}
    </div>
  );
}
```

## Типы данных

Все типы экспортируются из `@/services/wordpress-api`:

```tsx
import type {
  ServiceItem,
  ScheduleEvent,
  Promotion,
  PricingItem,
  ThermalZone,
  Review,
  TeamMember,
  MenuItem,
} from '@/services/wordpress-api';
```

## Кэширование

API сервис автоматически кэширует ответы на 5 минут. Для сброса кэша:

```tsx
import { clearCache } from '@/services/wordpress-api';

// Например, после успешной отправки формы
clearCache();
```

## Отладка

### Проверить доступность API

```tsx
import { useAPIStatus } from '@/hooks';

function DebugBar() {
  const { available, checked } = useAPIStatus();

  if (!checked) return <span>Проверка API...</span>;

  return (
    <span className={available ? 'text-green-500' : 'text-red-500'}>
      API: {available ? '✓ Online' : '✗ Offline'}
    </span>
  );
}
```

### Логирование в консоль

API сервис автоматически логирует ошибки. Для подробного логирования добавьте в `.env`:

```env
VITE_DEBUG=true
```

## WordPress Admin

### Управление контентом

| Раздел | URL | Описание |
|--------|-----|----------|
| Услуги | `/wp-admin/edit.php?post_type=termburg_service` | SPA, массаж и др. |
| Расписание | `/wp-admin/edit.php?post_type=termburg_schedule` | Мероприятия |
| Акции | `/wp-admin/edit.php?post_type=termburg_promotion` | Скидки и спецпредложения |
| Зоны | `/wp-admin/edit.php?post_type=termburg_zone` | Парные, бассейны |
| Цены | `/wp-admin/edit.php?post_type=termburg_pricing` | Тарифы |
| Команда | `/wp-admin/edit.php?post_type=termburg_team` | Сотрудники |
| Отзывы | `/wp-admin/edit.php?post_type=termburg_review` | Отзывы гостей |
| Кафе | `/wp-admin/edit.php?post_type=termburg_cafe_item` | Меню кафе |

### Настройки темы

Настройки сайта (телефон, адрес, соцсети) в: **Внешний вид → Настроить**
