/**
 * Прямая интеграция с 1С-Дельфин (Push-модель)
 *
 * Сайт сам отправляет данные о чеках в Дельфин при успешной оплате.
 * Используется как альтернатива pull-модели (exchange endpoints).
 *
 * Для активации: DOLPHIN_DIRECT_URL и DOLPHIN_DIRECT_KEY в .env
 */

import axios, { AxiosInstance } from 'axios';
import { prisma } from '../../config/database.js';

interface DolphinDirectConfig {
  apiUrl: string;
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
}

interface DolphinCheckItem {
  id: string;
  uuid: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  phone: string;
  email: string;
  paidAt: string;
  yookassaId?: string;
}

interface DolphinSendResult {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
}

export class DolphinDirectClient {
  private client: AxiosInstance;
  private config: DolphinDirectConfig;

  constructor(config: DolphinDirectConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
    });
  }

  /**
   * Отправить чек в Дельфин после успешной оплаты
   */
  async sendCheck(item: DolphinCheckItem): Promise<boolean> {
    try {
      const response = await this.client.post('/api/v1/import/check', {
        items: [item],
      });

      if (response.data?.success) {
        await prisma.booking.update({
          where: { id: item.id },
          data: { isExported: true, exportedAt: new Date() },
        });
        console.log(`[Dolphin Direct] Check sent: ${item.id}`);
        return true;
      }

      console.error(`[Dolphin Direct] Failed to send check ${item.id}:`, response.data);
      return false;
    } catch (error) {
      console.error(`[Dolphin Direct] Error sending check ${item.id}:`, error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Отправить чек с retry
   */
  async sendCheckWithRetry(item: DolphinCheckItem): Promise<boolean> {
    const maxRetries = this.config.retryAttempts || 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const success = await this.sendCheck(item);
      if (success) return true;

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`[Dolphin Direct] Retry ${attempt}/${maxRetries} for ${item.id} in ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return false;
  }

  /**
   * Пакетная отправка неэкспортированных заказов
   */
  async sendPendingChecks(limit = 100): Promise<DolphinSendResult> {
    const bookings = await prisma.booking.findMany({
      where: {
        isExported: false,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        user: { select: { phone: true, email: true } },
        payment: { select: { amount: true, yookassaId: true, paidAt: true } },
      },
    });

    const result: DolphinSendResult = {
      success: true,
      sentCount: 0,
      failedCount: 0,
      errors: [],
    };

    for (const booking of bookings) {
      const item: DolphinCheckItem = {
        id: booking.id,
        uuid: booking.id,
        name: booking.serviceName,
        price: Number(booking.totalPrice),
        quantity: booking.guests,
        total: booking.payment ? Number(booking.payment.amount) : Number(booking.totalPrice),
        phone: booking.user.phone || '',
        email: booking.user.email,
        paidAt: booking.payment?.paidAt?.toISOString() || booking.createdAt.toISOString(),
        yookassaId: booking.payment?.yookassaId || undefined,
      };

      const success = await this.sendCheckWithRetry(item);
      if (success) {
        result.sentCount++;
      } else {
        result.failedCount++;
        result.errors.push({ id: booking.id, error: 'Failed after retries' });
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  /**
   * Проверка подключения к Дельфин
   */
  async healthCheck(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      await this.client.get('/api/v1/health', { timeout: 5000 });
      return { connected: true, latency: Date.now() - start };
    } catch (error) {
      return {
        connected: false,
        latency: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton — создаётся только если настроено
let directClient: DolphinDirectClient | null = null;

export function getDolphinDirectClient(): DolphinDirectClient | null {
  if (directClient) return directClient;

  const apiUrl = process.env.DOLPHIN_DIRECT_URL;
  const apiKey = process.env.DOLPHIN_DIRECT_KEY;

  if (!apiUrl || !apiKey) {
    return null;
  }

  directClient = new DolphinDirectClient({
    apiUrl,
    apiKey,
    retryAttempts: 3,
  });

  return directClient;
}

/**
 * Хук для вызова после успешной оплаты.
 * Если прямая интеграция настроена — отправляет чек сразу.
 * Если нет — Дельфин заберёт через pull-эндпоинт.
 */
export async function onPaymentSuccess(bookingId: string): Promise<void> {
  const client = getDolphinDirectClient();
  if (!client) return; // Pull-модель, ничего не делаем

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { phone: true, email: true } },
      payment: { select: { amount: true, yookassaId: true, paidAt: true } },
    },
  });

  if (!booking || !booking.payment) return;

  const item: DolphinCheckItem = {
    id: booking.id,
    uuid: booking.id,
    name: booking.serviceName,
    price: Number(booking.totalPrice),
    quantity: booking.guests,
    total: Number(booking.payment.amount),
    phone: booking.user.phone || '',
    email: booking.user.email,
    paidAt: booking.payment.paidAt?.toISOString() || new Date().toISOString(),
    yookassaId: booking.payment.yookassaId || undefined,
  };

  // Не блокируем основной flow — отправляем асинхронно
  client.sendCheckWithRetry(item).catch((error) => {
    console.error('[Dolphin Direct] Background send failed:', error);
  });
}
