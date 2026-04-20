import { useEffect, useState } from 'react';
import { X, Sparkles, Thermometer, Droplets, Crown, Leaf } from 'lucide-react';
import WPImage from '@/components/ui/WPImage';
import type { ZoneItem } from '@/data/zoneCategories';

// "до 80°C · влажн. 70%" → { temp, humidity }
function parseTemp(raw?: string): { temp: string; humidity: string | null } {
  if (!raw) return { temp: '—', humidity: null };
  const parts = raw.split('·').map((s) => s.trim());
  return { temp: parts[0] || raw, humidity: parts[1] || null };
}

export function ClimatePill({ raw, size = 'sm' }: { raw?: string; size?: 'sm' | 'md' }) {
  const { temp, humidity } = parseTemp(raw);
  const padding = size === 'md' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-[11px]';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="inline-flex items-stretch bg-black/65 backdrop-blur-md text-white font-semibold rounded-full border border-white/15 shadow-md overflow-hidden">
      <div className={`flex items-center gap-1.5 ${padding}`}>
        <Thermometer className={`${iconSize} text-primary`} />
        <span className="tabular-nums">{temp}</span>
      </div>
      {humidity && (
        <>
          <div className="w-px bg-white/15" />
          <div className={`flex items-center gap-1.5 ${padding}`}>
            <Droplets className={`${iconSize} text-sky-300`} />
            <span className="tabular-nums">{humidity}</span>
          </div>
        </>
      )}
    </div>
  );
}

export function ZoneItemCard({ item, onClick }: { item: ZoneItem; onClick: () => void }) {
  const feats = item.features || [];
  const hasGuardian = feats.length > 3;
  const chips = hasGuardian ? feats.slice(0, -1) : feats;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative text-left rounded-2xl overflow-hidden bg-surface border border-border hover:border-primary/40 hover:shadow-[0_15px_40px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
    >
      <div className="relative h-72 overflow-hidden">
        <WPImage
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {item.temp && (
          <div className="absolute top-3 right-3">
            <ClimatePill raw={item.temp} />
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-bold text-white drop-shadow-md leading-tight line-clamp-2">{item.name}</h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-text-secondary line-clamp-3 mb-3 leading-relaxed min-h-[3.6em]">{item.desc}</p>
        <div className="min-h-[1.5rem] flex flex-wrap gap-1.5">
          {chips.slice(0, 3).map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
            >
              <Sparkles className="w-2.5 h-2.5" />
              {f}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-3 text-[11px] font-semibold text-primary/80 group-hover:text-primary transition-colors">
          Подробнее →
        </div>
      </div>
    </button>
  );
}

export function ZoneItemModal({ item, onClose }: { item: ZoneItem; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const features = item.features || [];
  const guardian = features.length > 3 ? features[features.length - 1] : null;
  const highlights = guardian ? features.slice(0, -1) : features;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-surface border border-primary/20 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-64 sm:h-72 overflow-hidden rounded-t-3xl relative">
          <WPImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {item.temp && (
            <div className="absolute top-4 left-4">
              <ClimatePill raw={item.temp} size="md" />
            </div>
          )}

          <div className="absolute bottom-5 left-6 right-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">{item.name}</h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white hover:bg-black/80 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <p className="text-text-secondary leading-relaxed text-[15px] mb-6">{item.desc}</p>

          {highlights.length > 0 && (
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Главные особенности</h3>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 via-primary/40 to-transparent" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((f) => (
                  <div
                    key={f}
                    className="group relative rounded-2xl bg-gradient-to-br from-primary/[0.08] via-surface to-primary/[0.04] border border-primary/15 p-5 text-center hover:border-primary/40 hover:shadow-[0_8px_30px_-10px_rgba(212,175,55,0.4)] transition-all duration-300"
                  >
                    <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center shadow-inner">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-text-primary leading-snug">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guardian && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary italic">
              <Crown className="w-3.5 h-3.5 text-primary/70" />
              Хранитель: <span className="font-medium text-text-primary not-italic">{guardian}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ZoneItemsGrid({ items, columns = 3 }: { items: ZoneItem[]; columns?: 2 | 3 }) {
  const [selected, setSelected] = useState<ZoneItem | null>(null);
  const cols = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <>
      <div className={`grid gap-5 ${cols}`}>
        {items.map((item) => (
          <ZoneItemCard key={item.name} item={item} onClick={() => setSelected(item)} />
        ))}
      </div>
      {selected && <ZoneItemModal item={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
