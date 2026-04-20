# Payments Module

Complete YooKassa payment integration for Termburg spa bookings.

## Quick Start

```typescript
// 1. User creates a booking
const booking = await bookingsService.createBooking(userId, bookingData);

// 2. Create payment for the booking
const payment = await paymentsService.createPayment(userId, {
  amount: booking.totalPrice,
  description: `Оплата: ${booking.serviceName}`,
  bookingId: booking.id,
  returnUrl: 'https://termburg.ru/payment/return',
});

// 3. Redirect user to payment URL
window.location.href = payment.paymentUrl;

// 4. YooKassa processes payment and sends webhook
// 5. Webhook handler updates payment status and confirms booking
// 6. User returns to returnUrl with payment result
```

## File Structure

```
payments/
├── payments.schema.ts       # Zod schemas & TypeScript types
├── payments.service.ts      # Business logic
├── payments.routes.ts       # REST API endpoints
├── yookassa.client.ts       # YooKassa API client
└── README.md               # This file
```

## Payment Flow

### Happy Path

```
1. User → Frontend: Creates booking
2. Frontend → Backend: POST /api/bookings
3. Backend → Database: Create booking (status: PENDING)
4. Frontend → Backend: POST /api/payments
5. Backend → YooKassa: Create payment
6. YooKassa → Backend: Payment created (status: pending)
7. Backend → Database: Save payment record
8. Backend → Frontend: Return payment URL
9. Frontend: Redirect to YooKassa payment page
10. User → YooKassa: Completes payment
11. YooKassa → Backend: Webhook (payment.succeeded)
12. Backend → Database: Update payment (status: SUCCEEDED)
13. Backend → Database: Update booking (status: CONFIRMED)
14. Backend → User: Send confirmation email
15. YooKassa → Frontend: Redirect to returnUrl
```

### Status Mappings

| YooKassa Status | Our Status | Booking Status |
|----------------|-----------|---------------|
| `pending` | `PENDING` | `PENDING` |
| `waiting_for_capture` | `PROCESSING` | `PENDING` |
| `succeeded` | `SUCCEEDED` | `CONFIRMED` |
| `canceled` | `CANCELLED` | `PENDING` (user can retry) |

## API Endpoints

### POST /api/payments

Create a new payment.

**Auth**: Required
**Body**:
```typescript
{
  amount: number;           // Must match booking.totalPrice
  description: string;      // Payment description
  bookingId: string;        // Booking CUID
  returnUrl?: string;       // Optional redirect URL
  metadata?: Record<string, string>;
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    id: string;            // Our payment ID
    bookingId: string;
    amount: number;
    currency: string;
    status: string;
    paymentUrl: string;    // Redirect user here
    createdAt: string;
  }
}
```

### GET /api/payments/:id

Get payment status.

**Auth**: Required
**Params**: `id` - Payment ID
**Response**:
```typescript
{
  success: true,
  data: {
    id: string;
    bookingId: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    yookassaId?: string;
    paymentUrl?: string;
    paidAt?: string;
    createdAt: string;
    booking: {
      id: string;
      serviceName: string;
      date: string;
      time: string;
      status: BookingStatus;
    };
  }
}
```

### POST /api/payments/webhook

YooKassa webhook handler (internal).

**Auth**: None (signature verified)
**Headers**: `x-yookassa-signature` (optional)
**Body**: YooKassa webhook payload

### POST /api/payments/:id/refund

Process a refund (admin only).

**Auth**: Required (ADMIN role)
**Params**: `id` - Payment ID
**Body**:
```typescript
{
  amount?: number;        // Optional, defaults to full amount
  reason?: string;        // Refund reason
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    payment: {
      id: string;
      status: "REFUNDED";
    };
    refund: {
      id: string;
      payment_id: string;
      status: string;
      amount: {
        value: string;
        currency: string;
      };
    };
  }
}
```

## YooKassa Client

Singleton instance: `yookassaClient`

### Methods

```typescript
// Create payment
const payment = await yookassaClient.createPayment({
  amount: { value: "5000.00", currency: "RUB" },
  description: "Оплата услуг",
  confirmation: {
    type: "redirect",
    return_url: "https://site.com/return",
  },
  capture: true,
  metadata: { bookingId: "123" },
}, "idempotency-key");

// Get payment status
const payment = await yookassaClient.getPayment("payment-id");

// Capture payment (for two-step payments)
const payment = await yookassaClient.capturePayment("payment-id");

// Cancel payment
const payment = await yookassaClient.cancelPayment("payment-id");

// Create refund
const refund = await yookassaClient.createRefund({
  payment_id: "payment-id",
  amount: { value: "5000.00", currency: "RUB" },
  description: "Возврат средств",
});
```

## Environment Variables

