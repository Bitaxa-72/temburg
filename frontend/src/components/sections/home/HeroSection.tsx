import { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { useBooking } from '@/context/BookingContext';
import { useSettings } from '@/hooks/useWordPressData';
import EventCarousel from './TariffCarousel';
import WinVisitModal from '@/components/shared/WinVisitModal';

const SITE_URL = 'https://termburg.ceosivaev.ru';

// Schema.org VideoObject for SEO
const videoSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Термбург — термальный комплекс в Москве',
  description: 'Виртуальная экскурсия по термальному комплексу Термбург. 12 видов парных, бассейны, SPA-процедуры и зоны отдыха.',
  thumbnailUrl: `${SITE_URL}/images/og-default.jpg`,
  uploadDate: '2024-01-01',
  contentUrl: `${SITE_URL}/video/bg-hero.mp4`,
  embedUrl: `${SITE_URL}/video/bg-hero.mp4`,
  duration: 'PT30S',
  publisher: {
    '@type': 'Organization',
    name: 'Термбург',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/termburg-logo.svg`,
    },
  },
};

export default function HeroSection() {
  const { openBooking } = useBooking();
  const { data: settings } = useSettings();
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const [showWinModal, setShowWinModal] = useState(false);

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    if (!video1 || !video2) return;

    let timeoutId: number;

    const playVideo1 = () => {
      video2.style.opacity = '0';
      video1.style.opacity = '1';
      video1.currentTime = 0;
      video1.play();
    };

    const playVideo2 = () => {
      video1.style.opacity = '0';
      video2.style.opacity = '1';
      video2.currentTime = 0;
      video2.play();

      // Через 2 секунды вернуться к первому
      timeoutId = window.setTimeout(playVideo1, 2000);
    };

    // Когда первое видео заканчивается — запустить второе
    video1.addEventListener('ended', playVideo2);

    return () => {
      video1.removeEventListener('ended', playVideo2);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      </Helmet>
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Background videos */}
      <div className="absolute inset-0">
        <video
          ref={video1Ref}
          src="/video/bg-hero.mp4"
          muted
          autoPlay
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: 1 }}
        />
        <video
          ref={video2Ref}
          src="/video/bg-hero-2.mp4"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950/50 via-black/15 to-black/25" />
      </div>

      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <Container className="relative z-10 pt-32 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: text content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
              <span className="text-primary">Тепло пожаловать</span>
              <br />
              <span className="text-warm-white">в Термбург</span>
            </h1>

            <p className="font-heading text-sm md:text-base tracking-[0.3em] text-primary mt-4 uppercase">
              Термальный комплекс
            </p>

            <p className="mt-6 text-lg md:text-xl text-warm-white/90 max-w-2xl leading-relaxed">
              Пространство энергии, гармонии и заботы о вашем здоровье
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 flex-wrap">
              <Button variant="primary" size="lg" onClick={openBooking}>
                Хочу пойти
              </Button>
              <Button
                variant="outline"
                size="lg"
                href="/about"
              >
                Узнать больше
              </Button>
              {/* Кнопка игры скрыта — раскомментировать при необходимости
              <button
                type="button"
                onClick={() => setShowWinModal(true)}
                className="inline-flex items-center justify-center rounded-xl border-2 border-primary bg-transparent px-8 py-3.5 text-lg font-medium text-primary transition-all duration-200 hover:bg-primary hover:text-white"
              >
                Хочу выиграть посещение
              </button>
              */}
            </div>

            <p className="mt-12 text-sm text-warm-white/70">
              {settings?.workingHours || 'Ежедневно 9:00–23:00 (1-й пн месяца — сан. день)'} &middot; {settings?.address || 'Гурьянова, 30 (Серф Плаза, 2 эт.)'} &middot; {settings?.metro || 'м. Печатники'}
            </p>
          </div>

          {/* Right: tariff carousel */}
          <div className="hidden lg:block flex-shrink-0">
            <EventCarousel />
          </div>
        </div>
      </Container>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Win Visit Modal */}
        <WinVisitModal isOpen={showWinModal} onClose={() => setShowWinModal(false)} />
      </section>
    </>
  );
}
