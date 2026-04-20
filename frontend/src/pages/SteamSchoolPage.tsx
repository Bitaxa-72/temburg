import { useState, useMemo } from 'react';
import { Flame, GraduationCap, Clock, CheckCircle, ChevronRight, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import Container from '@/components/ui/Container';
import TicketButton from '@/components/ui/TicketButton';
import { useBooking } from '@/context/BookingContext';
import { steamSchool, type SchoolProgram } from '@/data/services';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const SITE_URL = 'https://termburg.ceosivaev.ru';

const advantages = [
  'Техники коллективных арома-программ',
  'Индивидуальные парения',
  'Секреты создания идеальной атмосферы в бане',
  'Техника работы с веером (опахалом)',
  'Арома- и галлотерапия в бане',
  'Сертификат по окончании курса',
];

function ProgramCard({ program, onSelect }: { program: SchoolProgram; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-2xl bg-surface border border-border/50 overflow-hidden text-left hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col"
    >
      <div className="h-44 overflow-hidden relative">
        <img src={program.image} alt={program.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{program.name}</h3>
        <p className="text-sm text-text-secondary flex-1 mb-4">{program.description}</p>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            {program.duration}
          </span>
          <span className="text-lg font-bold text-primary">
            {program.price.toLocaleString('ru-RU')}&nbsp;&#8381;
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Подробнее <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

function ProgramModal({ program, onClose, onBook }: { program: SchoolProgram; onClose: () => void; onBook: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img src={program.image} alt={program.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors" aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="font-heading text-xl font-bold text-white">{program.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-white/20 text-white backdrop-blur-sm text-xs">
                <Clock className="w-3 h-3 mr-1" />{program.duration}
              </Badge>
              <span className="text-lg font-bold text-white">{program.price.toLocaleString('ru-RU')}&nbsp;&#8381;</span>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-text-primary leading-relaxed">{program.fullDescription}</p>
          <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Что входит</h3>
            <ul className="space-y-2">
              {program.includes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={onBook} className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white hover:bg-primary-light transition-colors">
            Записаться на курс
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SteamSchoolPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «steam-school» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('steam-school');

  const { openBooking } = useBooking();
  const [selected, setSelected] = useState<SchoolProgram | null>(null);

  // Course schema for SEO
  const courseSchema = useMemo(() => steamSchool.map((program) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.name,
    description: program.description,
    provider: {
      '@type': 'Organization',
      name: 'Термбург',
      sameAs: SITE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: program.price,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'onsite',
      location: {
        '@type': 'Place',
        name: 'Термбург',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'ул. Гурьянова, д. 30',
          addressLocality: 'Москва',
          addressCountry: 'RU',
        },
      },
    },
  })), []);

  return (
    <PageLayout
      title="Школа парения"
      description="Обучение искусству парения у мастеров Термбурга. Техники арома-программ, работа с веером, индивидуальные парения. Сертификат по окончании."
      schema={courseSchema}
    >
      <PageHero
        title="Школа парения"
        subtitle="Научитесь искусству парения у профессиональных банщиков"
        backgroundImage="/images/heroes/steam-school.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Intro */}
      <Section>
        <div className="mx-auto max-w-4xl flex flex-col-reverse md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-text-primary">Искусство парения</h2>
            </div>
            <p className="text-lg leading-relaxed text-text-secondary">
              Вы обожаете баню и мечтаете освоить искусство парения? Хотите стать настоящим мастером банного дела
              или просто улучшить свои навыки для личного удовольствия? Тогда школа домашнего банщика в Термбург для вас!
            </p>
            <p className="text-lg leading-relaxed text-text-secondary">
              Учитесь у лучших специалистов и получите ценные знания и навыки, которые сможете применять в кругу друзей и близких!
              Подарок для лучших выпускников: по завершении курса — практика в нашем комплексе!
            </p>
          </div>
          <img src="/images/services/steam-author-new.webp" alt="Мастер парения" className="w-full md:w-72 h-48 md:h-56 rounded-2xl object-cover flex-shrink-0" />
        </div>
      </Section>

      {/* Advantages */}
      <Section title="Чему вы научитесь" warm>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((text) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-surface p-4 border border-border/50">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-success" />
              <span className="text-text-primary font-medium text-sm">{text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Programs */}
      <Section title="Программы" subtitle="Нажмите на карточку, чтобы узнать подробности">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steamSchool.map((program) => (
            <ProgramCard key={program.id} program={program} onSelect={() => setSelected(program)} />
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <GraduationCap className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">Запишитесь на курс</h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">Откройте для себя настоящее искусство парения вместе с мастерами Термбурга.</p>
          <TicketButton onClick={openBooking}>Записаться</TicketButton>
          <p className="mt-4 text-sm text-white/50">
            Или позвоните: <a href="tel:+79091674746" className="text-primary hover:underline">+7 (909) 167-47-46</a>
          </p>
        </Container>
      </section>

      {selected && (
        <ProgramModal program={selected} onClose={() => setSelected(null)} onBook={() => { setSelected(null); openBooking(); }} />
      )}
    </PageLayout>
  );
}
