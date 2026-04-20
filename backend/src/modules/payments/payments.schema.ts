import { z } from 'zod';

// YooKassa payment schemas
export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  bookingId: z.string().cuid('Invalid booking ID'),
  returnUrl: z.string().url('Invalid return URL').optional(),
  metadata: z.record(z.string()).optional(),
});

export const paymentWebhookSchema = z.object({
  type: z.enum([
    'payment.succeeded',
    'payment.waiting_for_capture',
    'payment.canceled',
    'refund.succeeded',
  ]),
  event: z.enum([
    'payment.succeeded',
    'payment.waiting_for_capture',
    'payment.canceled',
    'refund.succeeded',
  ]),
  object: z.object({
    id: z.string(),
    status: z.enum([
      'pending',
      'waiting_for_capture',
      'succeeded',
      'canceled',
    ]),
    amount: z.object({
      value: z.string(),
      currency: z.string(),
    }),
    income_amount: z
      .object({
        value: z.string(),
        currency: z.string(),
      })
      .optional(),
    description: z.string().optional(),
    recipient: z
      .object({
        account_id: z.string(),
        gateway_id: z.string(),
      })
      .optional(),
    payment_method: z
      .object({
        type: z.string(),
        id: z.string(),
        saved: z.boolean(),
      })
      .optional(),
    captured_at: z.string().optional(),
    created_at: z.string(),
    expires_at: z.string().optional(),
    confirmation: z
      .object({
        type: z.string(),
        return_url: z.string().optional(),
        confirmation_url: z.string().optional(),
      })
      .optional(),
    test: z.boolean(),
    refunded_amount: z
      .object({
        value: z.string(),
        currency: z.string(),
      })
      .optional(),
    paid: z.boolean(),
    refundable: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
});

// YooKassa API response types
export interface YooKassaAmount {
  value: string;
  currency: string;
}

export interface YooKassaConfirmation {
  type: 'redirect' | 'embedded';
  return_url?: string;
  confirmation_url?: string;
  confirmation_token?: string;
}

export interface YooKassaPaymentMethod {
  type: string;
  id: string;
  saved: boolean;
  title?: string;
}

export interface YooKassaRecipient {
  account_id: string;
  gateway_id: string;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: YooKassaAmount;
  income_amount?: YooKassaAmount;
  description?: string;
  recipient?: YooKassaRecipient;
  payment_method?: YooKassaPaymentMethod;
  captured_at?: string;
  created_at: string;
  expires_at?: string;
  confirmation?: YooKassaConfirmation;
  test: boolean;
  refunded_amount?: YooKassaAmount;
  paid: boolean;
  refundable: boolean;
  metadata?: Record<string, any>;
}

export interface YooKassaRefundResponse {
  id: string;
  payment_id: string;
  status: 'pending' | 'succeeded' | 'canceled';
  created_at: string;
  amount: YooKassaAmount;
  description?: string;
  receipt_registration?: string;
}

export interface YooKassaErrorResponse {
  type: string;
  id: string;
  code: string;
  description: string;
  parameter?: string;
}

// Input/Output types
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
