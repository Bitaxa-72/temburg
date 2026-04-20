import { useState, useEffect, memo } from 'react';
import { X, Thermometer } from 'lucide-react';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import WPImage from '@/components/ui/WPImage';
import { useBooking } from '@/context/BookingContext';
import { zoneCategories as localZoneCategories, type ZoneItem, type ZoneCategory } from '@/data/zoneCategories';

function ZoneItemModal({ item, onClose }: { item: ZoneItem; onClose: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-56 overflow-hidden rounded-t-2xl relative">
          <WPImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            {item.temp && (
              <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Thermometer className="w-4 h-4 text-primary" />
                <span className="text-white font-semibold">{item.temp}</span>
              </div>
            )}
          </div>
        </div>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <p className="text-text-secondary text-base leading-relaxed mb-5">{item.desc}</p>
          {item.features && item.features.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Особенности</h3>
              <div className="flex flex-wrap gap-2">
                {item.features.map((f) => <span key={f} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">{f}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ZoneModal({ zone, onClose }: { zone: ZoneCategory; onClose: () => void }) {
  const [selectedItem, setSelectedItem] = useState<ZoneItem | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !selectedItem) onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [onClose, selectedItem]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-48 sm:h-56 overflow-hidden rounded-t-2xl relative">
          <WPImage src={zone.image} alt={zone.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h2 className="text-3xl font-bold text-white">{zone.name}</h2>
            <p className="text-white/80">{zone.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <p className="text-text-secondary mb-6">{zone.description}</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {zone.items.map((item) => (
              <Card
                key={item.name}
                className="p-0 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative h-36 overflow-hidden">
                  <WPImage src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                    {item.temp && (
                      <div className="flex items-center gap-1 text-white/90">
                        <Thermometer className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium">{item.temp}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-text-secondary mb-2 line-clamp-2">{item.desc}</p>
                  {item.features && item.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.features.slice(0, 2).map((f) => (
                        <span key={f} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {item.features.length > 2 && (
                        <span className="text-[10px] text-text-secondary">+{item.features.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {selectedItem && <ZoneItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
}

const ZonesPreviewSection = memo(function ZonesPreviewSection() {
  const [selectedZone, setSelectedZone] = useState<ZoneCategory | null>(null);
  const { openWhatToBring } = useBooking();

  const [wpZones, setWpZones] = useState<ZoneCategory[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/wp-json/termburg/v1/zones')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data) {
          // If WP returns an array of zone categories, use directly; otherwise try to map
          if (Array.isArray(data) && data.length > 0) {
            setWpZones(data);
          } else if (typeof data === 'object' && Object.keys(data).length > 0) {
            setWpZones(Object.values(data));
          }
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const zoneCategories = wpZones || localZoneCategories;

  return (
    <Section
      id="bani"
      warm
      title="Наши зоны"
      subtitle="Парные, бассейны, купели и джакузи для вашего отдыха"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {zoneCategories.map((zone) => (
          <Card
            key={zone.id}
            className="p-0 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            onClick={() => setSelectedZone(zone)}
          >
            <div className="relative h-48 overflow-hidden">
              <WPImage
                src={zone.image}
                alt={zone.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-heading text-xl font-bold text-white">{zone.name}</h3>
                <p className="text-sm text-white/80">{zone.subtitle}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button variant="outline" size="sm" href="/pricing">
          Купить билет
        </Button>
        <button onClick={openWhatToBring} className="text-sm text-text-secondary hover:text-primary transition-colors underline underline-offset-2">
          Не забудьте взять с собой →
        </button>
      </div>

      {selectedZone && <ZoneModal zone={selectedZone} onClose={() => setSelectedZone(null)} />}
    </Section>
  );
});

export default ZonesPreviewSection;
