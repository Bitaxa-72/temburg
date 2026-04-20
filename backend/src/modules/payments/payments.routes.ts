import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string; role: string };
    user: { id: string; email: string; role: string };
  }
}
import { PaymentsService } from './payments.service.js';
import {
  createPaymentSchema,
  paymentWebhookSchema,
  refundSchema,
  CreatePaymentInput,
  PaymentWebhookInput,
  RefundInput,
} from './payments.schema.js';
import { authenticate, requireRole } from '../../shared/middleware/auth.js';
import { validateBody } from '../../shared/middleware/validation.js';
import { BadRequestError } from '../../shared/utils/errors.js';

const paymentsService = new PaymentsService();

export async function paymentsRoutes(fastify: FastifyInstance) {
  // Create payment
  fastify.post<{
    Body: CreatePaymentInput;
  }>(
    '/',
    {
      preHandler: [authenticate, validateBody(createPaymentSchema)],
      schema: {
        description: 'Create a new payment for a booking',
        tags: ['payments'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['amount', 'description', 'bookingId'],
          properties: {
            amount: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            bookingId: { type: 'string' },
            returnUrl: { type: 'string', format: 'uri' },
            metadata: { type: 'object' },
          },
        },
        response: {
          201: {
            description: 'Payment created successfully',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  bookingId: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  paymentUrl: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CreatePaymentInput }>,
      reply: FastifyReply
    ) => {
      const userId = request.user!.id;
      const payment = await paymentsService.createPayment(userId, request.body);

      return reply.status(201).send({
        success: true,
        data: {
          id: payment.id,
          bookingId: payment.bookingId,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          paymentUrl: payment.paymentUrl,
          createdAt: payment.createdAt,
        },
      });
    }
  );

  // Get payment status
  fastify.get<{
    Params: { id: string };
  }>(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get payment status by ID',
        tags: ['payments'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Payment details',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  bookingId: { type: 'string' },
                  amount: { type: 'number' },
                  currency: { type: 'string' },
                  status: { type: 'string' },
                  yookassaId: { type: 'string' },
                  paymentUrl: { type: 'string' },
                  paidAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  booking: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      serviceName: { type: 'string' },
                      date: { type: 'string', format: 'date-time' },
                      time: { type: 'string' },
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = request.user!.id;
      const userRole = request.user!.role;

      // Admins can view any payment, users only their own
      const payment = await paymentsService.getPaymentStatus(
        request.params.id,
        userRole === 'ADMIN' ? undefined : userId
      );

      return reply.send({
        success: true,
        data: {
          id: payment.id,
          bookingId: payment.bookingId,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status,
          yookassaId: payment.yookassaId,
          paymentUrl: payment.paymentUrl,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          booking: {
            id: payment.booking.id,
            serviceName: payment.booking.serviceName,
            date: payment.booking.date,
            time: payment.booking.time,
            status: payment.booking.status,
          },
        },
      });
    }
  );

  // YooKassa webhook handler
  fastify.post<{
    Body: PaymentWebhookInput;
  }>(
    '/webhook',
    {
      schema: {
        description: 'Handle YooKassa payment webhooks',
        tags: ['payments'],
        hide: true, // Hide from Swagger UI
        body: {
          type: 'object',
        },
        response: {
          200: {
            description: 'Webhook processed',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: PaymentWebhookInput }>,
      reply: FastifyReply
    ) => {
      try {
        // Validate webhook data
        const webhookData = paymentWebhookSchema.parse(request.body);

        // Get signature from headers if present
        const signature = request.headers['x-yookassa-signature'] as
          | string
          | undefined;

        // Process webhook
        await paymentsService.handleWebhook(webhookData, signature);

        return reply.send({ success: true });
      } catch (error) {
        // Log error but return 200 to avoid retry storms
        console.error('Webhook processing error:', error);

        if (error instanceof BadRequestError) {
          // Only return error for invalid signatures
          return reply.status(400).send({
            success: false,
            error: {
              code: 'INVALID_WEBHOOK',
              message: error.message,
            },
          });
        }

        // Return 200 for other errors to prevent retries
        return reply.send({ success: true });
      }
    }
  );

  // Refund payment (admin only)
  fastify.post<{
    Params: { id: string };
    Body: RefundInput;
  }>(
    '/:id/refund',
    {
      preHandler: [authenticate, requireRole('ADMIN'), validateBody(refundSchema)],
      schema: {
        description: 'Refund a payment (admin only)',
        tags: ['payments'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0 },
            reason: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Refund processed successfully',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  payment: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      status: { type: 'string' },
                    },
                  },
                  refund: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      payment_id: { type: 'string' },
                      status: { type: 'string' },
                      amount: {
                        type: 'object',
                        properties: {
                          value: { type: 'string' },
                          currency: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: RefundInput }>,
      reply: FastifyReply
    ) => {
      const result = await paymentsService.refundPayment(
        request.params.id,
        request.body
      );

      return reply.send({
        success: true,
        data: result,
      });
    }
  );
}
