import { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import IsometricMap3D from '@/components/map/IsometricMap3D';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

function MapLoading() {
  return (
    <div className="w-full h-[600px] md:h-[700px] rounded-2xl bg-[#2C2420] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C4944E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#FBF9F4]/70">Загрузка 3D карты...</p>
      </div>
    </div>
  );
}

export default function MapPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «map» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('map');

  return (
    <PageLayout
      title="3D Карта комплекса"
      description="Интерактивная 3D карта термального комплекса Термбург. Исследуйте 8 парных, бассейны, SPA и зоны отдыха в формате виртуальной экскурсии."
    >
      <PageHero
        title="3D Карта комплекса"
        subtitle="Исследуйте термальный комплекс в интерактивном 3D"
        backgroundImage="/images/heroes/map.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      <Section className="py-8 md:py-12">
        <Container>
          <Suspense fallback={<MapLoading />}>
            <IsometricMap3D />
          </Suspense>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#8B4513]/10 to-[#A0522D]/10 rounded-xl p-6 border border-[#8B4513]/20">
              <h3 className="font-['Ikra_Slab'] text-xl mb-2 text-[#8B4513]">🪵 8 парных</h3>
              <p className="text-sm text-[#3D3530]/70">
                Русская, индийская, сибирская, гималайская, шаманская, травяная, песочная и деревенская
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#4682B4]/10 to-[#6BA3BE]/10 rounded-xl p-6 border border-[#4682B4]/20">
              <h3 className="font-['Ikra_Slab'] text-xl mb-2 text-[#4682B4]">🏊 Водные зоны</h3>
              <p className="text-sm text-[#3D3530]/70">
                Большой бассейн, холодная и горячая купели, хаммам, бани-бочки
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#D2691E]/10 to-[#E8D5C4]/10 rounded-xl p-6 border border-[#D2691E]/20">
              <h3 className="font-['Ikra_Slab'] text-xl mb-2 text-[#D2691E]">💆 SPA и отдых</h3>
              <p className="text-sm text-[#3D3530]/70">
                SPA-кабинеты, массаж, йога, кафе, детская зона, фотозона
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}
