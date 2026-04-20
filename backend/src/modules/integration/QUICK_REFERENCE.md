# 1C-Дельфін Integration - Quick Reference

Fast reference for common operations and troubleshooting.

---

## Environment Variables

```bash
DOLPHIN_API_URL=https://your-1c-server.com/api
DOLPHIN_API_KEY=your-api-key
DOLPHIN_WEBHOOK_SECRET=your-webhook-secret
```

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/integration/dolphin/webhook` | POST | Public* | Receive 1C webhooks |
| `/api/integration/dolphin/sync` | POST | Admin | Manual sync trigger |
| `/api/integration/dolphin/status` | GET | Admin | Health check |
| `/api/integration/dolphin/services` | GET | Admin | Fetch services catalog |
| `/api/integration/dolphin/schedule` | GET | User | Fetch schedule |

*Signature-verified

---

## Code Examples

### Queue Booking Sync

```typescript
import { dolphinService } from './modules/integration';

await dolphinService.queueBookingSync('booking-id');
```

### Queue Payment Sync

```typescript
await dolphinService.queuePaymentSync('payment-id');
```

### Queue Customer Sync

```typescript
await dolphinService.queueCustomerSync('user-id');
```

### Full Sync

```typescript
const result = await dolphinService.triggerFullSync();
```

### Health Check

```typescript
const status = await dolphinService.getHealthStatus();
console.log(status.healthy ? 'OK' : 'FAILED');
```

### Fetch Services

```typescript
const services = await dolphinService.syncServicesCatalog();
```

### Fetch Schedule

```typescript
const schedule = await dolphinService.getSchedule({
  date: '2025-04-01'
});
```

---

## cURL Commands

### Health Check

```bash
curl http://localhost:3000/api/integration/dolphin/status \
  -H "Authorization: Bearer TOKEN"
```

### Manual Sync (Single)

```bash
curl -X POST http://localhost:3000/api/integration/dolphin/sync \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"booking","entityId":"clx123"}'
```

### Manual Sync (Full)

```bash
curl -X POST http://localhost:3000/api/integration/dolphin/sync \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"all"}'
```

### Fetch Services

```bash
curl http://localhost:3000/api/integration/dolphin/services \
  -H "Authorization: Bearer TOKEN"
```

### Fetch Schedule

```bash
curl 'http://localhost:3000/api/integration/dolphin/schedule?date=2025-04-01' \
  -H "Authorization: Bearer TOKEN"
```

---

## Webhook Events

| Event | Description | Handler |
|-------|-------------|---------|
| `booking.updated` | Booking status changed | Updates local booking |
| `booking.cancelled` | Booking cancelled | Sets status to CANCELLED |
| `booking.completed` | Booking completed | Sets status to COMPLETED |
| `payment.succeeded` | Payment successful | Updates payment & booking |
| `service.updated` | Service catalog changed | Optionally sync catalog |
| `schedule.updated` | Schedule changed | Optionally sync schedule |

---

## Status Mappings

### Booking Status

| Our Status | 1C Status |
|------------|-----------|
| PENDING | NEW |
| CONFIRMED | CONFIRMED |
| CANCELLED | CANCELLED |
| COMPLETED | COMPLETED |
| NO_SHOW | NO_SHOW |

### Payment Status

| Our Status | 1C Status |
|------------|-----------|
| PENDING | PENDING |
| PROCESSING | PROCESSING |
| SUCCEEDED | SUCCEEDED |
| CANCELLED | CANCELLED |
| REFUNDED | REFUNDED |

---

## Troubleshooting

### Integration Not Working

```bash
# 1. Check health
curl http://localhost:3000/api/integration/dolphin/status \
  -H "Authorization: Bearer TOKEN"

# 2. Check logs
grep "\[Dolphin\]" logs/app.log

# 3. Verify environment
echo $DOLPHIN_API_URL
echo $DOLPHIN_API_KEY
```

### Queue Growing

```typescript
// Check queue status
const status = await dolphinService.getHealthStatus();
console.log('Pending:', status.pendingJobs);

