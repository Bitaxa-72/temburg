import { useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { Waves, Droplets, Sparkles, Heart, Wind, Thermometer } from 'lucide-react';
import { ZoneItemsGrid } from '@/components/zones/ZoneCards';
import { usePageContent, useZonesData } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { findZoneCategory, mapZonesDataToCategories } from '@/utils/zonesData';

const features = [
  {
    icon: Thermometer,
    title: 'Контроль температуры',
    description: 'Вода поддерживается на комфортной температуре 36-40°C для максимального расслабления',
  },
  {
    icon: Waves,
    title: 'Гидромассажные форсунки',
    description: 'Мощные водяные струи целенаправленно воздействуют на мышцы спины, шеи и ног',
  },
  {
    icon: Sparkles,
    title: 'Хромотерапия',
    description: 'Цветная подсветка создаёт расслабляющую атмосферу и усиливает терапевтический эффект',
  },
  {
    icon: Wind,
    title: 'Пузырьковый массаж',
    description: 'Воздушные пузырьки мягко массируют всё тело, улучшая кровообращение',
  },
];

const benefits = [
  {
    icon: Heart,
    title: 'Расслабление мышц',
    description: 'Тёплая вода и гидромассаж снимают напряжение и зажимы, особенно в зоне спины и шеи',
  },
  {
    icon: Droplets,
    title: 'Улучшение кровообращения',
    description: 'Массаж водяными струями активизирует кровоток, ускоряя восстановление тканей',
  },
  {
    icon: Sparkles,
    title: 'Снятие стресса',
    description: 'Гидротерапия помогает снизить уровень кортизола и улучшить общее самочувствие',
  },
];

export default function JacuzziPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «jacuzzi» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('jacuzzi');

  const { openBooking } = useBooking();
  const { data: zonesData } = useZonesData();
  const zonesFromAcf = useMemo(() => mapZonesDataToCategories(zonesData.zones), [zonesData.zones]);
  const jacuzziZoneItems = findZoneCategory(zonesFromAcf, 'pools-cold')?.items || [];

  return (
    <PageLayout
      title="Купели и джакузи"
      description="Купели и джакузи в термальном комплексе Термбург: контрастные процедуры, гидромассаж и расслабление."
      ogImage="/images/saunas/attributes/hot-tub-attr.png"
    >
      <PageHero
        title="Купели и джакузи Термбурга"
        subtitle="Контраст температур, гидромассаж и полное расслабление"
        backgroundImage="/images/heroes/jacuzzi.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Overview - О гидромассаже */}
      <Section warm>
        <div className="relative rounded-3xl bg-gradient-to-br from-surface via-surface to-primary/5 border border-border/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-info/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-5 gap-8 p-8 md:p-12 items-center">
            {/* Text content - 3 columns */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <span className="inline-block text-primary text-sm font-medium uppercase tracking-wider mb-2">
                  Контраст и гидромассаж
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                  Купели и джакузи
                </h2>
              </div>

              <div className="w-16 h-1 bg-gradient-to-r from-primary to-info rounded-full" />

              <p className="text-lg text-text-secondary leading-relaxed">
                Тёплые джакузи и ледяные купели — <span className="text-text-primary font-medium">обязательная часть банного ритуала</span>.
                Контраст температур закаляет, бодрит и тренирует сосуды, а гидромассаж снимает напряжение и восстанавливает силы.
              </p>

              <p className="text-text-secondary leading-relaxed">
                В Термбурге <span className="text-text-primary font-medium">4 зоны</span>: тёплое джакузи возле бассейна, уличное джакузи «Ирий» под открытым небом, ледяная купель «Студенец» и холодная купель на улице — для тех, кто хочет настоящего закаливания.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Waves className="w-4 h-4" />
                  4 зоны
                </span>
                <span className="inline-flex items-center gap-2 bg-info/10 text-info px-4 py-2 rounded-full text-sm font-medium">
                  <Thermometer className="w-4 h-4" />
                  6–40°C
                </span>
                <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  Контраст
                </span>
              </div>
            </div>

            {/* Image - 2 columns */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-info/20 rounded-2xl blur-2xl scale-90" />
                <img
                  src="/images/saunas/attributes/hot-tub-attr.png"
                  alt="Джакузи Термбурга"
                  className="relative w-full max-w-sm h-auto rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Купели и джакузи */}
      <Section
        warm
        title="Наши купели и джакузи"
        subtitle="Выберите подходящий формат — расслабление, контраст или и то, и другое"
      >
        <ZoneItemsGrid items={jacuzziZoneItems} columns={2} />
      </Section>

      {/* Features */}
      <Section
        title="Особенности наших джакузи"
        subtitle="Технологии для вашего комфорта"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Benefits */}
      <Section
        warm
        title="Польза гидромассажа"
        subtitle="Научно доказанное воздействие на организм"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl bg-surface border border-border/50 p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 mx-auto max-w-2xl rounded-2xl bg-emerald-50 border border-emerald-200/50 p-6">
          <h3 className="text-lg font-bold text-emerald-800 mb-3 text-center">Рекомендации врачей</h3>
          <p className="text-sm text-emerald-800/80 leading-relaxed text-center">
            Регулярные сеансы гидромассажа рекомендуются при повышенных физических нагрузках,
            сидячей работе, хроническом стрессе и для профилактики заболеваний опорно-двигательного аппарата.
          </p>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Готовы погрузиться в мир релакса?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Купите билет и наслаждайтесь гидромассажем в любой из 4 зон джакузи и купелей
          </p>
          <TicketButton onClick={openBooking}>Пузырьки</TicketButton>
        </Container>
      </section>
    </PageLayout>
  );
}
