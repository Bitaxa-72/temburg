import { useMemo } from 'react';
import { Droplets, Thermometer, Sparkles, Users, CheckCircle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { useZonesData } from '@/hooks/useWordPressData';
import { ZoneItemsGrid } from '@/components/zones/ZoneCards';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { findZoneCategory, mapZonesDataToCategories } from '@/utils/zonesData';

const features = [
  {
    icon: Thermometer,
    title: 'Постоянный подогрев',
    description: 'Все бассейны поддерживают комфортную температуру воды круглый год',
  },
  {
    icon: Sparkles,
    title: 'Современная очистка',
    description: 'Многоступенчатая система фильтрации и обеззараживания воды',
  },
  {
    icon: Droplets,
    title: 'Гидромассаж',
    description: 'Мощные форсунки для расслабляющего массажа и восстановления',
  },
  {
    icon: Users,
    title: 'Для всей семьи',
    description: 'Бассейны для взрослых и безопасная зона для детей',
  },
];

const advantages = [
  'Чистая вода с современной системой фильтрации',
  'Профессиональные инструкторы по плаванию',
  'Удобные раздевалки и душевые',
  'Шезлонги и зона отдыха у бассейнов',
  'Безопасность детей в воде остаётся ответственностью родителей',
  'Продажа полотенец и купальных принадлежностей',
];

function FeatureCard({ feature }: { feature: typeof features[0] }) {
  const Icon = feature.icon;

  return (
    <div className="flex items-start gap-4 rounded-xl bg-surface p-5 border border-border/50">
      <div className="rounded-lg bg-primary/10 p-2.5 flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-text-primary mb-1">{feature.title}</h3>
        <p className="text-sm text-text-secondary">{feature.description}</p>
      </div>
    </div>
  );
}

export default function PoolsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «pools» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('pools');

  const { openBooking } = useBooking();
  const { data: zonesData } = useZonesData();
  const zonesFromAcf = useMemo(() => mapZonesDataToCategories(zonesData.zones), [zonesData.zones]);
  const poolZoneItems = findZoneCategory(zonesFromAcf, 'pools')?.items || [];

  return (
    <PageLayout
      title="Бассейны"
      description="Комплекс бассейнов с чистой водой в Термбурге - плавание, гидромассаж и отдых для всей семьи."
    >
      <PageHero
        title="Бассейны Термбурга"
        subtitle="Комплекс бассейнов для плавания, отдыха и всей семьи"
        backgroundImage="/images/heroes/pools.webp"
      />

      {/* Overview - Водный отдых */}
      <Section warm>
        <div className="relative rounded-3xl bg-gradient-to-br from-surface via-surface to-info/5 border border-border/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-info/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-5 gap-8 p-8 md:p-12 items-center">
            {/* Text content - 3 columns */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <span className="inline-block text-info text-sm font-medium uppercase tracking-wider mb-2">
                  Активный отдых
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                  Водный отдых
                </h2>
              </div>

              <div className="w-16 h-1 bg-gradient-to-r from-info to-primary rounded-full" />

              <p className="text-lg text-text-secondary leading-relaxed">
                Комплекс бассейнов Термбурга — это <span className="text-text-primary font-medium">сочетание спорта, релакса и семейного отдыха</span>.
                Вода поддерживается при комфортной температуре круглый год.
              </p>

              <p className="text-text-secondary leading-relaxed">
                У нас есть большой 25-метровый бассейн для активного плавания и безопасная зона для детей.
                <span className="text-text-primary font-medium"> Современная система очистки воды</span> гарантирует кристальную чистоту и безопасность.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 bg-info/10 text-info px-4 py-2 rounded-full text-sm font-medium">
                  <Droplets className="w-4 h-4" />
                  2 бассейна
                </span>
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Thermometer className="w-4 h-4" />
                  Подогрев воды
                </span>
                <span className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
                  <Users className="w-4 h-4" />
                  Для всей семьи
                </span>
              </div>
            </div>

            {/* Image - 2 columns */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-info/20 to-primary/20 rounded-2xl blur-2xl scale-90" />
                <img
                  src="/images/complex/pool.webp"
                  alt="Бассейны Термбурга"
                  className="relative w-full max-w-sm h-auto rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pool Types */}
      <Section title="Наши бассейны" subtitle="Выберите бассейн по душе" warm>
        <ZoneItemsGrid items={poolZoneItems} columns={2} />
      </Section>

      {/* Features */}
      <Section title="Особенности комплекса" subtitle="Что делает наши бассейны особенными">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </Section>

      {/* Advantages */}
      <Section warm title="Преимущества" subtitle="Всё для вашего комфорта">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((text) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/50">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-success" />
              <span className="text-text-primary font-medium text-sm">{text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <Droplets className="mx-auto mb-4 h-8 w-8 text-info" />
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Окунитесь в мир водного отдыха
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Посетите бассейны Термбурга — плавание, отдых и веселье для всей семьи круглый год
          </p>
          <TicketButton onClick={openBooking}>Окунуться</TicketButton>
        </Container>
      </section>
    </PageLayout>
  );
}
