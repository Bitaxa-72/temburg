import { useState } from 'react';
import {
  Heart, Users, Briefcase, GraduationCap, PartyPopper,
  Mail, Send, CheckCircle2, Clock3, Banknote,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import LegalConsents from '@/components/shared/LegalConsents';
import type { WPCareerVacancy, WPCareersBenefit } from '@/api/wordpress';

const fallbackStats = [
  { value: '12', label: 'видов парных' },
  { value: '50+', label: 'сотрудников' },
  { value: '2', label: 'года на рынке' },
  { value: '4.8', label: 'рейтинг' },
];

const fallbackBenefits = [
  { icon: 'graduation', title: 'Обучение', text: 'Плавная адаптация по работе комплекса с наставником' },
  { icon: 'briefcase', title: 'Карьерный рост', text: 'Прозрачная система грейдов и возможности для роста' },
  { icon: 'users', title: 'Дружный коллектив', text: 'Команда единомышленников с общими ценностями' },
  { icon: 'party', title: 'Корпоративы', text: 'Праздники, тимбилдинги и совместный отдых' },
];

const benefitIcons: Record<string, typeof GraduationCap> = {
  graduation: GraduationCap,
  briefcase: Briefcase,
  users: Users,
  party: PartyPopper,
};

const API_BASE = import.meta.env.VITE_API_URL || '/wp-json/termburg/v1';

function VacancyCard({ vacancy }: { vacancy: WPCareerVacancy }) {
  const details = [
    vacancy.schedule && { icon: Clock3, label: 'График', value: vacancy.schedule },
    vacancy.salary && { icon: Banknote, label: 'Доход', value: vacancy.salary },
    vacancy.employment && { icon: CheckCircle2, label: 'Условия', value: vacancy.employment },
  ].filter(Boolean) as Array<{ icon: typeof Clock3; label: string; value: string }>;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border/50 bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium uppercase tracking-wide text-primary">
              Вакансия
            </p>
            <h3 className="font-heading text-2xl font-bold text-text-primary">
              {vacancy.title}
            </h3>
          </div>
        </div>
        <a
          href="#careers-apply"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
        >
          {vacancy.buttonLabel || 'Откликнуться'}
        </a>
      </div>

      {details.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {details.map((detail) => {
            const Icon = detail.icon;

            return (
              <div key={detail.label} className="rounded-xl bg-background p-4">
                <Icon className="mb-2 h-5 w-5 text-primary" />
                <p className="text-xs uppercase tracking-wide text-text-secondary">
                  {detail.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {detail.value}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-5">
        {!!vacancy.tasks?.length && (
          <div>
            <h4 className="mb-3 text-base font-bold text-text-primary">
              {vacancy.tasksTitle || 'Задачи:'}
            </h4>
            <ul className="space-y-2.5">
              {vacancy.tasks.map((task) => (
                <li key={task} className="flex gap-3 text-sm leading-relaxed text-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!!vacancy.perks?.length && (
          <div className="flex flex-wrap gap-2 border-t border-border/50 pt-5">
            {vacancy.perks.map((perk) => (
              <span
                key={perk}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                {perk}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function CareersPage() {
  const { data: pageContent } = usePageContent('careers');
  const careers = pageContent?.careers;
  const stats = careers?.stats?.length ? careers.stats : fallbackStats;
  const benefits = careers?.benefits?.length ? careers.benefits : fallbackBenefits;
  const vacancies = careers?.vacancies || [];
  const hasVacancies = vacancies.length > 0;
  const directEmail = careers?.directEmail || 'info@termburg.ru';

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/career-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, about }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка отправки');
      }

      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setAbout('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={careers?.pageTitle || pageContent?.title || 'Работа в Термбурге'}
      description={pageContent?.metaDescription || 'Присоединяйтесь к команде термального комплекса Термбург.'}
    >
      <PageHero
        title={careers?.heroTitle || 'Работа в Термбурге'}
        subtitle={careers?.heroSubtitle || 'Присоединяйтесь к нашей команде'}
        backgroundImage="/images/heroes/careers.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      <section className="relative bg-dark-surface py-10">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={`${s.value}-${s.label}`} className="text-center">
                <span className="block font-heading text-4xl font-bold text-primary md:text-5xl">{s.value}</span>
                <span className="mt-1 block text-sm text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <Section title="Преимущества работы у нас">
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {benefits.map((benefit: WPCareersBenefit) => {
            const Icon = benefitIcons[benefit.icon || 'briefcase'] || Briefcase;

            return (
              <div
                key={benefit.title}
                className="group rounded-2xl bg-surface border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1">{benefit.title}</h3>
                <p className="text-sm text-text-secondary">{benefit.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {hasVacancies && (
        <Section
          title={careers?.vacanciesTitle || 'Наши вакансии'}
          subtitle={careers?.vacanciesSubtitle || 'Открытые позиции в команде Термбурга'}
          warm
        >
          <div className={vacancies.length === 1 ? 'mx-auto max-w-3xl' : 'grid gap-6 xl:grid-cols-2'}>
            {vacancies.map((vacancy) => (
              <VacancyCard key={vacancy.title} vacancy={vacancy} />
            ))}
          </div>
        </Section>
      )}

      <Section id="careers-apply" title={careers?.applyTitle || 'Оставить заявку'} warm>
        <div className="mx-auto max-w-lg">
          {submitted ? (
            <div className="rounded-2xl bg-surface border border-primary/30 p-8 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold text-text-primary mb-2">
                {careers?.successTitle || 'Заявка отправлена!'}
              </h3>
              <p className="text-text-secondary text-sm">
                {careers?.successText || 'Мы свяжемся с вами.'}
              </p>
              <button type="button" onClick={() => setSubmitted(false)} className="mt-4 text-sm text-primary font-medium hover:text-primary-light transition-colors">
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-surface border border-border/50 p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">
                {careers?.formTitle || 'Хотите работать у нас?'}
              </h3>
              <p className="text-sm text-text-secondary">
                {careers?.formText || 'Заполните форму, и мы свяжемся с вами.'}
              </p>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Имя *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Телефон *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivan@email.ru"
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">О себе</label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Кратко о вашем опыте, желаемой должности..."
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>

              <LegalConsents />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white hover:bg-primary-light transition-colors disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Отправка...' : 'Отправить заявку'}
              </button>
            </form>
          )}
        </div>
      </Section>

      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            {careers?.directTitle || 'Напишите нам напрямую'}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            {careers?.directText || 'Отправьте резюме на почту — мы рассмотрим вашу кандидатуру.'}
          </p>
          <a
            href={`mailto:${directEmail}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-light transition-colors"
          >
            <Mail className="w-5 h-5" />
            {directEmail}
          </a>
        </Container>
      </section>
    </PageLayout>
  );
}
