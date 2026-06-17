import { useEffect } from 'react';
import { clearPendingCheckout, getPendingCheckout } from '@/utils/paymentReturn';

const PAID_STATUSES = new Set(['processing', 'completed']);
const FINAL_UNPAID_STATUSES = new Set(['cancelled', 'canceled', 'failed', 'refunded']);
const STATUS_RETRY_DELAYS_MS = [0, 1000, 1500, 2500];

interface CheckoutStatusResponse {
  status?: string;
}

function redirectToHome(): void {
  clearPendingCheckout();
  window.location.replace('/');
}

function buildSuccessUrl(orderId: string, orderKey: string): string {
  const params = new URLSearchParams({
    payment: 'success',
    order_id: orderId,
    key: orderKey,
  });

  return `/?${params.toString()}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForPaidStatus(orderId: string, orderKey: string): Promise<boolean | null> {
  for (const waitMs of STATUS_RETRY_DELAYS_MS) {
    if (waitMs > 0) {
      await delay(waitMs);
    }

    try {
      const params = new URLSearchParams({ key: orderKey });
      const response = await fetch(
        `/wp-json/termburg/v1/checkout/status/${encodeURIComponent(orderId)}?${params.toString()}`
      );

      if (!response.ok) {
        return null;
      }

      const result = (await response.json()) as CheckoutStatusResponse;
      const status = String(result.status ?? '').toLowerCase();

      if (PAID_STATUSES.has(status)) {
        return true;
      }

      if (FINAL_UNPAID_STATUSES.has(status)) {
        return false;
      }
    } catch {
      return null;
    }
  }

  return false;
}

export default function YooKassaReturnPage() {
  useEffect(() => {
    let cancelled = false;

    async function restoreCheckoutReturn() {
      const params = new URLSearchParams(window.location.search);
      const yooKassaOrderKey = params.get('yookassa-order-id');
      const pendingCheckout = getPendingCheckout();

      if (
        !yooKassaOrderKey
        || !pendingCheckout
        || pendingCheckout.orderKey !== yooKassaOrderKey
      ) {
        if (!cancelled) redirectToHome();
        return;
      }

      const paid = await waitForPaidStatus(pendingCheckout.orderId, pendingCheckout.orderKey);
      if (cancelled) return;

      if (paid === true || paid === null) {
        window.location.replace(
          buildSuccessUrl(pendingCheckout.orderId, pendingCheckout.orderKey)
        );
        return;
      }

      redirectToHome();
    }

    void restoreCheckoutReturn();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
