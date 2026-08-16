import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Baby,
  Percent,
  Gift,
  Crown,
  Flame,
  Package,
  ShoppingBag,
  Ticket,
  Check,
  Heart,
  Star,
  Sparkles,
  Clock,
  UserCheck,
  Loader2,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import TicketButton from '@/components/ui/TicketButton';
import Container from '@/components/ui/Container';
import { useBooking, type PurchaseItem } from '@/context/BookingContext';
import { usePricing } from '@/hooks/useWordPressData';
import PricingPreviewSection from '@/components/sections/home/PricingPreviewSection';
import LegalConsents from '@/components/shared/LegalConsents';
import type { WPGiftBox, WPMerchItem } from '@/api/wordpress';
import { formatDateRu, getTariffOptionId, getTariffTimeWindowText, isDateAfter, normalizeNoticeLines, normalizeTimeValue } from '@/utils/pricingTariffs';
import { catalogKey, catalogSourceId } from '@/utils/catalogItems';

const serviceLinks = [
  { name: 'Парения и SPA', image: '/images/heroes/services.webp', href: '/services' },
  { name: 'Школа плавания', image: '/images/heroes/swimming-school.webp', href: '/swimming-school' },
  { name: 'Школа парения', image: '/images/heroes/steam-school.webp', href: '/steam-school' },
  { name: 'Кафетерий', image: '/images/heroes/cafe.webp', href: '/cafe' },
];

// Fallback data (used while loading or on error)
import {
  subscriptions as fallbackSubscriptions,
  giftBoxes as fallbackGiftBoxes,
  merchItems as fallbackMerchItems,
} from '@/data/pricing';
import { includedServices } from '@/data/services';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

