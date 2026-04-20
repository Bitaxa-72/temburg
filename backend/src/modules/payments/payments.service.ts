import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors.js';
import { yookassaClient, YooKassaApiError } from './yookassa.client.js';
import { onPaymentSuccess } from '../integration/dolphin-direct.js';

import type {
  CreatePaymentInput,
  PaymentWebhookInput,
  RefundInput,
  YooKassaPaymentResponse,
} from './payments.schema.js';
import crypto from 'crypto';

export class PaymentsService {
  /**
   * Create a new payment for a booking
   */
  async createPayment(userId: string, data: CreatePaymentInput) {
    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestError('Booking does not belong to this user');
    }

    if (booking.payment) {
      // Payment already exists - check status
      if (
        booking.payment.status === 'SUCCEEDED' ||
        booking.payment.status === 'PROCESSING'
      ) {
        throw new BadRequestError('Payment already exists for this booking');
      }
    }

    // Validate amount matches booking
    if (Math.abs(data.amount - Number(booking.totalPrice)) > 0.01) {
      throw new BadRequestError('Payment amount does not match booking total');
    }

    try {
      // Create payment via YooKassa
      const yookassaPayment = await yookassaClient.createPayment(
        {
          amount: {
            value: data.amount.toFixed(2),
            currency: 'RUB',
          },
          description: data.description,
          confirmation: {
            type: 'redirect',
            return_url: data.returnUrl || env.YOOKASSA_RETURN_URL,
          },
          capture: true,
          metadata: {
            bookingId: data.bookingId,
            userId: userId,
            ...data.metadata,
          },
        },
        `payment-${data.bookingId}-${Date.now()}`
      );

      // Save payment to database
      const payment = await prisma.payment.upsert({
        where: { bookingId: data.bookingId },
        create: {
          bookingId: data.bookingId,
          amount: data.amount,
          currency: 'RUB',
          status: this.mapYooKassaStatus(yookassaPayment.status),
          yookassaId: yookassaPayment.id,
          paymentUrl: yookassaPayment.confirmation?.confirmation_url,
          metadata: yookassaPayment.metadata,
        },
        update: {
          amount: data.amount,
          status: this.mapYooKassaStatus(yookassaPayment.status),
          yookassaId: yookassaPayment.id,
          paymentUrl: yookassaPayment.confirmation?.confirmation_url,
          metadata: yookassaPayment.metadata,
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return payment;
    } catch (error) {
      if (error instanceof YooKassaApiError) {
        throw new BadRequestError(
          'Payment creation failed. Please try again.'
        );
      }
      throw error;
    }
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string, userId?: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // If userId provided, verify ownership
    if (userId && payment.booking.userId !== userId) {
      throw new NotFoundError('Payment not found');
    }

    // Sync with YooKassa if payment is not final
    if (
      payment.yookassaId &&
      (payment.status === 'PENDING' || payment.status === 'PROCESSING')
    ) {
      try {
        const yookassaPayment = await yookassaClient.getPayment(
          payment.yookassaId
        );

        // Update local status if changed
        const newStatus = this.mapYooKassaStatus(yookassaPayment.status);
        if (newStatus !== payment.status) {
          const updatedPayment = await this.updatePaymentStatus(
            payment.id,
            yookassaPayment
          );
          return updatedPayment;
        }
      } catch (error) {
        console.error('Failed to sync payment status with YooKassa:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    return payment;
  }

  /**
   * Handle YooKassa webhook event
   */
  async handleWebhook(
    webhookData: PaymentWebhookInput,
    signature?: string
  ): Promise<void> {
    // Verify webhook signature if secret is configured
    if (env.YOOKASSA_WEBHOOK_SECRET) {
      if (!signature) {
        throw new BadRequestError('Missing webhook signature');
      }
      const isValid = this.verifyWebhookSignature(
        JSON.stringify(webhookData),
        signature
      );
      if (!isValid) {
        throw new BadRequestError('Invalid webhook signature');
      }
    }

    const { event, object: paymentObject } = webhookData;

    // Find payment by YooKassa ID
    const payment = await prisma.payment.findUnique({
      where: { yookassaId: paymentObject.id },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      console.warn(
        `Webhook received for unknown payment: ${paymentObject.id}`
      );
      return;
    }

    // Handle different event types
    switch (event) {
      case 'payment.succeeded':
        await this.handlePaymentSucceeded(payment.id, paymentObject as any);
        break;

      case 'payment.waiting_for_capture':
        await this.updatePaymentStatus(payment.id, paymentObject as any);
        break;

      case 'payment.canceled':
        await this.handlePaymentCanceled(payment.id, paymentObject as any);
        break;

      case 'refund.succeeded':
        await this.handleRefundSucceeded(payment.id, paymentObject as any);
        break;

      default:
        console.warn(`Unhandled webhook event: ${event}`);
    }
  }

  /**
   * Process a refund
   */
  async refundPayment(paymentId: string, data: RefundInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestError('Can only refund succeeded payments');
    }

    if (!payment.yookassaId) {
      throw new BadRequestError('Payment has no YooKassa ID');
    }

    const refundAmount = data.amount || Number(payment.amount);

    if (refundAmount > Number(payment.amount)) {
      throw new BadRequestError('Refund amount exceeds payment amount');
    }

    try {
      const refund = await yookassaClient.createRefund(
        {
          payment_id: payment.yookassaId,
          amount: {
            value: refundAmount.toFixed(2),
            currency: payment.currency,
          },
          description: data.reason,
        },
        `refund-${paymentId}-${Date.now()}`
      );

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' },
      });

      return {
        payment: updatedPayment,
        refund,
      };
    } catch (error) {
      if (error instanceof YooKassaApiError) {
        throw new BadRequestError(
          'Refund processing failed. Please try again.'
        );
      }
      throw error;
    }
  }

  /**
   * Map YooKassa payment status to our internal status
   */
  private mapYooKassaStatus(
    yookassaStatus: string
  ): 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CANCELLED' | 'REFUNDED' {
    switch (yookassaStatus) {
      case 'pending':
        return 'PENDING';
      case 'waiting_for_capture':
        return 'PROCESSING';
      case 'succeeded':
        return 'SUCCEEDED';
      case 'canceled':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  }

  /**
   * Update payment status from YooKassa data
   */
  private async updatePaymentStatus(
    paymentId: string,
    yookassaPayment: YooKassaPaymentResponse
  ) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: this.mapYooKassaStatus(yookassaPayment.status),
        metadata: yookassaPayment.metadata,
        ...(yookassaPayment.paid && { paidAt: new Date() }),
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Handle payment succeeded event
   */
  private async handlePaymentSucceeded(
    paymentId: string,
    paymentObject: YooKassaPaymentResponse
  ) {
    const payment = await this.updatePaymentStatus(paymentId, paymentObject);

    // Update booking status to confirmed
    const booking = await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // ========== Синхронизация с 1С-Дельфин ==========
    // Если настроена прямая интеграция — отправит чек сразу.
    // Если нет — Дельфин заберёт через GET /api/v1/exchange/getdata (pull).
    onPaymentSuccess(payment.bookingId).catch((error) => {
      console.error('[Dolphin] Direct sync failed, will be picked up via pull:', error);
    });

    // Уведомление субарендатора (массаж, SPA, парение)
    const serviceTypes = ['MASSAGE', 'SPA', 'STEAM', 'SWIMMING'];
    if (booking.serviceType && serviceTypes.includes(booking.serviceType)) {
      this.notifySubtenant(booking).catch((error) => {
        console.error('[Subtenant] Failed to notify:', error);
      });
    }

    console.log(
      `Payment succeeded for booking ${payment.bookingId}`
    );
  }

  /**
   * Notify subtenant about confirmed booking
   * (massage, spa, steam services may have subtenants)
   */
  private async notifySubtenant(booking: any): Promise<void> {
    // TODO: Implement subtenant notification
    // This could be:
    // - Email notification
    // - Webhook to subtenant's system
    // - Push notification via Telegram bot
    console.log(`[Subtenant] Notification for booking ${booking.id}:`, {
      serviceType: booking.serviceType,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });
  }

  /**
   * Handle payment canceled event
   */
  private async handlePaymentCanceled(
    paymentId: string,
    paymentObject: YooKassaPaymentResponse
  ) {
    await this.updatePaymentStatus(paymentId, paymentObject);

    // Don't auto-cancel booking - user might retry payment
    console.log(`Payment canceled: ${paymentId}`);
  }

  /**
   * Handle refund succeeded event
   */
  private async handleRefundSucceeded(
    paymentId: string,
    paymentObject: YooKassaPaymentResponse
  ) {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
      include: { booking: true },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CANCELLED' },
    });

    // Dolphin sync happens via pull-model (getdata endpoint)

    console.log(`Refund succeeded for payment: ${paymentId}`);
  }

  /**
   * Verify webhook signature (HMAC SHA-256)
   */
  private verifyWebhookSignature(body: string, signature: string): boolean {
    if (!env.YOOKASSA_WEBHOOK_SECRET) {
      return true; // Skip verification if secret not configured
    }

    const hmac = crypto.createHmac('sha256', env.YOOKASSA_WEBHOOK_SECRET);
    hmac.update(body);
    const expected = hmac.digest('hex');

    if (expected.length !== signature.length) return false;
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }
}
