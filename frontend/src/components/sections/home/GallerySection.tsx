import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import Section from '@/components/ui/Section';
import ImageLightbox from '@/components/shared/ImageLightbox';
import { useImages } from '@/hooks/useImage';
import { useGallery } from '@/hooks/useWordPressData';
import { COMPLEX_IMAGES } from '@/data/imagePaths';
import { mapGalleryData, type GalleryDisplayItem } from '@/utils/galleryData';

interface GalleryItem extends GalleryDisplayItem {
  type: 'photo' | 'video';
  videoUrl?: string;
}

const galleryItemsData: GalleryItem[] = [
  { id: 1, src: COMPLEX_IMAGES.gallery1, alt: 'Термальный бассейн', category: 'pool', type: 'photo' },
  { id: 2, src: COMPLEX_IMAGES.gallery2, alt: 'Зона отдыха', category: 'interior', type: 'photo' },
  { id: 3, src: COMPLEX_IMAGES.pool, alt: 'Бассейн', category: 'pool', type: 'photo' },
  { id: 4, src: COMPLEX_IMAGES.gallery4, alt: 'Парная', category: 'sauna', type: 'photo' },
  { id: 5, src: COMPLEX_IMAGES.sauna, alt: 'Сауна', category: 'sauna', type: 'photo' },
  { id: 6, src: COMPLEX_IMAGES.gallery6, alt: 'Интерьер', category: 'interior', type: 'photo' },
  { id: 7, src: COMPLEX_IMAGES.herbal, alt: 'Травяная парная', category: 'sauna', type: 'photo' },
  { id: 8, src: COMPLEX_IMAGES.gallery8, alt: 'Атмосфера', category: 'interior', type: 'photo' },
];

function isResolvedImageUrl(src: string): boolean {
  return /^(https?:)?\/\//.test(src) || src.startsWith('/');
}

export default function GallerySection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: wpGallery } = useGallery();

  const sourceItems = useMemo(
    () => mapGalleryData(wpGallery, galleryItemsData).slice(0, 8),
    [wpGallery],
  );

  // Get all image paths for useImages hook
  const imagePaths = useMemo(
    () => sourceItems.map((item) => item.src).filter((src) => !isResolvedImageUrl(src)),
    [sourceItems],
  );
  const imageUrls = useImages(imagePaths);

  // Map gallery items with resolved URLs
  const galleryItems = useMemo(() => sourceItems.map((item) => {
    const itemType = (item as Partial<GalleryItem>).type || 'photo';

    return {
      ...item,
      type: itemType,
      resolvedSrc: isResolvedImageUrl(item.src) ? item.src : imageUrls[item.src] || `/images/${item.src}`,
    };
  }), [imageUrls, sourceItems]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const lightboxImages = galleryItems.map((item) => ({
    src: item.resolvedSrc,
    alt: item.alt,
  }));

  return (
    <Section
      title="Фотогалерея"
      subtitle="Загляните внутрь Термбурга"
    >
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {galleryItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLightbox(index)}
            className={`group relative overflow-hidden rounded-xl aspect-square cursor-pointer ${
              index === 0 ? 'md:col-span-2 md:row-span-2' : ''
            }`}
          >
            <img
              src={item.resolvedSrc}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-medium">{item.alt}</p>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-colors"
        >
          Смотреть все фото
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </Section>
  );
}
