import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink, BookOpen, Calendar } from 'lucide-react';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';

interface NewsItem {
  id: number | string;
  title?: string;
  text: string;
  date: string;
  image?: string;
  link?: string;
}

interface DzenArticle {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  image: string;
  date: string;
}

interface NewsData {
  news: NewsItem[];
  dzenArticles: DzenArticle[];
  dzenChannel: string;
}

const fallbackNews = [
  {
    id: 1,
    title: 'Открытие новой травяной парной',
    date: '2026-02-15',
    image: '/images/complex/gallery1.webp',
  },
  {
    id: 2,
    title: 'Зимний фестиваль парения',
    date: '2026-02-01',
    image: '/images/complex/gallery2.webp',
  },
  {
    id: 3,
    title: 'Новые программы парений',
    date: '2026-01-20',
    image: '/images/complex/gallery3.webp',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

function getTitle(text: string): string {
  return text.split('\n')[0].slice(0, 100);
}

export default function NewsPreviewSection() {
  const [news, setNews] = useState<{ id: number | string; title: string; date: string; image?: string }[]>(fallbackNews);
  const [dzenPreview, setDzenPreview] = useState<DzenArticle[]>([]);
  const [dzenChannel, setDzenChannel] = useState('https://dzen.ru/id/652f7beb5939720dfbfa6bc8');

  useEffect(() => {
    let cancelled = false;
    async function fetchNews() {
      try {
        // Fetch from WordPress API
        const res = await fetch('/wp-json/wp/v2/news?per_page=6&_fields=id,title,date,featured_media,_links&_embed');
        if (!res.ok) throw new Error('WP API failed');
        const posts = await res.json();
        if (!cancelled && Array.isArray(posts) && posts.length > 0) {
          setNews(
            posts.slice(0, 6).map((post: any) => ({
              id: post.id,
              title: post.title?.rendered || 'Новость',
              date: post.date,
              image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/complex/gallery1.webp',
            }))
          );
        }
      } catch {
        // keep fallback
      }
    }
    fetchNews();
    return () => { cancelled = true; };
  }, []);

  return (
    <Section title="Новости и статьи" subtitle="Будьте в курсе событий Термбурга">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Left column - first 3 */}
        <div>
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Последние новости</h3>
          <div className="space-y-3">
            {news.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to="/news"
                className="flex items-center gap-4 rounded-xl bg-surface border border-border/50 p-3 hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || 'Новость Термбурга'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-warm flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-text-secondary/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            to="/news"
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary font-medium hover:text-primary-light transition-colors"
          >
            Все новости
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right column - news 4-6 */}
        {news.length > 3 && (
        <div>
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">&nbsp;</h3>
          <div className="space-y-3">
            {news.slice(3, 6).map((item) => (
              <Link
                key={item.id}
                to="/news"
                className="flex items-center gap-4 rounded-xl bg-surface border border-border/50 p-3 hover:border-primary/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title || 'Новость Термбурга'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-warm flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-text-secondary/30" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        )}
      </div>
    </Section>
  );
}
