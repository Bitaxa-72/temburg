import { useState, useEffect } from 'react';
import { Star, ExternalLink, Quote } from 'lucide-react';
import Section from '@/components/ui/Section';

const reviewPlatforms = [
  {
    id: 'yandex',
    name: 'Яндекс Карты',
    rating: 5.0,
    reviewCount: 1552,
    url: 'https://yandex.com/maps/-/CDVfBRPb',
    logo: '/images/icons/yandex-logo.png',
  },
  {
    id: '2gis',
    name: '2ГИС',
    rating: 4.5,
    reviewCount: 180,
    url: 'https://go.2gis.com/7LiqQ',
    logo: '/images/icons/2gis-logo.png',
  },
];

export default function ReviewsSection() {
  const [platforms, setPlatforms] = useState(reviewPlatforms);

  useEffect(() => {
    fetch('/wp-json/termburg/v1/reviews-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setPlatforms(prev => prev.map(p => {
          if (p.id === 'yandex' && data.yandex) {
            return { ...p, rating: data.yandex.rating, reviewCount: data.yandex.count };
          }
          if (p.id === '2gis' && (data['2gis'] || data.twogis)) {
            const d = data['2gis'] || data.twogis;
            return { ...p, rating: d.rating, reviewCount: d.count };
          }
          return p;
        }));
      })
      .catch(() => {});
  }, []);

  const avgRating = (platforms.reduce((acc, p) => acc + p.rating, 0) / platforms.length).toFixed(1);
  const totalReviews = platforms.reduce((acc, p) => acc + p.reviewCount, 0);

  return (
    <Section warm title="Отзывы гостей" subtitle="Нам доверяют тысячи посетителей">
      <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 shadow-lg shadow-amber-100/50 overflow-hidden">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-300/50">
                <span className="text-4xl font-bold text-white">{avgRating}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="flex gap-1 mb-1 justify-center">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-amber-900 font-semibold">{totalReviews}+ отзывов</p>
            <p className="text-amber-700/70 text-sm">на площадках</p>
          </div>

          <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-transparent via-amber-300 to-transparent" />

          <div className="flex gap-4">
            {platforms.map((platform) => (
              <a key={platform.id} href={platform.url} target="_blank" rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/70 hover:bg-white border border-amber-200/50 hover:border-amber-300 hover:shadow-md transition-all">
                <img src={platform.logo} alt={platform.name} className="w-12 h-12 rounded-xl shadow-sm" />
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-900">{platform.rating}</div>
                  <div className="text-xs text-amber-700/70">{platform.reviewCount} отзывов</div>
                </div>
                <span className="text-xs font-medium text-amber-600 group-hover:text-amber-800 flex items-center gap-1 transition-colors">
                  Оставить отзыв <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>

          <div className="hidden lg:block w-px h-24 bg-gradient-to-b from-transparent via-amber-300 to-transparent" />

          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-center">
            <Quote className="w-8 h-8 text-amber-400 mb-2 rotate-180" />
            <p className="text-xl font-serif italic text-amber-900 leading-relaxed">Ваше признание — лучшая награда</p>
            <div className="mt-3 w-12 h-1 rounded-full bg-gradient-to-r from-amber-300 to-orange-400" />
          </div>
        </div>
      </div>
    </Section>
  );
}
