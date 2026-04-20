import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { termliny as localTermliny } from '@/data/termliny';
import { shuffleWishes } from '@/data/wishes';

const INTERVAL = 6000;

// Получаем короткое имя термлина для подписи
function getTermlinShortName(index: number): string {
  const names = ['Яромира', 'Валькирии', 'Переслава', 'Казимира', 'Ведагора', 'Милована', 'Лели'];
  return names[index] || 'Термбурга';
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // WP termliny data with local fallback
  const [wpTermliny, setWpTermliny] = useState<any[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/wp-json/termburg/v1/termliny')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (!cancelled && Array.isArray(data) && data.length > 0) setWpTermliny(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const termliny = wpTermliny || localTermliny;

  // Перемешиваем пожелания один раз при монтировании
  const shuffledWishes = useMemo(() => shuffleWishes(), []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % shuffledWishes.length);
  }, [shuffledWishes.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + shuffledWishes.length) % shuffledWishes.length);
  }, [shuffledWishes.length]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const wish = shuffledWishes[current];
  const termlin = termliny[wish.termlinIndex];
  const Icon = wish.icon;

  return (
    <div className="w-[400px]">
      {/* Slide */}
      <div className="group relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border bg-dark-surface border-dark-border w-[400px] h-[280px]">
        <div className="flex h-full">
          {/* Left side - Text */}
          <div className="w-[232px] p-5 flex flex-col justify-between flex-shrink-0">
            <div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/20">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs uppercase tracking-wider mb-1 text-primary truncate">
                Пожелание от {getTermlinShortName(wish.termlinIndex)}
              </p>
              <h3 className="font-heading text-lg text-white font-bold mb-2 leading-tight line-clamp-2 min-h-[3rem]">
                {wish.title}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-3 min-h-[3.75rem]">
                {wish.description}
              </p>
            </div>
            <p className="text-xs text-white/40 truncate">— {termlin.name}</p>
          </div>

          {/* Right side - Termlin Image */}
          <div className="w-[168px] relative flex-shrink-0">
            <img
              key={termlin.image}
              src={termlin.image}
              alt={termlin.name}
              className={`absolute inset-0 w-full h-full object-cover ${
                wish.termlinIndex === 5 ? 'object-[10%_top]' : 'object-top'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-surface via-dark-surface/60 to-transparent" />
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-white/80" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>
      </div>

    </div>
  );
}
