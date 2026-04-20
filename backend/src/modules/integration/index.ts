/**
 * 1С-Дельфин Integration Module
 *
 * Два режима работы:
 * 1. Pull (костыль/рабочий) — Дельфин забирает через GET /api/v1/exchange/getdata
 * 2. Push (прямой) — сайт отправляет при оплате, если DOLPHIN_DIRECT_URL настроен
 *
 * Переключение: добавить DOLPHIN_DIRECT_URL и DOLPHIN_DIRECT_KEY в .env
 * Без них работает только pull-модель.
 */

export { registerDolphinRoutes } from './dolphin.routes.js';
export { onPaymentSuccess, getDolphinDirectClient } from './dolphin-direct.js';
