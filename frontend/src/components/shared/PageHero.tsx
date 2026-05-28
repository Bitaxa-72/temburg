import Container from '@/components/ui/Container';
import { useImage } from '@/hooks/useImage';
import { useLocation } from 'react-router-dom';
import { usePageContent } from '@/hooks/useWordPressData';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function PageHero({ title, subtitle, backgroundImage }: PageHeroProps) {
  const location = useLocation();
  const slug = location.pathname === '/' ? 'home' : location.pathname.replace(/^\/+|\/+$/g, '');
  const { data: editablePage } = usePageContent(slug || 'home');
  // Resolve image through WordPress if available
  const resolvedBg = useImage(backgroundImage || '');
  const effectiveTitle = editablePage.title || title;

  return (
    <section className="relative py-16 text-center md:py-20 overflow-hidden">
      {backgroundImage ? (
        <>
          <div className="absolute inset-0">
            <img
              src={resolvedBg}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-surface-warm to-background" />
      )}

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <Container className="relative z-10">
        <h1 className="font-heading text-4xl font-bold md:text-5xl text-white">
          {effectiveTitle}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
