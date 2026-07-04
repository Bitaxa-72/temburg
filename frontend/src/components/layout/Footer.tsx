import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { contactInfo as fallbackContact } from '@/data/contacts';
import { useFooter } from '@/hooks/useWordPressData';

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export default function Footer() {
  const { data: footer } = useFooter();
  const externalLinks = (footer.externalLinks || []).filter((link) => isExternalUrl(link.url));
  const coordinates = fallbackContact.coordinates;
  const navCol1 = [
    { to: '/about', label: footer.nav?.about || 'О Термбурге' },
    { to: '/termliny', label: footer.nav?.termliny || 'Термлины' },
    { to: '/services', label: footer.nav?.services || 'Услуги' },
    { to: '/swimming-school', label: footer.nav?.swimmingSchool || 'Школа плавания' },
    { to: '/steam-school', label: footer.nav?.steamSchool || 'Школа парения' },
    { to: '/schedule', label: footer.nav?.schedule || 'Расписание' },
    { to: '/pricing', label: footer.nav?.pricing || 'Прайс-лист' },
  ].filter((link) => link.label);
  const navCol2 = [
    { to: '/promotions', label: footer.nav?.promotions || 'Акции' },
    { to: '/news', label: footer.nav?.news || 'Новости' },
    { to: '/cafe', label: footer.nav?.cafe || 'Кафетерий' },
    { to: '/contacts', label: footer.nav?.contacts || 'Контакты' },
  ].filter((link) => link.label);
  const bottomLinks = [
    { to: '/partners', label: footer.bottomLinks?.partners || 'Сотрудничество' },
    { to: '/careers', label: footer.bottomLinks?.careers || 'Вакансии' },
    { to: '/offer', label: footer.bottomLinks?.offer || 'Публичная оферта' },
    { to: '/privacy', label: footer.bottomLinks?.privacy || 'Политика конфиденциальности' },
    { to: '/soglasie-na-obrabotku-personalnyh-dannyh', label: 'Согласие на обработку персональных данных' },
    { to: '/rules', label: footer.bottomLinks?.rules || 'Правила комплекса' },
  ].filter((link) => link.label);

  return (
    <footer className="relative bg-dark-surface ornament-pattern">
      <div className="gold-separator" />

      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={footer.logoUrl || '/favicon.ico'}
                alt=""
                className="h-7 w-7 object-contain md:h-8 md:w-8"
              />
              <span className="font-heading text-xl font-bold tracking-[0.2em] text-primary md:text-2xl">
                {footer.brandText}
              </span>
            </Link>
            {footer.description && (
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {footer.description}
              </p>
            )}

            {externalLinks.length > 0 && (
              <div className="mt-6">
                {footer.linksTitle && (
                  <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                    {footer.linksTitle}
                  </h3>
                )}
                <div className="flex flex-wrap gap-2">
                  {externalLinks.map((link) => (
                    <a
                      key={`${link.label}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/60 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                {footer.navTitle || 'Навигация'}
              </h3>
              <nav className="flex flex-col gap-2">
                {navCol1.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                &nbsp;
              </h3>
              <nav className="flex flex-col gap-2">
                {navCol2.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              {footer.contactsTitle}
            </h3>
            <div className="flex flex-col gap-3">
              {footer.phone && (
                <a
                  href={`tel:${footer.phone.replace(/[\s()-]/g, '')}`}
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-primary"
                >
                  {footer.phone}
                </a>
              )}
              {footer.address && <p className="text-sm text-white/60">{footer.address}</p>}
              {footer.metro && <p className="text-sm text-white/60">{footer.metro}</p>}
              {footer.email && (
                <a
                  href={`mailto:${footer.email}`}
                  className="text-sm text-white/60 transition-colors duration-200 hover:text-primary"
                >
                  {footer.email}
                </a>
              )}
              {footer.workingHours && <p className="text-xs text-white/40">{footer.workingHours}</p>}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              {footer.mapTitle || 'На карте'}
            </h3>
            <div className="w-full h-48 rounded-xl overflow-hidden border border-dark-border">
              <iframe
                src={`https://yandex.ru/map-widget/v1/?ll=${coordinates.lng}%2C${coordinates.lat}&z=16&l=map&pt=${coordinates.lng}%2C${coordinates.lat}%2Cpm2rdm`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                title="Термбург на карте"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-dark-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {footer.copyright && (
            <p className="text-sm text-white/40">{footer.copyright}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {bottomLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-white/40 transition-colors duration-200 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
