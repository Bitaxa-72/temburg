/**
 * 1С-Дельфин Exchange Routes (Pull-модель)
 *
 * Дельфин забирает неэкспортированные заказы через GET,
 * затем подтверждает импорт через POST.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../config/database.js';

const EXCHANGE_API_KEY = process.env.DOLPHIN_API_KEY || '';
const EXCHANGE_LIMIT = 500;

/**
 * Verify API key + Basic Auth
 */
function verifyExchangeAuth(request: FastifyRequest, reply: FastifyReply): boolean {
  const apiKey = request.headers['x-api-key'];
  if (!apiKey || apiKey !== EXCHANGE_API_KEY) {
    reply.status(401).send({ success: false, error: 'Invalid API key' });
    return false;
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    reply.status(401).send({ success: false, error: 'Basic auth required' });
    return false;
  }

  const basicUser = process.env.DOLPHIN_BASIC_USER;
  const basicPass = process.env.DOLPHIN_BASIC_PASS;

  if (!basicUser || !basicPass) {
    reply.status(401).send({ success: false, error: 'Exchange auth not configured' });
    return false;
  }
  const expected = Buffer.from(`${basicUser}:${basicPass}`).toString('base64');
  const provided = authHeader.slice(6);

  if (provided !== expected) {
    reply.status(401).send({ success: false, error: 'Invalid credentials' });
    return false;
  }

  return true;
}

/**
 * GET /api/v1/exchange/getdata
 * Дельфин забирает неэкспортированные заказы
 */
async function handleGetData(request: FastifyRequest, reply: FastifyReply) {
  if (!verifyExchangeAuth(request, reply)) return;

  const bookings = await prisma.booking.findMany({
    where: {
      isExported: false,
      status: { in: ['COMPLETED', 'CONFIRMED', 'PENDING'] },
    },
    orderBy: { createdAt: 'asc' },
    take: EXCHANGE_LIMIT,
    include: {
      user: {
        select: { phone: true, email: true },
      },
      payment: {
        select: { amount: true },
      },
    },
  });

  const items = bookings.map((b) => ({
    id: b.id,
    uuid: b.id,
    name: b.serviceName,
    price: Number(b.totalPrice),
    quantity: b.guests,
    total: b.payment ? Number(b.payment.amount) : Number(b.totalPrice),
    phone: b.user.phone || '',
    email: b.user.email,
  }));

  reply.send({ items });
}

const setExportedSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      uuid: z.string(),
      errorcode: z.number(),
      errormessage: z.string().optional(),
    })
  ),
});

/**
 * POST /api/v1/exchange/setexported
 * Дельфин подтверждает импорт заказов
 */
async function handleSetExported(request: FastifyRequest, reply: FastifyReply) {
  if (!verifyExchangeAuth(request, reply)) return;

  const body = setExportedSchema.parse(request.body);

  const successIds = body.items
    .filter((item) => item.errorcode === 0)
    .map((item) => item.id);

  if (successIds.length > 0) {
    await prisma.booking.updateMany({
      where: { id: { in: successIds } },
      data: {
        isExported: true,
        exportedAt: new Date(),
      },
    });
  }

  const failedItems = body.items.filter((item) => item.errorcode !== 0);
  if (failedItems.length > 0) {
    console.warn('[Dolphin] Some items failed to import:', failedItems);
  }

  reply.send({
    success: true,
    exported: successIds.length,
    failed: failedItems.length,
  });
}

/**
 * GET /api/v1/exchange/status
 * Статус интеграции (для админки)
 */
async function handleExchangeStatus(request: FastifyRequest, reply: FastifyReply) {
  if (!verifyExchangeAuth(request, reply)) return;

  const [pendingCount, exportedCount, totalCount] = await Promise.all([
    prisma.booking.count({
      where: { isExported: false, status: { in: ['COMPLETED', 'CONFIRMED', 'PENDING'] } },
    }),
    prisma.booking.count({ where: { isExported: true } }),
    prisma.booking.count(),
  ]);

  reply.send({
    success: true,
    status: {
      pendingExport: pendingCount,
      exported: exportedCount,
      total: totalCount,
      configured: !!EXCHANGE_API_KEY,
    },
  });
}

/**
 * Register exchange routes
 */
export async function registerDolphinRoutes(app: FastifyInstance): Promise<void> {
  if (!EXCHANGE_API_KEY) {
    app.log.warn('[Dolphin] DOLPHIN_API_KEY not set — exchange endpoints disabled');
  } else {
    app.get('/api/v1/exchange/getdata', handleGetData);
    app.post('/api/v1/exchange/setexported', handleSetExported);
  }

  app.get('/api/v1/exchange/status', handleExchangeStatus);

  app.log.info('[Dolphin] Exchange routes registered');
}

export const dolphinRouteSchemas = {};
