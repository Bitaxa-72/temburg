import { FastifyInstance } from 'fastify';
import { BookingsService } from './bookings.service.js';
import {
  createBookingSchema,
  updateBookingSchema,
  updateBookingStatusSchema,
  listBookingsQuerySchema,
} from './bookings.schema.js';
import { validateBody, validateQuery } from '../../shared/middleware/validation.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import type { AuthenticatedRequest } from '../../shared/types/index.js';

export async function bookingsRoutes(fastify: FastifyInstance) {
  const bookingsService = new BookingsService();

  // Create booking (authenticated)
  fastify.post(
    '/',
    {
      preHandler: [authenticate, validateBody(createBookingSchema)],
      schema: {
        tags: ['Bookings'],
        description: 'Create a new booking',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const booking = await bookingsService.createBooking(
        request.user.id,
        request.body as any
      );
      return reply.status(201).send({
        success: true,
        data: booking,
      });
    }
  );

  // Get user's bookings
  fastify.get(
    '/',
    {
      preHandler: [authenticate, validateQuery(listBookingsQuerySchema)],
      schema: {
        tags: ['Bookings'],
        description: 'Get user bookings',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const result = await bookingsService.listBookings(
        request.user.id,
        request.query as any
      );
      return reply.send({
        success: true,
        data: result.bookings,
        meta: result.meta,
      });
    }
  );

  // Get all bookings (admin only)
  fastify.get(
    '/all',
    {
      preHandler: [
        authenticate,
        authorize('ADMIN', 'MANAGER'),
        validateQuery(listBookingsQuerySchema),
      ],
      schema: {
        tags: ['Bookings'],
        description: 'Get all bookings (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const result = await bookingsService.listAllBookings(request.query as any);
      return reply.send({
        success: true,
        data: result.bookings,
        meta: result.meta,
      });
    }
  );

  // Get single booking
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Bookings'],
        description: 'Get booking by ID',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const booking = await bookingsService.getBooking(id, request.user.id);
      return reply.send({
        success: true,
        data: booking,
      });
    }
  );

  // Update booking
  fastify.patch(
    '/:id',
    {
      preHandler: [authenticate, validateBody(updateBookingSchema)],
      schema: {
        tags: ['Bookings'],
        description: 'Update booking',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const booking = await bookingsService.updateBooking(
        id,
        request.user.id,
        request.body as any
      );
      return reply.send({
        success: true,
        data: booking,
      });
    }
  );

  // Cancel booking
  fastify.post(
    '/:id/cancel',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Bookings'],
        description: 'Cancel booking',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const booking = await bookingsService.cancelBooking(id, request.user.id);
      return reply.send({
        success: true,
        data: booking,
      });
    }
  );

  // Update booking status (admin only)
  fastify.patch(
    '/:id/status',
    {
      preHandler: [
        authenticate,
        authorize('ADMIN', 'MANAGER'),
        validateBody(updateBookingStatusSchema),
      ],
      schema: {
        tags: ['Bookings'],
        description: 'Update booking status (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const { status } = request.body as any;
      const booking = await bookingsService.updateBookingStatus(id, status);
      return reply.send({
        success: true,
        data: booking,
      });
    }
  );

  // Delete booking (admin only)
  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate, authorize('ADMIN')],
      schema: {
        tags: ['Bookings'],
        description: 'Delete booking (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const result = await bookingsService.deleteBooking(id);
      return reply.send({
        success: true,
        data: result,
      });
    }
  );
}
