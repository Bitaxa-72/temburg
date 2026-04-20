import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import ImageLightbox from '@/components/shared/ImageLightbox';

const photos = [
  { src: '/images/complex/gallery5.webp', alt: 'Травяная парная с тёплым освещением' },
  { src: '/images/complex/gallery9.webp', alt: 'Зона отдыха комплекса' },
  { src: '/images/complex/herbal.webp', alt: 'Травяная парная' },
  { src: '/images/complex/gallery14.webp', alt: 'Термальный комплекс' },
  { src: '/images/complex/gallery4.webp', alt: 'Парная с каменкой и травами' },
  { src: '/images/complex/gallery10.webp', alt: 'Термальная зона' },
  { src: '/images/complex/barrels.webp', alt: 'Бани-бочки на террасе' },
  { src: '/images/complex/gallery12.webp', alt: 'Парная' },
  { src: '/images/complex/gallery8.webp', alt: 'Парная с вениками' },
  { src: '/images/complex/gallery11.webp', alt: 'Парная с камнями' },
  { src: '/images/complex/gallery6.webp', alt: 'Каменка в парной' },
  { src: '/images/complex/gallery13.webp', alt: 'Зона релаксации' },
];

export default function PhotoStrip() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const scrollPositionRef = useRef(0);

  // Smooth auto-scroll animation
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.5; // pixels per frame
    const maxScroll = container.scrollWidth / 2;

    const animate = () => {
      if (!isPaused && container) {
        scrollPositionRef.current += speed;

        // Reset to start when reaching the duplicate set
        if (scrollPositionRef.current >= maxScroll) {
          scrollPositionRef.current = 0;
        }

        container.scrollLeft = scrollPositionRef.current;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    const newPosition = scrollPositionRef.current + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollPositionRef.current = Math.max(0, newPosition);
    scrollRef.current.scrollTo({
      left: scrollPositionRef.current,
      behavior: 'smooth',
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index % photos.length);
  };

  return (
    <section className="py-8 overflow-hidden relative group bg-surface-warm/30">
      {/* Header with link */}
      <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
        <h2 className="font-heading text-xl text-text-primary">Фотогалерея</h2>
        <Link
          to="/gallery"
          className="flex items-center gap-2 text-sm font-medium text-primary-dark hover:text-primary transition-colors"
        >
          <Images className="w-4 h-4" />
          Смотреть все фото
        </Link>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 mt-4 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 md:left-4 md:h-12 md:w-12"
        aria-label="Предыдущие фото"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 mt-4 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 md:right-4 md:h-12 md:w-12"
        aria-label="Следующие фото"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4"
        style={{ scrollBehavior: 'auto' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {[...photos, ...photos].map((photo, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openLightbox(i)}
            className="flex-shrink-0 w-72 h-44 md:w-80 md:h-52 rounded-2xl overflow-hidden relative group/item cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/item:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="flex items-center gap-2 text-white text-sm font-medium">
                <ZoomIn className="h-4 w-4" />
                Увеличить
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
