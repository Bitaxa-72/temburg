import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { promotions as localPromotions } from '@/data/promotions';

export default function PromotionsCarousel() {
  const [wpPromotions, setWpPromotions] = useState<any[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/wp-json/termburg/v1/promotions')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && Array.isArray(data) && data.length > 0) setWpPromotions(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const promotions = wpPromotions || localPromotions;

  return (
    <Section
      dark
      ornament
      separator
      title="Акции и скидки"
      subtitle="Выгодные предложения для наших гостей"
    >
      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        {promotions.map((promo) => (
          <Card
            key={promo.id}
            dark
            className="min-w-[300px] max-w-[340px] flex-shrink-0 snap-start flex flex-col p-0 overflow-hidden"
          >
            {promo.banner && (
              <div className="h-44 overflow-hidden">
                <img
                  src={promo.banner}
                  alt={promo.title}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <Badge variant="gold" className="self-start mb-3">
                {promo.badge}
              </Badge>
              <h3 className="font-heading text-lg font-semibold text-white mb-2">
                {promo.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed flex-1">
                {promo.description}
              </p>
              <p className="text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
                {promo.conditions}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/promotions"
          className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors"
        >
          Все акции
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </Section>
  );
}
