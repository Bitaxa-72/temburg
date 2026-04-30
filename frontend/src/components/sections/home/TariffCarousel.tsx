import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { termliny as localTermliny } from '@/data/termliny';
import { shuffleWishes } from '@/data/wishes';
import { useHero, useTermliny } from '@/hooks/useWordPressData';
import type { WPHeroSlide } from '@/api/wordpress';

const INTERVAL = 6000;

// Получаем короткое имя термлина для подписи
function getTermlinShortName(index: number): string {
  const names = ['Яромира', 'Валькирии', 'Переслава', 'Казимира', 'Ведагора', 'Милована', 'Лели'];
  return names[index] || 'Термбурга';
}

function hasSlideContent(slide: WPHeroSlide): boolean {
  return Boolean(
    slide.label?.trim() ||
    slide.title?.trim() ||
    slide.text?.trim() ||
    slide.author?.trim() ||
    slide.image?.trim()
  );
}

function formatAuthor(author: string): string {
  const clean = author.trim();
  if (!clean) return '';
  return clean.startsWith('—') ? clean : `— ${clean}`;
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const { data: hero } = useHero();

  const { data: termliny } = useTermliny();

  // Перемешиваем пожелания один раз при монтировании
  const shuffledWishes = useMemo(() => shuffleWishes(), []);
  const adminSlides = useMemo(
    () => (hero.slides || []).filter(hasSlideContent),
    [hero.slides]
  );
  const slideCount = adminSlides.length > 0 ? adminSlides.length : shuffledWishes.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const wish = shuffledWishes[current % shuffledWishes.length];
  const termlin = termliny[wish.termlinIndex] || localTermliny[wish.termlinIndex];
  const Icon = wish.icon;
  const adminSlide = adminSlides.length > 0 ? adminSlides[current % adminSlides.length] : undefined;
  const slideLabel = adminSlide?.label?.trim() || `Пожелание от ${getTermlinShortName(wish.termlinIndex)}`;
  const slideTitle = adminSlide?.title?.trim() || wish.title;
  const slideText = adminSlide?.text?.trim() || wish.description;
  const slideAuthor = formatAuthor(adminSlide?.author?.trim() || termlin.name);
  const slideImage = adminSlide?.image?.trim() || termlin.image;
  const slideAlt = (adminSlide?.author?.trim() || termlin.name).replace(/^—\s*/, '');

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
                {slideLabel}
              </p>
              <h3 className="font-heading text-lg text-white font-bold mb-2 leading-tight line-clamp-2 min-h-[3rem]">
                {slideTitle}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-3 min-h-[3.75rem]">
                {slideText}
              </p>
            </div>
            <p className="text-xs text-white/40 truncate">{slideAuthor}</p>
          </div>

          {/* Right side - Termlin Image */}
          <div className="w-[168px] relative flex-shrink-0">
            <img
              key={slideImage}
              src={slideImage}
              alt={slideAlt}
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
