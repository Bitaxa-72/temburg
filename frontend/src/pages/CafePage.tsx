import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  Loader2,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import { useCafe } from '@/hooks/useWordPressData';
import { cafeMenu as fallbackMenu } from '@/data/cafe';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */
import { useImage } from '@/hooks/useImage';

// Menu slides data
const menuSlides = [
  {
    id: 'main',
    title: 'Основное меню',
    image: '/images/menu/menu-0.jpg',
  },
  {
    id: 'kids',
    title: 'Детское меню',
    image: '/images/menu/kids-0.jpg',
  },
];

// Menu Slider Component
type MenuSlide = typeof menuSlides[number];

function MenuSlider({ slides = menuSlides, title = 'Меню' }: { slides?: MenuSlide[]; title?: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  const slide = slides[currentSlide] || slides[0];

  return (
    <section className="py-8 bg-surface">
      <Container>
        <h2 className="font-heading text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          {title}
        </h2>

        <div
          className="relative rounded-2xl overflow-hidden bg-surface-warm shadow-lg"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide content */}
          <div className="relative aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/10] overflow-hidden">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-contain bg-white"
            />
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide title bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{slide.title}</h3>
              {/* Dots indicator */}
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      idx === currentSlide ? 'bg-primary' : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function CafeMenuItem({ item }: { item: any }) {
  const resolvedImage = useImage(item.image || '');
  const details = [item.cookTime ? `${item.cookTime} мин` : '', item.calories ? `${item.calories} ккал` : ''].filter(Boolean);

  return (
    <div className="rounded-xl bg-surface border border-border/50 px-5 py-4">
      <div className="flex gap-4">
        {item.image && (
          <img
            src={resolvedImage}
            alt={item.name}
            className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-text-primary text-sm font-medium">{item.name}</span>
                {item.badge && (
                  <Badge variant="default" className="text-xs py-0.5">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{item.description}</p>
              )}
              {details.length > 0 && (
                <p className="mt-1 text-xs text-text-secondary/70">{details.join(' · ')}</p>
              )}
            </div>
            <div className="text-right text-primary font-bold text-sm flex-shrink-0">
              <span>{Number(item.price || 0).toLocaleString('ru-RU')}&nbsp;&#8381;</span>
              {item.priceAlt ? (
                <span className="block text-xs font-medium text-text-secondary">
                  {Number(item.priceAlt).toLocaleString('ru-RU')}&nbsp;&#8381;
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cafe menu categories section with WP data
function CafeMenuSection({ wpCafe, loading }: { wpCafe: any; loading: boolean }) {
  // Convert WP response (Record<string, {name, items}>) to array format
  const rawCategories = wpCafe && 'categories' in wpCafe ? wpCafe.categories : wpCafe;
  const wpCategories = Array.isArray(rawCategories)
    ? rawCategories.map((cat: any) => ({
        id: cat.id || cat.name,
        name: cat.name,
        items: (cat.items || []).map((item: any) => ({
          name: item.name,
          price: item.price,
          priceAlt: item.priceAlt ?? undefined,
          description: item.description || undefined,
          badge: item.badge || undefined,
          cookTime: item.cookTime ?? undefined,
          calories: item.calories ?? undefined,
          image: item.image || undefined,
        })),
      }))
    : Object.keys(rawCategories || {}).length > 0
    ? Object.entries(rawCategories).filter(([, cat]) => (cat as any)?.items).map(([key, cat]) => ({
        id: key,
        name: (cat as any).name,
        items: (cat as any).items.map((item: any) => ({
          name: item.name,
          price: item.price,
          priceAlt: item.priceAlt ?? undefined,
          description: item.description || undefined,
          badge: item.badge || undefined,
          cookTime: item.cookTime ?? undefined,
          calories: item.calories ?? undefined,
          image: item.image || undefined,
        })),
      }))
    : null;

  const filledWpCategories = (wpCategories || []).filter((cat: any) => cat.name && cat.items.length > 0);
  const categories = filledWpCategories.length > 0 ? filledWpCategories : fallbackMenu;

  if (loading) {
    return (
      <Section title={wpCafe?.categoriesTitle || 'Меню кафетерия'}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Section>
    );
  }

  return (
    <Section title={wpCafe?.categoriesTitle || 'Меню кафетерия'} subtitle={wpCafe?.categoriesSubtitle || 'Блюда и напитки для восстановления сил'}>
      <div className="space-y-8 max-w-4xl mx-auto">
        {categories.map((cat: any) => (
          <div key={cat.id}>
            <h3 className="font-heading text-xl font-bold text-text-primary mb-4">{cat.name}</h3>
            <div className="space-y-2">
              {cat.items.map((item: any, idx: number) => (
                <CafeMenuItem key={idx} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function CafePage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «cafe» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('cafe');
  const { data: wpCafe, loading } = useCafe();
  const cafeSlides = menuSlides.map((fallback) => {
    const adminSlide = Array.isArray(wpCafe?.menuSlides)
      ? wpCafe.menuSlides.find((slide: any) => slide.id === fallback.id)
      : null;

    return {
      ...fallback,
      title: adminSlide?.title || fallback.title,
      image: adminSlide?.image || fallback.image,
    };
  });

  return (
    <PageLayout title="Кафетерий" description="Кафетерий термального комплекса Термбург: здоровые блюда, травяные чаи, напитки и закуски. Меню для восстановления сил после парных и SPA.">
      <PageHero
        title="Кафетерий"
        subtitle="Вкусная кухня для идеального отдыха"
        backgroundImage="/images/heroes/cafe.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Menu Slider */}
      <MenuSlider slides={cafeSlides} title={(wpCafe?.menuTitle as string) || 'Меню'} />

      {/* Menu Categories from WP */}
      <CafeMenuSection wpCafe={wpCafe} loading={loading} />
    </PageLayout>
  );
}
