import { Tag, Gift, ArrowRight, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import TicketButton from '@/components/ui/TicketButton';
import Container from '@/components/ui/Container';
import { useBooking } from '@/context/BookingContext';
import { usePromotions } from '@/hooks/useWordPressData';
import { promotions as fallbackPromotions } from '@/data/promotions';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

export default function PromotionsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «promotions» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('promotions');

  const { openBooking, openWhatToBring } = useBooking();
  const { data: wpPromotions, loading } = usePromotions();

  // Use WordPress data or fallback to static
  const promotions = wpPromotions.length > 0 ? wpPromotions : fallbackPromotions;

  return (
    <PageLayout title="Акции" description="Актуальные акции и специальные предложения Термбурга.">
      <PageHero
        title="Акции и спецпредложения"
        subtitle="Приятные бонусы для наших гостей. Следите за обновлениями — мы регулярно добавляем новые предложения."
        backgroundImage="/images/heroes/promotions.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Promotions grid */}
      <Section>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {promotions.map((promo) => {
            // Разбиваем описание на пункты по точкам/переносам
            const items = (promo.description || '')
              .split(/(?:\.\s+|\n+)/)
              .map((s) => s.trim().replace(/\.$/, ''))
              .filter((s) => s.length > 0);
            return (
              <Card key={promo.id} className="relative h-full flex flex-col overflow-hidden p-0">
                {/* Banner image */}
                {promo.banner && (
                  <div className="h-80 overflow-hidden bg-surface-warm flex-shrink-0">
                    <img
                      src={promo.banner}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="relative flex flex-col flex-1 p-6">
                  {/* Content */}
                  <div className="mb-4 pt-2 min-h-[3.5rem]">
                    {promo.discount && (
                      <span className="mb-2 inline-block text-3xl font-bold text-accent">
                        -{promo.discount}%
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-text-primary leading-tight">{promo.title}</h3>
                  </div>

                  <ul className="mb-4 flex-1 space-y-1.5 text-sm text-text-secondary">
                    {items.map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary flex-shrink-0">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Conditions */}
                  <div className="rounded-lg bg-surface-warm px-4 py-3 min-h-[4rem]">
                    <p className="text-xs font-medium text-text-secondary">Условие:</p>
                    <p className="text-sm text-text-primary">{promo.conditions}</p>
                  </div>

                  {promo.validUntil && (
                    <p className="mt-3 text-xs text-text-secondary">
                      Действует до {promo.validUntil}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
        )}
      </Section>
    </PageLayout>
  );
}
