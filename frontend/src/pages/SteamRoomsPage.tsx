import { useMemo } from 'react';
import { Thermometer, Droplets, Heart, CheckCircle2, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { useZonesData } from '@/hooks/useWordPressData';
import { ZoneItemsGrid } from '@/components/zones/ZoneCards';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { findZoneCategory, mapZonesDataToCategories } from '@/utils/zonesData';


// Static benefits and recommendations (can be moved to WordPress later)
const benefits = [
  {
    title: 'Укрепление иммунитета',
    description: 'Контрастные температуры закаляют организм, повышают сопротивляемость вирусам и инфекциям.',
    icon: Heart,
  },
  {
    title: 'Очищение организма',
    description: 'Глубокое потоотделение выводит токсины, шлаки, улучшает обмен веществ и состояние кожи.',
    icon: Droplets,
  },
  {
    title: 'Снятие стресса',
    description: 'Тепло и пар расслабляют мышцы, успокаивают нервную систему, улучшают сон.',
    icon: CheckCircle2,
  },
  {
    title: 'Улучшение кровообращения',
    description: 'Расширение сосудов ускоряет кровоток, улучшает питание тканей, снижает артериальное давление.',
    icon: Heart,
  },
];

const recommendations = [
  {
    step: 1,
    title: 'Подготовка',
    text: 'Примите душ, снимите украшения. Не парьтесь натощак или сразу после еды.',
  },
  {
    step: 2,
    title: 'Первый заход',
    text: 'Начните с 5-7 минут на нижней полке. Дышите носом, не делайте резких движений.',
  },
  {
    step: 3,
    title: 'Охлаждение',
    text: 'После парной обязательно примите душ. Контраст температур — основа закаливания.',
  },
  {
    step: 4,
    title: 'Отдых',
    text: 'Отдохните 10-15 минут, восполните водный баланс тёплым чаем или водой.',
  },
  {
    step: 5,
    title: 'Повторение',
    text: 'Повторите цикл 2-3 раза. С каждым заходом можно увеличивать время на 2-3 минуты.',
  },
  {
    step: 6,
    title: 'Завершение',
    text: 'После последнего захода отдохните 20-30 минут, укутайтесь в полотенце, выпейте травяной чай.',
  },
];

const contraindications = [
  'Острые воспалительные заболевания',
  'Онкологические заболевания',
  'Гипертония 3 степени',
  'Беременность (проконсультируйтесь с врачом)',
  'Недавние операции (менее 6 месяцев)',
  'Эпилепсия',
];

export default function SteamRoomsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «steam-rooms» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('steam-rooms');

  const { openBooking } = useBooking();
  const { data: zonesData } = useZonesData();
  const zonesFromAcf = useMemo(() => mapZonesDataToCategories(zonesData.zones), [zonesData.zones]);
  const steamZoneItems = findZoneCategory(zonesFromAcf, 'steam')?.items || [];

  return (
    <PageLayout
      title="Парные Термбурга"
      description="Парные Термбурга: русская баня, хаммам, травяная парная, соляная комната. Оздоровление, закаливание, релакс."
    >
      {/* Hero */}
      <PageHero
        title="Парные Термбурга"
        subtitle="12 видов парных для здоровья, красоты и долголетия"
        backgroundImage="/images/heroes/steam-rooms.webp"
      />

      {/* Overview - Банная культура */}
      <Section warm>
        <div className="relative rounded-3xl bg-gradient-to-br from-surface via-surface to-primary/5 border border-border/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-5 gap-8 p-8 md:p-12 items-center">
            {/* Text content - 3 columns */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <span className="inline-block text-primary text-sm font-medium uppercase tracking-wider mb-2">
                  Тысячелетние традиции
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
                  Банная культура
                </h2>
              </div>

              <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />

              <p className="text-lg text-text-secondary leading-relaxed">
                Баня — это не просто место для гигиены. Это <span className="text-text-primary font-medium">древняя традиция оздоровления</span>,
                закаливания и духовного очищения, известная всем народам мира.
              </p>

              <p className="text-text-secondary leading-relaxed">
                В Термбурге мы собрали лучшие банные традиции: от классической русской бани
                до турецкого хаммама, от травяной парной до инновационной соляной комнаты.
                <span className="text-text-primary font-medium"> Каждая парная — уникальный опыт</span> для вашего тела и души.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <Thermometer className="w-4 h-4" />
                  12 видов парных
                </span>
                <span className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-600 px-4 py-2 rounded-full text-sm font-medium">
                  <Droplets className="w-4 h-4" />
                  Разная влажность
                </span>
                <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  Для здоровья
                </span>
              </div>
            </div>

            {/* Image - 2 columns */}
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl scale-90" />
                <img
                  src="/images/banshchik.jpg"
                  alt="Банщик — мастер парения"
                  className="relative w-64 md:w-80 h-auto rounded-2xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Steam room types */}
      <Section warm title="Виды парных" subtitle="Выберите свой идеальный формат оздоровления">
        <ZoneItemsGrid items={steamZoneItems} />
      </Section>

      {/* Benefits */}
      <Section title="Польза для здоровья" subtitle="Научно доказанные эффекты банных процедур">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl bg-surface border border-border/50 p-6 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Recommendations */}
      <Section warm title="Как правильно париться" subtitle="Пошаговая инструкция для максимальной пользы">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-5 md:grid-cols-2">
            {recommendations.map((rec) => (
              <div
                key={rec.step}
                className="flex gap-4 rounded-2xl bg-surface border border-border/50 p-5"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-white font-bold">
                  {rec.step}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-text-primary mb-1.5">
                    {rec.title}
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {rec.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contraindications */}
          <div className="mt-8 rounded-2xl bg-red-50 border border-red-200/50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-heading text-lg font-bold text-red-800">
                Противопоказания
              </h3>
            </div>
            <p className="text-sm text-red-800/80 mb-3">
              Банные процедуры не рекомендуются при:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {contraindications.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-800/70">
                  <span className="text-red-600 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-800/60 mt-4 pt-3 border-t border-red-200/50">
              Перед посещением парных проконсультируйтесь с врачом, если у вас есть
              хронические заболевания.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Готовы испытать силу пара?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Купите билет онлайн или офлайн и получите доступ ко всем парным в рамках одного посещения. Оздоровление, закаливание и релакс — только в Термбург.
          </p>
          <TicketButton onClick={openBooking}>Пропариться</TicketButton>
        </Container>
      </section>
    </PageLayout>
  );
}
