import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, CheckCircle, Phone, Users, Baby, Ticket, ChevronDown, Calendar, Clock, Minus, Plus, UserPlus, Loader2, Eye, EyeOff, Copy, Check, AlertCircle, CreditCard } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { weekdayPricing as localWeekdayPricing, weekendPricing as localWeekendPricing, type PricingSlot } from '@/data/pricing';
import { bookingsApi, paymentsApi, type ServiceType } from '@/services/api';
import { getApiUrl } from '@/api/wordpress';
import { findPricingSlot, getDefaultTariffId, getTariffLabel, getTariffOptions, type TariffOption } from '@/utils/pricingTariffs';

// Generate random password
function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type TicketType = 'adult' | 'child';

function normalizePricingSlots(slots: PricingSlot[] | undefined): PricingSlot[] {
  if (!Array.isArray(slots)) return [];

  return slots.map((slot) => ({
    ...slot,
    id: String(slot.id),
    adultPrice: Number(slot.adultPrice) || 0,
    childPrice: Number(slot.childPrice) || 0,
  }));
}

function isWeekend(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function isFriday(dateStr: string) {
  const d = new Date(dateStr);
  return d.getDay() === 5;
}

function isSpecialWeekendDate(dateStr: string, specialWeekendDates: Set<string>) {
  return dateStr !== '' && specialWeekendDates.has(dateStr);
}

function isFridayWeekendTime(timeStr: string) {
  const [hours = '0', minutes = '0'] = timeStr.split(':');
  return Number(hours) * 60 + Number(minutes) >= 18 * 60;
}

function getTicketTariffId(itemName: string, tariffOptions: TariffOption[]) {
  const lower = itemName.toLowerCase();
  return tariffOptions.find((option) => lower.includes(option.label.toLowerCase()))?.id
    ?? getDefaultTariffId(tariffOptions);
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatDateInputValue(new Date());
}

function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return formatDateInputValue(d);
}

const SERVICE_KEYWORDS = ['парение', 'парения', 'spa', 'спа', 'массаж', 'процедур', 'скраб', 'пилинг', 'обёртыван', 'пихтовый', 'баня', 'сауна', 'хаммам', 'пакет', 'комплекс'];
const TICKET_KEYWORDS = ['будни', 'выходные', 'час', 'безлимит'];
const STANDALONE_PRODUCT_KEYWORDS = ['абонемент', 'сертификат', 'бокс', 'мерч'];

function isStandaloneProductPurchase(itemName: string): boolean {
  const lower = itemName.toLowerCase();
  return STANDALONE_PRODUCT_KEYWORDS.some((k) => lower.includes(k));
}

function hasServiceKeyword(itemName: string): boolean {
  const lower = itemName.toLowerCase();
  return SERVICE_KEYWORDS.some((k) => lower.includes(k));
}

function isServicePurchase(itemName: string): boolean {
  if (isStandaloneProductPurchase(itemName)) return false;
  return hasServiceKeyword(itemName);
}

function isTicketPurchase(itemName: string, tariffOptions: TariffOption[]): boolean {
  const lower = itemName.toLowerCase();
  if (isStandaloneProductPurchase(itemName) || hasServiceKeyword(itemName)) return false;
  return TICKET_KEYWORDS.some((k) => lower.includes(k))
    || tariffOptions.some((option) => lower.includes(option.label.toLowerCase()));
}

// Determine service type from item name
function getServiceType(itemName: string): ServiceType {
  const lower = itemName.toLowerCase();
  if (lower.includes('массаж')) return 'MASSAGE';
  if (lower.includes('spa') || lower.includes('спа')) return 'SPA';
  if (lower.includes('хаммам')) return 'HAMMAM';
  if (lower.includes('баня') || lower.includes('парен') || lower.includes('сауна')) return 'SAUNA';
  if (lower.includes('пакет') || lower.includes('комплекс')) return 'PACKAGE';
  return 'SPA';
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

function isValidCertificateAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= 1000 && amount <= 99999999 && amount % 500 === 0;
}

