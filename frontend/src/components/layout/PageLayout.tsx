import { Helmet } from 'react-helmet-async';
import { useMatch, useLocation } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import InfoTicker from '@/components/sections/home/InfoTicker';
import UrgentNewsBanner from '@/components/shared/UrgentNewsBanner';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { getSeo } from '@/seo/seoConfig';

const SITE_URL = 'https://termburg.ru';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  ogImage?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

// WebSite schema with search action
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Термбург',
  description: 'Термальный комплекс в Москве',
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'ru-RU',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HealthAndBeautyBusiness',
  '@id': `${SITE_URL}/#organization`,
  name: 'Термбург',
  alternateName: 'Termburg',
  description: 'Термальный комплекс в Москве. 12 видов парных, SPA-процедуры, бассейн, школа плавания.',
  url: SITE_URL,
  logo: `${SITE_URL}/images/termburg-logo.svg`,
  image: [
    `${SITE_URL}/images/og-default.jpg`,
    `${SITE_URL}/images/complex/pool.webp`,
    `${SITE_URL}/images/complex/gallery1.webp`,
  ],
  telephone: '+7 (909) 167-47-46',
  email: 'info@termburg.ru',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ул. Гурьянова, д. 30, 2 этаж',
    addressLocality: 'Москва',
    postalCode: '109388',
    addressRegion: 'Москва',
    addressCountry: 'RU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 55.680707,
    longitude: 37.71583,
  },
  hasMap: 'https://yandex.ru/maps/-/CDFgJ0fh',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '23:00',
    },
  ],
  priceRange: '₽₽',
  currenciesAccepted: 'RUB',
  paymentAccepted: 'Cash, Credit Card, Debit Card',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Бассейн', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Парковка', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Детская зона', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Кафетерий', value: true },
  ],
  sameAs: [
    'https://vk.com/termburg',
    'https://t.me/termburg',
  ],
};

export default function PageLayout({ children, title, description, ogImage, schema }: PageLayoutProps) {
  const isHomePage = !!useMatch('/');
  const location = useLocation();
  // Fallback на централизованный seoConfig если страница не передала свои meta
  const fallback = getSeo(location.pathname);
  const effectiveTitle = title || fallback.title;
  const effectiveDescription = description || fallback.description;
  // Не дублируем " | Термбург" если бренд уже в title
  const alreadyHasBrand = /Термбург/i.test(effectiveTitle);
  const fullTitle = isHomePage || alreadyHasBrand ? effectiveTitle : `${effectiveTitle} | Термбург`;
  const canonicalUrl = `${SITE_URL}${location.pathname}`;
  const ogImageUrl = ogImage || fallback.ogImage || `${SITE_URL}/images/og-default.jpg`;

  // Combine all schemas
  const allSchemas = [jsonLd, websiteSchema, ...(schema ? (Array.isArray(schema) ? schema : [schema]) : [])];

  return (
    <>
      <Helmet>
        <title>{fullTitle}</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="yandex" content="index, follow" />
        {effectiveDescription && <meta name="description" content={effectiveDescription} />}
        <meta property="og:title" content={fullTitle} />
        {effectiveDescription && <meta property="og:description" content={effectiveDescription} />}
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Термбург" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={effectiveTitle} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        {effectiveDescription && <meta name="twitter:description" content={effectiveDescription} />}
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="geo.region" content="RU-MOW" />
        <meta name="geo.placename" content="Москва" />
        <meta name="geo.position" content="55.680707;37.71583" />
        <meta name="ICBM" content="55.680707, 37.71583" />
        {allSchemas.map((s, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
        ))}
      </Helmet>
      <div className="flex min-h-screen flex-col">
        <Header />
        <UrgentNewsBanner
          message="Внимание! Сегодня комплекс работает до 21:00"
          active={false}
        />
        <main className={`flex-1 ${isHomePage ? '' : 'pt-16 md:pt-20'}`}>
          {!isHomePage && <Breadcrumbs />}
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
