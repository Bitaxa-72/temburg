import { useState, useRef, useEffect, memo } from 'react';
import { toPng } from 'html-to-image';
import JsBarcode from 'jsbarcode';
import { Gift, Sparkles, Heart, Star, Check, Plus } from 'lucide-react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return '+7';
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9) return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}

const termlinData = [
  { id: 'yaromir', name: 'Яромир' },
  { id: 'valkiriya', name: 'Валькирия' },
  { id: 'pereslav', name: 'Переслав' },
  { id: 'kazimir', name: 'Казимир' },
  { id: 'vedagor', name: 'Ведагор' },
  { id: 'milovan', name: 'Милован' },
  { id: 'lelya', name: 'Леля' },
  { id: 'group', name: 'Все вместе' },
];

const termlinFallback: Record<string, string> = {
  yaromir: '/images/termliny/yaromir.webp',
  valkiriya: '/images/termliny/valkiriya.webp',
  pereslav: '/images/termliny/pereslav.webp',
  kazimir: '/images/termliny/kazimir.webp',
  vedagor: '/images/termliny/vedagor.webp',
  milovan: '/images/termliny/milovan.webp',
  lelya: '/images/termliny/lelya.webp',
  group: '/images/termliny/hero.jpg',
};

const v1baseImages: Record<string, string> = {
  birthday: '/images/certificates/v1-base/birthday.png',
  spa: '/images/certificates/v1-base/spa.png',
  mensday: '/images/certificates/v1-base/mensday.png',
  womensday: '/images/certificates/v1-base/womensday.png',
  newyear: '/images/certificates/v1-base/newyear.png',
};

let wpCertImageMap: Record<string, string> = {};

const getTermlinHolidayImage = (_termlinId: string, holidayId: string): string => {
  return wpCertImageMap[holidayId] || v1baseImages[holidayId] || '/images/certificates/v1-base/universal.png';
};

const termlinPhotos = termlinData.map(t => ({
  ...t,
  src: termlinFallback[t.id],
}));

const holidayTermlinyMap: Record<string, string[]> = {
  birthday: ['yaromir', 'valkiriya', 'pereslav', 'kazimir', 'vedagor', 'milovan', 'lelya', 'group'],
  spa: ['valkiriya', 'milovan', 'lelya', 'yaromir', 'group'],
  mensday: ['yaromir', 'pereslav', 'kazimir', 'milovan', 'group'],
  womensday: ['valkiriya', 'lelya', 'vedagor', 'group'],
  easter: ['yaromir', 'pereslav', 'vedagor', 'valkiriya', 'group'],
  laborday: ['yaromir', 'pereslav', 'valkiriya', 'kazimir', 'group'],
  victoryday: ['yaromir', 'pereslav', 'kazimir', 'group'],
  childday: ['vedagor', 'lelya', 'milovan', 'pereslav', 'group'],
  russiaday: ['yaromir', 'pereslav', 'kazimir', 'valkiriya', 'group'],
  familyday: ['yaromir', 'valkiriya', 'pereslav', 'kazimir', 'vedagor', 'milovan', 'lelya', 'group'],
  motherday: ['valkiriya', 'lelya', 'vedagor', 'group'],
  newyear: ['yaromir', 'valkiriya', 'pereslav', 'kazimir', 'vedagor', 'milovan', 'lelya', 'group'],
  custom: ['yaromir', 'valkiriya', 'pereslav', 'kazimir', 'vedagor', 'milovan', 'lelya', 'group'],
};

const getPhotosForHoliday = (holidayId: string) => {
  const allowedTermliny = holidayTermlinyMap[holidayId] || holidayTermlinyMap.custom;
  return termlinData
    .filter(t => allowedTermliny.includes(t.id))
    .map(t => ({
      ...t,
      src: holidayId === 'custom'
        ? termlinFallback[t.id]
        : getTermlinHolidayImage(t.id, holidayId),
    }));
};

