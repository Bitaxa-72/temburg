import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { X, Minus, Plus, Phone, CheckCircle, ChevronDown, CheckCircle2, Info, Ticket } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import CertificateConfigurator from '@/components/shared/CertificateConfigurator';
import { weekdayPricing as localWeekdayPricing, weekendPricing as localWeekendPricing, subscriptions as localSubscriptions, type PricingSlot, type Subscription } from '@/data/pricing';
import { steamServices as localSteamServices, massageServices as localMassageServices, spaServices as localSpaServices, type ServiceItem } from '@/data/services';

type BookingType = 'steaming' | 'massage' | 'spa' | 'visit' | 'certificate' | 'subscription';

const tariffOptions = [
  { id: '1h', label: '1 час' },
  { id: '2h', label: '2 часа' },
  { id: '3h', label: '3 часа' },
  { id: '4h', label: '4 часа' },
  { id: 'unlimited', label: 'Безлимит на день' },
];

const localCertImages = [
  { id: 'pool', src: '/images/complex/pool.webp', label: 'Бассейн' },
  { id: 'herbal', src: '/images/complex/herbal.webp', label: 'Травяная парная' },
  { id: 'termliny', src: '/images/termliny/teaser.jpg', label: 'Термлины' },
  { id: 'russian', src: '/images/saunas/attributes/russian-attr.jpg', label: 'Русская баня' },
];

// Will be overridden by WP data in component
let certificateImages = localCertImages;

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
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

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getMaxDate() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d.toISOString().split('T')[0];
}

