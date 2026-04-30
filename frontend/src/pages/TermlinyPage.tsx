import { useState, useRef } from 'react';
import { Flame, Droplets, Wind, Home, BookOpen, Heart, Sparkles, ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import { type Termlin } from '@/data/termliny';
import { usePageContent, useTermliny } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const elementIcons: Record<string, ReactNode> = {
  fire: <Flame className="w-6 h-6" />,
  herb: <Sparkles className="w-6 h-6" />,
  home: <Home className="w-6 h-6" />,
  wind: <Wind className="w-6 h-6" />,
  wisdom: <BookOpen className="w-6 h-6" />,
  love: <Heart className="w-6 h-6" />,
  water: <Droplets className="w-6 h-6" />,
};

const elementColors: Record<string, string> = {
  fire: 'text-accent bg-accent/20',
  herb: 'text-success bg-success/20',
  home: 'text-warm-gold bg-warm-gold/20',
  wind: 'text-info bg-info/20',
  wisdom: 'text-primary bg-primary/20',
  love: 'text-accent-light bg-accent/20',
  water: 'text-info bg-info/20',
};

const funnyPhrases = [
  'Эта кнопка не для барабанной дроби.',
  'Сюда тыкать бесполезно, магии не будет.',
  'Кнопка — не друг, она не прощает лишних тыков.',
  'Техника безопасности: сюда тыкать запрещено (особенно просто так).',
  'Кнопка — не кнопка "Баян", нажимать только по делу.',
  'Интерактивности не дождётесь.',
];

function TermlinCard({ termlin }: { termlin: Termlin }) {
  const [expanded, setExpanded] = useState(false);
  const [funnyMessage, setFunnyMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colors = elementColors[termlin.element] || 'text-primary bg-primary/20';

  const handleIconClick = () => {
    // Сброс предыдущего таймера при повторном клике
    if (timerRef.current) clearTimeout(timerRef.current);

    const randomPhrase = funnyPhrases[Math.floor(Math.random() * funnyPhrases.length)];
    setFunnyMessage(randomPhrase);

    timerRef.current = setTimeout(() => setFunnyMessage(null), 3000);
  };

  return (
    <Card dark className="overflow-hidden">
      {/* Character image */}
      <div className="relative bg-[#1a1a2e]">
        <img
          src={termlin.image}
          alt={termlin.name}
          className="w-full aspect-square object-contain mx-auto"
          loading="lazy"
        />
        <button
          onClick={handleIconClick}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform ${colors}`}
        >
          {elementIcons[termlin.element]}
        </button>
        {/* Funny message tooltip */}
        {funnyMessage && (
          <div className="absolute top-16 right-3 max-w-[200px] px-3 py-2 rounded-lg bg-black/90 text-white text-xs animate-fade-in shadow-lg">
            {funnyMessage}
          </div>
        )}
      </div>

      <div className="p-6 pt-3">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-heading text-xl font-bold text-white">
            {termlin.name}
          </h3>
          <p className="text-sm text-primary font-medium">{termlin.title}</p>
        </div>

        {/* Meaning */}
        <p className="text-sm text-white/50 mb-3 italic">
          Значение имени: «{termlin.nameMeaning}»
        </p>

        {/* Signs & Mission */}
        <p className="text-white text-sm mb-2">
          <span className="text-white/50">Приметы:</span> {termlin.signs}
        </p>
        <p className="text-white text-sm mb-3">
          <span className="text-white/50">Миссия:</span> {termlin.mission}
        </p>

        {/* Baths */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          {termlin.baths}
        </div>

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-sm text-white/50 hover:text-primary transition-colors mt-2"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Свернуть' : 'История, характер, приметы...'}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm">
            <div>
              <p className="text-white/50 mb-1 font-medium">История</p>
              <p className="text-white">{termlin.history}</p>
            </div>
            <div>
              <p className="text-white/50 mb-1 font-medium">Характер</p>
              <p className="text-white">{termlin.character}</p>
            </div>
            <div>
              <p className="text-white/50 mb-1 font-medium">Привычки</p>
              <p className="text-white">{termlin.habits}</p>
            </div>
            <div>
              <p className="text-white/50 mb-1 font-medium">Любимые выражения</p>
              <div className="flex flex-wrap gap-2">
                {termlin.expressions.map((expr) => (
                  <span
                    key={expr}
                    className="px-2.5 py-1 rounded-full bg-white/5 text-white/80 text-xs border border-white/10"
                  >
                    «{expr}»
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white/50 mb-1 font-medium">Приметы и поверья</p>
              <p className="text-white">{termlin.omens}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function TermlinyPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «termliny» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('termliny');

  const { data: termliny } = useTermliny();

  return (
    <PageLayout
      title="Термлины — духи-хранители Термбурга"
      description="Познакомьтесь с Термлинами — мифологическими духами-хранителями бань термального комплекса Термбург."
      ogImage="/images/termliny/og.jpg"
    >
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
      {/* Hero */}
      <section className="relative overflow-hidden pt-8 pb-4 md:pt-12 md:pb-6">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/images/heroes/termliny.webp"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <Container className="relative z-10">
          <div className="text-center">
            <h1 className="sr-only">Термлины — духи-хранители бань Термбурга</h1>
            <img
              src="/images/termliny-logo-dark.svg"
              alt="Термлины"
              className="h-12 md:h-16 mx-auto mb-3"
            />
            <p className="text-sm md:text-base text-white/70 max-w-2xl mx-auto">
              Каждая баня и сауна Термбурга находится под покровительством своего
              духа-хранителя. Познакомьтесь с ними — и ваш визит станет ещё более
              особенным.
            </p>
          </div>
        </Container>
      </section>

      {/* Termlin cards */}
      <Section dark ornament className="pt-4 md:pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {termliny.map((t) => (
            <TermlinCard key={t.id} termlin={t} />
          ))}
        </div>
      </Section>

      {/* Lore note */}
      <section className="relative py-12 bg-dark-surface ornament-pattern">
        <div className="gold-separator absolute top-0 left-0 right-0" />
        <Container>
          <div className="relative max-w-2xl mx-auto text-center">
            <img
              src="/images/termliny-symbol.svg"
              alt=""
              className="w-12 h-12 mx-auto mb-4 opacity-40"
            />
            <p className="text-white/50 text-sm leading-relaxed">
              Термлины — мифологические персонажи термального комплекса Термбург.
              Их истории вдохновлены славянским фольклором и банными традициями.
              Приходите в гости — и, может быть, вы почувствуете их присутствие.
            </p>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