// Clear and retry
await dolphinService.triggerFullSync();
```

### Webhook Not Received

1. Check 1C webhook configuration
2. Verify URL is accessible: `curl https://your-domain.com/api/integration/dolphin/webhook`
3. Check webhook secret matches
4. Review 1C webhook logs

### API Errors

```bash
# Test connectivity
curl https://your-1c-server.com/api/v1/health \
  -H "Authorization: Bearer $DOLPHIN_API_KEY"

# Check API key permissions
# Contact 1C support if needed
```

---

## Log Patterns

### Success Patterns

```
[Dolphin] Job added: booking/create/clx123
[Dolphin] Processing job: booking/create/clx123
[Dolphin] Syncing booking: clx123
[Dolphin] Booking synced successfully: clx123
[Dolphin] Job completed: booking/create/clx123
```

### Error Patterns

```
[Dolphin] Request failed (attempt 1/3): Error message
[Dolphin] Retrying in 1000ms...
[Dolphin] Job failed: booking/create/clx123
[Dolphin] Job failed after 3 retries, discarding
```

### Webhook Processing

```
[Dolphin] Processing webhook: booking.updated
[Dolphin] Booking updated: clx123
[Dolphin Webhook] Webhook processed successfully
```

---

## Performance Tips

### Optimize Sync

```typescript
// Batch sync instead of individual
const bookings = await getRecentBookings();
await Promise.all(
  bookings.map(b => dolphinService.queueBookingSync(b.id))
);
```

### Reduce API Calls

```typescript
// Cache services catalog (updates rarely)
const services = await redis.get('dolphin:services');
if (!services) {
  const fresh = await dolphinService.syncServicesCatalog();
  await redis.set('dolphin:services', JSON.stringify(fresh), 'EX', 3600);
}
```

### Monitor Queue

```typescript
setInterval(async () => {
  const status = await dolphinService.getHealthStatus();
  if (status.pendingJobs > 50) {
    console.warn('High queue size:', status.pendingJobs);
  }
}, 60000); // Every minute
```

---

## Security Checklist

- [ ] API key stored in environment variable (not code)
- [ ] Webhook secret is randomly generated
- [ ] HTTPS used for webhook endpoint
- [ ] Webhook signature verified
- [ ] Admin endpoints require authentication
- [ ] Rate limiting enabled
- [ ] Sensitive data not logged

---

## Maintenance Commands

### Daily Health Check

```bash
#!/bin/bash
STATUS=$(curl -s http://localhost:3000/api/integration/dolphin/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.status.healthy')

if [ "$STATUS" != "true" ]; then
  echo "ALERT: 1C Integration is unhealthy"
  # Send notification
fi
```

### Weekly Sync Verification

```bash
# Trigger full sync
curl -X POST http://localhost:3000/api/integration/dolphin/sync \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType":"all"}'
```

### Monthly Service Catalog Update

```bash
curl -X GET http://localhost:3000/api/integration/dolphin/services \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Production Upgrade Path

### Current: In-Memory Queue

```typescript
// Simple queue for development
const queue = [];
```

### Upgrade: Redis-Based Queue

```typescript
import Bull from 'bull';

const queue = new Bull('dolphin-sync', {
  redis: { host: 'localhost', port: 6379 }
});

queue.process(async (job) => {
  // Process sync
});
```

Benefits:
- Persistence across restarts
- Better scaling
- Built-in retry logic
- Dashboard UI

---

## Contact & Support

- **1C-Дельфін API**: Contact 1C support
- **Integration Module**: See README.md and INTEGRATION_GUIDE.md
- **Emergency**: Disable via environment variable

---

## Quick Disable

If you need to quickly disable the integration:

```bash
# Option 1: Environment variable
export DOLPHIN_API_URL=""

# Option 2: Comment out route registration
# await registerDolphinRoutes(app);

# Option 3: Disable webhook in 1C panel
```

---

**Version**: 1.0.0
**Last Updated**: 2025-03-25
**Maintainer**: Termburg Dev Team
