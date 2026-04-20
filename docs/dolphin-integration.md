# Интеграция с 1С-Дельфин — Реальная схема

## Принцип обмена (Pull-модель)

Сервис Дельфин в офисе **сам забирает** данные о заказах с сайта. Не сайт отправляет.

### Шаг 1: Дельфин запрашивает данные
```
GET /api/v1/exchange/getdata
Headers:
  x-api-key: <секретный ключ>
  Authorization: Basic <base64(login:password)>
```

Сайт возвращает до 500 неэкспортированных заказов (статусы: "выполнен", "обработка"), отсортированных по дате создания.

### Шаг 2: Дельфин подтверждает импорт
```
POST /api/v1/exchange/setexported
Headers:
  x-api-key: <секретный ключ>
  Authorization: Basic <base64(login:password)>
Body: JSON с массивом id+uuid
```

Сайт помечает заказы как экспортированные (`isExported = true`).

## Формат JSON

### Ответ getdata (данные о проданных товарах):
```json
{
  "items": [
    {
      "id": 1,
      "uuid": "39427a5f-d510-49e9-a024-3bea9004abaa",
      "name": "Посещение 3 часа",
      "price": 560,
      "quantity": 1,
      "total": 560,
      "phone": "XXX-XXX-XXX",
      "email": "xxx@xxx.xx"
    },
    {
      "id": 2,
      "uuid": "69280a5f-d510-49e9-a024-3bea9004abaa",
      "name": "Посещение 3 часа",
      "price": 560,
      "quantity": 1,
      "total": 560,
      "phone": "XXX-XXX-XXX",
      "email": "xxx@xxx.xx"
    }
  ]
}
```

### Ответ Дельфин (подтверждение импорта):
```json
{
  "items": [
    {
      "id": 1,
      "uuid": "39427a5f-d510-49e9-a024-3bea9004abaa",
      "errorcode": 0,
      "errormessage": ""
    },
    {
      "id": 2,
      "uuid": "69280a5f-d510-49e9-a024-3bea9004abaa",
      "errorcode": 0,
      "errormessage": ""
    }
  ]
}
```

## Безопасность
- HTTPS
- API Key в заголовке `x-api-key`
- Basic Authentication (логин + пароль)

## Поле в БД
- `isExported` (boolean) + индекс — в таблице заказов/платежей
- При успешном ответе от Дельфин → `isExported = true`

## Статусы заказов для экспорта
- "выполнен" (COMPLETED)
- "обработка" (PROCESSING)
- НЕ включать "ожидает оплаты" (PENDING)