export default function PurchaseModal() {
  const { purchaseOpen, purchaseItem, closeModal } = useBooking();
  const { isAuthenticated, user, register } = useAuth();

  // WP pricing data with local fallback
  const [wpPricing, setWpPricing] = useState<any>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(getApiUrl('/pricing'))
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data) setWpPricing(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const hasWpPricing = wpPricing !== null;
  const weekdayPricing: PricingSlot[] = hasWpPricing ? normalizePricingSlots(wpPricing.weekday) : localWeekdayPricing;
  const weekendPricing: PricingSlot[] = hasWpPricing ? normalizePricingSlots(wpPricing.weekend) : localWeekendPricing;
  const specialWeekendDates = useMemo(
    () => new Set<string>(Array.isArray(wpPricing?.specialWeekendDates) ? wpPricing.specialWeekendDates : []),
    [wpPricing]
  );
  const pricingContent = wpPricing?.pricingContent ?? {};
  const modalText = pricingContent.purchaseModal ?? {};
  const tariffOptions = useMemo(
    () => getTariffOptions(weekdayPricing, weekendPricing),
    [weekdayPricing, weekendPricing]
  );
  const defaultTariffId = useMemo(() => getDefaultTariffId(tariffOptions), [tariffOptions]);
  const hasVisitTariffs = tariffOptions.length > 0;
  const childUnder6Price = wpPricing?.childUnder6 ?? 470;
  const childNoteText = (modalText.childNote || pricingContent.childNote || 'Дети до 6 лет включительно — {price} ₽ безлимит')
    .replace('{price}', childUnder6Price.toLocaleString('ru-RU'));
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'register' | 'error'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');

  // Validation state
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = emailTouched && email && !emailPattern.test(email) ? 'Введите корректный email' : '';
  const phoneDigits = phone.replace(/\D/g, '');
  const phoneError = phoneTouched && phone && phoneDigits.length > 1 && phoneDigits.length < 11 ? 'Введите корректный номер телефона' : '';

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhone(value));
  };
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('12:00');

  // Registration state
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [copied, setCopied] = useState(false);
  const [ticketType, setTicketType] = useState<TicketType>('adult');
  const [addTicket, setAddTicket] = useState(false);
  const [ticketDate, setTicketDate] = useState('');
  const [ticketTariff, setTicketTariff] = useState(defaultTariffId);
  const [fridayTime, setFridayTime] = useState<'before18' | 'after18'>('before18');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasVisitTariffs) {
      setTicketTariff('');
      setAddTicket(false);
      return;
    }

    if (!tariffOptions.some((option) => option.id === ticketTariff)) {
      setTicketTariff(defaultTariffId);
    }
  }, [defaultTariffId, hasVisitTariffs, tariffOptions, ticketTariff]);

  // Payment state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const isCertificate = purchaseItem?.name.toLowerCase().includes('сертификат') ?? false;
  const isTicket = purchaseItem ? isTicketPurchase(purchaseItem.name, tariffOptions) : false;
  const mainTicketTariff = useMemo(
    () => purchaseItem && isTicket ? getTicketTariffId(purchaseItem.name, tariffOptions) : defaultTariffId,
    [purchaseItem, isTicket, tariffOptions, defaultTariffId]
  );
  const useWeekendPricingForMainTicket = isTicket && (
    isSpecialWeekendDate(visitDate, specialWeekendDates)
    || isWeekend(visitDate)
    || (isFriday(visitDate) && isFridayWeekendTime(visitTime))
  );
  const mainTicketSlot = useMemo(() => {
    if (!isTicket) return null;
    const pricing = useWeekendPricingForMainTicket ? weekendPricing : weekdayPricing;
    return findPricingSlot(pricing, mainTicketTariff, tariffOptions);
  }, [isTicket, mainTicketTariff, useWeekendPricingForMainTicket, weekendPricing, weekdayPricing, tariffOptions]);
  const fallbackAdultPrice = useMemo(() => {
    const priceStr = purchaseItem?.price ?? '0';
    const num = parseInt(priceStr.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [purchaseItem]);
  const mainTicketAdultPrice = isTicket ? (mainTicketSlot?.adultPrice ?? fallbackAdultPrice) : fallbackAdultPrice;

  // Расчёт стоимости входного билета
  const ticketPrice = useMemo(() => {
    if (!addTicket || !ticketDate) return 0;
    const useWeekendPricing = isSpecialWeekendDate(ticketDate, specialWeekendDates)
      || isWeekend(ticketDate)
      || (isFriday(ticketDate) && fridayTime === 'after18');
    const pricing = useWeekendPricing ? weekendPricing : weekdayPricing;
    const slot = findPricingSlot(pricing, ticketTariff, tariffOptions);
    return slot?.adultPrice ?? 0;
  }, [addTicket, ticketDate, ticketTariff, fridayTime, specialWeekendDates, weekendPricing, weekdayPricing, tariffOptions]);

  // Стоимость детского билета
  const childPrice = useMemo(() => {
    if (isTicket) {
      return mainTicketSlot?.childPrice ?? 0;
    }
    const priceStr = purchaseItem?.childPrice ?? '0';
    const num = parseInt(priceStr.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
  }, [purchaseItem, isTicket, mainTicketSlot]);

  // Общая стоимость услуги/билетов
  const servicePrice = useMemo(() => {
    // Для билетов умножаем на количество
    if (isTicket) {
      return mainTicketAdultPrice * adults + childPrice * children;
    }
    return fallbackAdultPrice;
  }, [isTicket, adults, mainTicketAdultPrice, childPrice, children, fallbackAdultPrice]);

  const totalPrice = servicePrice + ticketPrice;
  const isService = purchaseItem ? isServicePurchase(purchaseItem.name) : false;
  const hasChildPrice = !!purchaseItem?.childPrice;
  const displayPrice = ticketType === 'child' && hasChildPrice ? purchaseItem!.childPrice! : purchaseItem?.price ?? '';
  const mainTicketPeriodLabel = useWeekendPricingForMainTicket ? 'Выходные / Праздники' : 'Будни';
  const effectivePurchaseName = isTicket && visitDate
    ? `${mainTicketPeriodLabel} — ${getTariffLabel(tariffOptions, mainTicketTariff)}`
    : purchaseItem?.name ?? '';

  // Get duration based on tariff
  const getDuration = () => {
    if (isTicket) {
      const tariff = tariffOptions.find(t => t.id === mainTicketTariff);
      return tariff?.duration || 60;
    }
    return 60; // Default 60 min for services
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!visitDate && !purchaseItem?.certificate) {
        throw new Error('Выберите дату посещения');
      }
      // Validate email
      if (email && !emailPattern.test(email)) {
        throw new Error('Введите корректный email');
      }
      // Validate phone
      const submitPhoneDigits = phone.replace(/\D/g, '');
      if (phone && submitPhoneDigits.length > 1 && submitPhoneDigits.length < 11) {
        throw new Error('Введите корректный номер телефона');
      }
      if (purchaseItem?.certificate && !isValidCertificateAmount(purchaseItem.certificate.amount)) {
        throw new Error('Сумма сертификата должна быть от 1 000 ₽ и кратна 500 ₽');
      }

      // Create order via WP checkout API and redirect to YooKassa
      const response = await fetch('/wp-json/termburg/v1/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('termburg_token') ? { Authorization: `Bearer ${localStorage.getItem('termburg_token')}` } : {}),
        },
        body: JSON.stringify({
          name: effectivePurchaseName,
          amount: totalPrice,
          quantity: 1,
          email: email,
          phone: phone,
          customerName: name,
          returnUrl: `${window.location.origin}/account?payment=success`,
          ...(purchaseItem!.certificate && {
            cert_design: purchaseItem!.certificate.design,
            cert_occasion: purchaseItem!.certificate.occasion,
            cert_recipient: purchaseItem!.certificate.recipientName,
            cert_recipient_phone: purchaseItem!.certificate.recipientPhone,
            cert_wish: purchaseItem!.certificate.wish,
            cert_emoji: purchaseItem!.certificate.emoji,
            cert_color: purchaseItem!.certificate.color,
            cert_front_image: purchaseItem!.certificate.frontImage,
            cert_back_image: purchaseItem!.certificate.backImage,
          }),
        }),
      });

      const order = await response.json();

      if (!response.ok) {
        throw new Error(order.error || 'Ошибка при создании заказа');
      }

      setBookingId(String(order.orderId));

      // Redirect to YooKassa payment page
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        // If no payment URL, show success
        if (!isAuthenticated) {
          setGeneratedPassword(generatePassword());
        }
        setStep('success');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при оформлении заказа');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setRegisterError('');
    try {
      await register({
        email,
        password: generatedPassword,
        name,
        phone: phone || undefined,
      });
      setStep('register');
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = useCallback(() => {
    closeModal();
    setTimeout(() => {
      setStep('form');
      setName('');
      setPhone('');
      setEmail('');
      setRecipientName('');
      setVisitDate('');
      setVisitTime('12:00');
      setTicketType('adult');
      setAddTicket(false);
      setTicketDate('');
      setTicketTariff(defaultTariffId);
      setFridayTime('before18');
      setAdults(1);
      setChildren(0);
      setGeneratedPassword('');
      setShowPassword(false);
      setIsRegistering(false);
      setRegisterError('');
      setCopied(false);
      setError('');
      setBookingId(null);
      setIsSubmitting(false);
      setEmailTouched(false);
      setPhoneTouched(false);
    }, 300);
  }, [closeModal, defaultTariffId]);

  // Pre-fill data for authenticated users
  useEffect(() => {
    if (purchaseOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [purchaseOpen, user]);

  // Check if can scroll down
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 20;
      setCanScrollDown(hasMore);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll, purchaseOpen, step]);

  // Close on Escape
  useEffect(() => {
    if (!purchaseOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [purchaseOpen, handleClose]);

  if (!purchaseOpen || !purchaseItem) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purchase-title"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={scrollRef}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4 rounded-t-2xl">
          <h2 id="purchase-title" className="font-heading text-xl font-bold text-text-primary">{modalText.title || 'Оформить заказ'}</h2>
          <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-surface-warm transition-colors" aria-label="Закрыть">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Выбранная услуга */}
            <div className="rounded-xl bg-background border border-border px-5 py-4">
              <p className="font-medium text-text-primary">{effectivePurchaseName}</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {isTicket ? `${servicePrice.toLocaleString('ru-RU')} ₽` : displayPrice}
              </p>
              {(purchaseItem.name.includes('Будни') || purchaseItem.name.includes('Выходные')) && (
                <p className="mt-2 text-xs text-text-secondary/70">
                  {pricingContent.fridayNote || 'Пятница: до 18:00 — тариф будней, после 18:00 — тариф выходных'}
                </p>
              )}
              {isTicket && visitDate && (
                <p className="mt-1 text-xs font-medium text-primary">
                  Тариф по выбранной дате: {useWeekendPricingForMainTicket ? 'выходной / праздничный' : 'будний'}
                </p>
              )}
            </div>

            {/* Дата и время посещения */}
            {!isCertificate && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  {modalText.dateLabel || 'Дата посещения'}
                </label>
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  min={getToday()}
                  max={getMaxDate()}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                  <Clock className="w-4 h-4" />
                  {modalText.timeLabel || 'Время'}
                </label>
                <input
                  type="time"
                  required
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
            </div>
            )}

            {/* Выбор количества для билетов */}
            {isTicket && (
              <div className="space-y-4">
                {/* Взрослые */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{modalText.adultsLabel || 'Взрослые'}</p>
                      <p className="text-xs text-text-secondary">
                        {mainTicketAdultPrice.toLocaleString('ru-RU')} ₽ / чел.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-text-primary">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-warm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Дети */}
                {childPrice > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Baby className="w-4 h-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{modalText.childrenLabel || 'Дети 6–12 лет'}</p>
                        <p className="text-xs text-text-secondary">{childPrice.toLocaleString('ru-RU')} ₽ / чел.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-text-primary">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-surface-warm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-text-secondary/70">
                  {childNoteText}
                </p>
              </div>
            )}

            {/* Добавить входной билет */}
            {isService && hasVisitTariffs && (
              <div className="rounded-xl bg-amber-50 border border-amber-200/60 overflow-hidden">
                <label className="flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-100/50">
                  <input
                    type="checkbox"
                    checked={addTicket}
                    onChange={(e) => setAddTicket(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary/30"
                  />
                  <div className="flex items-center gap-1.5 flex-1">
                    <Ticket className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Добавить входной билет</span>
                  </div>
                  {addTicket && ticketPrice > 0 && (
                    <span className="text-sm font-bold text-primary">+{ticketPrice.toLocaleString('ru-RU')} ₽</span>
                  )}
                </label>

                {addTicket && (
                  <div className="px-5 pb-4 space-y-3 border-t border-amber-200/60 pt-3">
                    {/* Дата посещения */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
                        <Calendar className="w-3.5 h-3.5" />
                        {modalText.dateLabel || 'Дата посещения'}
                      </label>
                      <input
                        type="date"
                        value={ticketDate}
                        onChange={(e) => setTicketDate(e.target.value)}
                        min={getToday()}
                        className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                      />
                    </div>

                    {/* Пятница: до/после 18:00 */}
                    {ticketDate && isFriday(ticketDate) && !isSpecialWeekendDate(ticketDate, specialWeekendDates) && (
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Время посещения (пятница)
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFridayTime('before18')}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                              fridayTime === 'before18'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-amber-200 text-amber-800 hover:border-primary/30'
                            }`}
                          >
                          До 18:00
                            <span className="block text-[10px] opacity-70">тариф будней</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFridayTime('after18')}
                            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                              fridayTime === 'after18'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-amber-200 text-amber-800 hover:border-primary/30'
                            }`}
                          >
                          После 18:00
                            <span className="block text-[10px] opacity-70">тариф выходных</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Тариф */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        Тариф
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {tariffOptions.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTicketTariff(opt.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium break-words transition-all border ${
                              ticketTariff === opt.id
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-amber-200 text-amber-800 hover:border-primary/30'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Взрослый / Детский toggle (только для не-билетов) */}
            {hasChildPrice && !isTicket && (
              <div>
                <p className="mb-2 text-sm font-medium text-text-secondary">Тип билета</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketType('adult')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                      ticketType === 'adult'
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-primary/30'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Взрослый
                    <span className={`text-xs ${ticketType === 'adult' ? 'text-white/80' : 'text-text-secondary'}`}>
                      {purchaseItem.price}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketType('child')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                      ticketType === 'child'
                        ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                        : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-accent/30'
                    }`}
                  >
                    <Baby className="w-4 h-4" />
                    Детский
                    <span className={`text-xs ${ticketType === 'child' ? 'text-white/80' : 'text-text-secondary'}`}>
                      {purchaseItem.childPrice}
                    </span>
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-text-secondary/70">
                  {childNoteText}
                </p>
              </div>
            )}

            {/* Имя получателя (для сертификатов без мета) */}
            {isCertificate && !purchaseItem?.certificate && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                  Имя получателя сертификата
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Кому дарите?"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
                <p className="mt-1 text-xs text-text-secondary/70">
                  Будет указано на сертификате. Оставьте пустым, если не нужно.
                </p>
              </div>
            )}

            {/* Превью конфигурации сертификата */}
            {isCertificate && purchaseItem?.certificate && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 space-y-1 text-sm">
                <p className="font-semibold text-text-primary mb-1">Ваш сертификат:</p>
                <p className="text-text-secondary">Повод: <span className="text-text-primary">{purchaseItem.certificate.occasion}</span></p>
                {purchaseItem.certificate.recipientName && (
                  <p className="text-text-secondary">Получатель: <span className="text-text-primary">{purchaseItem.certificate.recipientName}</span></p>
                )}
                {purchaseItem.certificate.recipientPhone && (
                  <p className="text-text-secondary">Телефон: <span className="text-text-primary">{purchaseItem.certificate.recipientPhone}</span></p>
                )}
                {purchaseItem.certificate.wish && (
                  <p className="text-text-secondary">Пожелание: <span className="text-text-primary italic">«{purchaseItem.certificate.wish}»</span></p>
                )}
                <p className="text-xs text-text-secondary/70 mt-2">PDF будет отправлен на ваш email после оплаты.</p>
              </div>
            )}

            {/* Контактные данные */}
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{modalText.nameLabel || 'Ваше имя'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={modalText.namePlaceholder || 'Ваше имя'}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{modalText.phoneLabel || 'Телефон'}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setPhoneTouched(true)}
                  placeholder={modalText.phonePlaceholder || '+7 (___) ___-__-__'}
                  className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-2 outline-none transition-colors ${
                    phoneError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{modalText.emailLabel || 'Email'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder={modalText.emailPlaceholder || 'your@email.com'}
                  className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:ring-2 outline-none transition-colors ${
                    emailError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-border focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>
            </div>

            {/* Итого */}
            {addTicket && ticketPrice > 0 && (
              <div className="rounded-xl bg-surface border border-border px-5 py-4">
                <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
                  <span>Услуга:</span>
                  <span>{servicePrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                  <span>Входной билет:</span>
                  <span>{ticketPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-text-primary">Итого:</span>
                  <span className="text-xl font-bold text-primary">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            )}

            {/* Auth notice */}
            {!isAuthenticated && (
              <div className="rounded-xl bg-blue-50 border border-blue-200/60 px-4 py-3">
                <p className="text-sm text-blue-800">
                  {modalText.authNotice || 'После оплаты вы сможете создать личный кабинет для отслеживания заказов.'}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-light active:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {modalText.processingLabel || 'Оформляем...'}
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  {modalText.submitPrefix || 'Оплатить —'} {(isTicket ? servicePrice : (addTicket && ticketPrice > 0 ? totalPrice : servicePrice)).toLocaleString('ru-RU')} ₽
                </>
              )}
            </button>
          </form>
        ) : step === 'error' ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-text-primary">Ошибка</h3>
            <p className="mb-6 text-text-secondary">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => setStep('form')}
                className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light"
              >
                Попробовать снова
              </button>
              <p className="text-sm text-text-secondary">
                Или позвоните: <a href="tel:+79091674746" className="text-primary hover:underline">+7 (909) 167-47-46</a>
              </p>
            </div>
          </div>
        ) : step === 'success' ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-text-primary">Заказ оформлен!</h3>
            <p className="mb-6 text-text-secondary">
              Перенаправляем на страницу оплаты...
            </p>
            {/* Registration offer for non-authenticated users */}
            {!isAuthenticated && (
              <div className="mb-6 rounded-xl bg-primary/5 border border-primary/20 p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-text-primary">Создать личный кабинет?</h4>
                </div>
                <p className="text-sm text-text-secondary mb-3">
                  Отслеживайте заказы, копите бонусы и получайте скидки постоянного клиента.
                </p>

                {/* Show generated password */}
                <div className="mb-3">
                  <p className="text-xs text-text-secondary mb-1">Ваш пароль для входа:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg bg-white border border-border px-3 py-2 font-mono text-sm">
                      {showPassword ? generatedPassword : '••••••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-surface-warm transition-colors"
                      title={showPassword ? 'Скрыть' : 'Показать'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="p-2 rounded-lg hover:bg-surface-warm transition-colors"
                      title="Скопировать"
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {registerError && (
                  <p className="text-sm text-red-500 mb-3">{registerError}</p>
                )}

                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering && <Loader2 className="h-4 w-4 animate-spin" />}
                  Создать аккаунт
                </button>
              </div>
            )}

            <div>
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light"
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          /* Registration success */
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <UserPlus className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-text-primary">Аккаунт создан!</h3>
            <p className="mb-4 text-text-secondary">
              Теперь вы можете копить бонусы и получать скидки.
            </p>
            <div className="mb-6 rounded-xl bg-background border border-border p-4 text-left">
              <p className="text-sm text-text-secondary mb-1">Ваши данные для входа:</p>
              <p className="text-sm"><strong>Email:</strong> {email}</p>
              <p className="text-sm"><strong>Пароль:</strong> {generatedPassword}</p>
              <p className="mt-2 text-xs text-text-secondary">
                Сохраните пароль. Вы можете изменить его в личном кабинете.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light"
            >
              Перейти в личный кабинет
            </button>
          </div>
        )}

        {/* Scroll indicator */}
        {canScrollDown && (
          <div className="sticky bottom-0 left-0 right-0 pointer-events-none">
            <div className="h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-5 h-5 text-primary/60" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
