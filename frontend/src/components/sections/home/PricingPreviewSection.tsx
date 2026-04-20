import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Baby, UserCheck } from 'lucide-react';

import Section from '@/components/ui/Section';
import TicketButton from '@/components/ui/TicketButton';
import CertificateConfigurator from '@/components/shared/CertificateConfigurator';
import { useBooking } from '@/context/BookingContext';
import { usePricing } from '@/hooks/useWordPressData';
import { weekdayPricing, weekendPricing, subscriptions, pensionerPricing, childUnder6Price as fallbackChildUnder6 } from '@/data/pricing';

const PricingPreviewSection = memo(function PricingPreviewSection() {
  const { openBooking, openPurchase, openWhatToBring } = useBooking();
  const { data: wpPricing } = usePricing();
  const childUnder6Price = wpPricing.childUnder6 ?? fallbackChildUnder6;

  return (
    <Section
      warm
      separator
      title="Стоимость и абонементы"
      subtitle="Гибкая система тарифов — от 1 часа до безлимита на день"
    >
      <div className="max-w-5xl mx-auto">
        {/* Two-column pricing table */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Weekdays */}
          <div className="rounded-2xl border border-border overflow-hidden bg-surface">
            <div className="bg-background px-6 py-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-text-primary text-center">Будни</h3>
            </div>
            <div className="divide-y divide-border/50">
              {weekdayPricing.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-surface-warm transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPurchase({ name: `Будни — ${slot.name}`, price: `${slot.adultPrice.toLocaleString('ru-RU')} ₽`, childPrice: `${slot.childPrice.toLocaleString('ru-RU')} ₽` })}
                >
                  <span className="text-text-primary">{slot.name}</span>
                  <span className="text-primary font-bold">{slot.adultPrice.toLocaleString('ru-RU')}₽</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekends */}
          <div className="rounded-2xl border border-accent/40 overflow-hidden bg-surface">
            <div className="bg-accent/10 px-6 py-3 border-b border-accent/20">
              <h3 className="font-heading text-lg font-bold text-accent text-center">Выходные / Праздники</h3>
            </div>
            <div className="divide-y divide-border/50">
              {weekendPricing.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-accent/5 transition-colors"
                  role="button"
                  tabIndex={0}
                  onClick={() => openPurchase({ name: `Выходные — ${slot.name}`, price: `${slot.adultPrice.toLocaleString('ru-RU')} ₽`, childPrice: `${slot.childPrice.toLocaleString('ru-RU')} ₽` })}
                >
                  <span className="text-text-primary">{slot.name}</span>
                  <span className="text-primary font-bold">{slot.adultPrice.toLocaleString('ru-RU')}₽</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Примечание про пятницу */}
        <p className="text-xs text-text-secondary/70 text-center mb-8 -mt-4">
          Пятница: до 16:00 — тариф будней, после 16:00 — тариф выходных
        </p>

        {/* Льготные тарифы и дети */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {/* Детский тариф */}
          <div className="rounded-xl bg-surface border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Baby className="w-4 h-4 text-accent" />
              </div>
              <h4 className="font-bold text-text-primary">Детский тариф</h4>
            </div>
            <div className="space-y-1.5 text-sm text-text-secondary">
              <p>Дети до 6 лет включительно — <strong className="text-accent">{childUnder6Price.toLocaleString('ru-RU')} ₽</strong> безлимит</p>
            </div>
          </div>

          {/* Льготы для пенсионеров */}
          <div className="rounded-xl bg-surface border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="font-bold text-text-primary">Льготы для пенсионеров</h4>
            </div>
            <div className="space-y-1.5 text-sm text-text-secondary">
              {pensionerPricing.map((p) => (
                <p key={p.id}>{p.name} — <strong className="text-primary">{p.price.toLocaleString('ru-RU')} ₽</strong></p>
              ))}
              <p className="text-xs text-text-secondary/70 pt-1">Пн–Чт, до 18:00 (билет до 16:00)</p>
            </div>
          </div>
        </div>

        {/* Subscriptions — 2 columns */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-primary" />
            <h3 className="font-heading text-xl font-bold text-text-primary">Абонементы</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {subscriptions.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                className="rounded-xl bg-surface border border-border px-5 py-4 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => openPurchase({ name: `Абонемент «${sub.name}»`, price: `${sub.adultPrice.toLocaleString('ru-RU')} ₽` })}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-text-primary">{sub.name}</h4>
                  {sub.discount > 0 && (
                    <span className="rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-semibold px-2 py-0.5">
                      -{sub.discount}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-3">{sub.description}</p>
                <p className="text-xl font-bold text-primary">
                  {sub.adultPrice.toLocaleString('ru-RU')}&nbsp;&#8381;
                  <span className="text-xs text-text-secondary font-normal ml-1">/ мес</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift Certificate */}
      <div className="my-12">
        <CertificateConfigurator
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
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          <TicketButton onClick={openBooking}>Купить дзен для себя</TicketButton>
          <button onClick={openWhatToBring} className="text-sm text-text-secondary hover:text-primary transition-colors underline underline-offset-2">
            Не забудьте взять с собой →
          </button>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors"
          >
            Все тарифы и абонементы
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
});

export default PricingPreviewSection;
