import { useEffect, useMemo, useState } from 'react';
import type { CheckoutLineItem } from '@/context/BookingContext';

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
  onApplied: (validation: PromoValidation | null) => void;
}

export default function PromoCodeField({ items, email, phone, onApplied }: PromoCodeFieldProps) {
  const [config, setConfig] = useState<PromoConfig | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState<PromoValidation | null>(null);
  const cartFingerprint = useMemo(() => JSON.stringify(items), [items]);

  useEffect(() => {
    let active = true;
    fetch('/wp-json/termburg-promocodes/v1/checkout/config')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (active && data) {
          setConfig(data);
        }
      })
      .catch(() => {});
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
      const response = await fetch('/wp-json/termburg-promocodes/v1/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: normalizedCode,
          items,
          email,
          phone,
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
          className="promo-code__input"
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
