import { Gift, Gamepad2, Trophy, ExternalLink, X } from 'lucide-react';

interface WinVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: Gamepad2,
    title: 'Сыграй в игру',
    description: 'Пройди увлекательную мини-игру от Термбурга',
  },
  {
    icon: Trophy,
    title: 'Набери очки',
    description: 'Покажи лучший результат среди участников',
  },
  {
    icon: Gift,
    title: 'Получи билет',
    description: 'Победитель получает бесплатное посещение Термбурга',
  },
];

export default function WinVisitModal({ isOpen, onClose }: WinVisitModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl border border-border/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:bg-surface-warm hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-text-primary">
            Выиграй бесплатное посещение
          </h2>
          <p className="text-sm text-text-secondary mt-2">
            Участвуй в игре и получи шанс на бесплатный билет
          </p>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-xl bg-surface-warm border border-border/30"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <step.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-text-primary">{step.title}</h3>
                </div>
                <p className="text-sm text-text-secondary">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-6 pt-0">
          <a
            href="https://termliny-game.ceosivaev.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-6 py-4 text-lg font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Играть сейчас
            <ExternalLink className="h-5 w-5" />
          </a>
          <p className="text-xs text-text-secondary text-center mt-3">
            Розыгрыш проводится еженедельно среди участников
          </p>
        </div>
      </div>
    </div>
  );
}
