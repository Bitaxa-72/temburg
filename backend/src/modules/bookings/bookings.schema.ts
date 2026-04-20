import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceType: z.enum(['MASSAGE', 'SPA', 'SAUNA', 'HAMMAM', 'PACKAGE', 'EVENT']),
  serviceName: z.string().min(1, 'Service name is required'),
  date: z.string().datetime('Invalid date format'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  guests: z.number().int().min(1).max(20).default(1),
  duration: z.number().int().min(30).max(480).default(60),
  totalPrice: z.number().positive('Price must be positive'),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  date: z.string().datetime('Invalid date format').optional(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  guests: z.number().int().min(1).max(20).optional(),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
});

export const listBookingsQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default('10'),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
