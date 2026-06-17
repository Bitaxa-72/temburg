interface PurchaseLike {
  name: string;
  certificate?: unknown;
}

export function isTemporarilyHiddenServicePurchase(item: PurchaseLike): boolean {
  const name = item.name.toLowerCase();
  const allowedNonServicePurchase = item.certificate
    || name.includes('абонемент')
    || name.includes('сертификат')
    || name.includes('бокс')
    || name.includes('мерч');

  if (allowedNonServicePurchase) return false;

  return /парен|массаж|spa|спа/.test(name);
}

export function isTemporarilyHiddenServiceName(name: string): boolean {
  return isTemporarilyHiddenServicePurchase({ name });
}
