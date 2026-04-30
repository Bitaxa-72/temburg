import { useState, useMemo } from 'react';
import { Waves, Clock, CheckCircle, ChevronRight, X } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import { useBooking } from '@/context/BookingContext';
import { swimmingSchool, type SchoolProgram } from '@/data/services';
import { usePageContent, useSchoolsContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const SITE_URL = 'https://termburg.ceosivaev.ru';

const advantages = [
  'Тёплый термальный бассейн круглый год',
  'Мини-группы 4–6 человек — индивидуальный подход',
  'Сертифицированные тренеры с опытом от 5 лет',
  'Занятия для детей от 6 до 12 лет',
  'Расписание: пятница 16:00, воскресенье 10:00',
  'Абонемент на месяц — 8 занятий по 45 минут',
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
            {program.price === 0 ? 'Бесплатно' : `${program.price.toLocaleString('ru-RU')}\u00A0₽`}
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
              <span className="text-lg font-bold text-white">{program.price === 0 ? 'Бесплатно' : `${program.price.toLocaleString('ru-RU')}\u00A0₽`}</span>
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
            Записаться на занятие
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwimmingSchoolPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «swimming-school» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('swimming-school');
  const { data: schoolsContent } = useSchoolsContent();
  const schoolContent = schoolsContent.swimming;
  const programs = useMemo<SchoolProgram[]>(() => {
    if (!schoolContent.programs?.length) return swimmingSchool;

    return schoolContent.programs.map((program, index) => {
      const fallback = swimmingSchool[index];

      return {
        ...program,
        image: program.image || fallback?.image || '/images/swimming-school.jpg',
        fullDescription: program.fullDescription || program.description || fallback?.fullDescription || '',
        includes: program.includes?.length ? program.includes : fallback?.includes || [],
      };
    });
  }, [schoolContent.programs]);
  const schoolAdvantages = schoolContent.advantages?.length ? schoolContent.advantages : advantages;
  const introParagraphs = schoolContent.introText
    ? schoolContent.introText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
    : null;

  const { openBooking, openSwimmingEnrollment } = useBooking();
  const [selected, setSelected] = useState<SchoolProgram | null>(null);

  // Course schema for SEO
  const courseSchema = useMemo(() => programs.filter(p => p.price > 0).map((program) => ({
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
  })), [programs]);

  return (
    <PageLayout
      title="Школа плавания"
      description="Обучение плаванию для детей и взрослых в термальном бассейне Термбурга. Группы 4-6 человек, сертифицированные тренеры. Пятница 16:00, воскресенье 10:00."
      schema={courseSchema}
    >
      <PageHero
        title={schoolContent.heroTitle || 'Школа плавания'}
        subtitle={schoolContent.heroSubtitle || 'Обучение плаванию для детей и взрослых в тёплом термальном бассейне'}
        backgroundImage="/images/heroes/swimming-school.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Intro */}
      <Section>
        <div className="mx-auto max-w-4xl flex flex-col-reverse md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Waves className="h-6 w-6 text-info" />
              <h2 className="text-2xl font-bold text-text-primary">{schoolContent.introTitle || 'Плавание в Термбурге'}</h2>
            </div>
            {introParagraphs ? introParagraphs.map((text) => (
              <p key={text} className="text-lg leading-relaxed text-text-secondary">{text}</p>
            )) : (
              <>
                <p className="text-lg leading-relaxed text-text-secondary">
                  Термбург приглашает детей в возрасте от 6 до 12 лет на занятия в Школу Плавания.
                  Мини-группы из 4–6 человек обеспечивают индивидуальный подход к каждому ребёнку.
                </p>
                <p className="text-lg leading-relaxed text-text-secondary">
                  Расписание: пятница — 16:00, воскресенье — 10:00. Стоимость абонемента на месяц — 8000 рублей за 8 занятий по 45 минут.
                  Формирование групп осуществляется исходя из уровня навыков детей.
                </p>
              </>
            )}
          </div>
          <img src={schoolContent.introImage || '/images/swimming-school.jpg'} alt="Школа плавания Термбурга" className="w-full md:w-72 h-48 md:h-56 rounded-2xl object-cover flex-shrink-0" />
        </div>
      </Section>

      {/* Advantages */}
      <Section title="Преимущества" warm>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schoolAdvantages.map((text) => (
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
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} onSelect={() => setSelected(program)} />
          ))}
        </div>
      </Section>

      {/* Pricing */}
      <Section warm title="Абонементы и услуги" subtitle="Выберите подходящий вариант">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="rounded-2xl bg-surface border border-border/50 p-5 flex flex-col hover:border-primary/30 hover:shadow-lg transition-all"
            >
              {program.badge && (
                <Badge variant={program.badge === 'Бесплатно' ? 'success' : program.badge === 'Выгодно' ? 'gold' : 'default'} className="self-start mb-3">
                  {program.badge}
                </Badge>
              )}
              <h3 className="font-heading text-lg font-bold text-text-primary mb-1">{program.name}</h3>
              <p className="text-sm text-text-secondary mb-2">{program.duration}</p>
              <p className="text-xs text-text-secondary/70 mb-4 flex-1">{program.description}</p>
              <div className="flex items-end justify-between">
                <div>
                  {program.price > 0 ? (
                    <span className="text-2xl font-bold text-primary">{program.price.toLocaleString('ru-RU')} ₽</span>
                  ) : (
                    <span className="text-2xl font-bold text-success">Бесплатно</span>
                  )}
                </div>
                <button
                  onClick={() => program.price > 0 ? openSwimmingEnrollment({ programName: program.name, price: program.price }) : openBooking()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  {program.price > 0 ? 'Записаться' : 'Записаться'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Или позвоните: <a href="tel:+79091674746" className="text-primary hover:underline">+7 (909) 167-47-46</a>
        </p>
      </Section>

      {selected && (
        <ProgramModal program={selected} onClose={() => setSelected(null)} onBook={() => {
          setSelected(null);
          if (selected.price > 0) {
            openSwimmingEnrollment({ programName: selected.name, price: selected.price });
          } else {
            openBooking();
          }
        }} />
      )}
    </PageLayout>
  );
}
