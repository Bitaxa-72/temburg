import { useMemo } from 'react';
import { Snowflake, Waves, Droplets, Leaf, Heart, ShieldCheck, TrendingUp, BookOpen, type LucideIcon } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { usePageContent, useZonesData } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { findZoneCategory, mapZonesDataToCategories } from '@/utils/zonesData';

interface PlungePoolType {
  id: string;
  name: string;
  icon: LucideIcon;
  temperature: string;
  description: string;
  benefits: string[];
  color: string;
}

// Icons are decorative; card content comes from /zones-data.
const ICONS_BY_INDEX = [Snowflake, Droplets, Waves, Leaf];

const benefits = [
  {
    icon: Heart,
    title: 'Укрепление сердечно-сосудистой системы',
    description: 'Контрастные процедуры тренируют сосуды, улучшают кровообращение и нормализуют артериальное давление.',
  },
  {
    icon: ShieldCheck,
    title: 'Повышение иммунитета',
    description: 'Регулярное закаливание стимулирует защитные силы организма, снижает риск простудных заболеваний.',
  },
  {
    icon: TrendingUp,
    title: 'Ускорение метаболизма',
    description: 'Чередование температур активизирует обмен веществ, способствует детоксикации и снижению веса.',
  },
  {
    icon: Droplets,
    title: 'Улучшение состояния кожи',
    description: 'Контрастные процедуры повышают тонус и эластичность кожи, улучшают цвет лица, борются с целлюлитом.',
  },
];

const guidelines = [
  {
    step: 1,
    title: 'Разогрейтесь в парной',
    description: 'Перед погружением в купель проведите 8-12 минут в парной или сауне. Тело должно хорошо прогреться и вспотеть.',
  },
  {
    step: 2,
    title: 'Охладитесь под душем',
    description: 'Сначала ополоснитесь под прохладным душем, начиная с ног. Это подготовит тело к контрасту температур.',
  },
  {
    step: 3,
    title: 'Погрузитесь в купель',
    description: 'Входите в воду медленно, начиная с ног. Оптимальное время — 30-60 секунд для холодной купели, до 5 минут для теплой.',
  },
  {
    step: 4,
    title: 'Отдохните и согрейтесь',
    description: 'После купели отдохните 10-15 минут, выпейте травяного чаю. При желании можно повторить цикл 2-3 раза.',
  },
];

export default function PlungePoolsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «plunge-pools» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('plunge-pools');

  const { openBooking } = useBooking();
  const { data: zonesData } = useZonesData();
  const zonesFromAcf = useMemo(() => mapZonesDataToCategories(zonesData.zones), [zonesData.zones]);
  const plungePoolTypesFromAcf = useMemo<PlungePoolType[]>(
    () =>
      (findZoneCategory(zonesFromAcf, 'pools-cold')?.items || [])
        .filter((item) => /купел/i.test(item.name))
        .map((item, idx) => ({
          id: 'cold-' + (idx + 1),
          name: item.name,
          icon: ICONS_BY_INDEX[idx] || Snowflake,
          temperature: (item.temp || '').split('·')[0].trim(),
          description: item.desc,
          benefits: item.features || [],
          color: idx === 0 ? 'text-cyan-400' : 'text-blue-400',
        })),
    [zonesFromAcf],
  );

  return (
    <PageLayout
      title="Купели Термбурга"
      description="Контрастные купели с разной температурой воды: ледяная, холодная, теплая и травяная. Укрепление здоровья и закаливание."
    >
      {/* Hero */}
      <PageHero
        title="Купели Термбурга"
        subtitle="Контрастные процедуры для здоровья, бодрости и закаливания"
        backgroundImage="/images/heroes/plunge-pools.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Overview */}
      <Section
        title="Искусство контрастных процедур"
        subtitle="Традиция, проверенная веками и подтвержденная наукой"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-text-secondary leading-relaxed mb-6">
            Контрастные процедуры — это чередование высоких и низких температур, которое оказывает мощное оздоровительное воздействие на весь организм. Термбург предлагает четыре вида купелей с разной температурой воды, чтобы каждый гость мог подобрать комфортный для себя вариант.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Резкая смена температуры тренирует сосуды, укрепляет иммунитет, запускает процессы обновления клеток и дарит невероятный прилив энергии. Начните с теплой купели и постепенно переходите к более контрастным вариантам.
          </p>
        </div>
      </Section>

      {/* Plunge Pool Types */}
      <Section warm title="Виды купелей" subtitle="Выберите свой уровень контраста">
        <div className="grid gap-6 md:grid-cols-2">
          {plungePoolTypesFromAcf.map((pool) => {
            const Icon = pool.icon;
            return (
              <Card key={pool.id} className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-surface-warm flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${pool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-1">{pool.name}</h3>
                    <p className={`text-sm font-semibold ${pool.color}`}>{pool.temperature}</p>
                  </div>
                </div>
                <p className="text-text-secondary mb-4 leading-relaxed">{pool.description}</p>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
                    Эффекты
                  </p>
                  <ul className="space-y-2">
                    {pool.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className={`mt-1 ${pool.color}`}>•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Польза контрастных процедур" subtitle="Научно доказанные эффекты для здоровья">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{benefit.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* How to Use */}
      <Section
        warm
        title="Как правильно использовать купели"
        subtitle="Следуйте этим рекомендациям для максимального эффекта"
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {guidelines.map((guide) => (
            <div key={guide.step} className="relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                {guide.step}
              </div>
              <Card className="h-full pt-4">
                <h3 className="text-lg font-bold text-text-primary mb-2">{guide.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{guide.description}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Important Notes */}
        <div className="rounded-2xl bg-amber-50 border border-amber-200/50 p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Важно знать</h3>
              <ul className="space-y-1.5 text-sm text-amber-900/80">
                <li>• Начинайте с коротких погружений и постепенно увеличивайте время</li>
                <li>• При первом посещении выбирайте более мягкие варианты (теплую или холодную купель)</li>
                <li>• Не погружайтесь в ледяную купель без подготовки и опыта закаливания</li>
                <li>• При наличии сердечно-сосудистых заболеваний проконсультируйтесь с врачом</li>
                <li>• Беременным женщинам рекомендуется избегать резких контрастов температур</li>
                <li>• Слушайте свое тело — дискомфорт сигнализирует о необходимости прекратить процедуру</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Готовы испытать силу контраста?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Купели входят в стоимость любого посещения Термбурга. Приезжайте и откройте для себя удивительный эффект контрастных процедур.
          </p>
          <TicketButton onClick={openBooking}>Купить билет</TicketButton>
          <p className="mt-6 text-sm text-white/50">
            Вопросы? Звоните{' '}
            <a href="tel:+79091674746" className="text-primary hover:underline">
              +7 (909) 167-47-46
            </a>
          </p>
        </Container>
      </section>
    </PageLayout>
  );
}
