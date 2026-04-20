import { X, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface ClayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const clays = [
  {
    name: 'Белая глина (каолин)',
    color: 'bg-gray-100',
    benefits: 'Очищает, отбеливает, сужает поры. Идеальна для чувствительной кожи.',
  },
  {
    name: 'Голубая глина',
    color: 'bg-sky-200',
    benefits: 'Антицеллюлитный эффект, улучшает кровообращение, разглаживает кожу.',
  },
  {
    name: 'Зелёная глина',
    color: 'bg-emerald-200',
    benefits: 'Глубокое очищение, регуляция работы сальных желёз, детокс.',
  },
  {
    name: 'Красная глина',
    color: 'bg-red-200',
    benefits: 'Насыщает кожу железом, улучшает цвет лица, снимает раздражение.',
  },
  {
    name: 'Жёлтая глина',
    color: 'bg-amber-200',
    benefits: 'Тонизирует, выводит токсины, насыщает кожу кислородом.',
  },
  {
    name: 'Чёрная глина',
    color: 'bg-gray-700 text-white',
    benefits: 'Мощный детокс, сужает поры, антибактериальный эффект.',
  },
  {
    name: 'Розовая глина',
    color: 'bg-pink-200',
    benefits: 'Деликатный уход, омоложение, питание. Для всех типов кожи.',
  },
];

export default function ClayModal({ isOpen, onClose }: ClayModalProps) {
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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border/50 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-text-primary">
                Глинвилл
              </h2>
              <p className="text-sm text-text-secondary">7 видов косметических глин</p>
            </div>
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
          <p className="text-sm text-text-secondary mb-5">
            Бесплатно для всех гостей нашего комплекса! Выберите глину по типу кожи и наслаждайтесь процедурой.
          </p>

          <div className="space-y-3">
            {clays.map((clay) => (
              <div
                key={clay.name}
                className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border/30"
              >
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 ${clay.color}`} />
                <div>
                  <h3 className="font-medium text-text-primary text-sm">{clay.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{clay.benefits}</p>
                </div>
              </div>
            ))}
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
