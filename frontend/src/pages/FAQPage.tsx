import { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle, Loader2, Clock, CreditCard, Users, Sparkles, MapPin, ShieldCheck } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { useFAQ, useSettings } from '@/hooks/useWordPressData';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const SITE_URL = 'https://termburg.ceosivaev.ru';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

// Comprehensive fallback FAQ data
const fallbackFaqData: FAQItem[] = [
  // Первое посещение
  {
    question: 'Что взять с собой?',
    answer: 'Купальник или плавки, резиновые тапочки, полотенце (можно арендовать у нас). Для парных пригодится банная шапочка. Всё необходимое также можно купить на ресепшен.',
    category: 'Первое посещение',
  },
  {
    question: 'Я первый раз в бане. С чего начать?',
    answer: 'Начните с тёплого душа, затем посетите травяную парную или хаммам — они самые мягкие. Проведите там 5-7 минут, затем охладитесь в бассейне. Отдохните 10-15 минут и повторите цикл. Администраторы на ресепшене всё расскажут и покажут видеоролики на телевизоре.',
    category: 'Первое посещение',
  },
  {
    question: 'Есть ли возрастные ограничения?',
    answer: 'Дети до 6 лет включительно — 470 ₽ безлимит. Детям до 14 лет вход только в сопровождении взрослых. В жаркие парные (выше 70°C) детям до 7 лет вход не рекомендуется.',
    category: 'Первое посещение',
  },
  // Время и билеты
  {
    question: 'Сколько стоит посещение?',
    answer: 'Будни: взрослый — от 1 500 ₽, детский (3-14 лет) — от 750 ₽. Выходные: взрослый — от 1 800 ₽, детский — от 900 ₽. Утренние и вечерние тарифы со скидкой. Подробности на странице цен.',
    category: 'Билеты и оплата',
  },
  {
    question: 'На сколько времени рассчитан билет?',
    answer: 'Стандартный билет — 3 часа. Безлимитный билет — весь день до закрытия. Можно продлить пребывание на ресепшен.',
    category: 'Билеты и оплата',
  },
  {
    question: 'Какие способы оплаты принимаете?',
    answer: 'Наличные, банковские карты, СБП (оплата по QR-коду), Apple Pay и Google Pay. Также принимаем подарочные сертификаты Термбурга.',
    category: 'Билеты и оплата',
  },
  // Услуги
  {
    question: 'Что входит в стоимость билета?',
    answer: 'Все парные и сауны, бассейны, джакузи и купели, зоны отдыха, шезлонги, групповые парения по расписанию. Дополнительно оплачиваются: SPA-процедуры, индивидуальное парение, аренда полотенец, кафе.',
    category: 'Услуги',
  },
  {
    question: 'Можно ли заказать индивидуальное парение?',
    answer: 'Да! Наши профессиональные банщики проведут для вас индивидуальное парение с вениками. Длительность 30-60 минут. Записывайтесь заранее на ресепшен или через сайт.',
    category: 'Услуги',
  },
  {
    question: 'Есть ли у вас кафе?',
    answer: 'Да, в комплексе работает кафе с горячими блюдами, закусками, напитками и десертами. Травяные чаи, квас, морсы — идеально для восстановления между парениями!',
    category: 'Услуги',
  },
  // Правила
  {
    question: 'Можно ли с собой еду и напитки?',
    answer: 'Проносить свою еду и напитки не разрешается. В комплексе есть кафе и автоматы с водой. Питьевая вода в зонах отдыха — бесплатно.',
    category: 'Правила',
  },
  {
    question: 'Есть ли противопоказания для посещения?',
    answer: 'Посещение парных не рекомендуется при: острых воспалениях, высоком давлении, беременности (без консультации врача), онкологии, эпилепсии, после недавних операций. При сомнениях проконсультируйтесь с врачом.',
    category: 'Правила',
  },
  {
    question: 'Можно ли фотографировать?',
    answer: 'Съёмка в общих зонах запрещена из уважения к приватности гостей. Сделать фото можно в специально отведённых местах или в арендованных приватных зонах.',
    category: 'Правила',
  },
  // Как добраться
  {
    question: 'Где вы находитесь?',
    answer: 'Мы находимся по адресу: Москва, ул. Гурьянова, д. 30, 2 этаж. Это рядом с метро «Печатники» (10 минут пешком) и «Кожуховская» (15 минут).',
    category: 'Как добраться',
  },
  {
    question: 'Есть ли парковка?',
    answer: 'Да, у нас есть бесплатная парковка для гостей. Въезд со стороны ул. Гурьянова.',
    category: 'Как добраться',
  },
];

