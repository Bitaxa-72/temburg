const PENDING_CHECKOUT_KEY = 'termburg_pending_checkout';

export interface PendingCheckout {
  orderId: string;
  orderKey: string;
  email: string;
  name: string;
  phone: string;
  itemName: string;
  itemPrice: string;
  confirmed?: boolean;
}

export interface PaymentReturnParams {
  orderId: string;
  orderKey: string;
  status: 'success' | 'cancelled';
}

export function savePendingCheckout(checkout: PendingCheckout): void {
  try {
    localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(checkout));
  } catch {
    // Checkout can still continue when storage is unavailable.
  }
}

export function getPendingCheckout(): PendingCheckout | null {
  try {
    const raw = localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;

    const checkout = JSON.parse(raw) as Partial<PendingCheckout>;
    if (!checkout.orderId || !checkout.orderKey) return null;

    return {
      orderId: String(checkout.orderId),
      orderKey: String(checkout.orderKey),
      email: String(checkout.email ?? ''),
      name: String(checkout.name ?? ''),
      phone: String(checkout.phone ?? ''),
      itemName: String(checkout.itemName ?? 'Заказ'),
      itemPrice: String(checkout.itemPrice ?? ''),
      confirmed: Boolean(checkout.confirmed),
    };
  } catch {
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    // Nothing else to clean up.
  }
}

export function markPendingCheckoutConfirmed(): void {
  const checkout = getPendingCheckout();
  if (!checkout) return;

  savePendingCheckout({ ...checkout, confirmed: true });
}

export async function claimPendingCheckout(token: string): Promise<boolean> {
  const checkout = getPendingCheckout();
  if (!checkout?.confirmed) return false;

  try {
    const response = await fetch('/wp-json/termburg/v1/checkout/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId: checkout.orderId,
        orderKey: checkout.orderKey,
      }),
    });

    if (!response.ok) return false;

    clearPendingCheckout();
    return true;
  } catch {
    return false;
  }
}

export function getPaymentReturnParams(): PaymentReturnParams | null {
  const params = new URLSearchParams(window.location.search);
  const payment = params.get('payment');
  const orderId = params.get('order_id');
  const orderKey = params.get('key');

  if (!orderId || !orderKey) {
    return null;
  }

  if (payment === 'success') {
    return { orderId, orderKey, status: 'success' };
  }

  return null;
}

export function cleanPaymentReturnUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('order_id');
  url.searchParams.delete('key');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
