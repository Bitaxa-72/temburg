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
import { useFamilyContent } from '@/hooks/useWordPressData';
import type { WPFamilyContent, WPFamilyService } from '@/api/wordpress';

const familyIconMap = {
  waves: Waves,
  graduation: GraduationCap,
  thermometer: Thermometer,
  heart: Heart,
  party: PartyPopper,
  sparkles: Sparkles,
};

const fallbackFamilyServices: WPFamilyService[] = [
  {
    id: 'kids-pool',
    icon: 'waves',
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
    visible: true,
  },
  {
    id: 'swimming-school',
    icon: 'graduation',
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
    visible: true,
  },
  {
    id: 'kids-steam',
    icon: 'thermometer',
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
    visible: true,
  },
  {
    id: 'kids-massage',
    icon: 'heart',
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
    visible: true,
  },
  {
    id: 'animation',
    icon: 'party',
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
    visible: true,
  },
  {
    id: 'aqua-aerobics',
    icon: 'sparkles',
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
    visible: true,
  },
];

const safetyRules = [
  'Дети до 14 лет — только в сопровождении взрослых',
  'В парных — не более 5–7 минут для детей',
  'Обязательный душ перед бассейном',
  'Резиновая обувь на всей территории',
  'Нарукавники для не умеющих плавать',
];

interface FamilyPageContentView {
  pageTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  intro: {
    title: string;
    text: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: WPFamilyService[];
  };
  schedule: {
    title: string;
    text: string;
    buttonText: string;
    link: string;
  };
  safety: {
    title: string;
    subtitle: string;
    rules: string[];
    linkText: string;
    link: string;
  };
  cta: {
    title: string;
    text: string;
    primaryButton: string;
    secondaryButton: string;
    secondaryLink: string;
    phoneLabel: string;
    phone: string;
  };
}

function mergeFamilyContent(content: WPFamilyContent): FamilyPageContentView {
  return {
    pageTitle: content.pageTitle || 'Семейный отдых',
    metaDescription: content.metaDescription || 'Термбург для всей семьи — детский бассейн, школа плавания, анимация и мягкие парения для детей.',
    heroTitle: content.heroTitle || 'Семейный отдых',
    heroSubtitle: content.heroSubtitle || 'Термбург для всей семьи — здесь рады и взрослым, и детям',
    heroImage: content.heroImage || '/images/heroes/family.webp',
    intro: {
      title: content.intro?.title || 'Отдых для всей семьи',
      text: content.intro?.text || 'Термбург — это место, где каждый член семьи найдёт занятие по душе. Пока родители расслабляются в парных и SPA, дети весело проводят время в бассейне, на занятиях с аниматорами или учатся плавать в нашей школе.',
    },
    services: {
      title: content.services?.title || 'Для детей и родителей',
      subtitle: content.services?.subtitle || 'Всё, что нужно для идеального семейного дня',
      items: content.services?.items?.length ? content.services.items : fallbackFamilyServices,
    },
    schedule: {
      title: content.schedule?.title || 'Расписание детских мероприятий',
      text: content.schedule?.text || 'Смотрите актуальное расписание аквааэробики, анимации и других активностей для детей',
      buttonText: content.schedule?.buttonText || 'Открыть расписание',
      link: content.schedule?.link || '/schedule',
    },
    safety: {
      title: content.safety?.title || 'Правила безопасности',
      subtitle: content.safety?.subtitle || 'Для комфортного отдыха с детьми',
      rules: content.safety?.rules?.length ? content.safety.rules : safetyRules,
      linkText: content.safety?.linkText || 'Полные правила посещения',
      link: content.safety?.link || '/rules',
    },
    cta: {
      title: content.cta?.title || 'Подарите семье день отдыха',
      text: content.cta?.text || 'Забронируйте посещение для всей семьи и проведите незабываемый день в Термбурге',
      primaryButton: content.cta?.primaryButton || 'Купить посещение',
      secondaryButton: content.cta?.secondaryButton || 'Смотреть цены',
      secondaryLink: content.cta?.secondaryLink || '/pricing',
      phoneLabel: content.cta?.phoneLabel || 'Вопросы? Звоните:',
      phone: content.cta?.phone || '+7 (909) 167-47-46',
    },
  };
}

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:+${digits}` : '';
}

function ServiceCard({ service }: { service: WPFamilyService }) {
  const { openBooking } = useBooking();
  const Icon = familyIconMap[service.icon as keyof typeof familyIconMap] || Waves;

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
          <Icon className="w-5 h-5 text-primary" />
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
              {service.linkText || 'Подробнее'} <ChevronRight className="w-4 h-4" />
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
  const { data: familyContent } = useFamilyContent();
  const content = mergeFamilyContent(familyContent);
  const { openBooking } = useBooking();
  const ctaPhoneHref = phoneHref(content.cta.phone);

  return (
    <PageLayout
      title={content.pageTitle}
      description={content.metaDescription}
    >
      <PageHero
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        backgroundImage={content.heroImage}
      />

      {/* Intro */}
      <Section>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="h-8 w-8 text-primary" />
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            {content.intro.title}
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            {content.intro.text}
          </p>
        </div>
      </Section>

      {/* Services grid */}
      <Section
        warm
        title={content.services.title}
        subtitle={content.services.subtitle}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.services.items.filter((service) => service.visible !== false).map((service) => (
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
                {content.schedule.title}
              </h3>
              <p className="text-text-secondary mb-4">
                {content.schedule.text}
              </p>
              <Link
                to={content.schedule.link}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition-colors"
              >
                <Clock className="w-4 h-4" />
                {content.schedule.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* Safety rules */}
      <Section warm title={content.safety.title} subtitle={content.safety.subtitle}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {content.safety.rules.map((rule) => (
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
            to={content.safety.link}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {content.safety.linkText} <ChevronRight className="w-4 h-4" />
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
            {content.cta.title}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            {content.cta.text}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TicketButton onClick={openBooking}>{content.cta.primaryButton}</TicketButton>
            <Link
              to={content.cta.secondaryLink}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
            >
              {content.cta.secondaryButton}
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/50">
            {content.cta.phoneLabel}{' '}
            {ctaPhoneHref ? (
              <a href={ctaPhoneHref} className="text-primary hover:underline">
                {content.cta.phone}
              </a>
            ) : (
              <span className="text-primary">{content.cta.phone}</span>
            )}
          </p>
        </Container>
      </section>
    </PageLayout>
  );
}

