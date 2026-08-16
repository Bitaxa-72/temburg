import { useEffect, useMemo, useState } from 'react';
import type { CheckoutLineItem } from '@/context/BookingContext';
import { API_BASE } from '@/api/wordpress';

interface PromoConfig {
  enabled: boolean;
  label: string;
  placeholder: string;
  button: string;
  appliedText: string;
}

export interface PromoValidation {
  code: string;
  discountAmount: number;
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  eligibleTotal: number;
  campaignId: string;
  campaignName: string;
  message: string;
}

interface PromoCodeFieldProps {
  items: CheckoutLineItem[];
  email: string;
  phone: string;
  checkoutRequestId: string;
  onApplied: (validation: PromoValidation | null) => void;
}

function promoApiUrl(endpoint: string): string {
  const apiBase = import.meta.env.VITE_PROMO_API_URL || API_BASE;
  try {
    return `${new URL(apiBase).origin}/wp-json/termburg-promocodes/v1${endpoint}`;
  } catch {
    return `/wp-json/termburg-promocodes/v1${endpoint}`;
  }
}

export default function PromoCodeField({ items, email, phone, checkoutRequestId, onApplied }: PromoCodeFieldProps) {
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState<PromoValidation | null>(null);
  const cartFingerprint = useMemo(() => JSON.stringify(items), [items]);

  useEffect(() => {
    let active = true;
    fetch(promoApiUrl('/checkout/config'))
      .then((response) => {
        if (!response.ok) {
          throw new Error('');
        }
        return response.json();
      })
      .then((data) => {
        if (active && data) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (active) {
          setConfig(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setValidation(null);
    setError('');
    onApplied(null);
  }, [cartFingerprint, email, phone, onApplied]);

  if (!config?.enabled) {
    return null;
  }

  const applyCode = async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode || items.length === 0) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(promoApiUrl('/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: normalizedCode,
          items,
          email,
          phone,
          checkoutRequestId,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.valid) {
        throw new Error(result.message || result.error || '');
      }

      const nextValidation: PromoValidation = {
        code: String(result.code || normalizedCode),
        discountAmount: Number(result.discountAmount) || 0,
        totalBeforeDiscount: Number(result.totalBeforeDiscount) || 0,
        totalAfterDiscount: Number(result.totalAfterDiscount) || 0,
        eligibleTotal: Number(result.eligibleTotal) || 0,
        campaignId: String(result.campaignId || ''),
        campaignName: String(result.campaignName || ''),
        message: String(result.message || config.appliedText),
      };
      setValidation(nextValidation);
      setCode(nextValidation.code);
      onApplied(nextValidation);
    } catch (applyError) {
      setValidation(null);
      onApplied(null);
      setError(applyError instanceof Error ? applyError.message : '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="promo-code">
      <label className="promo-code__label" htmlFor="termburg-promo-code">
        {config.label}
      </label>
      <div className="promo-code__controls">
        <input
          id="termburg-promo-code"
          className="promo-code__input w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
          type="text"
          value={code}
          disabled={loading}
          placeholder={config.placeholder}
          autoComplete="off"
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setValidation(null);
            setError('');
            onApplied(null);
          }}
        />
        <button
          className="promo-code__button"
          type="button"
          disabled={loading || code.trim() === '' || items.length === 0}
          onClick={applyCode}
        >
          {config.button}
        </button>
      </div>
      {validation && (
        <div className="promo-code__result promo-code__result--success">
          <span>{config.appliedText}</span>
          <strong>
            {validation.campaignName}: −{validation.discountAmount.toLocaleString('ru-RU')} ₽
          </strong>
        </div>
      )}
      {error && (
        <div className="promo-code__result promo-code__result--error">
          {error}
        </div>
      )}
    </div>
  );
}
