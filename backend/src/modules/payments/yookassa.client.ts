import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '../../config/env.js';
import {
  YooKassaPaymentResponse,
  YooKassaRefundResponse,
  YooKassaErrorResponse,
  YooKassaAmount,
  YooKassaConfirmation,
} from './payments.schema.js';

export class YooKassaApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: string,
    public parameter?: string
  ) {
    super(message);
    this.name = 'YooKassaApiError';
  }
}

export interface CreatePaymentParams {
  amount: YooKassaAmount;
  description: string;
  confirmation: YooKassaConfirmation;
  capture?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateRefundParams {
  payment_id: string;
  amount: YooKassaAmount;
  description?: string;
}

export class YooKassaClient {
  private client: AxiosInstance;
  private readonly baseURL = 'https://api.yookassa.ru/v3';

  constructor() {
    // Create Basic Auth header
    const credentials = Buffer.from(
      `${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`
    ).toString('base64');

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<YooKassaErrorResponse>) => {
        if (error.response?.data) {
          const errorData = error.response.data;
          throw new YooKassaApiError(
            errorData.description || error.message,
            errorData.code,
            errorData.type,
            errorData.parameter
          );
        }
        throw error;
      }
    );
  }

  /**
   * Generate idempotency key for safe retries
   */
  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create a new payment
   * @param params Payment parameters
   * @param idempotencyKey Optional idempotency key for safe retries
   */
  async createPayment(
    params: CreatePaymentParams,
    idempotencyKey?: string
  ): Promise<YooKassaPaymentResponse> {
    const response = await this.client.post<YooKassaPaymentResponse>(
      '/payments',
      {
        ...params,
        capture: params.capture ?? true, // Auto-capture by default
      },
      {
        headers: {
          'Idempotence-Key': idempotencyKey || this.generateIdempotencyKey(),
        },
      }
    );

    return response.data;
  }

  /**
   * Get payment information by ID
   * @param paymentId YooKassa payment ID
   */
  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    const response = await this.client.get<YooKassaPaymentResponse>(
      `/payments/${paymentId}`
    );

    return response.data;
  }

  /**
   * Capture a payment (if created with capture=false)
   * @param paymentId YooKassa payment ID
   * @param amount Optional amount to capture (partial capture)
   */
  async capturePayment(
    paymentId: string,
    amount?: YooKassaAmount,
    idempotencyKey?: string
  ): Promise<YooKassaPaymentResponse> {
    const response = await this.client.post<YooKassaPaymentResponse>(
      `/payments/${paymentId}/capture`,
      amount ? { amount } : {},
      {
        headers: {
          'Idempotence-Key': idempotencyKey || this.generateIdempotencyKey(),
        },
      }
    );

    return response.data;
  }

  /**
   * Cancel a payment (only for waiting_for_capture status)
   * @param paymentId YooKassa payment ID
   */
  async cancelPayment(
    paymentId: string,
    idempotencyKey?: string
  ): Promise<YooKassaPaymentResponse> {
    const response = await this.client.post<YooKassaPaymentResponse>(
      `/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          'Idempotence-Key': idempotencyKey || this.generateIdempotencyKey(),
        },
      }
    );

    return response.data;
  }

  /**
   * Create a refund
   * @param params Refund parameters
   */
  async createRefund(
    params: CreateRefundParams,
    idempotencyKey?: string
  ): Promise<YooKassaRefundResponse> {
    const response = await this.client.post<YooKassaRefundResponse>(
      '/refunds',
      params,
      {
        headers: {
          'Idempotence-Key': idempotencyKey || this.generateIdempotencyKey(),
        },
      }
    );

    return response.data;
  }

  /**
   * Get refund information by ID
   * @param refundId YooKassa refund ID
   */
  async getRefund(refundId: string): Promise<YooKassaRefundResponse> {
    const response = await this.client.get<YooKassaRefundResponse>(
      `/refunds/${refundId}`
    );

    return response.data;
  }
}

// Export singleton instance
export const yookassaClient = new YooKassaClient();
