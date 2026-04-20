import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'termburg_cookie_consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const closeBanner = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'dismissed');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-dark-surface border-t border-dark-border
        transform transition-transform duration-500 ease-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon & Text */}
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/80">
              Мы используем cookies для улучшения работы сайта.
              Продолжая использовать сайт, вы соглашаетесь с{' '}
              <Link
                to="/privacy"
                className="text-primary hover:text-primary-light underline underline-offset-2"
              >
                политикой конфиденциальности
              </Link>
              .
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={acceptCookies}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              Принять
            </button>
            <button
              type="button"
              onClick={closeBanner}
              className="p-2 text-white/50 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