const categoryIcons: Record<string, typeof HelpCircle> = {
  'Первое посещение': Sparkles,
  'Билеты и оплата': CreditCard,
  'Услуги': Users,
  'Правила': ShieldCheck,
  'Как добраться': MapPin,
  'Посещение': Clock,
};

const quickCardIcons: Record<string, typeof Clock> = {
  clock: Clock,
  ticket: CreditCard,
  users: Users,
  map: MapPin,
};

const fallbackQuickCards = [
  { icon: 'clock', title: 'Время работы', text: 'Ежедневно 9:00 — 23:00' },
  { icon: 'ticket', title: 'Билеты', text: 'от 540 ₽ / 1 час' },
  { icon: 'users', title: 'Дети', text: 'до 1 года бесплатно' },
  { icon: 'map', title: 'Адрес', text: 'м. Печатники, 10 мин' },
];

interface AccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className={`rounded-2xl border bg-surface overflow-hidden transition-all duration-300 ${isOpen ? 'border-primary/30 shadow-lg shadow-primary/5' : 'border-border/50 hover:border-primary/20'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-text-primary text-base pr-4">
          {item.question}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-primary/10 text-primary'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 pt-0 border-t border-border/30">
          <p className="text-text-secondary leading-relaxed pt-4">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «faq» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('faq');

  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const { openBooking } = useBooking();

  // Fetch FAQ from WordPress API
  const { data: faqResponse, loading } = useFAQ();
  const { data: settings } = useSettings();
  const pageTitle = faqResponse.title || 'Вопросы и ответы';
  const pageDescription = faqResponse.description || 'Всё, что нужно знать перед посещением Термбурга';
  const quickCards = faqResponse.quickCards?.length ? faqResponse.quickCards : fallbackQuickCards;

  const handleToggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  // Use API data or fallback
  const faqData = faqResponse.allItems.length > 0
    ? faqResponse.allItems
    : fallbackFaqData;

  // Group by category
  const groupedFaq = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {};
    faqData.forEach((item) => {
      const cat = item.category || 'Общие вопросы';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [faqData]);

  const categories = Object.keys(groupedFaq);

  // Generate FAQPage schema for SEO
  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }), [faqData]);

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: `${SITE_URL}/faq`,
      },
    ],
  };

  return (
    <PageLayout
      title="Часто задаваемые вопросы"
      description="Ответы на популярные вопросы о посещении Термбурга: правила, тарифы, услуги и многое другое."
      schema={[faqSchema, breadcrumbSchema]}
    >
      <PageHero
        title={pageTitle}
        subtitle={pageDescription}
        backgroundImage="/images/heroes/faq.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Quick Info Cards */}
      <Section warm>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickCards.map((card) => {
            const Icon = quickCardIcons[card.icon] || Clock;
            return (
              <div key={`${card.icon}-${card.title}`} className="rounded-2xl bg-surface border border-border/50 p-5 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-text-primary mb-1">{card.title}</h3>
                <p className="text-sm text-text-secondary">{card.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FAQ by Categories */}
      <Section>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {categories.map((category) => {
              const Icon = categoryIcons[category] || HelpCircle;
              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">{category}</h2>
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    {groupedFaq[category].map((item, index) => (
                      <AccordionItem
                        key={`${category}-${index}`}
                        item={item}
                        isOpen={openIndex === `${category}-${index}`}
                        onToggle={() => handleToggle(`${category}-${index}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-12 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="mb-3 font-heading text-2xl font-bold text-white md:text-3xl">
            Не нашли ответ?
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-white/70">
            Приходите — администраторы подробно расскажут о комплексе.
          </p>
          <TicketButton onClick={openBooking}>Купить билет</TicketButton>
        </Container>
      </section>
    </PageLayout>
  );
}
