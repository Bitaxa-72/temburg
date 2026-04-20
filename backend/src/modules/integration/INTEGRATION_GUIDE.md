# Integration Guide: Connecting Termburg with 1C-Дельфін

Quick start guide for integrating the 1C-Дельфін module into the Termburg backend.

---

## Step 1: Update Main Application

**File**: `src/index.ts`

```typescript
import Fastify from 'fastify';
import { registerDolphinRoutes } from './modules/integration/index.js';

const app = Fastify({ logger: true });

// ... existing middleware setup ...

// Register 1C-Дельфін routes
await registerDolphinRoutes(app);

await app.listen({ port: 3000, host: '0.0.0.0' });
```

---

## Step 2: Update Bookings Service

Automatically sync bookings when they're created or updated.

**File**: `src/modules/bookings/bookings.service.ts`

```typescript
import { dolphinService } from '../integration/index.js';

export class BookingsService {
  async createBooking(userId: string, data: CreateBookingInput) {
    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceType: data.serviceType,
        serviceName: data.serviceName,
        date: new Date(data.date),
        time: data.time,
        guests: data.guests,
        duration: data.duration,
        totalPrice: data.totalPrice,
        notes: data.notes,
        status: 'PENDING',
      },
      include: { user: true },
    });

    // ✨ NEW: Queue booking for 1C sync
    dolphinService.queueBookingSync(booking.id).catch(error => {
      console.error('[Dolphin] Failed to queue booking sync:', error);
      // Don't fail the booking creation if sync fails
    });

    // Send confirmation email...
    return booking;
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ) {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { user: true },
    });

    // ✨ NEW: Sync status update to 1C
    dolphinService.queueBookingSync(booking.id).catch(error => {
      console.error('[Dolphin] Failed to queue booking status sync:', error);
    });

    return booking;
  }
}
```

---

## Step 3: Update Payment Service

Sync payment information to 1C.

