import { lazy, Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/sections/home/HeroSection';
import AdvantagesSection from '@/components/sections/home/AdvantagesSection';
import ZonesPreviewSection from '@/components/sections/home/ZonesPreviewSection';
import PhotoStrip from '@/components/sections/home/PhotoStrip';
import SchedulePreviewSection from '@/components/sections/home/SchedulePreviewSection';
import PricingPreviewSection from '@/components/sections/home/PricingPreviewSection';
import TermlinyTeaser from '@/components/sections/home/TermlinyTeaser';
import ReviewsSection from '@/components/sections/home/ReviewsSection';
import Section from '@/components/ui/Section';
import InfoTicker from '@/components/sections/home/InfoTicker';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */


const NewsPreviewSection = lazy(() => import('@/components/sections/home/NewsPreviewSection'));

export default function HomePage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «home» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('home');

  return (
    <PageLayout description="Термбург — термальный комплекс в самом сердце Москвы. Бани, сауны, парения и SPA-процедуры.">
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}
      <HeroSection />
      <InfoTicker />
      <div className="gold-separator" />
      <AdvantagesSection />
      <ZonesPreviewSection />
      <div className="gold-separator" />
      <PhotoStrip />
      <div className="gold-separator" />
      <Section dark separator>
        <div className="grid md:grid-cols-2 gap-8 items-stretch overflow-hidden">
          <TermlinyTeaser />
          <SchedulePreviewSection />
        </div>
      </Section>
      <PricingPreviewSection />
      <Suspense fallback={null}>
        <NewsPreviewSection />
      </Suspense>
      <ReviewsSection />
    </PageLayout>
  );
}
