import { useState, useEffect } from 'react';

interface UrgentNewsBannerProps {
  message: string;
  active: boolean;
}

const STORAGE_KEY = 'termburg-urgent-banner-dismissed';

export default function UrgentNewsBanner({ message, active }: UrgentNewsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(true);
    }
  }, [message]);

  if (!active || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, message);
    setDismissed(true);
  };

  return (
    <div className="relative z-40 bg-amber-500 text-amber-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          {/* Megaphone icon */}
          <svg
            className="h-5 w-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 11 18-5v12L3 13v-2z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
          <p className="text-sm font-medium truncate">{message}</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 hover:bg-amber-600/30 transition-colors"
          aria-label="Закрыть объявление"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
