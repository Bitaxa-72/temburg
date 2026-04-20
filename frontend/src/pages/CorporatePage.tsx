import {
  Building2,
  Users,
  Briefcase,
  Sparkles,
  CheckCircle,
  Gift,
  Calendar,
  Bus,
  Coffee,
  Crown,
  TrendingUp,
  Award,
  Target,
  Heart,
  Shield,
  ChevronRight,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import TicketButton from '@/components/ui/TicketButton';
import Badge from '@/components/ui/Badge';
import { useBooking } from '@/context/BookingContext';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

interface CorporatePackage {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  participants: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

const packages: CorporatePackage[] = [
  {
    id: 'team-building',
    name: 'Тимбилдинг',
    description: 'Идеальный формат для сплочения команды. Посещение термального комплекса с активностями и развлечениями.',
    price: 'от 50 000 ₽',
    duration: '4 часа',
    participants: 'до 20 человек',
    features: [
      'Аренда приватной зоны',
      'Групповые парения',
      'Тимбилдинг-активности',
      'Трансфер от офиса',
      'Лёгкий фуршет',
    ],
    badge: 'Популярно',
    popular: true,
  },
  {
    id: 'corporate-event',
    name: 'Корпоратив',
    description: 'Организация полноценного корпоративного мероприятия с банкетом, развлечениями и персональным обслуживанием.',
    price: 'от 100 000 ₽',
    duration: '6 часов',
    participants: 'до 40 человек',
    features: [
      'Эксклюзивная аренда комплекса',
      'Банкет от шеф-повара',
      'Живая музыка или диджей',
      'Профессиональная анимация',
      'Декор и оформление',
      'Трансфер для гостей',
    ],
  },
  {
    id: 'wellness-program',
    name: 'Wellness-программа',
    description: 'Регулярные посещения для заботы о здоровье сотрудников. Абонементы со скидкой для команд.',
    price: 'от 30 000 ₽',
    duration: 'абонемент',
    participants: '10+ человек',
    features: [
      'Корпоративные абонементы',
      'Скидка до 20%',
      'Гибкий график посещений',
      'Отчётность для HR',
      'Персональный менеджер',
    ],
    badge: 'Выгодно',
  },
  {
    id: 'vip-event',
    name: 'VIP-мероприятие',
    description: 'Эксклюзивное мероприятие высшего класса для партнёров, клиентов или топ-менеджмента.',
    price: 'от 150 000 ₽',
    duration: 'полный день',
    participants: 'до 30 человек',
    features: [
      'Приватность и конфиденциальность',
      'Премиум-кейтеринг',
      'Авторские SPA-программы',
      'Персональные банщики',
      'Кальяны премиум-класса',
      'Встреча на лимузине',
    ],
  },
];

const benefits = [
  {
    icon: Users,
    title: 'Сплочение команды',
    description: 'Неформальная атмосфера помогает укрепить доверие и командный дух между сотрудниками.',
  },
  {
    icon: Heart,
    title: 'Забота о здоровье',
    description: 'Термальные процедуры снимают стресс, восстанавливают силы и улучшают самочувствие.',
  },
  {
    icon: TrendingUp,
    title: 'Повышение продуктивности',
    description: 'Отдохнувшие и мотивированные сотрудники работают эффективнее и креативнее.',
  },
  {
    icon: Award,
    title: 'Признание и мотивация',
    description: 'Корпоративное мероприятие — отличный способ отметить успехи и поощрить команду.',
  },
  {
    icon: Shield,
    title: 'Укрепление лояльности',
    description: 'Инвестиции в благополучие сотрудников повышают их вовлечённость и лояльность к компании.',
  },
  {
    icon: Target,
    title: 'Деловые встречи',
    description: 'Комфортная обстановка располагает к продуктивным переговорам и неформальному общению.',
  },
];

const features = [
  {
    icon: Crown,
    title: 'Приватные зоны',
    description: 'Отдельные зоны для вашей команды с полной конфиденциальностью и комфортом.',
  },
  {
    icon: Coffee,
    title: 'Кейтеринг',
    description: 'Профессиональное питание от лёгких закусок до полноценного банкета.',
  },
  {
    icon: Bus,
    title: 'Трансфер',
    description: 'Организуем комфортную доставку гостей от офиса до комплекса и обратно.',
  },
  {
    icon: Briefcase,
    title: 'Персональный менеджер',
    description: 'Выделенный специалист для организации и координации всего мероприятия.',
  },
];

const clients = [
  'Сбербанк',
  'Яндекс',
  'МТС',
  'РЖД',
  'Газпром',
  'Росатом',
];

function PackageCard({ pkg }: { pkg: CorporatePackage }) {
  const { openBooking } = useBooking();

  return (
    <Card
      className={`p-0 overflow-hidden flex flex-col h-full ${pkg.popular ? 'border-2 border-primary shadow-lg shadow-primary/10' : ''}`}
    >
      {pkg.badge && (
        <div className="bg-primary px-4 py-2 text-center">
          <Badge variant="gold" className="text-xs font-semibold">
            {pkg.badge}
          </Badge>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-text-primary mb-2">{pkg.name}</h3>
        <p className="text-sm text-text-secondary mb-4 flex-1">{pkg.description}</p>

        <div className="space-y-2 mb-4 pb-4 border-b border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Цена:</span>
            <span className="font-bold text-primary text-lg">{pkg.price}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Длительность:</span>
            <span className="font-medium text-text-primary">{pkg.duration}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Участники:</span>
            <span className="font-medium text-text-primary">{pkg.participants}</span>
          </div>
        </div>

        <ul className="space-y-2 mb-5">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={openBooking}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-light transition-colors"
        >
          Оставить заявку
        </button>
      </div>
    </Card>
  );
}

export default function CorporatePage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «corporate» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('corporate');

  const { openBooking } = useBooking();

  return (
    <PageLayout
      title="Корпоративным клиентам"
      description="Организация корпоративных мероприятий, тимбилдингов и wellness-программ в термальном комплексе Термбург."
    >
      <PageHero
        title="Программы для компаний"
        subtitle="Корпоративные мероприятия, тимбилдинги и wellness-программы в атмосфере тепла и заботы"
        backgroundImage="/images/heroes/corporate.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Intro */}
      <Section>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Термбург для бизнеса
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed mb-6">
            Мы создаём уникальные корпоративные программы для компаний любого размера.
            От тимбилдинга для отдела до масштабного корпоратива на весь коллектив —
            организуем мероприятие под ключ с учётом всех ваших пожеланий.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Более 300 корпоративных мероприятий</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Индивидуальный подход</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>Гибкие условия оплаты</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Benefits */}
      <Section
        warm
        title="Почему выбирают нас"
        subtitle="Преимущества корпоративных мероприятий в Термбурге"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{benefit.title}</h3>
              <p className="text-sm text-text-secondary">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Packages */}
      <Section
        title="Корпоративные пакеты"
        subtitle="Выберите готовое решение или создадим программу под ваши задачи"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-sm text-text-secondary mb-4">
            Не нашли подходящий пакет? Мы создадим индивидуальное предложение специально для вас.
          </p>
          <button
            type="button"
            onClick={openBooking}
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Получить индивидуальное предложение <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </Section>

      {/* Features */}
      <Section warm title="Что мы предлагаем" subtitle="Полный спектр услуг для корпоративных клиентов">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Clients */}
      <Section title="Нам доверяют" subtitle="Среди наших клиентов">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {clients.map((client) => (
              <div
                key={client}
                className="flex items-center justify-center p-4 rounded-xl bg-surface border border-border/50 hover:border-primary/30 transition-colors"
              >
                <span className="text-sm font-semibold text-text-primary text-center">{client}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-text-secondary mt-6">
            И ещё более 200 компаний из различных отраслей
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section warm title="Как организовать мероприятие" subtitle="Всего 4 простых шага">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Заявка', text: 'Оставьте заявку на сайте или позвоните нам' },
              { step: '2', title: 'Обсуждение', text: 'Менеджер свяжется и обсудит детали' },
              { step: '3', title: 'Предложение', text: 'Подготовим коммерческое предложение' },
              { step: '4', title: 'Мероприятие', text: 'Организуем и проведём идеальный event' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">{item.step}</span>
                </div>
                <h4 className="font-bold text-text-primary mb-1">{item.title}</h4>
                <p className="text-sm text-text-secondary">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="h-8 w-8 text-primary" />
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Готовы организовать мероприятие?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Оставьте заявку, и наш менеджер свяжется с вами в течение 30 минут
            для обсуждения деталей и подготовки персонального предложения.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <TicketButton onClick={openBooking}>Оставить заявку</TicketButton>
            <a
              href="tel:+79091674746"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Позвонить сейчас
            </a>
          </div>
          <p className="mt-6 text-sm text-white/50">
            Менеджер по корпоративным клиентам:{' '}
            <a href="tel:+79091674746" className="text-primary hover:underline">
              +7 (909) 167-47-46
            </a>
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-white/40">
            <span>Работаем с НДС</span>
            <span>•</span>
            <span>Гибкие условия оплаты</span>
            <span>•</span>
            <span>Договор и закрывающие документы</span>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
