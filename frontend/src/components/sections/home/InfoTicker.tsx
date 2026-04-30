import { memo } from 'react';
import { Info } from 'lucide-react';
import { useHero } from '@/hooks/useWordPressData';

const InfoTicker = memo(function InfoTicker() {
  const { data: hero } = useHero();
  const tickerText = hero.ticker?.text?.trim();
  const tickerLabel = hero.ticker?.label?.trim() || 'Инфо';

  if (!tickerText) return null;

  return (
    <div className="bg-[#1E1A2E] border-t border-[#2A2438] overflow-hidden">
      <div className="relative flex items-center h-10">
        <div className="flex-shrink-0 z-10 flex items-center gap-2 px-4 bg-[#1E1A2E] border-r border-[#2A2438]">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider hidden sm:inline">{tickerLabel}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="ticker-scroll whitespace-nowrap text-sm text-white/80">
            <span className="inline-block px-4">{tickerText}</span>
            <span className="inline-block px-4">{tickerText}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InfoTicker;
