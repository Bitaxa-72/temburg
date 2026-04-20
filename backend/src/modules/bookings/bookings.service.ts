import { prisma } from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors.js';
import {
  sendEmail,
  generateBookingConfirmationEmail,
} from '../../shared/utils/email.js';
import type {
  CreateBookingInput,
  UpdateBookingInput,
  ListBookingsQuery,
} from './bookings.schema.js';

export class BookingsService {
  async createBooking(userId: string, data: CreateBookingInput) {
    const bookingDate = new Date(data.date);

    // Check if date is in the future
    if (bookingDate < new Date()) {
      throw new BadRequestError('Cannot book in the past');
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType: data.serviceType,
        serviceName: data.serviceName,
        date: bookingDate,
        time: data.time,
        guests: data.guests,
        duration: data.duration,
        totalPrice: data.totalPrice,
        notes: data.notes,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    // Send confirmation email (non-blocking)
    sendEmail({
      to: booking.user.email,
      subject: 'Бронирование подтверждено - Термбург',
      html: generateBookingConfirmationEmail({
        userName: booking.user.name,
        serviceName: booking.serviceName,
        date: booking.date.toLocaleDateString('ru-RU'),
        time: booking.time,
        totalPrice: booking.totalPrice.toString(),
        bookingId: booking.id,
      }),
    }).catch((error) => {
      console.error('Failed to send booking confirmation email:', error);
    });

    return booking;
  }

  async getBooking(bookingId: string, userId?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // If userId is provided, check ownership
    if (userId && booking.userId !== userId) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  async listBookings(userId: string, query: ListBookingsQuery) {
    const { page, limit, status, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      ...(status && { status }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listAllBookings(query: ListBookingsQuery) {
    const { page, limit, status, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(status && { status }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBooking(
    bookingId: string,
    userId: string,
    data: UpdateBookingInput
  ) {
    const booking = await this.getBooking(bookingId, userId);

    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      throw new BadRequestError('Cannot update cancelled or completed booking');
    }

    if (data.date) {
      const newDate = new Date(data.date);
      if (newDate < new Date()) {
        throw new BadRequestError('Cannot update to a past date');
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(data.date && { date: new Date(data.date) }),
        ...(data.time && { time: data.time }),
        ...(data.guests && { guests: data.guests }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        payment: true,
      },
    });

    return updatedBooking;
  }

  async updateBookingStatus(
    bookingId: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  ) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.getBooking(bookingId, userId);

    if (booking.status === 'CANCELLED') {
      throw new BadRequestError('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestError('Cannot cancel completed booking');
    }

    return this.updateBookingStatus(bookingId, 'CANCELLED');
  }

  async deleteBooking(bookingId: string) {
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return { message: 'Booking deleted successfully' };
  }
}
