/**
 * Formats a number as a price in Russian locale
 * @param price - The price to format
 * @returns Formatted price string with space as thousand separator
 * @example
 * formatPrice(1000) // "1 000"
 * formatPrice(15000) // "15 000"
 * formatPrice(0) // "0"
 */
export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) {
    return '0';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
