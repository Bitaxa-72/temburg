import { useState, useEffect, memo } from 'react';
import { Info } from 'lucide-react';

const WP_API_BASE = import.meta.env.VITE_WP_API_URL || 'https://termburg.ru/wp-json';

interface TickerItem {
  id: number;
  text: string;
}

// Фоллбэк если WP недоступен
const defaultItems: TickerItem[] = [
  { id: 1, text: 'Режим работы: ежедневно 9:00–23:00 (1-й понедельник месяца — санитарный день)' },
  { id: 2, text: 'Адрес: Москва, ул. Гурьянова 30, Серф Плаза, 2 этаж, м. Печатники' },
  { id: 3, text: 'Телефон: +7 (495) 191-64-38' },
];

const InfoTicker = memo(function InfoTicker() {
  const [items, setItems] = useState<TickerItem[]>(defaultItems);

  useEffect(() => {
    let mounted = true;

    async function fetchTicker() {
      try {
        const res = await fetch(`${WP_API_BASE}/termburg/v1/ticker`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setItems(data.map((item: any, i: number) => ({
            id: item.id || i,
            text: item.text || item.title?.rendered || '',
          })).filter((item: TickerItem) => item.text));
        }
      } catch {
        // Используем фоллбэк
      }
    }

    fetchTicker();
    return () => { mounted = false; };
  }, []);

  if (items.length === 0) return null;

  // Дублируем текст для бесшовного цикла
  const tickerText = items.map(item => item.text).join('    ●    ');

  return (
    <div className="bg-[#1E1A2E] border-t border-[#2A2438] overflow-hidden">
      <div className="relative flex items-center h-10">
        <div className="flex-shrink-0 z-10 flex items-center gap-2 px-4 bg-[#1E1A2E] border-r border-[#2A2438]">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider hidden sm:inline">Инфо</span>
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
