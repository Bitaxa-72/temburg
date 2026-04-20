import { Link } from 'react-router-dom';
import {
  Waves,
  Baby,
  GraduationCap,
  Sparkles,
  PartyPopper,
  Heart,
  Clock,
  CheckCircle,
  ChevronRight,
  Calendar,
  Users,
  Thermometer,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

interface FamilyService {
  id: string;
  icon: typeof Waves;
  title: string;
  description: string;
  features: string[];
  image: string;
  link?: string;
  linkText?: string;
  badge?: string;
  price?: string;
}

const familyServices: FamilyService[] = [
  {
    id: 'kids-pool',
    icon: Waves,
    title: 'Детский бассейн',
    description:
      'Безопасный тёплый бассейн с комфортной глубиной для детей. Зона джакузи с гидромассажем для малышей и родителей.',
    features: [
      'Глубина 60–80 см',
      'Температура воды 30–32°C',
      'Джакузи в детской зоне',
      'Постоянный контроль качества воды',
    ],
    image: '/images/complex/pool.webp',
    badge: 'Включено',
  },
  {
    id: 'swimming-school',
    icon: GraduationCap,
    title: 'Школа плавания',
    description:
      'Обучение плаванию для детей от 6 до 12 лет в тёплом термальном бассейне. Мини-группы 4–6 человек с индивидуальным подходом.',
    features: [
      'Сертифицированные тренеры',
      'Мини-группы 4–6 человек',
      'Занятия по пятницам и воскресеньям',
      'Абонемент на 8 занятий',
    ],
    image: '/images/swimming-school.jpg',
    link: '/swimming-school',
    linkText: 'Подробнее о школе',
    price: 'от 1 800 ₽',
  },
  {
    id: 'kids-steam',
    icon: Thermometer,
    title: 'Детские парения',
    description:
      'Мягкие щадящие парения для детей с пониженной температурой. Банщики работают деликатно, учитывая особенности детского организма.',
    features: [
      'Пониженная температура 50–60°C',
      'Короткие сеансы 5–7 минут',
      'Мягкие берёзовые веники',
      'Опытные детские банщики',
    ],
    image: '/images/services/steam-kids.webp',
    link: '/services',
    linkText: 'Все парения',
    price: 'от 1 200 ₽',
  },
  {
    id: 'kids-massage',
    icon: Heart,
    title: 'Детский массаж',
    description:
      'Нежный расслабляющий массаж для детей от 5 лет. Снимает напряжение, улучшает сон и общее самочувствие ребёнка.',
    features: [
      'Для детей от 5 лет',
      'Гипоаллергенные масла',
      'Сертифицированный массажист',
      '30 минут релаксации',
    ],
    image: '/images/services/spa-relax.webp',
    link: '/services',
    linkText: 'Все SPA-услуги',
    price: '1 900 ₽',
  },
  {
    id: 'animation',
    icon: PartyPopper,
    title: 'Детская анимация',
    description:
      'Профессиональные аниматоры проводят весёлые игры и мастер-классы для детей. Родители могут отдохнуть, пока дети развлекаются.',
    features: [
      'Игры и конкурсы',
      'Творческие мастер-классы',
      'По выходным и праздникам',
      'Включено в стоимость',
    ],
    image: '/images/promo/birthday.webp',
    link: '/schedule',
    linkText: 'Смотреть расписание',
    badge: 'Бесплатно',
  },
  {
    id: 'aqua-aerobics',
    icon: Sparkles,
    title: 'Аквааэробика',
    description:
      'Групповые занятия в бассейне для всей семьи. Весело и полезно — фитнес в воде подходит для любого возраста и уровня подготовки.',
    features: [
      'Пн, Ср, Пт — 10:00',
      '45 минут занятие',
      'Для любого возраста',
      'Включено в стоимость',
    ],
    image: '/images/promo/swimming.webp',
    link: '/schedule',
    linkText: 'Смотреть расписание',
    badge: 'Бесплатно',
  },
];

const safetyRules = [
  'Дети до 14 лет — только в сопровождении взрослых',
  'В парных — не более 5–7 минут для детей',
  'Обязательный душ перед бассейном',
  'Резиновая обувь на всей территории',
  'Нарукавники для не умеющих плавать',
];

function ServiceCard({ service }: { service: FamilyService }) {
  const { openBooking } = useBooking();

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <div className="h-44 overflow-hidden relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {service.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant="gold" className="text-xs">
              {service.badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <service.icon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-text-primary">{service.title}</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4 flex-1">{service.description}</p>
        <ul className="space-y-1.5 mb-4">
          {service.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
              <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border pt-3">
          {service.price ? (
            <span className="text-base font-bold text-primary">{service.price}</span>
          ) : (
            <span className="text-sm text-success font-medium">Включено</span>
          )}
          {service.link ? (
            <Link
              to={service.link}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {service.linkText} <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={openBooking}
              className="text-sm font-medium text-primary hover:underline"
            >
              Купить
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function FamilyPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «family» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('family');

  const { openBooking } = useBooking();

  return (
    <PageLayout
      title="Семейный отдых"
      description="Термбург для всей семьи — детский бассейн, школа плавания, анимация и мягкие парения для детей."
    >
      <PageHero
        title="Семейный отдых"
        subtitle="Термбург для всей семьи — здесь рады и взрослым, и детям"
        backgroundImage="/images/heroes/family.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Intro */}
      <Section>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="h-8 w-8 text-primary" />
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Отдых для всей семьи
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Термбург — это место, где каждый член семьи найдёт занятие по душе.
            Пока родители расслабляются в парных и SPA, дети весело проводят время
            в бассейне, на занятиях с аниматорами или учатся плавать в нашей школе.
          </p>
        </div>
      </Section>

      {/* Services grid */}
      <Section
        warm
        title="Для детей и родителей"
        subtitle="Всё, что нужно для идеального семейного дня"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {familyServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Section>

      {/* Schedule link */}
      <Section>
        <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Расписание детских мероприятий
              </h3>
              <p className="text-text-secondary mb-4">
                Смотрите актуальное расписание аквааэробики, анимации и других активностей для детей
              </p>
              <Link
                to="/schedule"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
              >
                <Clock className="w-4 h-4" />
                Открыть расписание
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Safety rules */}
      <Section warm title="Правила безопасности" subtitle="Для комфортного отдыха с детьми">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {safetyRules.map((rule) => (
            <div
              key={rule}
              className="flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/50"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm text-text-primary">{rule}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/rules"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Полные правила посещения <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="h-8 w-8 text-primary" />
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Подарите семье день отдыха
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Забронируйте посещение для всей семьи и проведите незабываемый день в Термбурге
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TicketButton onClick={openBooking}>Купить посещение</TicketButton>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Смотреть цены
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/50">
            Вопросы? Звоните:{' '}
            <a href="tel:+79091674746" className="text-primary hover:underline">
              +7 (909) 167-47-46
            </a>
          </p>
        </Container>
      </section>
    </PageLayout>
  );
}
