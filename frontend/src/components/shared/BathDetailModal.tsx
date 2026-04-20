import { useEffect, useCallback } from 'react';
import { X, Thermometer } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import Badge from '@/components/ui/Badge';

export default function BathDetailModal() {
  const { bathDetailOpen, selectedBath, closeBathDetail, openBooking, openWhatToBring } = useBooking();

  const handleClose = useCallback(() => {
    closeBathDetail();
  }, [closeBathDetail]);

  useEffect(() => {
    if (!bathDetailOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [bathDetailOpen, handleClose]);

  if (!bathDetailOpen || !selectedBath) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bath-detail-title"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero image */}
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-2xl">
          <img
            src={selectedBath.image}
            alt={selectedBath.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <h2 id="bath-detail-title" className="font-heading text-2xl font-bold text-white mb-2">
              {selectedBath.name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                <Thermometer className="w-3.5 h-3.5 mr-1" />
                {selectedBath.temperature}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-text-primary leading-relaxed">{selectedBath.description}</p>

          {/* Features */}
          <div>
            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Особенности</h3>
            <div className="flex flex-wrap gap-2">
              {selectedBath.features.map((feature) => (
                <Badge key={feature} variant="default">{feature}</Badge>
              ))}
            </div>
          </div>

          {/* Tips */}
          {selectedBath.tips && selectedBath.tips.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">Советы</h3>
              <ol className="space-y-2">
                {selectedBath.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-text-primary">{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={() => {
              handleClose();
              setTimeout(() => openBooking(), 300);
            }}
            className="w-full rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-light active:brightness-90"
          >
            Оставить заявку
          </button>
          <button
            onClick={() => {
              handleClose();
              setTimeout(() => openWhatToBring(), 300);
            }}
            className="block w-full mt-3 text-center text-xs text-text-secondary/70 hover:text-primary transition-colors"
          >
            Не забудьте взять с собой →
          </button>
        </div>
      </div>
    </div>
  );
}
