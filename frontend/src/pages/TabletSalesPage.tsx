import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertCircle, CalendarDays, Clock, Flame, Package, RefreshCcw, Sparkles, Ticket, Waves } from 'lucide-react';
import { api, type WPService, type WPServicesResponse, type WPPricingItem, type WPPricingResponse } from '@/api/wordpress';
import CertificateConfigurator from '@/components/shared/CertificateConfigurator';
import { useBooking, type CheckoutLineItem, type PurchaseItem } from '@/context/BookingContext';
import { daysOfWeek, type ScheduleEvent } from '@/data/schedule';
import { catalogKey, catalogSourceId } from '@/utils/catalogItems';
import { mapScheduleData } from '@/utils/scheduleData';
import { normalizeServiceBookingSection, parseServiceDurationMinutes, type ServiceBookingSection } from '@/utils/serviceBooking';

type TabletSalesTab = 'visit' | 'spa' | 'steaming' | 'massage' | 'schedule' | 'certificate' | 'subscription';

interface TabletProduct {
  id: string;
  tab: Exclude<TabletSalesTab, 'certificate' | 'schedule'>;
  title: string;
  description: string;
  price: number;
  priceLabel: string;
  duration?: string;
  badge?: string;
  purchaseItem: PurchaseItem;
}

interface VisitProduct extends TabletProduct {
  tab: 'visit';
  weekdayPrice?: number;
  weekendPrice?: number;
  childWeekdayPrice?: number;
  childWeekendPrice?: number;
}

interface TabletTabItem {
  id: TabletSalesTab;
  label: string;
}

const tabs: TabletTabItem[] = [
  { id: 'visit', label: 'Посещение' },
  { id: 'spa', label: 'SPA-процедуры' },
  { id: 'steaming', label: 'Парения' },
  { id: 'massage', label: 'Массаж' },
  { id: 'schedule', label: 'Расписание' },
  { id: 'certificate', label: 'Сертификат' },
  { id: 'subscription', label: 'Абонемент' },
];

const serviceTabs: Record<string, Exclude<TabletSalesTab, 'visit' | 'schedule' | 'certificate' | 'subscription'>> = {
  steam: 'steaming',
  spa: 'spa',
  massage: 'massage',
};

const serviceSections: Record<string, ServiceBookingSection> = {
  steam: 'steaming',
  spa: 'spa',
  massage: 'massage',
};

const tabTitles: Record<TabletSalesTab, string> = {
  visit: 'Посещение',
  spa: 'SPA-процедуры',
  steaming: 'Парения',
  massage: 'Массаж',
  schedule: 'Расписание',
  certificate: 'Подарочный сертификат',
  subscription: 'Абонементы',
};

const weekdayShortNames: Record<string, string> = {
  Понедельник: 'Пн',
  Вторник: 'Вт',
  Среда: 'Ср',
  Четверг: 'Чт',
  Пятница: 'Пт',
  Суббота: 'Сб',
  Воскресенье: 'Вс',
};

function formatPrice(price: number) {
  return `${Math.max(0, price).toLocaleString('ru-RU')} ₽`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDayNameByDate(date: Date) {
  const jsDay = date.getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return daysOfWeek[index];
}

function getWeekDates(date: Date) {
  const monday = new Date(date);
  const weekday = monday.getDay();
  monday.setDate(monday.getDate() - (weekday === 0 ? 6 : weekday - 1));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

function scheduleEventsForDate(events: ScheduleEvent[], date: Date) {
  const dateKey = formatDateKey(date);
  const dayName = getDayNameByDate(date);
  return events
    .filter((event) => event.date ? event.date === dateKey : Array.isArray(event.day) && event.day.includes(dayName))
    .filter((event) => event.type !== 'closed' && !event.closed && !event.sanitaryDay)
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''), 'ru'));
}