const holidaysWithDates = [
  { id: 'birthday', label: 'День рождения', month: 0, day: 0 },
  { id: 'spa', label: 'SPA-релакс', month: 0, day: 0 },
  { id: 'mensday', label: '23 февраля', month: 2, day: 23 },
  { id: 'womensday', label: '8 марта', month: 3, day: 8 },
  { id: 'easter', label: 'Пасха', month: 4, day: 20 },
  { id: 'laborday', label: '1 мая', month: 5, day: 1 },
  { id: 'victoryday', label: '9 мая', month: 5, day: 9 },
  { id: 'childday', label: 'День защиты детей', month: 6, day: 1 },
  { id: 'russiaday', label: 'День России', month: 6, day: 12 },
  { id: 'familyday', label: 'День семьи', month: 7, day: 8 },
  { id: 'motherday', label: 'День матери', month: 11, day: 24 },
  { id: 'newyear', label: 'Новый год', month: 12, day: 31 },
];

const getSortedHolidays = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const getDaysUntil = (month: number, day: number) => {
    if (month === 0) return -1;
    let daysUntil = (month - currentMonth) * 30 + (day - currentDay);
    if (daysUntil < 0) daysUntil += 365;
    return daysUntil;
  };

  return [...holidaysWithDates].sort((a, b) => {
    const daysA = getDaysUntil(a.month, a.day);
    const daysB = getDaysUntil(b.month, b.day);
    if (daysA === -1 && daysB === -1) return 0;
    if (daysA === -1) return -1;
    if (daysB === -1) return -1;
    return daysA - daysB;
  });
};

const certificateHolidays = getSortedHolidays().map(h => ({ id: h.id, label: h.label }));

const certificateColors = [
  { id: 'emerald', label: 'Изумруд', bgClass: 'from-emerald-950 via-green-900 to-emerald-950', light: false },
  { id: 'amber', label: 'Янтарь', bgClass: 'from-amber-950 via-orange-900 to-amber-950', light: false },
  { id: 'pink', label: 'Розовый', bgClass: 'from-pink-950 via-fuchsia-900 to-purple-950', light: false },
  { id: 'slate', label: 'Графит', bgClass: 'from-slate-900 via-slate-800 to-zinc-900', light: false },
  { id: 'gold', label: 'Золото', bgClass: 'from-amber-950 via-yellow-900 to-amber-950', light: false },
  { id: 'teal', label: 'Бирюза', bgClass: 'from-teal-950 via-cyan-900 to-teal-950', light: false },
  { id: 'rose', label: 'Роза', bgClass: 'from-rose-950 via-rose-900 to-pink-950', light: false },
  { id: 'indigo', label: 'Индиго', bgClass: 'from-indigo-950 via-indigo-900 to-violet-950', light: false },
  { id: 'stone', label: 'Камень', bgClass: 'from-stone-800 via-stone-700 to-stone-800', light: false },
  { id: 'cream', label: 'Молочный', bgClass: 'from-amber-50 via-orange-50 to-yellow-50', light: true },
];

const CERT_AMOUNT_MIN = 1000;
const CERT_AMOUNT_MAX = 99999999;
const CERT_AMOUNT_STEP = 500;
const CERT_CAPTURE_WIDTH = 520;
const CERT_CAPTURE_HEIGHT = 325;

function isValidCertificateAmount(amount: number): boolean {
  return Number.isFinite(amount)
    && amount >= CERT_AMOUNT_MIN
    && amount <= CERT_AMOUNT_MAX
    && amount % CERT_AMOUNT_STEP === 0;
}

function normalizeCertificateAmount(amount: number): number {
  if (!Number.isFinite(amount)) return CERT_AMOUNT_MIN;
  const clamped = Math.min(CERT_AMOUNT_MAX, Math.max(CERT_AMOUNT_MIN, amount));
  return Math.round(clamped / CERT_AMOUNT_STEP) * CERT_AMOUNT_STEP;
}

export type CertificateData = {
  design: string;
  occasion: string;
  amount: number;
  recipientName: string;
  recipientPhone: string;
  wish: string;
  emoji: string;
  color: string;
  photo: string;
  code: string;         // уникальный код сертификата (Code128) — привязывается к WC order
  frontImage?: string;  // base64 PNG превью лицевой стороны
  backImage?: string;   // base64 PNG превью оборотной стороны
};