export default function BookingModal() {
  const { bookingOpen, closeModal, openPurchase } = useBooking();

  // Load certificate images from WP
  const [certImgs, setCertImgs] = useState(localCertImages);
  useEffect(() => {
    let active = true;
    window.fetch(['/wp-json', '/termburg', '/v1', '/certificates'].join(''))
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        const mapped = data.map((c: any, i: number) => ({
          id: 'wp-cert-' + i,
          src: c.image || localCertImages[0].src,
          label: c.name || 'Сертификат',
        }));
        setCertImgs(mapped);
        certificateImages = mapped;
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // WP pricing data with local fallback
  const [wpPricing, setWpPricing] = useState<any>(null);
  const [wpServices, setWpServices] = useState<any>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/wp-json/termburg/v1/pricing')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data) setWpPricing(data); })
      .catch(() => {});
    fetch('/wp-json/termburg/v1/services')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && data) setWpServices(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const weekdayPricing: PricingSlot[] = wpPricing?.weekday || localWeekdayPricing;
  const weekendPricing: PricingSlot[] = wpPricing?.weekend || localWeekendPricing;
  const specialWeekendDates = useMemo(
    () => new Set<string>(Array.isArray(wpPricing?.specialWeekendDates) ? wpPricing.specialWeekendDates : []),
    [wpPricing]
  );
  const subscriptions: Subscription[] = wpPricing?.subscriptions?.length ? wpPricing.subscriptions : localSubscriptions;
  const steamServices: ServiceItem[] = wpServices?.steam || localSteamServices;
  const massageServices: ServiceItem[] = wpServices?.massage || localMassageServices;
  const spaServices: ServiceItem[] = wpServices?.spa || localSpaServices;
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [bookingType, setBookingType] = useState<BookingType>('visit');
  const [date, setDate] = useState('');
  const [tariff, setTariff] = useState('unlimited');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSteam, setSelectedSteam] = useState('');
  const [selectedMassage, setSelectedMassage] = useState('');
  const [selectedSpa, setSelectedSpa] = useState('');
  const [certImage, setCertImage] = useState(certificateImages[0].id);
  const [certAmount, setCertAmount] = useState<number | ''>('');
  const [certWish, setCertWish] = useState('');
  const [selectedSub, setSelectedSub] = useState(subscriptions[0].id);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [showWhatToBring, setShowWhatToBring] = useState(false);
  const [fridayTime, setFridayTime] = useState<'before16' | 'after16'>('before16');
  const [addVisit, setAddVisit] = useState(false);
  const [visitTariff, setVisitTariff] = useState('unlimited');
  const [visitDate, setVisitDate] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const whatToBringItems = [
    'Полотенце',
    'Купальник',
    'Шлёпки или резиновые тапочки',
    'Мочалка, шампунь, гель для душа',
    'Расчёска',
    'Полотенце для головы или банную шапочку',
  ];

  // Расчёт стоимости посещения для услуг
  const visitPrice = useMemo(() => {
    if (!addVisit || !visitDate) return 0;
    const useWeekendPricing = isSpecialWeekendDate(visitDate, specialWeekendDates)
      || isWeekend(visitDate)
      || (isFriday(visitDate) && fridayTime === 'after16');
    const pricing = useWeekendPricing ? weekendPricing : weekdayPricing;
    const nameMap: Record<string, string> = {
      '1h': '1 час',
      '2h': '2 часа',
      '3h': '3 часа',
      '4h': '4 часа',
      unlimited: 'Безлимит на день',
    };
    const slot = pricing.find((s) => s.name === nameMap[visitTariff]);
    return slot?.adultPrice ?? 0;
  }, [addVisit, visitDate, visitTariff, fridayTime, specialWeekendDates, weekendPricing, weekdayPricing]);

  const total = useMemo(() => {
    if (bookingType === 'certificate') {
      return typeof certAmount === 'number' ? certAmount : 0;
    }
    if (bookingType === 'subscription') {
      const sub = subscriptions.find((s) => s.id === selectedSub);
      return sub?.adultPrice ?? 0;
    }
    if (bookingType === 'steaming') {
      const steam = steamServices.find((s) => s.id === selectedSteam);
      return (steam?.price ?? 0) + visitPrice;
    }
    if (bookingType === 'massage') {
      const massage = massageServices.find((s) => s.id === selectedMassage);
      return (massage?.price ?? 0) + visitPrice;
    }
    if (bookingType === 'spa') {
      const spa = spaServices.find((s) => s.id === selectedSpa);
      return (spa?.price ?? 0) + visitPrice;
    }
    if (!date) return 0;
    // Пятница после 16:00 = тариф выходных
    const useWeekendPricing = isSpecialWeekendDate(date, specialWeekendDates)
      || isWeekend(date)
      || (isFriday(date) && fridayTime === 'after16');
    const pricing = useWeekendPricing ? weekendPricing : weekdayPricing;
    const nameMap: Record<string, string> = {
      '1h': '1 час',
      '2h': '2 часа',
      '3h': '3 часа',
      '4h': '4 часа',
      unlimited: 'Безлимит на день',
    };
    const slot = pricing.find((s) => s.name === nameMap[tariff]);
    if (!slot) return 0;
    return slot.adultPrice * adults + slot.childPrice * children;
  }, [bookingType, date, tariff, adults, children, selectedSub, fridayTime, selectedSteam, selectedMassage, selectedSpa, certAmount, visitPrice, specialWeekendDates, weekendPricing, weekdayPricing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/wp-json/termburg/v1/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('termburg_token') ? { Authorization: `Bearer ${localStorage.getItem('termburg_token')}` } : {}),
        },
        body: JSON.stringify({
          name: bookingType === 'visit' ? `Входной билет (${tariff === 'unlimited' ? 'Безлимит' : tariff})` : bookingType === 'steaming' ? selectedSteam : bookingType === 'massage' ? selectedMassage : bookingType === 'spa' ? selectedSpa : bookingType === 'certificate' ? `Сертификат ${certAmount} ₽` : `Абонемент`,
          amount: total,
          quantity: adults + children || 1,
          email: email,
          phone: phone,
          customerName: name,
          returnUrl: `${window.location.origin}/account?payment=success`,
        }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Ошибка');
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        setStep('success');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setStep('success');
    }
  };

  const handleClose = useCallback(() => {
    closeModal();
    setTimeout(() => {
      setStep('form');
      setBookingType('visit');
      setDate('');
      setTariff('unlimited');
      setAdults(1);
      setChildren(0);
      setName('');
      setPhone('');
      setEmail('');
      setSelectedSteam('');
      setSelectedMassage('');
      setSelectedSpa('');
      setCertImage(certificateImages[0].id);
      setCertAmount('');
      setCertWish('');
      setSelectedSub(subscriptions[0].id);
      setShowWhatToBring(false);
      setFridayTime('before16');
      setAddVisit(false);
      setVisitTariff('unlimited');
      setVisitDate('');
    }, 300);
  }, [closeModal]);

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
  }, [checkScroll, bookingOpen, step, bookingType]);

  // Close on Escape
  useEffect(() => {
    if (!bookingOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [bookingOpen, handleClose]);

  if (!bookingOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-title"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={scrollRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-6 py-4 rounded-t-2xl">
          <h2 id="booking-title" className="font-heading text-xl font-bold text-text-primary">Получу порцию счастья</h2>
          <button onClick={handleClose} className="rounded-lg p-1.5 hover:bg-surface-warm transition-colors" aria-label="Закрыть">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Тип бронирования */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Что хотите приобрести?</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'visit' as const, label: 'Посещение' },
                  { id: 'steaming' as const, label: 'Парение' },
                  { id: 'massage' as const, label: 'Массаж' },
                  { id: 'spa' as const, label: 'Спа' },
                  { id: 'certificate' as const, label: 'Сертификат' },
                  { id: 'subscription' as const, label: 'Абонемент' },
                ]).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBookingType(opt.id)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      bookingType === opt.id
                        ? 'bg-primary text-white'
                        : 'bg-surface-warm text-text-secondary hover:bg-border'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {bookingType === 'visit' && (
              <>
                {/* Дата */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Дата посещения</label>
                  <input
                    type="date"
                    required
                    min={getTomorrow()}
                    max={getMaxDate()}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  />
                  {date && !isFriday(date) && (
                    <p className="mt-1 text-xs text-text-secondary">
                      {isWeekend(date) ? 'Выходной день — тариф выходного дня' : 'Будний день'}
                    </p>
                  )}
                  {date && isFriday(date) && !isSpecialWeekendDate(date, specialWeekendDates) && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-text-secondary">Пятница — выберите время посещения:</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFridayTime('before16')}
                          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            fridayTime === 'before16'
                              ? 'bg-primary text-white'
                              : 'bg-surface-warm text-text-secondary hover:bg-border'
                          }`}
                        >
                          До 16:00
                          <span className="block text-xs opacity-80">тариф будней</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFridayTime('after16')}
                          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            fridayTime === 'after16'
                              ? 'bg-accent text-white'
                              : 'bg-surface-warm text-text-secondary hover:bg-border'
                          }`}
                        >
                          После 16:00
                          <span className="block text-xs opacity-80">тариф выходных</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Тариф */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Тариф</label>
                  <div className="grid grid-cols-2 gap-2">
                    {tariffOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTariff(opt.id)}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          tariff === opt.id
                            ? 'bg-primary text-white'
                            : 'bg-surface-warm text-text-secondary hover:bg-border'
                        } ${opt.id === 'unlimited' ? 'col-span-2' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Гости */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Гости</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                      <span className="text-sm text-text-secondary">Взрослые</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-warm transition-colors"
                          aria-label="Уменьшить количество взрослых"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-medium text-text-primary">{adults}</span>
                        <button
                          type="button"
                          onClick={() => setAdults(Math.min(10, adults + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-warm transition-colors"
                          aria-label="Увеличить количество взрослых"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                      <span className="text-sm text-text-secondary">Дети до 6 лет</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-warm transition-colors"
                          aria-label="Уменьшить количество детей"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-medium text-text-primary">{children}</span>
                        <button
                          type="button"
                          onClick={() => setChildren(Math.min(5, children + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface-warm transition-colors"
                          aria-label="Увеличить количество детей"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Выбор парения */}
            {bookingType === 'steaming' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Выберите парение</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {steamServices.map((steam) => (
                    <button
                      key={steam.id}
                      type="button"
                      onClick={() => setSelectedSteam(steam.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                        selectedSteam === steam.id
                          ? 'bg-background border-2 border-primary'
                          : 'bg-surface border-2 border-transparent hover:bg-surface-warm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text-primary">{steam.name}</p>
                        <p className="font-bold text-primary">{steam.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{steam.duration} · {steam.description}</p>
                    </button>
                  ))}
                </div>
                {/* Добавить посещение */}
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3 cursor-pointer transition-colors hover:bg-amber-100/50">
                    <input
                      type="checkbox"
                      checked={addVisit}
                      onChange={(e) => setAddVisit(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary/30"
                    />
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Добавить входной билет</span>
                    </div>
                  </label>

                  {addVisit && (
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Дата посещения</label>
                        <input
                          type="date"
                          required
                          min={getTomorrow()}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                        {visitDate && isFriday(visitDate) && !isSpecialWeekendDate(visitDate, specialWeekendDates) && (
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => setFridayTime('before16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'before16' ? 'bg-primary text-white' : 'bg-background text-text-secondary'}`}>До 16:00</button>
                            <button type="button" onClick={() => setFridayTime('after16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'after16' ? 'bg-accent text-white' : 'bg-background text-text-secondary'}`}>После 16:00</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Тариф</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {tariffOptions.slice(0, 3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          {tariffOptions.slice(3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {visitDate && visitPrice > 0 && (
                        <p className="text-xs text-text-secondary">Посещение: <strong className="text-primary">{visitPrice.toLocaleString('ru-RU')} ₽</strong></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Выбор массажа */}
            {bookingType === 'massage' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Выберите массаж</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {massageServices.map((massage) => (
                    <button
                      key={massage.id}
                      type="button"
                      onClick={() => setSelectedMassage(massage.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                        selectedMassage === massage.id
                          ? 'bg-background border-2 border-primary'
                          : 'bg-surface border-2 border-transparent hover:bg-surface-warm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text-primary">{massage.name}</p>
                        <p className="font-bold text-primary">{massage.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{massage.duration} · {massage.description}</p>
                    </button>
                  ))}
                </div>
                {/* Добавить посещение */}
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3 cursor-pointer transition-colors hover:bg-amber-100/50">
                    <input
                      type="checkbox"
                      checked={addVisit}
                      onChange={(e) => setAddVisit(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary/30"
                    />
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Добавить входной билет</span>
                    </div>
                  </label>

                  {addVisit && (
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Дата посещения</label>
                        <input
                          type="date"
                          required
                          min={getTomorrow()}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                        {visitDate && isFriday(visitDate) && !isSpecialWeekendDate(visitDate, specialWeekendDates) && (
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => setFridayTime('before16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'before16' ? 'bg-primary text-white' : 'bg-background text-text-secondary'}`}>До 16:00</button>
                            <button type="button" onClick={() => setFridayTime('after16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'after16' ? 'bg-accent text-white' : 'bg-background text-text-secondary'}`}>После 16:00</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Тариф</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {tariffOptions.slice(0, 3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          {tariffOptions.slice(3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {visitDate && visitPrice > 0 && (
                        <p className="text-xs text-text-secondary">Посещение: <strong className="text-primary">{visitPrice.toLocaleString('ru-RU')} ₽</strong></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Выбор СПА */}
            {bookingType === 'spa' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Выберите СПА-процедуру</label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {spaServices.map((spa) => (
                    <button
                      key={spa.id}
                      type="button"
                      onClick={() => setSelectedSpa(spa.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                        selectedSpa === spa.id
                          ? 'bg-background border-2 border-primary'
                          : 'bg-surface border-2 border-transparent hover:bg-surface-warm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text-primary">{spa.name}</p>
                        <p className="font-bold text-primary">{spa.price.toLocaleString('ru-RU')} ₽</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{spa.duration} · {spa.description}</p>
                    </button>
                  ))}
                </div>
                {/* Добавить посещение */}
                <div className="mt-3 space-y-3">
                  <label className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200/60 px-4 py-3 cursor-pointer transition-colors hover:bg-amber-100/50">
                    <input
                      type="checkbox"
                      checked={addVisit}
                      onChange={(e) => setAddVisit(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary/30"
                    />
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-800">Добавить входной билет</span>
                    </div>
                  </label>

                  {addVisit && (
                    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Дата посещения</label>
                        <input
                          type="date"
                          required
                          min={getTomorrow()}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                        {visitDate && isFriday(visitDate) && !isSpecialWeekendDate(visitDate, specialWeekendDates) && (
                          <div className="mt-2 flex gap-2">
                            <button type="button" onClick={() => setFridayTime('before16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'before16' ? 'bg-primary text-white' : 'bg-background text-text-secondary'}`}>До 16:00</button>
                            <button type="button" onClick={() => setFridayTime('after16')} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${fridayTime === 'after16' ? 'bg-accent text-white' : 'bg-background text-text-secondary'}`}>После 16:00</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Тариф</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {tariffOptions.slice(0, 3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          {tariffOptions.slice(3).map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setVisitTariff(opt.id)} className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${visitTariff === opt.id ? 'bg-primary text-white' : 'bg-background text-text-secondary hover:bg-border'}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {visitDate && visitPrice > 0 && (
                        <p className="text-xs text-text-secondary">Посещение: <strong className="text-primary">{visitPrice.toLocaleString('ru-RU')} ₽</strong></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Сертификат */}
            {bookingType === 'certificate' && (
              <CertificateConfigurator
                showDescription={false}
                showPreview={false}
                onSubmit={(cert) => {
                  openPurchase({
                    name: 'Подарочный сертификат',
                    price: `${cert.amount.toLocaleString('ru-RU')} ₽`,
                    certificate: {
                      design: cert.design,
                      occasion: cert.occasion,
                      recipientName: cert.recipientName,
                      recipientPhone: cert.recipientPhone,
                      wish: cert.wish,
                      emoji: cert.emoji,
                      color: cert.color,
                      code: cert.code,
                      frontImage: cert.frontImage,
                      backImage: cert.backImage,
                    },
                  });
                }}
              />
            )}

            {bookingType === 'subscription' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Выберите абонемент</label>
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSub(sub.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                        selectedSub === sub.id
                          ? 'bg-background border-2 border-primary'
                          : 'bg-surface border-2 border-transparent hover:bg-surface-warm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-text-primary">{sub.name}</p>
                        <p className="font-bold text-primary">{sub.adultPrice.toLocaleString('ru-RU')} &#8381;</p>
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">{sub.description ?? sub.period}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Контакт */}
            {bookingType !== 'certificate' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Имя</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Телефон</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Email (для чека)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.ru"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                />
              </div>
            </div>
            )}

            {/* Итого */}
            {bookingType !== 'certificate' && total > 0 && (
              <div className="rounded-xl bg-background border border-border px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-secondary">Итого</span>
                  <span className="text-2xl font-bold text-primary">
                    {total.toLocaleString('ru-RU')}&nbsp;&#8381;
                  </span>
                </div>
                {bookingType === 'visit' && date && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {adults} взр.{children > 0 ? ` + ${children} дет.` : ''} &middot;{' '}
                    {isSpecialWeekendDate(date, specialWeekendDates) || isWeekend(date) || (isFriday(date) && fridayTime === 'after16') ? 'выходной' : 'будни'} &middot;{' '}
                    {tariffOptions.find((t) => t.id === tariff)?.label}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            {bookingType !== 'certificate' && (
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-light active:brightness-90"
            >
              Оплатить мою порцию счастья
            </button>
            )}
            <button
              type="button"
              onClick={() => setShowWhatToBring(true)}
              className="block w-full mt-3 text-center text-xs text-text-secondary/70 hover:text-primary transition-colors"
            >
              Не забудьте взять с собой →
            </button>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h3 className="mb-2 font-heading text-xl font-bold text-text-primary">Заказ оформлен!</h3>
            <p className="mb-6 text-text-secondary">
              Перенаправляем на страницу оплаты...
            </p>
            <button
              type="button"
              onClick={() => setShowWhatToBring(true)}
              className="block w-full mb-6 text-center text-sm text-primary hover:underline transition-colors"
            >
              Не забудьте взять с собой →
            </button>
            <div>
              <button
                onClick={handleClose}
                className="w-full rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light"
              >
                Закрыть
              </button>
            </div>
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

      {/* What to bring modal */}
      {showWhatToBring && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setShowWhatToBring(false); }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-500" />
                <h3 className="font-heading text-lg font-bold text-text-primary">Не забудьте взять</h3>
              </div>
              <button
                onClick={() => setShowWhatToBring(false)}
                className="rounded-lg p-1.5 hover:bg-surface-warm transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
            <div className="p-5">
              <ul className="space-y-2.5">
                {whatToBringItems.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-text-secondary/70 mt-4 pt-3 border-t border-border/50">
                Если вы что-то забудете — не переживайте! Всё можно приобрести на ресепшен.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
