import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Sparkles, Waves, Ticket, Gift, CalendarCheck, X, CheckCircle2, Info, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import TicketButton from '@/components/ui/TicketButton';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import { useBooking } from '@/context/BookingContext';
import { useServices, useSettings } from '@/hooks/useWordPressData';
import {
  includedServices as fallbackIncluded,
  spaServices as fallbackSpa,
  steamServices as fallbackSteam,
  type ServiceItem,
} from '@/data/services';
import { getSpaImageMap, getSteamImageMap } from '@/data/imagePaths';
import type { WPService } from '@/api/wordpress';
import { useImage } from '@/hooks/useImage';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

// Get image maps from centralized location
const spaImages = getSpaImageMap();
const steamImages = getSteamImageMap();

function ServiceCard({
  service,
  image,
  onClick,
}: {
  service: ServiceItem;
  image?: string;
  onClick?: () => void;
}) {
  const hasDetails = !!service.fullDescription;
  // Resolve image through WordPress if available
  const resolvedImage = useImage(image || '');

  return (
    <Card
      className={`p-0 overflow-hidden flex flex-col ${hasDetails ? 'cursor-pointer hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300' : ''}`}
      onClick={hasDetails ? onClick : undefined}
    >
      {image && (
        <div className="h-40 overflow-hidden">
          <img
            src={resolvedImage}
            alt={service.name}
            className={`w-full h-full object-cover ${hasDetails ? 'group-hover:scale-105 transition-transform duration-500' : ''}`}
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="mb-2 text-lg font-bold text-text-primary">{service.name}</h3>
        <p className="mb-4 text-sm text-text-secondary flex-1">{service.description}</p>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            {service.duration}
          </span>
          <span className="text-lg font-bold text-primary">
            {service.priceNote || `${service.price.toLocaleString('ru-RU')}\u00A0\u20BD`}
          </span>
        </div>
        {hasDetails && (
          <p className="mt-2 text-xs text-primary/70 text-center">Нажмите, чтобы узнать подробнее</p>
        )}
      </div>
    </Card>
  );
}

function ServiceModal({
  service,
  image,
  onClose,
}: {
  service: ServiceItem;
  image?: string;
  onClose: () => void;
}) {
  const { openBooking } = useBooking();
  // Resolve image through WordPress if available
  const resolvedImage = useImage(image || '');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {image && (
          <div className="h-56 sm:h-64 overflow-hidden rounded-t-2xl">
            <img src={resolvedImage} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">{service.name}</h2>
          <div className="flex items-center gap-4 mb-5">
            <span className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Clock className="h-4 w-4" />
              {service.duration}
            </span>
            <span className="text-lg font-bold text-primary">
              {service.priceNote || `${service.price.toLocaleString('ru-RU')}\u00A0\u20BD`}
            </span>
          </div>

          {service.fullDescription && (
            <p className="text-text-secondary leading-relaxed mb-6">
              {service.fullDescription}
            </p>
          )}

          {service.includes && service.includes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
                Что входит
              </h3>
              <ul className="space-y-2">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => { onClose(); openBooking(); }}
            className="w-full rounded-xl bg-primary px-6 py-3 text-center font-semibold text-white hover:bg-primary-light transition-colors duration-200"
          >
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper to convert WPService to ServiceItem
function wpToServiceItem(wp: WPService): ServiceItem {
  return {
    id: wp.slug || String(wp.id),
    name: wp.name,
    duration: wp.duration || '',
    price: wp.price || 0,
    priceNote: wp.priceNote || undefined,
    description: wp.description,
    fullDescription: wp.fullDescription || undefined,
    includes: wp.includes?.length ? wp.includes : undefined,
  };
}

export default function ServicesPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «services» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('services');

  const { openBooking, openPurchase, openWhatToBring } = useBooking();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  // WordPress settings for phone number
  const { data: wpSettings } = useSettings();
  const phone = wpSettings?.phone || '+7 (909) 167-47-46';
  const phoneHref = `tel:${phone.replace(/[\s()-]/g, '')}`;

  // Fetch services from WordPress
  const { data: wpServices, loading } = useServices();

  // Convert WordPress services to local format with fallbacks
  const { spaServices, steamServices, includedServices, wpImages } = useMemo(() => {
    const wpImages: Record<string, string> = {};

    // Extract spa services
    let spa: ServiceItem[] = [];
    if (wpServices?.spa?.items?.length) {
      spa = wpServices.spa.items.map((s) => {
        if (s.image) wpImages[s.slug || String(s.id)] = s.image as string;
        return wpToServiceItem(s);
      });
    } else {
      spa = fallbackSpa;
    }

    // Extract steam services
    let steam: ServiceItem[] = [];
    if (wpServices?.steam?.items?.length) {
      steam = wpServices.steam.items.map((s) => {
        if (s.image) wpImages[s.slug || String(s.id)] = s.image as string;
        return wpToServiceItem(s);
      });
    } else {
      steam = fallbackSteam;
    }

    // Use fallback for included services (these come from settings, not posts)
    const included = fallbackIncluded;

    return { spaServices: spa, steamServices: steam, includedServices: included, wpImages };
  }, [wpServices]);

  const allImages: Record<string, string> = { ...spaImages, ...steamImages, ...wpImages };

  const openModal = (service: ServiceItem) => {
    setSelectedService(service);
    setSelectedImage(allImages[service.id]);
  };

  if (loading) {
    return (
      <PageLayout title="Парения и СПА" description="Полный перечень услуг термального комплекса Термбург.">
        <PageHero
          title="Парения и СПА"
          subtitle="Широкий спектр услуг для вашего здоровья, красоты и расслабления"
          backgroundImage="/images/heroes/services.webp"
        />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
        <Section>
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Парения и СПА" description="Полный перечень услуг термального комплекса Термбург.">
      <PageHero
        title="Парения и СПА"
        subtitle="Широкий спектр услуг для вашего здоровья, красоты и расслабления"
        backgroundImage="/images/heroes/services.webp"
      />

      {/* Included services */}
      <Section
        title="Включено в стоимость посещения"
        subtitle="Все эти услуги вы получаете при покупке любого билета"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {includedServices.map((service) => (
            <div
              key={service}
              className="flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/50"
            >
              <CheckCircle className="h-6 w-6 flex-shrink-0 text-success" />
              <span className="text-text-primary font-medium">
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

      {/* What to bring + Procedure time notice + Steam services */}
      <Section warm>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* What to bring */}
          <div id="what-to-bring" className="rounded-2xl bg-surface border border-border/50 p-6 scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-sky-500" />
              <h3 className="font-heading text-lg font-bold text-text-primary">Не забудьте взять с собой</h3>
            </div>
            <ul className="space-y-2.5">
              {[
                'Полотенце',
                'Купальник',
                'Шлёпки или резиновые тапочки',
                'Мочалка, шампунь, гель для душа',
                'Расчёска',
                'Полотенце для головы или банную шапочку',
              ].map((item) => (
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

          {/* Procedure time notice */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/50 p-6 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading text-lg font-bold text-emerald-800">Важно знать</h3>
              </div>
              <p className="text-sm text-emerald-800/80 leading-relaxed">
                Мы не дарим час сверху — мы <strong>замораживаем ваше время посещения</strong> на тех процедурах, где это предусмотрено. Пока идёт процедура, ваш браслет «стоит на паузе», и оплаченное время не расходуется.
              </p>
            </div>
          </div>
        </div>

        {/* Steam services - сразу после важно знать */}
        <div className="mb-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2">Парения</h2>
          <p className="text-text-secondary">Индивидуальные и групповые программы парения от наших мастеров</p>
        </div>
        <div className="mb-6 flex items-center gap-2 text-primary">
          <Waves className="h-5 w-5" />
          <span className="text-sm font-medium">Авторские методики от опытных банщиков</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steamServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              image={allImages[service.id]}
              onClick={() => openModal(service)}
            />
          ))}
        </div>
      </Section>

      {/* SPA services */}
      <Section
        title="SPA-процедуры"
        subtitle="Профессиональные процедуры для глубокого расслабления и восстановления"
      >
        <div className="mb-6 flex items-center gap-2 text-accent">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">Записывайтесь заранее — количество мест ограничено</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              image={allImages[service.id]}
              onClick={() => openModal(service)}
            />
          ))}
        </div>
      </Section>

      {/* Купить */}
      <Section warm>
        <div className="grid gap-5 sm:grid-cols-3">
          <button
            type="button"
            onClick={openBooking}
            className="group rounded-2xl bg-surface border border-border/50 p-6 text-left hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Ticket className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Купить посещение</h3>
            <p className="text-sm text-text-secondary mb-3">Разовый билет для взрослых и детей</p>
            <Badge variant="default">от 540 ₽</Badge>
          </button>

          <button
            type="button"
            onClick={() => openPurchase({ name: 'Абонемент', price: 'от 4 500 ₽' })}
            className="group rounded-2xl bg-surface border border-border/50 p-6 text-left hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <CalendarCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Купить абонемент</h3>
            <p className="text-sm text-text-secondary mb-3">5 или 10 посещений со скидкой</p>
            <Badge variant="gold">выгодно</Badge>
          </button>

          {false && (
          <button
            type="button"
            onClick={() => openPurchase({ name: 'Подарочный сертификат', price: 'от 1 000 ₽' })}
            className="group rounded-2xl bg-surface border border-border/50 p-6 text-left hover:border-primary/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Сертификат в подарок</h3>
            <p className="text-sm text-text-secondary mb-3">Подарочные сертификаты и боксы</p>
            <Badge variant="default">от 1 000 ₽</Badge>
          </button>
          )}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Хотите купить услугу?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Оставьте заявку онлайн или позвоните нам <a href={phoneHref} className="text-primary hover:underline">{phone}</a>, и мы подберём для вас идеальную программу.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TicketButton onClick={openBooking}>Купить релакс</TicketButton>
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Перезвоните мне
            </a>
          </div>
          <button onClick={openWhatToBring} className="inline-block mt-4 text-xs text-white/50 hover:text-white/80 transition-colors">
            Не забудьте взять с собой →
          </button>
        </Container>
      </section>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          service={selectedService}
          image={selectedImage}
          onClose={() => setSelectedService(null)}
        />
      )}
    </PageLayout>
  );
}
