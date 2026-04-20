# 1C-Дельфін (Bitrix) Integration Module

Интеграция с системой управления spa-бизнесом 1C-Дельфін для синхронизации бронирований, платежей и каталога услуг.

## Содержание

- [Архитектура](#архитектура)
- [Установка](#установка)
- [Конфигурация](#конфигурация)
- [API Endpoints](#api-endpoints)
- [Webhooks](#webhooks)
- [Синхронизация данных](#синхронизация-данных)
- [Обработка ошибок](#обработка-ошибок)
- [Примеры использования](#примеры-использования)
- [Тестирование](#тестирование)

---

## Архитектура

Модуль состоит из 4 основных компонентов:

```
integration/
├── dolphin.types.ts      # TypeScript типы и маппинги
├── dolphin.client.ts     # REST API клиент
├── dolphin.service.ts    # Бизнес-логика интеграции
├── dolphin.routes.ts     # HTTP endpoints
└── index.ts              # Экспорты модуля
```

### Компоненты

**1. DolphinClient** (`dolphin.client.ts`)
- REST API клиент для взаимодействия с 1C-Дельфін
- Автоматические повторные попытки при сбоях
- Логирование запросов и ответов
- Обработка таймаутов

**2. DolphinIntegrationService** (`dolphin.service.ts`)
- Маппинг данных между нашими моделями и форматом 1C
- Асинхронная очередь синхронизации
- Обработка webhook событий
- Конфликт-резолюция

**3. Routes** (`dolphin.routes.ts`)
- HTTP endpoints для управления интеграцией
- Webhook endpoint для приема событий от 1C
- Admin endpoints для ручной синхронизации

---

## Установка

### 1. Настройка окружения

Добавьте переменные в `.env`:

```bash
# 1C-Дельфін Integration
DOLPHIN_API_URL=https://your-1c-server.com/api
DOLPHIN_API_KEY=your-api-key-here
DOLPHIN_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Регистрация маршрутов

В `src/index.ts` или главном файле приложения:

```typescript
import { registerDolphinRoutes } from './modules/integration/index.js';

// После создания Fastify app
await registerDolphinRoutes(app);
```

### 3. Настройка Fastify декораторов

Модуль использует `app.authenticate` и `app.requireRole`. Убедитесь, что они определены:

```typescript
// Middleware аутентификации
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// Middleware проверки ролей
app.decorate('requireRole', (roles: string[]) => {
  return async (request, reply) => {
    const user = request.user as any;
    if (!roles.includes(user.role)) {
      reply.status(403).send({ error: 'Forbidden' });
    }
  };
});
```

---

## Конфигурация

### API Client Configuration

```typescript
import { createDolphinClient } from './modules/integration';

// Создание клиента с custom настройками
const client = createDolphinClient({
  timeout: 60000,        // 60 seconds
  retryAttempts: 5,      // 5 попыток
  retryDelay: 2000,      // 2 seconds между попытками
});
```

### Webhook Configuration

В административной панели 1C-Дельфін настройте webhook:

- **URL**: `https://your-domain.com/api/integration/dolphin/webhook`
- **Secret**: Значение из `DOLPHIN_WEBHOOK_SECRET`
- **События**: Выберите необходимые события (booking.*, payment.*, etc.)

---

## API Endpoints

### 1. Webhook Handler

**Endpoint**: `POST /api/integration/dolphin/webhook`
**Auth**: Public (signature-verified)
**Описание**: Принимает события от 1C-Дельфін

**Request Body**:
```json
{
  "type": "booking.updated",
  "timestamp": "2025-03-25T12:00:00Z",
  "data": {
    "booking": {
      "externalId": "clx123456",
      "status": "CONFIRMED",
      ...
    }
  },
  "signature": "hmac-sha256-signature"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

---

### 2. Manual Sync

**Endpoint**: `POST /api/integration/dolphin/sync`
**Auth**: Required (Admin/Manager)
**Описание**: Ручной запуск синхронизации

**Request Body**:
```json
{
  "entityType": "booking",  // booking | payment | customer | all
  "entityId": "clx123456"   // optional, для синхронизации одной записи
}
```

**Response**:
```json
{
  "success": true,
  "message": "Booking clx123456 queued for sync"
}
```

**Примеры использования**:

```bash
# Синхронизация одного бронирования
curl -X POST https://api.termburg.ru/api/integration/dolphin/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"booking","entityId":"clx123456"}'

# Полная синхронизация всех данных
curl -X POST https://api.termburg.ru/api/integration/dolphin/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"all"}'
```

---

### 3. Health Check

**Endpoint**: `GET /api/integration/dolphin/status`
**Auth**: Required (Admin/Manager)
**Описание**: Проверка состояния интеграции

**Response**:
```json
{
  "success": true,
  "status": {
    "healthy": true,
    "lastSync": "2025-03-25T12:00:00Z",
    "pendingJobs": 5,
    "failedJobs": 0,
    "apiConnected": true
  }
}
```

---

### 4. Services Catalog

**Endpoint**: `GET /api/integration/dolphin/services`
**Auth**: Required (Admin/Manager)
**Описание**: Получение каталога услуг из 1C

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "service-123",
      "type": "MASSAGE",
      "name": "Классический массаж",
      "description": "60 минут релаксации",
      "duration": 60,
      "price": 3500,
      "active": true
    }
  ]
}
```

---

### 5. Schedule

**Endpoint**: `GET /api/integration/dolphin/schedule`
**Auth**: Required
**Описание**: Получение расписания из 1C

**Query Parameters**:
- `date` - Конкретная дата (YYYY-MM-DD)
- `dateFrom` - Дата начала диапазона
- `dateTo` - Дата окончания диапазона

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule-1",
      "resourceId": "room-1",
      "resourceName": "Массажный кабинет №1",
      "date": "2025-03-26",
      "slots": [
        {
          "startTime": "10:00",
          "endTime": "11:00",
          "available": true
        },
        {
          "startTime": "11:00",
          "endTime": "12:00",
          "available": false,
          "reason": "Забронировано"
        }
      ],
      "serviceIds": ["service-123", "service-456"]
    }
  ]
}
```

---

## Webhooks

### Поддерживаемые события

| Событие | Описание |
|---------|----------|
| `booking.created` | Создано новое бронирование |
| `booking.updated` | Обновлено бронирование |
| `booking.cancelled` | Отменено бронирование |
| `booking.completed` | Завершено бронирование |
| `payment.succeeded` | Успешная оплата |
| `payment.failed` | Ошибка оплаты |
| `service.updated` | Обновлена услуга в каталоге |
| `schedule.updated` | Обновлено расписание |
| `customer.updated` | Обновлены данные клиента |

### Обработка webhook

```typescript
import { dolphinService } from './modules/integration';

// В вашем webhook handler
const event = {
  type: 'booking.updated',
  timestamp: new Date().toISOString(),
  data: { booking: {...} },
  signature: 'hmac-signature',
};

await dolphinService.processWebhook(event);
```

---

## Синхронизация данных

### Автоматическая синхронизация

Используйте события в вашем коде для автоматической синхронизации:

**При создании бронирования**:
```typescript
import { dolphinService } from './modules/integration';

// После создания бронирования
const booking = await bookingsService.createBooking(userId, data);

// Добавить в очередь синхронизации
await dolphinService.queueBookingSync(booking.id);
```

**При обновлении платежа**:
```typescript
// После обновления статуса платежа
await dolphinService.queuePaymentSync(payment.id);
```

**При регистрации пользователя**:
```typescript
// После создания пользователя
await dolphinService.queueCustomerSync(user.id);
```

### Ручная синхронизация

```typescript
import { dolphinService } from './modules/integration';

// Полная синхронизация (batch)
const result = await dolphinService.triggerFullSync();
console.log(`Queued ${result.stats.bookingsQueued} bookings`);

// Синхронизация конкретной записи
await dolphinService.queueBookingSync('booking-id');
await dolphinService.queuePaymentSync('payment-id');
await dolphinService.queueCustomerSync('user-id');
```

---

## Обработка ошибок

### Retry Logic

Клиент автоматически повторяет запросы при сбоях:
- Количество попыток: 3 (по умолчанию)
- Задержка: 1 секунда с экспоненциальным увеличением
- Не повторяются: 400, 401, 403 ошибки

### Error Handling

```typescript
try {
  await dolphinService.syncBookingToDolphin(booking);
} catch (error) {
  console.error('Sync failed:', error);

  // Логирование в базу данных
  await prisma.integrationLog.create({
    data: {
      type: 'ERROR',
      entity: 'booking',
      entityId: booking.id,
      error: error.message,
    },
  });

  // Отправка уведомления администратору
  await sendAdminNotification({
    subject: '1C Integration Error',
    message: `Failed to sync booking ${booking.id}: ${error.message}`,
  });
}
```

### Мониторинг

Рекомендуется настроить мониторинг:

```typescript
// Проверка здоровья каждые 5 минут
setInterval(async () => {
  const status = await dolphinService.getHealthStatus();

  if (!status.healthy) {
    console.error('1C Integration is unhealthy:', status.error);
    // Отправить alert
  }

  if (status.pendingJobs > 100) {
    console.warn('High number of pending sync jobs:', status.pendingJobs);
    // Отправить warning
  }
}, 5 * 60 * 1000);
```

---

## Примеры использования

### Пример 1: Синхронизация при создании бронирования

```typescript
// В bookings.service.ts
import { dolphinService } from '../integration';

async createBooking(userId: string, data: CreateBookingInput) {
  // Создание бронирования
  const booking = await prisma.booking.create({
    data: { ...data, userId, status: 'PENDING' },
    include: { user: true },
  });

  // Асинхронная синхронизация с 1C
  dolphinService.queueBookingSync(booking.id)
    .catch(error => {
      console.error('Failed to queue booking sync:', error);
    });

  return booking;
}
```

### Пример 2: Получение доступного расписания

```typescript
// В schedule.routes.ts
import { dolphinService } from '../integration';

app.get('/api/schedule/available', async (request, reply) => {
  const { date } = request.query;

  // Получить расписание из 1C
  const schedule = await dolphinService.getSchedule({ date });

  // Фильтровать доступные слоты
  const availableSlots = schedule
    .flatMap(s => s.slots)
    .filter(slot => slot.available);

  return { success: true, data: availableSlots };
});
```

### Пример 3: Синхронизация каталога услуг

```typescript
// В admin.service.ts
import { dolphinService } from '../integration';

async syncServicesCatalog() {
  // Получить услуги из 1C
  const services = await dolphinService.syncServicesCatalog();

  // Обновить локальную базу данных
  for (const service of services) {
    await prisma.service.upsert({
      where: { externalId: service.id },
      create: {
        externalId: service.id,
        type: service.type,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        active: service.active,
      },
      update: {
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        active: service.active,
      },
    });
  }

  return { synced: services.length };
}
```

---

## Тестирование

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { DolphinClient } from './dolphin.client';

describe('DolphinClient', () => {
  it('should sync booking successfully', async () => {
    const client = new DolphinClient({
      apiUrl: 'https://test.com/api',
      apiKey: 'test-key',
    });

    const booking = {
      externalId: 'test-123',
      customerId: 'user-123',
      serviceType: 'MASSAGE',
      // ...
    };

    const response = await client.syncBooking(booking);
    expect(response.success).toBe(true);
  });
});
```

### Integration Tests

```bash
# Тестирование webhook endpoint
curl -X POST http://localhost:3000/api/integration/dolphin/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "booking.updated",
    "timestamp": "2025-03-25T12:00:00Z",
    "data": {"booking": {...}},
    "signature": "test-signature"
  }'
```

### Manual Testing

```typescript
// В test.ts
import { dolphinService } from './modules/integration';

async function test() {
  // Проверка подключения
  const status = await dolphinService.getHealthStatus();
  console.log('Status:', status);

  // Тестовая синхронизация
  await dolphinService.queueBookingSync('clx123456');

  console.log('Test completed');
}

test().catch(console.error);
```

---

## Production Deployment

### Checklist

- [ ] Настроены все переменные окружения
- [ ] Webhook URL зарегистрирован в 1C-Дельфін
- [ ] Webhook secret настроен и защищен
- [ ] Настроен мониторинг интеграции
- [ ] Настроены алерты при ошибках
- [ ] Протестированы все endpoints
- [ ] Проверена обработка ошибок
- [ ] Настроено логирование

### Рекомендации

1. **Используйте очередь на основе Redis** (Bull/BullMQ) вместо in-memory очереди для production
2. **Настройте rate limiting** для webhook endpoint
3. **Логируйте все события** синхронизации для аудита
4. **Мониторьте производительность** и размер очереди
5. **Настройте backup** стратегию при сбоях 1C

---

## Поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Проверьте health status endpoint
3. Проверьте настройки webhook в 1C
4. Проверьте переменные окружения
5. Обратитесь к документации 1C-Дельфін API

---

## Changelog

### v1.0.0 (2025-03-25)
- Начальная версия
- REST API client
- Async sync queue
- Webhook handling
- Admin endpoints
