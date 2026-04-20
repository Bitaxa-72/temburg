import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/utils/formatPrice';

describe('formatPrice', () => {
  it('formats numbers with Russian locale', () => {
    // Russian locale uses non-breaking space (U+00A0) as thousand separator
    expect(formatPrice(1000)).toBe('1\u00A0000');
    expect(formatPrice(15000)).toBe('15\u00A0000');
    expect(formatPrice(100000)).toBe('100\u00A0000');
    expect(formatPrice(1500000)).toBe('1\u00A0500\u00A0000');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0');
  });

  it('handles small numbers', () => {
    expect(formatPrice(1)).toBe('1');
    expect(formatPrice(10)).toBe('10');
    expect(formatPrice(100)).toBe('100');
    expect(formatPrice(999)).toBe('999');
  });

  it('handles negative numbers', () => {
    expect(formatPrice(-1000)).toBe('-1\u00A0000');
    expect(formatPrice(-500)).toBe('-500');
  });

  it('rounds decimal numbers', () => {
    expect(formatPrice(1000.5)).toBe('1\u00A0001');
    expect(formatPrice(1000.4)).toBe('1\u00A0000');
    expect(formatPrice(999.99)).toBe('1\u00A0000');
  });

  it('handles edge cases', () => {
    expect(formatPrice(NaN)).toBe('0');
    expect(formatPrice(Infinity)).toBe('0');
    expect(formatPrice(-Infinity)).toBe('0');
  });

  it('handles very large numbers', () => {
    expect(formatPrice(1000000000)).toBe('1\u00A0000\u00A0000\u00A0000');
    expect(formatPrice(999999999)).toBe('999\u00A0999\u00A0999');
  });
});
