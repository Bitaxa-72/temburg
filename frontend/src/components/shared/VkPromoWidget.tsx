import { useEffect, useState } from 'react';
import { Gift, MessageCircle, X } from 'lucide-react';

interface VkPromoWidgetConfig {
  enabled: boolean;
  delay: number;
  title: string;
  text: string;
  button: string;
  url: string;
}

interface VkPromoWidgetProps {
  hidden?: boolean;
}

function getWidgetEndpoint(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try {
      return `${new URL(apiUrl).origin}/wp-json/termburg-promocodes/v1/widget`;
    } catch {
      return '/wp-json/termburg-promocodes/v1/widget';
    }
  }

  return `${window.location.origin}/wp-json/termburg-promocodes/v1/widget`;
}

function localPreviewConfig(): VkPromoWidgetConfig | null {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return null;
  }

  return {
    enabled: true,
    delay: 5,
    title: 'Промокод на первое посещение',
    text: 'Подпишитесь на VK и получите персональную скидку в сообщениях сообщества.',
    button: 'Получить во VK',
    url: 'https://vk.me/termburg',
  };
}

export default function VkPromoWidget({ hidden = false }: VkPromoWidgetProps) {
  const [config, setConfig] = useState<VkPromoWidgetConfig | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    const controller = new AbortController();

    const showFromConfig = (nextConfig: VkPromoWidgetConfig | null) => {
      if (!active || !nextConfig?.enabled || !nextConfig.url) {
        return;
      }

      setConfig(nextConfig);
      timer = window.setTimeout(() => {
        if (active) {
          setVisible(true);
        }
      }, Math.max(0, Number(nextConfig.delay) || 0) * 1000);
    };

    fetch(getWidgetEndpoint(), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => showFromConfig(data))
      .catch(() => showFromConfig(localPreviewConfig()));

    return () => {
      active = false;
      controller.abort();
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const closeWidget = () => {
    setVisible(false);
  };

  const openVk = () => {
    if (config?.url) {
      window.open(config.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!visible || hidden || !config) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md overflow-hidden rounded-2xl border border-primary/25 bg-surface shadow-2xl shadow-primary/15 md:bottom-24 md:left-auto md:right-6 md:mx-0 md:w-[360px]"
      aria-label="Промокод VK"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      <button
        type="button"
        onClick={closeWidget}
        className="absolute right-3 top-3 rounded-full p-1.5 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
        aria-label="Закрыть предложение"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-4 p-4 pr-11 sm:p-5 sm:pr-12">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Gift className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 font-heading text-lg leading-tight text-text-primary">
            {config.title}
          </p>
          <p className="mb-3 text-sm leading-relaxed text-text-secondary">
            {config.text}
          </p>

          <button
            type="button"
            onClick={openVk}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light active:brightness-95 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" />
            {config.button}
          </button>
        </div>
      </div>
    </aside>
  );
}