```env
# YooKassa Shop ID (from dashboard)
YOOKASSA_SHOP_ID=123456

# YooKassa Secret Key (from dashboard)
YOOKASSA_SECRET_KEY=live_XXXXXXXXXXXXXXX

# Default return URL after payment
YOOKASSA_RETURN_URL=https://termburg.ru/payment/return

# Webhook signature secret (optional but recommended)
YOOKASSA_WEBHOOK_SECRET=your_webhook_secret
```

## Error Handling

### Custom Errors

```typescript
// YooKassa API errors
try {
  await yookassaClient.createPayment(params);
} catch (error) {
  if (error instanceof YooKassaApiError) {
    console.error(error.code);        // e.g., "invalid_request"
    console.error(error.type);        // e.g., "error"
    console.error(error.message);     // Human-readable message
    console.error(error.parameter);   // Field that caused error
  }
}

// Service errors
try {
  await paymentsService.createPayment(userId, data);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Booking not found
  } else if (error instanceof BadRequestError) {
    // Validation error or amount mismatch
  }
}
```

## Security Checklist

- [x] JWT authentication on all endpoints (except webhook)
- [x] User can only access own payments (admins see all)
- [x] Refunds restricted to ADMIN role
- [x] Payment amount validated against booking total
- [x] Webhook signature verification (optional)
- [x] Idempotency keys for payment operations
- [x] HTTPS required in production
- [x] Rate limiting on API (configured in main app)

## Testing

### Local Webhook Testing

1. Install ngrok: `npm install -g ngrok`
2. Start server: `npm run dev`
3. Expose local server: `ngrok http 3000`
4. Configure webhook in YooKassa dashboard with ngrok URL
5. Test payments with YooKassa test cards

### YooKassa Test Cards

| Card Number | Result |
|------------|--------|
| `5555 5555 5555 4444` | Success |
| `5555 5555 5555 5599` | Insufficient funds |
| `5555 5555 5555 5557` | Invalid card |

Expiry: Any future date
CVV: Any 3 digits

### Manual Testing

```bash
# 1. Create test booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "MASSAGE",
    "serviceName": "Классический массаж",
    "date": "2024-04-01T14:00:00Z",
    "time": "14:00",
    "guests": 1,
    "duration": 60,
    "totalPrice": 3000
  }'

# 2. Create payment
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3000,
    "description": "Оплата массажа",
    "bookingId": "BOOKING_ID_FROM_STEP_1",
    "returnUrl": "http://localhost:5173/payment/return"
  }'

# 3. Open payment URL in browser (from response)

# 4. Check payment status
curl http://localhost:3000/api/payments/PAYMENT_ID \
  -H "Authorization: Bearer YOUR_JWT"
```

## Monitoring

### Key Metrics to Track

- Payment success rate
- Average payment processing time
- Failed payment reasons
- Refund rate
- Webhook processing latency

### Logging

All important events are logged:
- Payment created
- Payment succeeded
- Payment failed
- Refund processed
- Webhook received
- Errors and exceptions

Check logs for:
```
Payment succeeded for booking XXX, user: user@email.com
Payment canceled: pay_123
Refund succeeded for payment: pay_456
```

## Troubleshooting

### Payment stuck in PENDING

1. Check YooKassa dashboard for payment status
2. Manually sync: `GET /api/payments/:id` (triggers sync)
3. Check webhook logs for delivery failures
4. Verify webhook URL is accessible from internet

### Webhook not received

1. Verify webhook URL in YooKassa dashboard
2. Check URL is publicly accessible (use ngrok for local)
3. Verify no firewall blocking YooKassa IPs
4. Check webhook logs in YooKassa dashboard

### Amount mismatch error

1. Ensure booking.totalPrice is Decimal type in DB
2. Check for rounding issues (use `.toFixed(2)`)
3. Verify frontend sends correct amount

## Best Practices

1. **Always use idempotency keys** for payment operations
2. **Verify amount** matches booking before payment
3. **Handle webhooks idempotently** (same event may be sent multiple times)
4. **Return 200 OK** for webhooks even if processing fails (to avoid retry storms)
5. **Log all payment operations** for audit trail
6. **Use test mode** until ready for production
7. **Set up monitoring** for failed payments
8. **Keep YooKassa credentials secure** (never commit to git)

## TODO

- [ ] Add email notifications for payment events
- [ ] Implement payment receipt generation
- [ ] Add payment analytics/reporting
- [ ] Add support for recurring payments (subscriptions)
- [ ] Add support for split payments (multiple payment methods)
- [ ] Add payment expiration handling
- [ ] Add automatic refund on booking cancellation (configurable)

## Resources

- [YooKassa API Documentation](https://yookassa.ru/developers/api)
- [YooKassa Dashboard](https://yookassa.ru/my)
- [YooKassa Test Environment](https://yookassa.ru/developers/test)
- [Webhook Setup Guide](https://yookassa.ru/developers/using-api/webhooks)