/* ─── Subscription highlights ─── */
const subscriptionHighlights: Record<string, { badge?: string; badgeVariant?: 'default' | 'gold' | 'success' }> = {
  'sub-day-1': { badge: 'Выгодно', badgeVariant: 'success' },
  'sub-parent-1': { badge: 'Для семьи', badgeVariant: 'gold' },
  'sub-family-1': { badge: 'Для семьи', badgeVariant: 'gold' },
  'sub-trio-1': { badge: 'Выгодно', badgeVariant: 'success' },
};

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ─── Pricing cards ─── */
function PricingCards() {
  const { openPurchase } = useBooking();
  const [tab, setTab] = useState<'weekday' | 'weekend'>('weekday');
  const { data: wpPricing, loading } = usePricing();
  const content = wpPricing.pricingContent;

  const weekdayPricing = (wpPricing.weekday || []).map(p => ({ ...p, id: String(p.id) }));
  const weekendPricing = (wpPricing.weekend || []).map(p => ({ ...p, id: String(p.id) }));
  const pensionerSlots = (wpPricing.pensioner || []).map((p) => ({ ...p, id: String(p.id) }));
  const activeOvertimeRates = wpPricing.overtime || [];
  const childPrice = wpPricing.childUnder6 ?? 0;
  const childNote = (content?.childNote || 'Дети до 6 лет включительно — {price} ₽ безлимит')
    .replace('{price}', childPrice.toLocaleString('ru-RU'));

  const pricing = tab === 'weekday' ? weekdayPricing : weekendPricing;
  const hasWeekdayPricing = weekdayPricing.length > 0;
  const hasWeekendPricing = weekendPricing.length > 0;
  const hasVisitPricing = hasWeekdayPricing || hasWeekendPricing;

  useEffect(() => {
    if (tab === 'weekday' && !hasWeekdayPricing && hasWeekendPricing) {
      setTab('weekend');
    }
    if (tab === 'weekend' && !hasWeekendPricing && hasWeekdayPricing) {
      setTab('weekday');
    }
  }, [tab, hasWeekdayPricing, hasWeekendPricing]);
  const tabLabel = tab === 'weekday' ? (content?.weekdayLabel || 'Будни') : (content?.weekendLabel || 'Выходные');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasVisitPricing) {
    return null;
  }

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-surface-warm p-1 gap-1">
          <button
            type="button"
            onClick={() => setTab('weekday')}
            disabled={!hasWeekdayPricing}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === 'weekday'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            } ${!hasWeekdayPricing ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {content?.weekdayLabel || 'Будни'}
          </button>
          <button
            type="button"
            onClick={() => setTab('weekend')}
            disabled={!hasWeekendPricing}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === 'weekend'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            } ${!hasWeekendPricing ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {content?.weekendLabel || 'Выходные / Праздники'}
          </button>
        </div>
        <p className="text-xs text-text-secondary/70 mt-3">
          {content?.fridayNote || 'Пятница: до 18:00 — тариф будней, после 18:00 — тариф выходных'}
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pricing.map((slot) => {
          const isPopular = slot.id.includes('3h');
          const isHit = slot.id.includes('unlimited');
          const noticeLines = normalizeNoticeLines(slot.noticeLines);
          const availableUntil = String(slot.availableUntil || '');
          const purchaseTimeFrom = normalizeTimeValue(slot.purchaseTimeFrom);
          const purchaseTimeTo = normalizeTimeValue(slot.purchaseTimeTo);
          const timeWindowText = getTariffTimeWindowText({ from: purchaseTimeFrom, to: purchaseTimeTo });
          const isExpired = isDateAfter(getToday(), availableUntil);
          return (
            <div
              key={slot.id}
              onClick={() => {
                if (isExpired) return;
                openPurchase({
                  name: `${tabLabel} — ${slot.name}`,
                  price: `${slot.adultPrice.toLocaleString('ru-RU')} ₽`,
                  childPrice: `${slot.childPrice.toLocaleString('ru-RU')} ₽`,
                  tariffId: getTariffOptionId(slot),
                  tariffLabel: slot.name,
                  tariffPeriod: tab,
                  availableUntil,
                  noticeLines,
                  purchaseTimeFrom,
                  purchaseTimeTo,
                });
              }}
              className={`relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                isHit
                  ? 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 ring-1 ring-primary/10'
                  : isPopular
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-200/50'
                    : 'bg-surface border-border/50 hover:border-primary/20'
              } ${isExpired ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''}`}
            >
              {/* Badge */}
              {(isPopular || isHit) && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {isHit ? (
                    <Badge variant="gold" className="text-xs py-1 px-3 shadow-sm">
                      <Crown className="h-3 w-3 mr-1" />
                      Лучшая цена за день
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs py-1 px-3 shadow-sm">
                      <Flame className="h-3 w-3 mr-1" />
                      Популярный
                    </Badge>
                  )}
                </div>
              )}

              {/* Tariff name */}
              <div className="text-center mt-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary">{slot.name}</h3>
                {isHit && (
                  <p className="text-xs text-text-secondary mt-1">{slot.duration}</p>
                )}
              </div>

              {/* Prices */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white/60 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    Взрослый
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {slot.adultPrice.toLocaleString('ru-RU')}&nbsp;&#8381;
                  </span>
                </div>
                {noticeLines.map((line) => (
                  <p key={line} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                    {line}
                  </p>
                ))}
                {availableUntil && (
                  <p className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${isExpired ? 'border-red-200 bg-red-50 text-red-600' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                    Доступно по {formatDateRu(availableUntil)}
                  </p>
                )}
                {timeWindowText && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                    Приобрести можно на время {timeWindowText}
                  </p>
                )}
              </div>

              {/* CTA hint */}
              <p className="mt-4 text-center text-sm text-primary-dark font-semibold">
                Нажмите, чтобы купить →
              </p>
            </div>
          );
        })}
      </div>

      {/* Additional pricing info */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pensioner discounts - only on weekdays */}
        {tab === 'weekday' && pensionerSlots.length > 0 && (
          <div className="rounded-xl bg-surface border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="font-bold text-text-primary">{content?.pensionerTitle || 'Льготы для пенсионеров'}</h4>
            </div>
            <div className="space-y-1.5 text-sm text-text-secondary">
              {pensionerSlots.map((p) => (
                <p key={p.id}>{p.name} — <strong className="text-primary">{p.price.toLocaleString('ru-RU')} ₽</strong></p>
              ))}
              <p className="text-xs text-text-secondary/70 pt-1">{content?.pensionerNote || 'Действует пн–чт включительно, до 18:00 (билет до 16:00)'}</p>
            </div>
          </div>
        )}

        {/* Child tariff */}
        {childPrice > 0 && (
        <div className="rounded-xl bg-surface border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Baby className="w-4 h-4 text-accent" />
            </div>
            <h4 className="font-bold text-text-primary">{content?.childTitle || 'Детский тариф'}</h4>
          </div>
          <div className="space-y-1.5 text-sm text-text-secondary">
            <p>{childNote}</p>
          </div>
        </div>
        )}

        {/* Overtime rates */}
        {activeOvertimeRates.length > 0 && (
        <div className="rounded-xl bg-surface border border-border/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="font-bold text-text-primary">Доплата за превышение</h4>
          </div>
          <div className="space-y-1.5 text-sm text-text-secondary">
            <p>Будни — <strong className="text-primary">{activeOvertimeRates.find(r => r.type === 'weekday')?.ratePerMin} ₽/мин</strong></p>
            <p>Выходные — <strong className="text-primary">{activeOvertimeRates.find(r => r.type === 'weekend')?.ratePerMin} ₽/мин</strong></p>
            <p>Льготный — <strong className="text-primary">{activeOvertimeRates.find(r => r.type === 'pensioner')?.ratePerMin} ₽/мин</strong></p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

/* ─── Subscription card (with CTA) ─── */
function SubscriptionCard({
  name,
  period,
  price,
  discount,
  description,
  badge,
  badgeVariant,
  onPurchase,
}: {
  name: string;
  period: string;
  price: number;
  discount: number;
  description?: string;
  badge?: string;
  badgeVariant?: 'default' | 'gold' | 'success';
  onPurchase: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-surface border border-border/50 hover:border-primary/20 p-5 transition-all duration-300">
      {/* Icon */}
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Users className="h-6 w-6 text-primary" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-text-primary">{name}</h3>
          {discount > 0 && (
            <Badge variant="success" className="text-xs py-0.5">
              <Percent className="h-3 w-3 mr-0.5" />
              -{discount}%
            </Badge>
          )}
          {badge && (
            <Badge variant={badgeVariant || 'default'} className="text-xs py-0.5">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-text-secondary mt-0.5">{period}</p>
        {description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
      </div>

      {/* Price + CTA */}
      <div className="flex items-center gap-4 flex-shrink-0 sm:ml-auto">
        <p className="text-2xl font-bold text-primary">
          {price.toLocaleString('ru-RU')}&nbsp;&#8381;
        </p>
        <TicketButton onClick={onPurchase} className="whitespace-nowrap">
          Оформить
        </TicketButton>
      </div>
    </div>
  );
}

/* ─── Certificate images for design selection ─── */
const localCertificateCategories = [
  {
    id: 'classic',
    label: 'Классические',
    images: [
      { id: 'pool', src: '/images/complex/pool.webp', label: 'Бассейн' },
      { id: 'herbal', src: '/images/complex/herbal.webp', label: 'Травяная парная' },
      { id: 'russian', src: '/images/saunas/attributes/russian-attr.jpg', label: 'Русская баня' },
      { id: 'universal', src: '/images/certificates/universal.png', label: 'Универсальный' },
    ],
  },
  {
    id: 'holidays',
    label: 'Праздничные',
    images: [
      { id: 'birthday', src: '/images/certificates/termliny/birthday/group.jpg', label: 'День рождения' },
      { id: 'newyear', src: '/images/certificates/termliny/newyear/group.png', label: 'Новый год' },
      { id: 'womensday', src: '/images/certificates/termliny/womensday/group.jpg', label: '8 марта' },
      { id: 'mensday', src: '/images/certificates/termliny/mensday/group.jpg', label: '23 февраля' },
      { id: 'familyday', src: '/images/certificates/termliny/familyday/group.png', label: 'День семьи' },
      { id: 'motherday', src: '/images/certificates/termliny/motherday/group.png', label: 'День матери' },
      { id: 'victoryday', src: '/images/certificates/termliny/victoryday/group.jpg', label: 'День Победы' },
      { id: 'childday', src: '/images/certificates/termliny/childday/group.png', label: 'День защиты детей' },
    ],
  },
  {
    id: 'spa',
    label: 'SPA & Релакс',
    images: [
      { id: 'spa', src: '/images/certificates/termliny/spa/group.jpg', label: 'SPA-отдых' },
      { id: 'spa-main', src: '/images/certificates/spa.png', label: 'Релакс' },
    ],
  },
];

// Hook to load certificates from WP
function useCertificateCategories() {
  const [wpCerts, setWpCerts] = useState<any[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(CERT_API_URL)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        // Map WP certs into holidays category
        const holidays = data.map((c: any) => ({
          id: c.name.toLowerCase().replace(/\s+/g, '-'),
          src: c.image || '/images/certificates/universal.png',
          label: c.name,
        }));
        setWpCerts([
          localCertificateCategories[0], // Classic stays local
          { id: 'holidays', label: 'Праздничные', images: holidays },
          localCertificateCategories[2], // SPA stays local
        ]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return wpCerts || localCertificateCategories;
}

// Flat list placeholder (will be overridden in component)
const certificateImages = localCertificateCategories.flatMap(cat => cat.images);

// WP API URL for certificates (as const to prevent tree-shaking)
const CERT_API_URL = '/wp-json/termburg/v1/certificates' as const;

/* ─── Certificate Section Component ─── */
function CertificateSection({ openPurchase }: { openPurchase: (data: PurchaseItem) => void }) {
  const [certCats, setCertCats] = useState(localCertificateCategories);

  useEffect(() => {
    let active = true;
    /* eslint-disable no-eval */
    const apiUrl = ['/wp-json', '/termburg', '/v1', '/certificates'].join('');
    window.fetch(apiUrl).then(async (res) => {
      if (!res.ok || !active) return;
      const data = await res.json();
      if (!active || !Array.isArray(data) || data.length === 0) return;
      const imgs = data.map((c: any, idx: number) => ({
        id: 'wp-cert-' + idx,
        src: c.image || '/images/certificates/universal.png',
        label: c.name || 'Сертификат',
      }));
      setCertCats([
        localCertificateCategories[0],
        { id: 'holidays', label: 'Праздничные', images: imgs },
        localCertificateCategories[2],
      ]);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const certificateCategories = certCats;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5" />
      <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl" />
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <Gift className="w-32 h-32 text-primary" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-5">
        <Sparkles className="w-24 h-24 text-primary" />
      </div>

      <div className="relative grid md:grid-cols-2 gap-8 p-8 sm:p-10">
        {/* Left — description */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-6 h-6 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Идея для подарка</span>
          </div>
          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-4">
            Подарочный сертификат
          </h3>
          <p className="text-text-secondary leading-relaxed mb-6">
            Подарите близким день расслабления в термальном комплексе. Сертификат на любую сумму — идеальный подарок на день рождения, юбилей или просто без повода.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Красивое оформление
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              Любая сумма
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Действует 6 месяцев
            </span>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex flex-col justify-center">
          <form
            className="rounded-xl bg-surface border border-border p-6 space-y-4 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const amount = Math.max(1000, Number(data.get('amount')) || 1000);
              const wish = String(data.get('wish') || '').trim();
              openPurchase({
                name: 'Подарочный сертификат',
                price: `${amount.toLocaleString('ru-RU')} ₽`,
                certificate: {
                  design: 'pricing',
                  occasion: 'Подарочный сертификат',
                  amount,
                  recipientName: '',
                  recipientPhone: '',
                  wish,
                  emoji: '🎁',
                  color: '#B68B2E',
                  code: catalogKey('certificate', 'pricing', amount),
                },
              });
            }}
          >
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-secondary">
              Выбор изображений для сертификата временно отключен. Сертификат оформляется в фирменном стиле Термбурга без выбора картинки.
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Сумма сертификата</label>
              <div className="flex gap-2 mb-2">
                {[1000, 3000, 5000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className="flex-1 rounded-lg border border-border bg-background py-2 text-sm text-text-primary hover:border-primary/40 hover:bg-primary/10 transition-colors"
                    onClick={() => {
                      const input = document.getElementById('cert-amount-pricing') as HTMLInputElement;
                      if (input) input.value = String(amount);
                    }}
                  >
                    {amount.toLocaleString('ru-RU')}&nbsp;&#8381;
                  </button>
                ))}
              </div>
              <input
                id="cert-amount-pricing"
                name="amount"
                type="number"
                min={1000}
                step={500}
                placeholder="Минимум 1 000 ₽"
                className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <p className="text-xs text-text-secondary/60 mt-1">Минимальная сумма — 1 000 ₽</p>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Пожелание (необязательно)</label>
              <textarea
                name="wish"
                rows={2}
                placeholder="Напишите тёплые слова..."
                className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm"
              />
            </div>
            <LegalConsents />
            <button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary-light text-dark-surface font-bold py-3.5 text-lg transition-colors shadow-lg shadow-primary/20"
            >
              Подарить тепло
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── Premium Gift Box Card ─── */
function GiftBoxCard({
  box,
  onPurchase,
}: {
  box: WPGiftBox | typeof fallbackGiftBoxes[0];
  onPurchase: () => void;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl group flex flex-col">
      {/* Badge */}
      {box.badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="gold" className="shadow-lg">
            <Crown className="w-3 h-3 mr-1" />
            {box.badge}
          </Badge>
        </div>
      )}

      {/* Image */}
      <div className="relative h-[42rem] overflow-hidden">
        <img
          src={box.image || '/images/heroes/pricing.webp'}
          alt={box.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-heading text-2xl font-bold text-white mb-1">
            {box.name}
          </h3>
          <p className="text-white/80 text-sm">{box.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Items list */}
        <div className="space-y-3 mb-6 flex-1">
          {box.items.length === 0 && box.contents && (
            <p className="text-sm text-text-secondary">{box.contents}</p>
          )}
          {box.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <div>
                <p className="text-text-primary font-medium text-sm">{item.name}</p>
                <p className="text-text-secondary text-xs">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-text-secondary">Стоимость бокса</p>
            <p className="text-2xl font-bold text-primary">
              {box.price.toLocaleString('ru-RU')}&nbsp;&#8381;
            </p>
          </div>
          <TicketButton onClick={onPurchase}>
            <Package className="w-4 h-4 mr-2" />
            Заказать
          </TicketButton>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function PricingPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «pricing» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('pricing');

  const { openBooking, openPurchase, openWhatToBring } = useBooking();
  const { data: wpPricing, loading: pricingLoading, error: pricingError } = usePricing();
  const pricingContent = wpPricing.pricingContent;
  const useStaticPricing = !!pricingError;

  const subscriptions = useStaticPricing
    ? fallbackSubscriptions.map(s => ({
        ...s,
        badge: '',
        badgeVariant: undefined,
      }))
    : (wpPricing.subscriptions || []).map(s => ({
        id: String(s.id),
        name: s.name,
        period: s.period || s.duration,
        adultPrice: s.adultPrice,
        discount: s.discount || 0,
        description: s.description || '',
        badge: s.badge || '',
        badgeVariant: s.badgeVariant || undefined,
      }));
  const giftBoxes: Array<WPGiftBox | typeof fallbackGiftBoxes[0]> =
    useStaticPricing ? fallbackGiftBoxes : (wpPricing.giftBoxes || []);
  const showGiftBoxes = false;
  const merchItems: Array<WPMerchItem | typeof fallbackMerchItems[0]> =
    useStaticPricing ? fallbackMerchItems : (wpPricing.merchItems || []);
  const includedItems = useStaticPricing ? includedServices : (pricingContent?.includedItems || []);
  const hasIncludedItems = includedItems.length > 0;
  const hasVisitPricing = pricingLoading || (wpPricing.weekday || []).length > 0 || (wpPricing.weekend || []).length > 0;

  return (
    <PageLayout>
      <PageHero
        title="Прайс-лист"
        subtitle="Прозрачные цены без скрытых доплат. Всё включено в стоимость посещения."
        backgroundImage="/images/heroes/pricing.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
      {hasVisitPricing && (
      <>

      {/* ── Tariff cards ── */}
      <Section
        title={pricingContent?.pageTariffsTitle || 'Стоимость посещения'}
        subtitle={pricingContent?.pageTariffsSubtitle || 'Выберите удобный тариф — от 1 часа до безлимита на весь день'}
        className="py-10"
      >
        <PricingCards />
      </Section>
      </>
      )}

      {/* ── What's included ── */}
      {hasIncludedItems && (
      <Section title={pricingContent?.includedTitle || 'Включено в стоимость посещения'} className="py-10" warm>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {includedItems.map((service) => (
            <div
              key={service}
              className="flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/50"
            >
              <Check className="h-5 w-5 flex-shrink-0 text-success" />
              <span className="text-text-primary text-sm">
                {service.includes('расписание') ? (
                  <>
                    {service.replace('(смотрите расписание)', '')}
                    (<Link to="/schedule" className="text-primary hover:underline">смотрите расписание</Link>)
                  </>
                ) : (
                  service
                )}
              </span>
            </div>
          ))}
        </div>
      </Section>
      )}

      {/* ── Service Links ── */}
      <Section className="py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceLinks.map((service) => (
            <Link
              key={service.name}
              to={service.href}
              className="group relative h-32 rounded-xl overflow-hidden"
            >
              <img
                src={service.image}
                alt={service.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-bold text-white text-sm">{service.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      {subscriptions.length > 0 && (
      <>

      {/* ── Subscriptions (with CTA) ── */}
      <Section
        title={pricingContent?.subscriptionsTitle || 'Абонементы'}
        subtitle={pricingContent?.subscriptionsSubtitle || 'Выгодные предложения для постоянных гостей'}
        className="py-10"
      >
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const highlight = subscriptionHighlights[sub.id];
            return (
              <SubscriptionCard
                key={sub.id}
                name={sub.name}
                period={sub.period}
                price={sub.adultPrice}
                discount={sub.discount}
                description={sub.description}
                badge={sub.badge || highlight?.badge}
                badgeVariant={(sub.badgeVariant as 'default' | 'gold' | 'success' | undefined) || highlight?.badgeVariant}
                onPurchase={() => openPurchase({
                  name: `Абонемент «${sub.name}»`,
                  price: `${sub.adultPrice.toLocaleString('ru-RU')} ₽`,
                  lineItems: [{
                    name: `Абонемент «${sub.name}»`,
                    price: sub.adultPrice,
                    quantity: 1,
                    kind: 'subscription',
                    productKey: catalogKey('subscription', sub.id || sub.name),
                    productGroup: 'subscription',
                    source: 'pricing.subscriptions',
                    sourceId: catalogSourceId(sub.id || sub.name),
                  }],
                })}
              />
            );
          })}
        </div>
      </Section>
      </>
      )}
      <PricingPreviewSection />
      {showGiftBoxes && giftBoxes.length > 0 && (
      <>

      {/* ── Premium Gift boxes ── */}
      <Section
        title={pricingContent?.giftBoxesTitle || 'Подарочные боксы'}
        subtitle={pricingContent?.giftBoxesSubtitle || 'Роскошные наборы в премиальной упаковке — готовый подарок, который запомнится'}
        className="py-10"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {giftBoxes.map((box) => (
            <GiftBoxCard
              key={box.id}
              box={box}
              onPurchase={() => openPurchase({
                name: box.name,
                price: `${box.price.toLocaleString('ru-RU')} ₽`,
                lineItems: [{
                  name: box.name,
                  price: box.price,
                  quantity: 1,
                  kind: 'gift_box',
                  productKey: catalogKey('gift-box', box.id || box.name),
                  productGroup: 'gift_box',
                  source: 'pricing.gift_boxes',
                  sourceId: catalogSourceId(box.id || box.name),
                }],
              })}
            />
          ))}
        </div>
      </Section>
      </>
      )}

      {/* ── Merch ── */}
      <Section
        title={pricingContent?.merchTitle || 'Мерч Термбурга'}
        subtitle={pricingContent?.merchSubtitle || 'Заберите частичку Термбурга с собой'}
        className={merchItems.length > 0 ? 'py-10' : 'hidden'}
        warm
      >
        <div className="grid gap-5 grid-cols-2 max-w-2xl mx-auto">
          {merchItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl bg-surface border border-border/50 hover:border-primary/20 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
              onClick={() => openPurchase({
                name: item.name,
                price: `${item.price.toLocaleString('ru-RU')} ₽`,
                lineItems: [{
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                  kind: 'merch',
                  productKey: catalogKey('merch', item.id || item.name),
                  productGroup: 'merch',
                  source: 'pricing.merch',
                  sourceId: catalogSourceId(item.id || item.name),
                }],
              })}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">{item.name}</h3>
              <p className="mt-1 text-sm text-text-secondary flex-1">{item.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xl font-bold text-primary">
                  {item.price.toLocaleString('ru-RU')}&nbsp;&#8381;
                </p>
                <span className="text-sm font-semibold text-primary-dark hover:underline">Купить →</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Готовы к отдыху?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Купите билет онлайн — выберите удобный тариф от 1 часа до безлимита.
          </p>
          <TicketButton onClick={openBooking}>Побаловать себя</TicketButton>
          <button onClick={openWhatToBring} className="block mt-4 text-xs text-white/50 hover:text-white/80 transition-colors">
            Не забудьте взять с собой →
          </button>
        </Container>
      </section>
    </PageLayout>
  );
}
