import { useState, useEffect, useMemo } from 'react';
import { Calendar, ExternalLink, ChevronDown, Filter, BookOpen } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

interface NewsItem {
  id: number | string;
  source?: string;
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

// Static fallback data
const fallbackNews: NewsItem[] = [
  {
    id: 1,
    text: 'Открытие новой травяной парной\n\nМы рады представить обновлённую травяную парную с расширенным набором целебных трав и новой системой подачи пара.',
    date: '2026-02-15',
    image: '/images/complex/gallery1.webp',
    link: 'https://max.ru/termburg',
  },
  {
    id: 2,
    text: 'Зимний фестиваль парения\n\nС 1 по 28 февраля приглашаем на зимний фестиваль парения — мастер-классы, авторские программы и подарки для гостей.',
    date: '2026-02-01',
    image: '/images/complex/gallery2.webp',
    link: 'https://max.ru/termburg',
  },
  {
    id: 3,
    text: 'Новые SPA-программы\n\nВ нашем меню появились три новые SPA-программы: «Сибирский ритуал», «Восточная сказка» и «Скандинавский детокс».',
    date: '2026-01-20',
    image: '/images/complex/gallery3.webp',
    link: 'https://max.ru/termburg',
  },
  {
    id: 4,
    text: 'Расширение школы плавания\n\nШкола плавания Термбурга теперь принимает детей от 4 лет. Новые группы по субботам и воскресеньям.',
    date: '2026-01-10',
    image: '/images/complex/gallery4.webp',
    link: 'https://max.ru/termburg',
  },
  {
    id: 5,
    text: 'Новогодние акции в Термбурге\n\nС 25 декабря по 8 января — праздничные скидки на абонементы и подарочные сертификаты.',
    date: '2025-12-25',
    image: '/images/complex/gallery5.webp',
    link: 'https://max.ru/termburg',
  },
  {
    id: 6,
    text: 'Обновление зоны отдыха\n\nМы обновили зону отдыха на втором этаже: новые шезлонги, подвесные кресла и расширенное чайное меню.',
    date: '2025-12-15',
    image: '/images/complex/sauna.webp',
    link: 'https://max.ru/termburg',
  },
];

const ITEMS_PER_PAGE = 12;

type DateFilter = 'all' | 'today' | 'week' | 'month';

const filterLabels: Record<DateFilter, string> = {
  all: 'Все',
  today: 'Сегодня',
  week: 'Неделя',
  month: 'Месяц',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Декодирует HTML-сущности (&#8230; → …, &amp; → & и т.п.)
function decodeEntities(s: string): string {
  if (!s) return '';
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

function getTitle(text: string): string {
  const firstLine = decodeEntities(text.split('\n')[0]);
  return firstLine.length > 100 ? firstLine.slice(0, 100) + '...' : firstLine;
}

function getBody(text: string): string {
  const lines = text.split('\n').filter(Boolean);
  if (lines.length <= 1) return '';
  return decodeEntities(lines.slice(1).join(' ').trim());
}

function filterByDate(items: NewsItem[], filter: DateFilter): NewsItem[] {
  if (filter === 'all') return items;

  const now = new Date();
  const start = new Date(now);

  switch (filter) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
  }

  return items.filter((item) => new Date(item.date) >= start);
}

export default function NewsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «news» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('news');

  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [dzenArticles, setDzenArticles] = useState<DzenArticle[]>([]);
  const [dzenChannel, setDzenChannel] = useState('https://dzen.ru/id/652f7beb5939720dfbfa6bc8');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      try {
        // Try WordPress API first
        const wpRes = await fetch('/wp-json/wp/v2/news?per_page=20&_embed');
        if (wpRes.ok) {
          const wpData = await wpRes.json();
          if (!cancelled && Array.isArray(wpData) && wpData.length > 0) {
            setNews(wpData.map((post: any) => ({
              id: post.id,
              text: (post.title?.rendered || '') + '\n\n' + (post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || post.content?.rendered?.replace(/<[^>]*>/g, '') || ''),
              date: post.date?.split('T')[0] || '',
              image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || post.featured_image_url || '',
              link: post.link || '',
            })));
            if (!cancelled) setLoading(false);
            return;
          }
        }
        // Fallback to static news.json
        const res = await fetch('/data/news.json');
        if (!res.ok) throw new Error('fetch failed');
        const data: NewsData = await res.json();
        if (!cancelled) {
          if (data.news?.length > 0) {
            setNews(data.news.map((item) => ({
              ...item,
              text: item.title ? `${item.title}\n\n${item.text}` : item.text,
            })));
          }
          if (data.dzenArticles?.length > 0) {
            setDzenArticles(data.dzenArticles);
          }
          if (data.dzenChannel) {
            setDzenChannel(data.dzenChannel);
          }
        }
      } catch {
        // Fallback already set
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNews();
    return () => { cancelled = true; };
  }, []);

  const filteredNews = useMemo(() => filterByDate(news, dateFilter), [news, dateFilter]);
  const visibleNews = filteredNews.slice(0, visibleCount);
  const hasMore = visibleCount < filteredNews.length;

  return (
    <PageLayout title="Новости" description="Новости и события термального комплекса Термбург.">
      <PageHero
        title="Новости"
        subtitle="Следите за событиями и обновлениями Термбурга"
        backgroundImage="/images/heroes/news.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      <Section>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Filter className="h-4 w-4 text-text-secondary" />
          {(Object.keys(filterLabels) as DateFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setDateFilter(key); setVisibleCount(ITEMS_PER_PAGE); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                dateFilter === key
                  ? 'bg-primary text-white'
                  : 'bg-surface-warm text-text-secondary hover:text-text-primary'
              }`}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-surface border border-border/30 overflow-hidden">
                <div className="h-64 bg-surface-warm" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-warm rounded w-3/4" />
                  <div className="h-3 bg-surface-warm rounded w-full" />
                  <div className="h-3 bg-surface-warm rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* News grid */}
        {!loading && (
          <>
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-text-secondary">Новостей за этот период нет</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {visibleNews.map((item) => {
                  const title = getTitle(item.text);
                  const body = getBody(item.text);

                  return (
                    <article
                      key={item.id}
                      className="group rounded-2xl bg-surface border border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {/* Image */}
                      {item.image && (
                        <div className="relative h-64 overflow-hidden">
                          <img
                            src={item.image}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5">
                        {/* Date */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                          <time className="text-xs text-text-secondary">{formatDate(item.date)}</time>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-text-primary mb-2">
                          {title}
                        </h3>

                        {/* Body */}
                        {body && (
                          <p className="text-sm text-text-secondary line-clamp-5 mb-4">{body}</p>
                        )}

                        {/* Link */}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-light transition-colors"
                          >
                            Читать в Max
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Section>

      {/* Dzen section */}
      {dzenArticles.length > 0 && (
      <Section warm title="Читайте на Дзене" subtitle="Полезные статьи о бане, здоровье и отдыхе">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dzenArticles.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-surface border border-border/50 overflow-hidden transition-all duration-300 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={article.image}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-orange-500/90 text-white text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Дзен
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <time className="text-xs text-text-secondary mb-2 block">{formatDate(article.date)}</time>
                <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {decodeEntities(article.title)}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2">{decodeEntities(article.excerpt)}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={dzenChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary-light transition-colors"
          >
            Все статьи на Дзен
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </Section>
      )}

      {/* Load more for news */}
      {!loading && hasMore && (
        <Section>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/20 px-6 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              Загрузить ещё
            </button>
          </div>
        </Section>
      )}
    </PageLayout>
  );
}
