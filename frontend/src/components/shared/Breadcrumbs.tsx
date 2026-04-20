import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Droplets, Calendar, Gift, Newspaper, Phone, Utensils, Users, Award, FileText, Lock, BookOpen, Map, Camera, Bath, CircleDot } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://termburg.ru';

// Карта роутов для человекочитаемых названий
const routeNames: Record<string, string> = {
  '': 'Главная',
  'about': 'О Термбурге',
  'termliny': 'Термлины',
  'services': 'Услуги',
  'pricing': 'Прайс-лист',
  'schedule': 'Расписание',
  'swimming-school': 'Школа плавания',
  'steam-school': 'Школа парения',
  'steam-rooms': 'Парные',
  'family': 'Семейный отдых',
  'promotions': 'Акции',
  'news': 'Новости',
  'contacts': 'Контакты',
  'cafe': 'Кафетерий',
  'partners': 'Сотрудничество',
  'careers': 'Вакансии',
  'offer': 'Публичная оферта',
  'privacy': 'Политика конфиденциальности',
  'rules': 'Правила комплекса',
  'login': 'Вход',
  'account': 'Личный кабинет',
  'map': 'Карта комплекса',
  'gallery': 'Фотогалерея',
  'pools': 'Бассейны',
  'jacuzzi': 'Джакузи',
  'plunge-pools': 'Купели',
  'faq': 'Вопросы и ответы',
  'corporate': 'Корпоративный отдых',
};

// Группировка для иерархии
const routeParents: Record<string, string> = {
  'swimming-school': 'services',
  'steam-school': 'services',
  'steam-rooms': 'services',
  'family': 'services',
  'cafe': 'services',
  'pools': 'services',
  'jacuzzi': 'services',
  'plunge-pools': 'services',
  'termliny': 'about',
  'careers': 'contacts',
  'partners': 'contacts',
};

// Иконки для секций
const routeIcons: Record<string, React.ReactNode> = {
  '': <Home className="w-3.5 h-3.5" />,
  'about': <Sparkles className="w-3.5 h-3.5" />,
  'termliny': <Sparkles className="w-3.5 h-3.5" />,
  'services': <Bath className="w-3.5 h-3.5" />,
  'pricing': <FileText className="w-3.5 h-3.5" />,
  'schedule': <Calendar className="w-3.5 h-3.5" />,
  'promotions': <Gift className="w-3.5 h-3.5" />,
  'news': <Newspaper className="w-3.5 h-3.5" />,
  'contacts': <Phone className="w-3.5 h-3.5" />,
  'cafe': <Utensils className="w-3.5 h-3.5" />,
  'partners': <Users className="w-3.5 h-3.5" />,
  'careers': <Award className="w-3.5 h-3.5" />,
  'offer': <FileText className="w-3.5 h-3.5" />,
  'privacy': <Lock className="w-3.5 h-3.5" />,
  'rules': <BookOpen className="w-3.5 h-3.5" />,
  'map': <Map className="w-3.5 h-3.5" />,
  'gallery': <Camera className="w-3.5 h-3.5" />,
  'pools': <Droplets className="w-3.5 h-3.5" />,
  'jacuzzi': <CircleDot className="w-3.5 h-3.5" />,
  'steam-rooms': <Bath className="w-3.5 h-3.5" />,
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Не показываем на главной
  if (pathSegments.length === 0) return null;

  // Строим цепочку крошек
  const crumbs: { path: string; label: string }[] = [
    { path: '/', label: 'Главная' },
  ];

  // Если есть родитель — добавляем его
  const currentSegment = pathSegments[pathSegments.length - 1];
  const parent = routeParents[currentSegment];

  if (parent) {
    crumbs.push({
      path: `/${parent}`,
      label: routeNames[parent] || parent,
    });
  }

  // Добавляем текущую страницу
  const currentPath = `/${pathSegments.join('/')}`;
  const currentLabel = routeNames[currentSegment] || currentSegment;
  crumbs.push({
    path: currentPath,
    label: currentLabel,
  });

  // Schema.org BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };

  // Получить иконку для сегмента
  const getIcon = (segment: string) => {
    return routeIcons[segment] || null;
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      <nav
        aria-label="Хлебные крошки"
        className="relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-warm/80 via-surface/60 to-surface-warm/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.05),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 py-3 text-sm overflow-x-auto scrollbar-hide">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const segment = crumb.path.split('/').filter(Boolean).pop() || '';
              const icon = index === 0 ? <Home className="w-3.5 h-3.5" /> : getIcon(segment);

              return (
                <li key={crumb.path} className="flex items-center gap-2 whitespace-nowrap">
                  {index > 0 && (
                    <span className="text-primary/40 font-light select-none">/</span>
                  )}

                  {isLast ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-xs border border-primary/20">
                      {icon}
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-text-secondary hover:text-primary hover:bg-primary/5 transition-all duration-200 text-xs"
                    >
                      {icon && (
                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                          {icon}
                        </span>
                      )}
                      <span>{crumb.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </nav>
    </>
  );
}
