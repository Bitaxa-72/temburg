import { useState, useEffect, useMemo } from 'react';
import { Filter } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
}

const categories = [
  { id: 'all', name: 'Все' },
  { id: 'pool', name: 'Бассейн' },
  { id: 'sauna', name: 'Парные' },
  { id: 'interior', name: 'Интерьер' },
  { id: 'spa', name: 'SPA' },
  { id: 'events', name: 'Мероприятия' },
];

const galleryItems: GalleryItem[] = [
  // Бассейн
  { id: 1, src: '/images/complex/pool.webp', alt: 'Термальный бассейн', category: 'pool' },
  { id: 2, src: '/images/complex/gallery1.webp', alt: 'Бассейн с подсветкой', category: 'pool' },
  { id: 3, src: '/images/complex/gallery7.webp', alt: 'Зона у бассейна', category: 'pool' },
  { id: 4, src: '/images/complex/barrels.webp', alt: 'Купели-бочки', category: 'pool' },

  // Парные
  { id: 5, src: '/images/complex/sauna.webp', alt: 'Сауна', category: 'sauna' },
  { id: 6, src: '/images/complex/herbal.webp', alt: 'Травяная парная', category: 'sauna' },
  { id: 7, src: '/images/complex/gallery4.webp', alt: 'Русская парная', category: 'sauna' },
  { id: 8, src: '/images/complex/gallery10.webp', alt: 'Хаммам', category: 'sauna' },
  { id: 9, src: '/images/complex/gallery11.webp', alt: 'Соляная комната', category: 'sauna' },

  // Интерьер
  { id: 10, src: '/images/complex/gallery2.webp', alt: 'Зона отдыха', category: 'interior' },
  { id: 11, src: '/images/complex/gallery3.webp', alt: 'Лаунж', category: 'interior' },
  { id: 12, src: '/images/complex/gallery5.webp', alt: 'Ресепшен', category: 'interior' },
  { id: 13, src: '/images/complex/gallery6.webp', alt: 'Освещение', category: 'interior' },
  { id: 14, src: '/images/complex/gallery8.webp', alt: 'Декор', category: 'interior' },
  { id: 15, src: '/images/complex/gallery9.webp', alt: 'Атмосфера', category: 'interior' },

  // SPA
  { id: 16, src: '/images/services/spa-classic.webp', alt: 'Классический массаж', category: 'spa' },
  { id: 17, src: '/images/services/spa-relax.webp', alt: 'Релакс-программа', category: 'spa' },
  { id: 18, src: '/images/services/spa-peeling.webp', alt: 'Пилинг', category: 'spa' },
  { id: 19, src: '/images/services/spa-detox.webp', alt: 'Детокс-программа', category: 'spa' },
  { id: 20, src: '/images/services/spa-stone.webp', alt: 'Стоун-терапия', category: 'spa' },
  { id: 21, src: '/images/services/spa-thai.webp', alt: 'Тайский массаж', category: 'spa' },

  // Мероприятия
  { id: 22, src: '/images/services/steam-author.webp', alt: 'Авторское парение', category: 'events' },
  { id: 23, src: '/images/services/steam-corporate.webp', alt: 'Корпоративные парения', category: 'events' },
  { id: 24, src: '/images/services/steam-couple.webp', alt: 'Парение для пар', category: 'events' },
  { id: 25, src: '/images/services/steam-kids.webp', alt: 'Детские программы', category: 'events' },
  { id: 26, src: '/images/complex/gallery12.webp', alt: 'Мастер-класс', category: 'events' },
  { id: 27, src: '/images/complex/gallery13.webp', alt: 'Праздник', category: 'events' },
  { id: 28, src: '/images/complex/gallery14.webp', alt: 'Банный фестиваль', category: 'events' },
];

export default function GalleryPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «gallery» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('gallery');

  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpGallery, setWpGallery] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/wp-json/termburg/v1/gallery')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setWpGallery(data.map((item: any, i: number) => ({
            id: item.id || i + 1,
            src: item.src || item.image || item.url || '',
            alt: item.alt || item.caption || item.title || '',
            category: item.category || 'interior',
          })));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const actualGallery = wpGallery || galleryItems;

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return actualGallery;
    return actualGallery.filter((item) => item.category === activeCategory);
  }, [activeCategory, actualGallery]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = filteredItems.map((item) => ({
    src: item.src,
    alt: item.alt,
  }));

  return (
    <PageLayout
      title="Фотогалерея"
      description="Фотографии термального комплекса Термбург — бассейны, парные, SPA и атмосфера."
    >
      <PageHero
        title="Фотогалерея"
        subtitle="Загляните внутрь Термбурга"
        backgroundImage="/images/heroes/gallery.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      <Section>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter className="h-4 w-4 text-text-secondary" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-surface-warm text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filteredItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative overflow-hidden rounded-xl aspect-square cursor-pointer"
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium">{item.alt}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Counter */}
        <div className="mt-8 text-center text-text-secondary text-sm">
          Показано {filteredItems.length} из {actualGallery.length} фотографий
        </div>
      </Section>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </PageLayout>
  );
}
