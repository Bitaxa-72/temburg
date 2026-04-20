import { useState } from 'react';
import {
  Heart, Users, Briefcase, GraduationCap, PartyPopper,
  Mail, Send,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const stats = [
  { value: '12', label: 'видов парных' },
  { value: '50+', label: 'сотрудников' },
  { value: '2', label: 'года на рынке' },
  { value: '4.8', label: 'рейтинг' },
];

const benefits = [
  { icon: GraduationCap, title: 'Обучение', text: 'Плавная адаптация по работе комплекса с наставником' },
  { icon: Briefcase, title: 'Карьерный рост', text: 'Прозрачная система грейдов и возможности для роста' },
  { icon: Users, title: 'Дружный коллектив', text: 'Команда единомышленников с общими ценностями' },
  { icon: PartyPopper, title: 'Корпоративы', text: 'Праздники, тимбилдинги и совместный отдых' },
];

const API_URL = import.meta.env.VITE_WP_API_URL || '';

export default function CareersPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «careers» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('careers');

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
      const res = await fetch(`${API_URL}/wp-json/termburg/v1/career-apply`, {
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
    <PageLayout title="Работа в Термбурге" description="Присоединяйтесь к команде термального комплекса Термбург.">
      <PageHero
        title="Работа в Термбурге"
        subtitle="Присоединяйтесь к нашей команде"
        backgroundImage="/images/heroes/careers.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Статистика */}
      <section className="relative bg-dark-surface py-10">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <span className="block font-heading text-4xl font-bold text-primary md:text-5xl">{s.value}</span>
                <span className="mt-1 block text-sm text-white/60">{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Преимущества работы */}
      <Section title="Преимущества работы у нас">
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl bg-surface border border-border/50 p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <b.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1">{b.title}</h3>
              <p className="text-sm text-text-secondary">{b.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Форма заявки */}
      <Section title="Оставить заявку" warm>
        <div className="mx-auto max-w-lg">
          {submitted ? (
            <div className="rounded-2xl bg-surface border border-primary/30 p-8 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Заявка отправлена!</h3>
              <p className="text-text-secondary text-sm">Мы свяжемся с вами.</p>
              <button type="button" onClick={() => setSubmitted(false)} className="mt-4 text-sm text-primary font-medium hover:text-primary-light transition-colors">
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-surface border border-border/50 p-6 space-y-4">
              <h3 className="text-lg font-bold text-text-primary">Хотите работать у нас?</h3>
              <p className="text-sm text-text-secondary">Заполните форму, и мы свяжемся с вами.</p>

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

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Напишите нам напрямую
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Отправьте резюме на почту — мы рассмотрим вашу кандидатуру.
          </p>
          <a
            href="mailto:info@termburg.ru"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-light transition-colors"
          >
            <Mail className="w-5 h-5" />
            info@termburg.ru
          </a>
        </Container>
      </section>
    </PageLayout>
  );
}
