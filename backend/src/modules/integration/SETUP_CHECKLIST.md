# 1C-Дельфін Integration Setup Checklist

Complete this checklist to fully integrate 1C-Дельфín with Termburg backend.

---

## Prerequisites

- [ ] Termburg backend is running
- [ ] PostgreSQL database is set up
- [ ] You have 1C-Дельфín API credentials
- [ ] You have admin access to 1C-Дельфín panel

---

## Installation

### 1. Environment Configuration

- [ ] Copy `.env.example` to `.env`
- [ ] Add 1C-Дельфін configuration:
  ```bash
  DOLPHIN_API_URL=https://your-1c-server.com/api
  DOLPHIN_API_KEY=your-api-key
  DOLPHIN_WEBHOOK_SECRET=your-webhook-secret
  ```
- [ ] Generate secure webhook secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 2. Register Routes

- [ ] Update `src/index.ts` to register dolphin routes:
  ```typescript
  import { registerDolphinRoutes } from './modules/integration/index.js';
  await registerDolphinRoutes(app);
  ```

### 3. Update Services

**Bookings Service** (`src/modules/bookings/bookings.service.ts`):
- [ ] Import dolphin service
- [ ] Add sync call to `createBooking()`
- [ ] Add sync call to `updateBookingStatus()`

**Payments Service** (create if needed):
- [ ] Import dolphin service
- [ ] Add sync call to payment success handler

**Auth Service** (`src/modules/auth/auth.service.ts`):
- [ ] Import dolphin service
- [ ] Add sync call to `register()`

### 4. Database Schema (Optional)

- [ ] Add 1C sync tracking fields to Prisma schema
- [ ] Run migration: `npm run prisma:migrate`

---

## 1C-Дельфін Configuration

### 1. API Access

- [ ] Log in to 1C-Дельфín admin panel
- [ ] Navigate to **Settings** → **API**
- [ ] Generate API key with permissions:
  - ✅ Read bookings
  - ✅ Write bookings
  - ✅ Read payments
  - ✅ Write payments
  - ✅ Read customers
  - ✅ Write customers
  - ✅ Read services
  - ✅ Read schedule
- [ ] Copy API key to `.env`

### 2. Webhook Setup

- [ ] Navigate to **Settings** → **Webhooks**
- [ ] Click **Add Webhook**
- [ ] Configure webhook:
  - **Name**: Termburg Integration
  - **URL**: `https://api.termburg.ru/api/integration/dolphin/webhook`
  - **Secret**: Copy from `DOLPHIN_WEBHOOK_SECRET`
  - **Events to subscribe**:
    - ✅ booking.updated
    - ✅ booking.cancelled
    - ✅ booking.completed
    - ✅ payment.succeeded
    - ✅ service.updated
    - ✅ schedule.updated
- [ ] Save webhook configuration
- [ ] Test webhook (use test button in 1C panel)

---

## Testing

### 1. Health Check

```bash
curl -X GET http://localhost:3000/api/integration/dolphin/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected result:
- [ ] Response status: 200
- [ ] `status.healthy`: true
- [ ] `status.apiConnected`: true

### 2. Create Test Booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "MASSAGE",
    "serviceName": "Test Massage",
    "date": "2025-04-01T00:00:00Z",
    "time": "14:00",
    "guests": 1,
    "duration": 60,
    "totalPrice": 3500
  }'
```

Verify:
- [ ] Booking created successfully
- [ ] Check logs: `[Dolphin] Job added: booking/create/...`
- [ ] Check logs: `[Dolphin] Booking synced successfully`
- [ ] Verify booking appears in 1C-Дельфін

### 3. Test Webhook

In 1C-Дельфін:
- [ ] Update a test booking status
- [ ] Check Termburg logs for webhook processing
- [ ] Verify booking status updated in Termburg

### 4. Manual Sync Test

```bash
curl -X POST http://localhost:3000/api/integration/dolphin/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType": "all"}'
```

Verify:
- [ ] Response: `"success": true`
- [ ] Jobs queued in logs
- [ ] Bookings appear in 1C

### 5. Services Catalog Sync