function serviceBaseName(service: WPService) {
  return String(service.name || '')
    .toLowerCase()
    .replace(/\d+(?:[.,]\d+)?\s*(мин|минута|минут|минуты|ч|час|часа|часов|h|hour|hours)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sortServices(items: WPService[]) {
  return [...items].sort((a, b) => {
    const baseCompare = serviceBaseName(a).localeCompare(serviceBaseName(b), 'ru');
    if (baseCompare !== 0) return baseCompare;

    const durationCompare = parseServiceDurationMinutes(a.duration || '') - parseServiceDurationMinutes(b.duration || '');
    if (durationCompare !== 0) return durationCompare;

    return (a.price || 0) - (b.price || 0);
  });
}

function serviceProduct(sectionKey: string, sectionName: string, service: WPService): TabletProduct | null {
  if (!service.name || !service.price || service.price <= 0) return null;

  const tab = serviceTabs[sectionKey];
  if (!tab) return null;

  const section = serviceSections[sectionKey] || normalizeServiceBookingSection(sectionKey, sectionName, service.name);
  const sourceId = service.slug || service.id || service.name;
  const productKey = catalogKey('service', section, sourceId);
  const line: CheckoutLineItem = {
    name: service.name,
    price: service.price,
    quantity: 1,
    duration: service.duration || undefined,
    kind: 'service',
    productKey,
    productGroup: 'service',
    source: 'services-list',
    sourceId: catalogSourceId(sourceId),
    serviceSection: section,
  };

  return {
    id: productKey,
    tab,
    title: service.name,
    description: service.description || service.fullDescription || tabTitles[tab],
    price: service.price,
    priceLabel: formatPrice(service.price),
    duration: service.duration || undefined,
    purchaseItem: {
      name: `${tabTitles[tab]}: ${service.name}`,
      price: formatPrice(service.price),
      duration: service.duration || undefined,
      requiresVisitTicket: true,
      lineItems: [line],
    },
  };
}

function subscriptionProduct(item: WPPricingItem): TabletProduct | null {
  if (!item.name || item.adultPrice <= 0) return null;

  const productKey = catalogKey('subscription', item.id || item.name);
  const line: CheckoutLineItem = {
    name: `Абонемент «${item.name}»`,
    price: item.adultPrice,
    quantity: 1,
    kind: 'subscription',
    productKey,
    productGroup: 'subscription',
    source: 'pricing.subscriptions',
    sourceId: catalogSourceId(item.id || item.name),
  };

  return {
    id: productKey,
    tab: 'subscription',
    title: item.name,
    description: item.description || item.period || item.duration || 'Абонемент',
    price: item.adultPrice,
    priceLabel: formatPrice(item.adultPrice),
    duration: item.period || item.duration,
    badge: item.badge || undefined,
    purchaseItem: {
      name: `Абонемент «${item.name}»`,
      price: formatPrice(item.adultPrice),
      lineItems: [line],
    },
  };
}

function visitProductsFromPricing(pricing: WPPricingResponse): VisitProduct[] {
  const rows = new Map<string, {
    key: string;
    label: string;
    duration?: string;
    description?: string;
    weekday?: WPPricingItem;
    weekend?: WPPricingItem;
  }>();

  const addRow = (item: WPPricingItem, period: 'weekday' | 'weekend') => {
    if (!item.name || item.adultPrice <= 0) return;

    const key = String(item.id || item.name);
    const existing = rows.get(key) || {
      key,
      label: item.name,
      duration: item.duration || item.period,
      description: item.description,
    };

    existing[period] = item;
    existing.label = existing.label || item.name;
    existing.duration = existing.duration || item.duration || item.period;
    existing.description = existing.description || item.description;
    rows.set(key, existing);
  };

  (pricing.weekday || []).forEach((item) => addRow(item, 'weekday'));
  (pricing.weekend || []).forEach((item) => addRow(item, 'weekend'));

  return Array.from(rows.values())
    .map((row): VisitProduct | null => {
      const primary = row.weekday || row.weekend;
      if (!primary) return null;

      const productKey = catalogKey('visit', row.key);
      const weekdayPrice = row.weekday?.adultPrice;
      const weekendPrice = row.weekend?.adultPrice;
      const childWeekdayPrice = row.weekday?.childPrice;
      const childWeekendPrice = row.weekend?.childPrice;

      return {
        id: productKey,
        tab: 'visit',
        title: row.label,
        description: row.description || row.duration || 'Входной билет',
        price: primary.adultPrice,
        priceLabel: formatPrice(primary.adultPrice),
        duration: row.duration,
        badge: primary.badge || row.weekday?.badge || row.weekend?.badge || undefined,
        weekdayPrice,
        weekendPrice,
        childWeekdayPrice,
        childWeekendPrice,
        purchaseItem: {
          name: row.label,
          price: formatPrice(primary.adultPrice),
          childPrice: primary.childPrice > 0 ? formatPrice(primary.childPrice) : undefined,
          tariffId: String(primary.id || row.key),
          tariffLabel: row.label,
          tariffPeriod: row.weekday ? 'weekday' : 'weekend',
          availableUntil: primary.availableUntil,
          noticeLines: primary.noticeLines,
          purchaseTimeFrom: primary.purchaseTimeFrom,
          purchaseTimeTo: primary.purchaseTimeTo,
        },
      };
    })
    .filter(Boolean) as VisitProduct[];
}

function productsFromApi(pricing: WPPricingResponse, services: WPServicesResponse): TabletProduct[] {
  const visits = visitProductsFromPricing(pricing);
  const serviceProducts = Object.entries(services || {}).flatMap(([sectionKey, section]) => (
    sortServices(section.items || [])
      .map((item) => serviceProduct(sectionKey, section.name, item))
      .filter(Boolean) as TabletProduct[]
  ));
  const subscriptions = (pricing.subscriptions || [])
    .map(subscriptionProduct)
    .filter(Boolean) as TabletProduct[];

  return [
    ...visits,
    ...serviceProducts,
    ...subscriptions,
  ];
}

function tabIcon(tab: TabletSalesTab) {
  if (tab === 'visit') return <Ticket className="h-5 w-5" />;
  if (tab === 'spa') return <Sparkles className="h-5 w-5" />;
  if (tab === 'steaming') return <Flame className="h-5 w-5" />;
  if (tab === 'massage') return <Waves className="h-5 w-5" />;
  if (tab === 'schedule') return <CalendarDays className="h-5 w-5" />;
  if (tab === 'certificate') return <Ticket className="h-5 w-5" />;
  return <Clock className="h-5 w-5" />;
}

function TabletSalesPage() {
  const { openPurchase } = useBooking();
  const [pricing, setPricing] = useState<WPPricingResponse | null>(null);
  const [services, setServices] = useState<WPServicesResponse | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabletSalesTab>('visit');
  const [activeScheduleDay, setActiveScheduleDay] = useState(() => {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let active = true;
    if (!pricing || !services || scheduleEvents.length === 0) {
      setLoading(true);
    }
    setError('');

    Promise.all([api.getPricing(), api.getServices(), api.getSchedule()])
      .then(([nextPricing, nextServices, nextSchedule]) => {
        if (!active) return;
        setPricing(nextPricing);
        setServices(nextServices);
        setScheduleEvents(mapScheduleData(nextSchedule));
      })
      .catch(() => {
        if (!active) return;
        setError('Не удалось загрузить услуги и цены. Обновите страницу.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshToken]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRefreshToken((value) => value + 1);
    }, 5 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const products = useMemo(() => (
    pricing && services ? productsFromApi(pricing, services) : []
  ), [pricing, services]);

  const currentProducts = useMemo(() => (
    products.filter((product) => product.tab === activeTab)
  ), [products, activeTab]);

  const weekDates = useMemo(() => getWeekDates(new Date()), []);

  const scheduleWeek = useMemo(() => (
    weekDates.map((date) => ({
      date,
      key: formatDateKey(date),
      dayName: getDayNameByDate(date),
      events: scheduleEventsForDate(scheduleEvents, date),
    }))
  ), [scheduleEvents, weekDates]);

  const selectedScheduleDay = scheduleWeek[activeScheduleDay] || scheduleWeek[0];

  const handleSchedulePurchase = (event: ScheduleEvent) => {
    const price = Number(event.price) || 0;
    if (price <= 0) return;

    openPurchase({
      name: event.name,
      price: formatPrice(price),
      duration: event.duration,
      requiresVisitTicket: true,
      lineItems: [{
        name: event.name,
        price,
        quantity: 1,
        duration: event.duration,
        eventDate: event.date,
        eventTime: event.time,
        kind: 'event',
        productKey: catalogKey('event', event.id || event.name),
        productGroup: 'event',
        source: 'schedule',
        sourceId: catalogSourceId(event.id || event.name),
      }],
    });
  };

  const visitNotes = useMemo(() => {
    if (!pricing) return [];

    const notes: string[] = [];
    if (pricing.childUnder6 && pricing.childUnder6 > 0) {
      notes.push(`Дети до 6 лет: ${formatPrice(pricing.childUnder6)} безлимит`);
    }
    if (Array.isArray(pricing.pensioner) && pricing.pensioner.length > 0) {
      notes.push(`Пенсионерам: ${pricing.pensioner.map((item) => `${item.name} ${formatPrice(item.price)}`).join(', ')}`);
    }

    return notes;
  }, [pricing]);

  const hasCatalogData = products.length > 0;

  const handleCertificateSubmit = (cert: {
    design: string;
    occasion: string;
    amount: number;
    recipientName: string;
    recipientPhone: string;
    wish: string;
    emoji: string;
    color: string;
    code: string;
    frontImage?: string;
    backImage?: string;
  }) => {
    openPurchase({
      name: 'Подарочный сертификат',
      price: formatPrice(cert.amount),
      certificate: {
        design: cert.design,
        occasion: cert.occasion,
        amount: cert.amount,
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
  };

  return (
    <main className="min-h-screen bg-[#f8f1e7] text-text-primary">
      <Helmet>
        <title>Планшет продаж | Термбург</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow,noarchive,nosnippet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Термбург" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/tablet-sales-manifest.json" />
      </Helmet>

      <div className="tablet-sales__shell mx-auto min-h-screen w-full max-w-[1440px] px-4 py-4 lg:px-6">
        <section className="tablet-sales__layout grid flex-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="tablet-sales__nav rounded-[28px] border border-primary/15 bg-white/90 p-4 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-32px)]">
            <div className="mb-4 px-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Термбург</p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-text-primary">Что вас интересует</h1>
            </div>

            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 text-left text-base font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-secondary/45 text-text-primary hover:bg-secondary'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-white' : 'text-primary'}>
                    {tabIcon(tab.id)}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="tablet-sales__content min-w-0 rounded-[28px] border border-primary/15 bg-white/90 p-4 shadow-sm md:p-5">
            {loading && (
              <div className="flex min-h-[520px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-lg font-semibold">Загружаем услуги и цены</p>
              </div>
            )}

            {!loading && error && (
              <div className="flex min-h-[520px] flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="max-w-md text-lg font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => setRefreshToken((value) => value + 1)}
                  className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 font-semibold text-white"
                >
                  <RefreshCcw className="h-5 w-5" />
                  Обновить
                </button>
              </div>
            )}

            {!loading && !error && activeTab !== 'certificate' && activeTab !== 'schedule' && !hasCatalogData && (
              <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-center">
                <Package className="h-12 w-12 text-text-muted" />
                <p className="text-lg font-semibold">Нет доступных позиций для продажи.</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="font-heading text-2xl font-bold text-text-primary">{tabTitles[activeTab]}</h2>
                    {activeTab === 'certificate' && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-text-secondary">
                        <span className="rounded-2xl bg-secondary/45 px-4 py-2">Любая сумма от 1 000 ₽</span>
                        <span className="rounded-2xl bg-secondary/45 px-4 py-2">Действует 6 месяцев</span>
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === 'visit' && visitNotes.length > 0 && (
                  <div className="mb-4 grid gap-3 md:grid-cols-2">
                    {visitNotes.map((note) => (
                      <div key={note} className="rounded-2xl border border-primary/20 bg-secondary/35 px-4 py-3 text-sm font-semibold text-text-primary">
                        {note}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'certificate' ? (
                  <div className="tablet-sales__certificate overflow-hidden rounded-3xl bg-white p-4 md:p-6">
                    <div className="tablet-sales__certificate-inner mx-auto w-full max-w-[760px]">
                      <CertificateConfigurator onSubmit={handleCertificateSubmit} showDescription={false} showPreview={false} compact tabletMode />
                    </div>
                  </div>
                ) : activeTab === 'schedule' ? (
                  <div className="grid gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {scheduleWeek.map((day, index) => {
                        const isActive = index === activeScheduleDay;
                        return (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => setActiveScheduleDay(index)}
                            className={`min-h-12 min-w-[76px] rounded-2xl px-4 text-base font-bold transition ${
                              isActive
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-secondary/60 text-text-secondary hover:bg-secondary'
                            }`}
                          >
                            {weekdayShortNames[day.dayName] || day.dayName} {day.date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <section className="rounded-3xl border border-primary/15 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-text-primary">{selectedScheduleDay.dayName}</h3>
                          <p className="text-sm font-semibold text-text-secondary">
                            {selectedScheduleDay.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                          </p>
                        </div>
                        <span className="rounded-full bg-secondary/60 px-4 py-2 text-sm font-semibold text-primary">
                          {selectedScheduleDay.events.length ? `${selectedScheduleDay.events.length} событий` : 'Нет событий'}
                        </span>
                      </div>

                      {selectedScheduleDay.events.length === 0 ? (
                        <div className="rounded-2xl bg-surface px-4 py-5 text-sm font-semibold text-text-secondary">
                          В этот день нет пунктов расписания.
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 min-[1450px]:grid-cols-3">
                          {selectedScheduleDay.events.map((event) => {
                            const price = Number(event.price) || 0;
                            const canPurchase = price > 0;

                            return (
                              <article
                                key={`${selectedScheduleDay.key}-${event.id}-${event.time}`}
                                className={`flex min-h-[160px] flex-col rounded-2xl border p-4 ${
                                  canPurchase
                                    ? 'border-primary/25 bg-primary/5'
                                    : 'border-border bg-surface'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-bold text-primary">{event.time}</p>
                                    <h4 className="mt-1 text-lg font-bold leading-snug text-text-primary">{event.name}</h4>
                                  </div>
                                  {canPurchase ? (
                                    <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                                      {formatPrice(price)}
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                                      Бесплатно
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2 text-sm text-text-secondary">
                                  {event.duration && (
                                    <span className="rounded-full bg-white px-3 py-1.5">{event.duration}</span>
                                  )}
                                  {event.location && (
                                    <span className="rounded-full bg-white px-3 py-1.5">{event.location}</span>
                                  )}
                                  {event.instructor && (
                                    <span className="rounded-full bg-white px-3 py-1.5">{event.instructor}</span>
                                  )}
                                </div>

                                {event.description && (
                                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text-secondary">
                                    {event.description}
                                  </p>
                                )}

                                {canPurchase && (
                                  <button
                                    type="button"
                                    onClick={() => handleSchedulePurchase(event)}
                                    className="mt-auto min-h-12 rounded-2xl bg-primary px-5 font-bold text-white transition hover:bg-primary-light"
                                  >
                                    Купить
                                  </button>
                                )}
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                ) : currentProducts.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
                    <Package className="h-10 w-10 text-text-muted" />
                    <p className="text-lg font-semibold">В этом разделе пока нет позиций.</p>
                  </div>
                ) : (
                  <div key={activeTab} className="tablet-sales__products grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {currentProducts.map((product) => {
                      const visit = product.tab === 'visit' ? product as VisitProduct : null;

                      return (
                        <article
                          key={`${activeTab}-${product.id}`}
                          className={`flex flex-col rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md ${
                            visit ? 'min-h-[190px] p-4' : 'min-h-[260px] p-5'
                          }`}
                        >
                          {!visit && (
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-secondary/60 px-3 text-sm font-semibold text-primary">
                                  {tabIcon(product.tab)}
                                  {tabTitles[product.tab]}
                                </div>
                                {product.badge && (
                                  <span className="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                                    {product.badge}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-4 text-xl font-bold leading-snug text-text-primary">{product.title}</h3>
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                                {product.description}
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                {product.duration && (
                                  <span className="rounded-full bg-surface px-3 py-1.5 text-text-secondary">
                                    {product.duration}
                                  </span>
                                )}
                                {product.tab !== 'subscription' && (
                                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-800">
                                    с записью по времени
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {visit && <h3 className="text-2xl font-bold leading-snug text-text-primary">{product.title}</h3>}

                          {visit ? (
                            <div className="mt-auto space-y-3 pt-5">
                              <div className="grid grid-cols-2 gap-3">
                                {visit.weekdayPrice ? (
                                  <div className="rounded-2xl bg-secondary/45 p-3">
                                    <p className="text-xs text-text-secondary">Будни</p>
                                    <p className="text-xl font-bold text-primary">{formatPrice(visit.weekdayPrice)}</p>
                                  </div>
                                ) : null}
                                {visit.weekendPrice ? (
                                  <div className="rounded-2xl bg-secondary/45 p-3">
                                    <p className="text-xs text-text-secondary">Выходные</p>
                                    <p className="text-xl font-bold text-primary">{formatPrice(visit.weekendPrice)}</p>
                                  </div>
                                ) : null}
                              </div>
                              <button
                                type="button"
                                onClick={() => openPurchase(product.purchaseItem)}
                                className="min-h-12 w-full rounded-2xl bg-primary px-5 text-base font-bold text-white transition hover:bg-primary-dark active:scale-[0.98]"
                              >
                                Купить
                              </button>
                            </div>
                          ) : (
                            <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                              <div>
                                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Цена</p>
                                <p className="text-2xl font-bold text-primary">{product.priceLabel}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => openPurchase(product.purchaseItem)}
                                className="min-h-14 rounded-2xl bg-primary px-5 text-base font-bold text-white transition hover:bg-primary-dark active:scale-[0.98]"
                              >
                                Купить
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default TabletSalesPage;
