import { X, CheckCircle2, Info, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

interface WhatToBringModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const items = [
  'Полотенце',
  'Купальник',
  'Шлёпки или резиновые тапочки',
  'Мочалка, шампунь, гель для душа',
  'Расчёска',
  'Полотенце для головы или банную шапочку',
];

export default function WhatToBringModal({ isOpen, onClose }: WhatToBringModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-sky-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-sky-600" />
            </div>
            <h2 className="font-heading text-xl font-bold text-text-primary">
              Не забудьте взять с собой
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-text-primary">
                <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Notice */}
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/50">
              <ShoppingBag className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Если вы что-то забудете — не переживайте! Всё можно приобрести на ресепшен.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