```bash
curl -X GET http://localhost:3000/api/integration/dolphin/services \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Verify:
- [ ] Services list returned
- [ ] Services contain correct data
- [ ] Active services marked correctly

### 6. Schedule Fetch

```bash
curl -X GET 'http://localhost:3000/api/integration/dolphin/schedule?date=2025-04-01' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Verify:
- [ ] Schedule returned for specified date
- [ ] Available slots marked correctly
- [ ] Resource information included

---

## Production Deployment

### Pre-Deployment

- [ ] All tests passed
- [ ] Production `.env` configured
- [ ] Webhook URL uses HTTPS
- [ ] SSL certificate is valid
- [ ] 1C server can reach webhook URL
- [ ] Firewall rules configured
- [ ] API rate limits reviewed

### Deployment Steps

1. **Deploy application**:
   - [ ] Build: `npm run build`
   - [ ] Deploy to server
   - [ ] Verify application starts

2. **Update 1C webhook URL**:
   - [ ] Update to production URL
   - [ ] Test webhook delivery

3. **Monitor initial sync**:
   - [ ] Check health status
   - [ ] Monitor queue size
   - [ ] Check error logs

### Post-Deployment

- [ ] Trigger initial full sync
- [ ] Monitor for 24 hours
- [ ] Verify all bookings syncing
- [ ] Verify webhooks received
- [ ] No errors in logs

---

## Monitoring Setup

### Application Monitoring

- [ ] Set up health check endpoint monitoring
- [ ] Configure alerts for:
  - Integration unhealthy
  - High queue size (>50 jobs)
  - API connectivity issues
  - Webhook failures

### Logging

- [ ] Ensure logs are captured
- [ ] Configure log aggregation (e.g., ELK, Datadog)
- [ ] Set up log-based alerts

### Metrics (Optional)

- [ ] Track sync success rate
- [ ] Track average sync time
- [ ] Track queue processing time
- [ ] Track webhook delivery success rate

---

## Maintenance

### Daily

- [ ] Check integration health status
- [ ] Review error logs
- [ ] Monitor queue size

### Weekly

- [ ] Review failed sync jobs
- [ ] Check webhook delivery logs in 1C
- [ ] Verify data consistency (spot check)

### Monthly

- [ ] Review API usage and rate limits
- [ ] Update dependencies if needed
- [ ] Review and optimize performance

---

## Rollback Plan

If issues occur after deployment:

1. **Immediate**:
   - [ ] Disable webhook in 1C (prevents new events)
   - [ ] Stop sync queue processing

2. **Investigation**:
   - [ ] Check logs for errors
   - [ ] Verify 1C API connectivity
   - [ ] Check environment variables

3. **Recovery**:
   - [ ] Fix identified issues
   - [ ] Re-enable webhook
   - [ ] Trigger full sync to catch up

---

## Common Issues & Solutions

### Issue: "Failed to connect to 1C-Дельфін"

**Solutions**:
- [ ] Check `DOLPHIN_API_URL` is correct
- [ ] Verify network connectivity
- [ ] Check firewall rules
- [ ] Verify API endpoint is accessible

### Issue: "Invalid API key"

**Solutions**:
- [ ] Check `DOLPHIN_API_KEY` is correct
- [ ] Verify API key has required permissions
- [ ] Check if API key has expired

### Issue: "Webhook signature verification failed"

**Solutions**:
- [ ] Verify `DOLPHIN_WEBHOOK_SECRET` matches 1C configuration
- [ ] Check webhook secret hasn't changed in 1C
- [ ] Verify webhook payload format

### Issue: "Queue growing too large"

**Solutions**:
- [ ] Check 1C API rate limits
- [ ] Verify API responses are successful
- [ ] Consider implementing Redis-based queue
- [ ] Increase sync processing delay

---

## Support Resources

- **Documentation**: See `README.md` and `INTEGRATION_GUIDE.md`
- **1C-Дельфін API Docs**: [Contact 1C support for API documentation]
- **Termburg Backend**: Contact development team
- **Emergency**: Disable integration via environment variable

---

## Completion

Once all items are checked:

- [ ] Integration is fully operational
- [ ] All tests passed
- [ ] Monitoring is active
- [ ] Team is trained on maintenance procedures
- [ ] Documentation is accessible

**Date Completed**: _________________

**Completed By**: _________________

**Sign-off**: _________________