type Props = {
  onSubmit: (data: CertificateData) => void;
  submitLabel?: string;
  showDescription?: boolean;
  showPreview?: boolean;
};

const CertificateConfigurator = memo(function CertificateConfigurator({
  onSubmit,
  submitLabel,
  showDescription = true,
  showPreview = true,
}: Props) {
  const [, setWpCertsLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    window.fetch(['/wp-json', '/termburg', '/v1', '/certificates'].join(''))
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        const nameToId: Record<string, string> = {
          'День рождения': 'birthday', '8 марта': 'womensday', '23 февраля': 'mensday',
          'Новый год': 'newyear', 'День матери': 'motherday', 'День защиты детей': 'childday',
          'День Победы': 'victoryday', 'День семьи': 'familyday', 'SPA': 'spa',
        };
        const newMap: Record<string, string> = {};
        data.forEach((c: any) => {
          const id = nameToId[c.name] || c.name.toLowerCase().replace(/\s+/g, '-');
          if (c.image) newMap[id] = c.image;
        });
        wpCertImageMap = newMap;
        if (active) setWpCertsLoaded(true);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const [selectedHoliday, setSelectedHoliday] = useState(certificateHolidays[0].id);
  const [certAmount, setCertAmount] = useState(3000);
  const [certWish, setCertWish] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [customHoliday, setCustomHoliday] = useState('');
  const [selectedColor, setSelectedColor] = useState(certificateColors[0].id);
  const wishRef = useRef<HTMLTextAreaElement>(null);
  const colorCarouselRef = useRef<HTMLDivElement>(null);
  const frontPreviewRef = useRef<HTMLDivElement>(null);
  const backPreviewRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  // Уникальный код сертификата — генерируется один раз при монтировании компонента,
  // попадает в штрихкод превью, в PNG, в WC-заказ и сохраняется как cert_code.
  // eslint-disable-next-line react-hooks/purity
  const ticketIdRef = useRef<string>(`TERMB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`);

  const ticketId = ticketIdRef.current;

  const selectedHolidayData = certificateHolidays.find(h => h.id === selectedHoliday) || certificateHolidays[0];
  const selectedColorData = certificateColors.find(c => c.id === selectedColor) || certificateColors[0];
  const isCertAmountValid = isValidCertificateAmount(certAmount);

  // Рендерим реальный Code128 штрихкод в SVG ref'е
  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, ticketId, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        width: 2,
        height: 36,
        background: 'transparent',
        lineColor: '#000000',
      });
    } catch (err) {
      console.warn('Barcode render failed:', err);
    }
  }, [ticketId]);

  const isLightBg = selectedColorData.light;
  const certText = {
    primary: isLightBg ? 'text-black' : 'text-white',
    secondary: isLightBg ? 'text-black/70' : 'text-amber-200/80',
    heading: isLightBg ? 'text-black' : 'text-amber-100',
    muted: isLightBg ? 'text-black/50' : 'text-white/50',
    soft: isLightBg ? 'text-black/70' : 'text-white/70',
    medium: isLightBg ? 'text-black/80' : 'text-white/80',
    bright: isLightBg ? 'text-black/90' : 'text-white/90',
    accent: isLightBg ? 'text-black/60' : 'text-amber-200/60',
    italic: isLightBg ? 'text-black/70' : 'text-amber-100/80',
    code: isLightBg ? 'text-black/50' : 'text-white/60',
  };

  const getHolidayLabel = () => {
    if (selectedHoliday === 'custom') return customHoliday || 'Мой праздник';
    return selectedHolidayData.label;
  };
  const holidayCarouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const itemWidth = ref.current.offsetWidth / 3 + 8;
      ref.current.scrollBy({
        left: direction === 'left' ? -itemWidth : itemWidth,
        behavior: 'smooth',
      });
    }
  };

  const emojiOptions = ['✨', '💝', '🎉', '💆', '🧖', '❤️', '🌸', '🔥', '💫', '🎁', '💕', '🌟'];

  const insertEmoji = (emoji: string) => {
    const textarea = wishRef.current;
    if (!textarea) {
      setCertWish(prev => prev + emoji);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = certWish.slice(0, start) + emoji + certWish.slice(end);
    setCertWish(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const captureCertificateSide = (node: HTMLDivElement) => toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    width: CERT_CAPTURE_WIDTH,
    height: CERT_CAPTURE_HEIGHT,
    style: {
      width: `${CERT_CAPTURE_WIDTH}px`,
      height: `${CERT_CAPTURE_HEIGHT}px`,
      maxWidth: 'none',
    },
  });

  const handleSubmit = async () => {
    if (!isCertAmountValid) {
      setCertAmount(prev => normalizeCertificateAmount(prev));
      return;
    }

    const emojiChars = (certWish.match(/\p{Extended_Pictographic}/gu) || []).join('');
    let frontImage: string | undefined;
    let backImage: string | undefined;
    try {
      setIsCapturing(true);
      if (frontPreviewRef.current) {
        frontImage = await captureCertificateSide(frontPreviewRef.current);
      }
      if (backPreviewRef.current) {
        backImage = await captureCertificateSide(backPreviewRef.current);
      }
    } catch (err) {
      console.warn('Failed to capture cert preview:', err);
    } finally {
      setIsCapturing(false);
    }
    onSubmit({
      design: selectedHoliday === 'custom' ? 'spa' : selectedHoliday,
      occasion: getHolidayLabel(),
      amount: certAmount,
      recipientName,
      recipientPhone,
      wish: certWish,
      emoji: emojiChars,
      color: selectedColor,
      photo: 'gradient',
      code: ticketId,
      frontImage,
      backImage,
    });
  };

  const gridCols = showDescription && showPreview
    ? 'lg:grid-cols-[280px_1fr_540px]'
    : showPreview
      ? 'lg:grid-cols-[1fr_540px]'
      : showDescription
        ? 'lg:grid-cols-[280px_1fr]'
        : '';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-2xl">
      <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className={`grid ${gridCols} gap-6 lg:gap-10 items-start`}>
          {showDescription && (
            <div className="flex flex-col justify-start pt-2">
              <div className="flex items-center gap-2 mb-5">
                <Gift className="w-8 h-8 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">Идея для подарка</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
                Подарочный сертификат
              </h3>
              <p className="text-base text-text-secondary leading-relaxed mb-6">
                Подарите близким день расслабления в термальном комплексе. Сертификат на любую сумму — идеальный подарок на день рождения, юбилей или просто без повода.
              </p>
              <div className="flex flex-col gap-3 text-base text-text-secondary">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  Красивое оформление
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Любая сумма от 1 000 ₽
                </span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Действует 6 месяцев
                </span>
              </div>
            </div>
          )}

          <div
            className="rounded-2xl bg-surface border border-border p-6 space-y-4 shadow-xl"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Праздник</label>
                <div className="relative px-8">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(holidayCarouselRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-text-primary hover:bg-surface transition-colors"
                  >
                    ‹
                  </button>
                  <div ref={holidayCarouselRef} className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide snap-x snap-mandatory" style={{ clipPath: 'inset(0)' }}>
                    {certificateHolidays.map((holiday) => (
                      <button
                        key={holiday.id}
                        type="button"
                        onClick={() => setSelectedHoliday(holiday.id)}
                        className={`relative flex-shrink-0 w-[calc((100%-16px)/3)] aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all snap-start bg-stone-700 ${
                          selectedHoliday === holiday.id
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-transparent hover:border-white/30'
                        }`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold text-center px-1 leading-tight">
                          {holiday.label}
                        </span>
                        {selectedHoliday === holiday.id && (
                          <div className="absolute top-1 right-1">
                            <Check className="w-3 h-3 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedHoliday('custom')}
                      className={`relative flex-shrink-0 w-[calc((100%-16px)/3)] aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all snap-start bg-gradient-to-br from-stone-700 via-stone-600 to-stone-700 ${
                        selectedHoliday === 'custom'
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-transparent hover:border-white/30'
                      }`}
                    >
                      <span className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <Plus className="w-4 h-4 mb-0.5" />
                        <span className="text-[9px] font-medium">Свой</span>
                      </span>
                      {selectedHoliday === 'custom' && (
                        <div className="absolute top-1 right-1">
                          <Check className="w-3 h-3 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  </div>
                  {selectedHoliday === 'custom' && (
                    <input
                      type="text"
                      value={customHoliday}
                      onChange={(e) => setCustomHoliday(e.target.value)}
                      placeholder="Введите название..."
                      className="mt-2 w-full rounded-lg bg-background border border-border px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
                      maxLength={30}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => scrollCarousel(holidayCarouselRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-text-primary hover:bg-surface transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Цвет</label>
                <div className="relative px-8">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(colorCarouselRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-text-primary hover:bg-surface transition-colors"
                  >
                    ‹
                  </button>
                  <div ref={colorCarouselRef} className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide snap-x snap-mandatory" style={{ clipPath: 'inset(0)' }}>
                    {certificateColors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColor(color.id)}
                        className={`relative flex-shrink-0 w-[calc((100%-16px)/3)] aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all snap-start bg-gradient-to-br ${color.bgClass} ${
                          selectedColor === color.id
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-transparent hover:border-white/30'
                        }`}
                      >
                        <span className={`absolute inset-0 flex items-center justify-center ${color.light ? 'text-black' : 'text-white'} text-[10px] font-bold text-center px-1`}>
                          {color.label}
                        </span>
                        {selectedColor === color.id && (
                          <div className="absolute top-1 right-1">
                            <Check className={`w-3 h-3 ${color.light ? 'text-black' : 'text-white'} drop-shadow-lg`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(colorCarouselRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white shadow-md border border-border flex items-center justify-center text-text-primary hover:bg-surface transition-colors"
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-secondary">
                Оформление изображения временно отключено. Сертификат будет создан в фирменном градиентном стиле без фото.
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Сумма</label>
              <div className="flex gap-1.5 mb-1.5">
                {[1000, 3000, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors ${
                      certAmount === amount
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-text-primary hover:border-primary/40'
                    }`}
                    onClick={() => setCertAmount(amount)}
                  >
                    {amount.toLocaleString('ru-RU')}&nbsp;&#8381;
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={1000}
                max={99999999}
                step={500}
                value={certAmount}
                onChange={(e) => setCertAmount(Math.min(CERT_AMOUNT_MAX, Math.max(CERT_AMOUNT_MIN, Number(e.target.value))))}
                onBlur={() => setCertAmount(prev => normalizeCertificateAmount(prev))}
                className={`w-full rounded-lg bg-background border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none transition-colors ${
                  isCertAmountValid
                    ? 'border-border focus:border-primary/50'
                    : 'border-red-400 focus:border-red-400'
                }`}
              />
              {!isCertAmountValid && (
                <p className="mt-1 text-xs text-red-500">Сумма должна быть от 1 000 ₽ и кратна 500 ₽.</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Кому</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Имя получателя"
                className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Телефон получателя</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(formatPhone(e.target.value))}
                placeholder="+7 (999) 123-45-67"
                className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-text-secondary">Пожелание</label>
                <span className={`text-xs ${certWish.length > 180 ? 'text-red-500' : 'text-text-secondary/50'}`}>
                  {certWish.length}/180
                </span>
              </div>
              <textarea
                ref={wishRef}
                rows={2}
                maxLength={180}
                value={certWish}
                onChange={(e) => setCertWish(e.target.value)}
                placeholder="Напишите тёплые слова... 💝"
                className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              <div className="flex items-center gap-0.5 mt-2 flex-wrap">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 rounded-md text-base flex items-center justify-center transition-all bg-background hover:bg-primary/10 hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isCapturing || !isCertAmountValid}
              className="w-full rounded-xl bg-primary hover:bg-primary-light disabled:opacity-60 text-dark-surface font-bold py-3 text-base transition-colors shadow-lg shadow-primary/20"
            >
              {isCapturing ? 'Подготовка сертификата…' : (submitLabel ?? `Подарить — ${certAmount.toLocaleString('ru-RU')} ₽`)}
            </button>
          </div>

          <div
            className={showPreview ? 'flex flex-col items-center lg:items-start' : 'fixed'}
            style={showPreview ? undefined : { left: -20000, top: 0, width: 520, pointerEvents: 'none', opacity: 1 }}
            aria-hidden={!showPreview}
          >
              {showPreview && <p className="text-sm text-text-secondary mb-3">Предпросмотр сертификата</p>}
              <div className="w-full max-w-[520px] space-y-4">
                <div ref={frontPreviewRef} className={`relative rounded-2xl overflow-hidden shadow-2xl ring-1 ${isLightBg ? 'ring-stone-300' : 'ring-white/10'} bg-gradient-to-br ${selectedColorData.bgClass}`} style={{ aspectRatio: '16/10' }}>
                  <div className="absolute inset-0 flex">
                    <div className={`w-[48%] flex flex-col p-6 ${certText.primary} z-10 overflow-hidden justify-between`}>
                      <div>
                        <p className={`text-[10px] uppercase tracking-[0.2em] ${certText.secondary} mb-1`}>Подарочный сертификат</p>
                        <h4 className={`font-heading text-2xl font-bold ${certText.heading} tracking-wide`}>ТЕРМБУРГ</h4>
                        <p className={`text-[10px] ${certText.accent} uppercase tracking-wider mt-1`}>Термальный комплекс</p>
                        <div className="w-14 h-0.5 bg-gradient-to-r from-primary to-transparent mt-3 mb-3" />
                        <p className={`text-base font-bold ${certText.primary}`}>{getHolidayLabel()}</p>
                        <p className={`font-bold text-primary whitespace-nowrap mt-1 ${certAmount >= 1000000 ? 'text-2xl' : certAmount >= 100000 ? 'text-3xl' : 'text-4xl'}`}>
                          {certAmount.toLocaleString('ru-RU')}&nbsp;₽
                        </p>
                      </div>
                      <div className={`text-[10px] ${certText.muted} space-y-0.5`}>
                        <p>ул. Гурьянова, д. 30</p>
                        <p>+7 (909) 167-47-46</p>
                        <p className="text-primary font-semibold">termburg.ru</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={backPreviewRef} className={`relative rounded-2xl overflow-hidden shadow-xl ring-1 ${isLightBg ? 'ring-stone-300' : 'ring-white/10'} bg-gradient-to-br ${selectedColorData.bgClass}`} style={{ aspectRatio: '16/10' }}>
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-heading text-2xl font-bold ${certText.primary}`}>ТЕРМБУРГ</h4>
                        <p className={`text-xs ${certText.muted} mt-0.5`}>Термальный комплекс</p>
                        <div className="mt-3 space-y-0.5">
                          <p className={`text-[10px] ${certText.muted} uppercase tracking-wider`}>Получатель</p>
                          <p className={`text-lg font-semibold ${certText.primary}`}>{recipientName || '—'}</p>
                          {recipientPhone && (
                            <p className={`text-sm ${certText.medium}`}>{recipientPhone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="h-10 bg-white rounded-md p-1.5 flex items-center">
                          <svg ref={barcodeRef} style={{ height: '100%', width: 'auto' }} />
                        </div>
                        <p className={`text-[9px] ${certText.code} mt-1 font-mono`}>{ticketId}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      {certWish ? (
                        <p className={`text-sm italic ${certText.italic} leading-relaxed text-center max-w-[90%] break-words`} style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {certWish}
                        </p>
                      ) : (
                        <p className={`text-sm ${certText.muted} italic`}>Место для пожелания</p>
                      )}
                    </div>
                    <div className={`flex justify-center gap-6 text-[10px] ${certText.soft}`}>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        6 месяцев
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        Частями
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-primary" />
                        Любые услуги
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificateConfigurator;