**File**: `src/modules/payments/payments.service.ts` (create if doesn't exist)

```typescript
import { dolphinService } from '../integration/index.js';

export class PaymentsService {
  async handlePaymentSuccess(paymentId: string) {
    // Update payment status
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
      },
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    // ✨ NEW: Sync payment to 1C
    dolphinService.queuePaymentSync(payment.id).catch(error => {
      console.error('[Dolphin] Failed to queue payment sync:', error);
    });

    return payment;
  }
}
```

---

## Step 4: Update Auth Service

Sync customer data when users register.

**File**: `src/modules/auth/auth.service.ts`

```typescript
import { dolphinService } from '../integration/index.js';

export class AuthService {
  async register(data: RegisterInput) {
    // Create user account
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'USER',
      },
    });

    // ✨ NEW: Sync customer to 1C
    dolphinService.queueCustomerSync(user.id).catch(error => {
      console.error('[Dolphin] Failed to queue customer sync:', error);
    });

    return user;
  }
}
```

---

## Step 5: Create Admin Endpoints

Add admin endpoints for manual sync management.

**File**: `src/modules/admin/admin.routes.ts` (create if doesn't exist)

```typescript
import type { FastifyInstance } from 'fastify';
import { dolphinService } from '../integration/index.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  // Trigger full 1C sync
  app.post('/api/admin/sync/1c', {
    preHandler: [app.authenticate, app.requireRole(['ADMIN'])],
  }, async (request, reply) => {
    const result = await dolphinService.triggerFullSync();
    return { success: true, ...result };
  });

  // Check 1C integration health
  app.get('/api/admin/integrations/1c/health', {
    preHandler: [app.authenticate, app.requireRole(['ADMIN', 'MANAGER'])],
  }, async (request, reply) => {
    const status = await dolphinService.getHealthStatus();
    return { success: true, status };
  });

  // Sync services catalog from 1C
  app.post('/api/admin/sync/1c/services', {
    preHandler: [app.authenticate, app.requireRole(['ADMIN'])],
  }, async (request, reply) => {
    const services = await dolphinService.syncServicesCatalog();

    // Update local database
    for (const service of services) {
      await prisma.service.upsert({
        where: { externalId: service.id },
        create: {
          type: service.type,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          active: service.active,
          externalId: service.id,
        },
        update: {
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          active: service.active,
        },
      });
    }

    return { success: true, synced: services.length };
  });
}
```

---

## Step 6: Add Database Fields (Optional)

If you want to track 1C sync status, add fields to Prisma schema:

**File**: `prisma/schema.prisma`

```prisma
model Booking {
  id          String   @id @default(cuid())
  // ... existing fields ...

  // 1C-Дельфін sync tracking (optional)
  dolphinSynced   Boolean   @default(false)
  dolphinSyncedAt DateTime?
  dolphinId       String?   // ID in 1C system

  @@index([dolphinSynced])
  @@map("bookings")
}

model Service {
  id         String   @id @default(cuid())
  // ... existing fields ...

  // Link to 1C service
  externalId String?  @unique // 1C service ID

  @@map("services")
}
```

Then run migration:
```bash
npm run prisma:migrate
```

---

## Step 7: Environment Configuration

Update your `.env` file:

```bash
# 1C-Дельфін Integration
DOLPHIN_API_URL=https://your-1c-server.ru/api
DOLPHIN_API_KEY=your-api-key-from-1c-admin-panel
DOLPHIN_WEBHOOK_SECRET=generate-random-secret-here
```

Generate webhook secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 8: Configure 1C-Дельфін Webhook

In your 1C-Дельфін admin panel:

1. Go to **Settings** → **Integrations** → **Webhooks**
2. Click **Add Webhook**
3. Configure:
   - **URL**: `https://api.termburg.ru/api/integration/dolphin/webhook`
   - **Secret**: Copy from `DOLPHIN_WEBHOOK_SECRET`
   - **Events**: Select:
     - ✅ `booking.updated`
     - ✅ `booking.cancelled`
     - ✅ `booking.completed`
     - ✅ `payment.succeeded`
     - ✅ `service.updated`
4. Save and test

---

## Step 9: Test Integration

### Test Health Check

```bash
curl -X GET http://localhost:3000/api/integration/dolphin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "status": {
    "healthy": true,
    "apiConnected": true,
    "pendingJobs": 0,
    "failedJobs": 0
  }
}
```

### Test Booking Creation

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "MASSAGE",
    "serviceName": "Классический массаж",
    "date": "2025-03-30T00:00:00Z",
    "time": "14:00",
    "guests": 2,
    "duration": 60,
    "totalPrice": 7000
  }'
```

Check logs for:
```
[Dolphin] Job added: booking/create/clx123456
[Dolphin] Processing job: booking/create/clx123456
[Dolphin] Syncing booking: clx123456
[Dolphin] Booking synced successfully: clx123456
```

### Test Manual Sync

```bash
curl -X POST http://localhost:3000/api/integration/dolphin/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType": "all"}'
```

---

## Step 10: Production Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Webhook URL registered in 1C
- [ ] Webhook secret is secure (not default)
- [ ] API key is valid and has required permissions
- [ ] Test webhook endpoint is accessible from 1C server
- [ ] SSL certificate is valid
- [ ] Firewall allows 1C server IP
- [ ] Monitoring is set up
- [ ] Error alerts configured

### Monitoring Setup

Add health check to your monitoring:

```typescript
// In a separate monitoring service or cron job
import { dolphinService } from './modules/integration';

setInterval(async () => {
  const status = await dolphinService.getHealthStatus();

  if (!status.healthy) {
    // Send alert to admins
    await sendAlert({
      title: '1C Integration is Down',
      message: status.error,
      severity: 'high',
    });
  }

  if (status.pendingJobs > 50) {
    // Send warning
    await sendAlert({
      title: '1C Sync Queue is Growing',
      message: `${status.pendingJobs} jobs pending`,
      severity: 'medium',
    });
  }
}, 5 * 60 * 1000); // Every 5 minutes
```

---

## Troubleshooting

### Issue: Bookings not syncing

**Check**:
1. Environment variables are set correctly
2. API key has write permissions
3. Check logs for errors: `[Dolphin]`
4. Test API connectivity: `/api/integration/dolphin/status`

### Issue: Webhook not receiving events

**Check**:
1. Webhook URL is correct and accessible
2. SSL certificate is valid
3. 1C server can reach your server (check firewall)
4. Webhook secret matches
5. Check 1C webhook logs

### Issue: Queue growing too large

**Check**:
1. 1C API is responding (health check)
2. Rate limits not exceeded
3. No authentication errors in logs
4. Consider implementing Redis-based queue for production

---

## Production Recommendations

### 1. Replace In-Memory Queue with Redis

```typescript
import Bull from 'bull';

const syncQueue = new Bull('dolphin-sync', {
  redis: { host: 'localhost', port: 6379 },
});

syncQueue.process(async (job) => {
  const { type, action, data } = job.data;
  // Process sync job
});
```

### 2. Add Retry Logic with Exponential Backoff

```typescript
syncQueue.add(jobData, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
});
```

### 3. Monitor Queue Performance

```typescript
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { FastifyAdapter } from '@bull-board/fastify';

const serverAdapter = new FastifyAdapter();

createBullBoard({
  queues: [new BullAdapter(syncQueue)],
  serverAdapter,
});

app.register(serverAdapter.registerPlugin(), {
  prefix: '/admin/queues',
});
```

### 4. Add Dead Letter Queue

```typescript
syncQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= job.opts.attempts) {
    // Move to dead letter queue
    await deadLetterQueue.add(job.data);

    // Alert admins
    await sendAlert({
      title: 'Sync Job Failed',
      message: `Job ${job.id} failed after ${job.attemptsMade} attempts`,
      data: job.data,
    });
  }
});
```

---

## Next Steps

1. Monitor integration health daily
2. Review sync logs weekly
3. Optimize sync frequency based on usage
4. Consider implementing bidirectional sync (1C → Termburg)
5. Add more webhook event handlers as needed
6. Implement conflict resolution strategies
7. Add comprehensive error tracking

---

## Support

For issues specific to:
- **1C-Дельфін API**: Contact 1C support
- **Integration module**: Check this documentation or project repository
- **Termburg backend**: Contact development team
