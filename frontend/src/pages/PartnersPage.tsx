import { useState } from 'react';
import { Building2, Megaphone, Camera, PackageOpen, Handshake, Mail, Phone, Send } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const advantages = [
  {
    num: '01',
    title: 'Уникальная локация',
    text: 'Термальный комплекс с 12 видами парных, бассейном и атмосферой средневекового города — идеальная площадка для незабываемых мероприятий.',
  },
  {
    num: '02',
    title: 'Гибкие условия',
    text: 'Индивидуальный подход к каждому партнёру. Готовы обсудить любой формат сотрудничества — от разовых акций до долгосрочных программ.',
  },
  {
    num: '03',
    title: 'Широкая аудитория',
    text: 'Более 50 000 посетителей в год. Активное присутствие в социальных сетях и лояльная база постоянных гостей.',
  },
];

const directions = [
  {
    icon: Building2,
    title: 'Корпоративные мероприятия',
    description: 'Организация корпоративных выездов, тимбилдингов и праздников. Индивидуальные программы парения, банкетное меню, аренда зон.',
  },
  {
    icon: Megaphone,
    title: 'Партнёрские программы',
    description: 'Кросс-маркетинг, совместные акции с фитнес-клубами, отелями, ресторанами и wellness-брендами. Взаимное продвижение.',
  },
  {
    icon: Camera,
    title: 'Аренда пространств',
    description: 'Уникальные интерьеры для фотосъёмок, мастер-классов, презентаций и частных мероприятий. Полное сопровождение.',
  },
  {
    icon: PackageOpen,
    title: 'Поставщикам',
    description: 'Сотрудничество с поставщиками банных аксессуаров, косметических средств, продуктов питания и напитков премиального качества.',
  },
];

export default function PartnersPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «partners» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('partners');

  const [form, setForm] = useState({ company: '', name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout title="Сотрудничество" description="Партнёрские программы и сотрудничество с термальным комплексом Термбург.">
      <PageHero
        title="Сотрудничество"
        subtitle="Развиваем партнёрские отношения и создаём совместные проекты"
        backgroundImage="/images/heroes/corporate.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Почему мы */}
      <Section title="Почему выбирают Термбург" subtitle="Три причины стать нашим партнёром">
        <div className="grid gap-8 md:grid-cols-3">
          {advantages.map((a) => (
            <div key={a.num} className="relative rounded-2xl bg-surface border border-border/50 p-8 hover:border-primary/30 transition-all duration-300">
              <span className="block font-heading text-5xl font-bold bg-gradient-to-b from-primary to-primary/20 bg-clip-text text-transparent mb-4">
                {a.num}
              </span>
              <h3 className="text-lg font-bold text-text-primary mb-2">{a.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Направления сотрудничества */}
      <Section title="Направления сотрудничества" warm>
        <div className="grid gap-6 sm:grid-cols-2">
          {directions.map((dir) => (
            <div
              key={dir.title}
              className="group rounded-2xl bg-surface border border-border/50 p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors duration-300">
                <dir.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{dir.title}</h3>
              <p className="text-sm leading-relaxed text-text-secondary">{dir.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Форма обратной связи */}
      <Section title="Оставить заявку" subtitle="Заполните форму — мы свяжемся с вами в течение 3 рабочих дней">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="rounded-2xl bg-surface border border-primary/30 p-10 text-center">
              <Handshake className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold text-text-primary mb-2">Заявка отправлена!</h3>
              <p className="text-text-secondary">Мы свяжемся с вами в ближайшее время.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl bg-surface border border-border/50 p-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Компания</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="ООО «Название»"
                    className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Ваше имя</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Иван Иванов"
                    className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ivan@company.ru"
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Сообщение</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Расскажите о вашем предложении..."
                  className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-light transition-colors"
              >
                <Send className="w-4 h-4" />
                Отправить заявку
              </button>
            </form>
          )}
        </div>
      </Section>

      {/* CTA */}
      <section className="relative bg-dark-surface ornament-pattern py-16 text-center">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <Handshake className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
            Предпочитаете связаться напрямую?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Пишите или звоните — мы всегда открыты для диалога.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:info@termburg.ru" className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors">
              <Mail className="w-5 h-5" />
              info@termburg.ru
            </a>
            <a href="tel:+79091674746" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <Phone className="w-5 h-5" />
              +7 (909) 167-47-46
            </a>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
