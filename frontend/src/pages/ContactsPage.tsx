import { useState, type ReactElement } from 'react';
import {
  Phone, MapPin, Train, Car, Bus, Mail, Clock,
  Handshake, Building2, Megaphone, Camera, PackageOpen, Send,
  Briefcase, Heart, ExternalLink, Upload,
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/shared/PageHero';
import Section from '@/components/ui/Section';
import { contactInfo as fallbackContact, type RouteDirection } from '@/data/contacts';
import { useSettings, useContactsContent } from '@/hooks/useWordPressData';
import { usePageContent } from '@/hooks/useWordPressData';
import WPContentBlocks from '@/components/shared/WPContentBlocks'; /* WP_PAGE_CONTENT_HOOK */

const routeIcons: Record<RouteDirection['icon'], typeof Train> = {
  metro: Train,
  car: Car,
  bus: Bus,
};

const routeRtt: Record<RouteDirection['icon'], string> = {
  metro: 'mt',
  car: 'auto',
  bus: 'mt',
};

const fallbackPartnerDirections = [
  { icon: Building2, title: 'Корпоративные мероприятия', description: 'Тимбилдинги, корпоративы, праздники' },
  { icon: Megaphone, title: 'Партнёрские программы', description: 'Кросс-маркетинг, совместные акции' },
  { icon: Camera, title: 'Аренда пространств', description: 'Фотосъёмки, мастер-классы, презентации' },
  { icon: PackageOpen, title: 'Поставщикам', description: 'Банные аксессуары, косметика, продукты' },
];

const partnerIconMap: Record<string, typeof Building2> = {
  building: Building2,
  megaphone: Megaphone,
  camera: Camera,
  package: PackageOpen,
};

export default function ContactsPage() {
  // WP-редактируемый контент из ACF (см. WP-админ → Контент страниц).
  // Если в админке для slug «contacts» добавлены блоки — они показываются после PageHero.
  const { data: pageContent } = usePageContent('contacts');
  const { data: contactsContent } = useContactsContent();

  const [partnerForm, setPartnerForm] = useState({ company: '', name: '', email: '', message: '' });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [resumeSubmitted, setResumeSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // WordPress settings with fallback
  const { data: settings } = useSettings();

  // Contact info from WordPress or fallback
  const contactInfo = {
    phone: settings.phone || fallbackContact.phone,
    email: settings.email || fallbackContact.email,
    address: settings.address || fallbackContact.address,
    metro: settings.metro || fallbackContact.metro,
    workingHours: settings.workingHours || fallbackContact.workingHours,
    howToGet: contactsContent.howToGet?.length ? contactsContent.howToGet : fallbackContact.howToGet,
  };

  const partnerDirections = contactsContent.partnerDirections?.length
    ? contactsContent.partnerDirections.map((dir) => ({
        ...dir,
        icon: partnerIconMap[dir.icon] || Building2,
      }))
    : fallbackPartnerDirections;

  // Social links from WordPress settings
  const socialLinks = [
    (settings.socialLinks?.max || fallbackContact.social.max) && {
      name: 'Max',
      href: settings.socialLinks?.max || fallbackContact.social.max,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 13h-2v-4l-1.5 2.5L10 11v4H8V9h2l2 3 2-3h2v6z"/></svg>,
    },
    settings.socialLinks?.vk && {
      name: 'VK',
      href: settings.socialLinks.vk,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.136.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.684 4 8.26c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.49 2.27 4.675 2.861 4.675.22 0 .322-.102.322-.66V9.87c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.475-.085.72-.576.72z"/></svg>,
    },
    settings.socialLinks?.telegram && {
      name: 'Telegram',
      href: settings.socialLinks.telegram,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    },
    settings.socialLinks?.whatsapp && {
      name: 'WhatsApp',
      href: `https://wa.me/${settings.socialLinks.whatsapp.replace(/\D/g, '')}`,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>,
    },
  ].filter(Boolean) as { name: string; href: string; icon: ReactElement }[];

  const [partnerLoading, setPartnerLoading] = useState(false);
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerLoading(true);
    try {
      await fetch('/wp-json/termburg/v1/partner-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerForm),
      });
    } catch {}
    setPartnerLoading(false);
    setPartnerSubmitted(true);
  };

  return (
    <PageLayout title="Контакты" description="Контактная информация термального комплекса Термбург. Адрес, телефон, email и схема проезда.">
      <PageHero
        title={contactsContent.heroTitle || 'Контакты'}
        backgroundImage="/images/heroes/contacts.webp"
      />
      {pageContent?.blocks?.length > 0 && <WPContentBlocks blocks={pageContent.blocks} />}

      {/* Contact info + map */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Contact info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Телефон</p>
                <a
                  href={`tel:${contactInfo.phone.replace(/[\s()-]/g, '')}`}
                  className="text-2xl font-bold text-text-primary hover:text-primary transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Адрес</p>
                <p className="text-lg font-medium text-text-primary">{contactInfo.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Train className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Метро</p>
                <p className="text-lg font-medium text-text-primary">{contactInfo.metro}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Email</p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-lg font-medium text-primary hover:text-primary-light transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-1">Часы работы</p>
                <p className="text-lg font-medium text-text-primary">{contactInfo.workingHours}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-text-secondary mb-4">Мы в социальных сетях</p>
              <div className="flex gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.name}
                    className="w-12 h-12 rounded-full bg-surface-warm flex items-center justify-center text-text-secondary hover:bg-primary hover:text-background transition-all duration-300"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Yandex Map */}
          <div className="flex flex-col gap-6">
            <div className="w-full h-80 lg:h-full min-h-[400px] rounded-2xl overflow-hidden border border-border/50">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.715830%2C55.680707&z=17&l=map&pt=37.715830%2C55.680707%2Cpm2rdm"
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
      </Section>

      {/* How to get — structured routes */}
      <Section title="Как добраться" warm>
        <div className="grid gap-6 md:grid-cols-3">
          {contactInfo.howToGet.map((route) => {
            const Icon = routeIcons[route.icon];
            return (
              <div
                key={route.id}
                className="rounded-2xl bg-surface border border-border/50 p-6 hover:border-primary/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{route.title}</h3>
                </div>

                {/* Steps */}
                <ol className="space-y-3">
                  {route.steps.map((step) => (
                    <li key={step.number} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {step.number}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-text-primary leading-relaxed">{step.text}</p>
                        {step.image && (
                          <img
                            src={step.image}
                            alt={`Шаг ${step.number}`}
                            className="mt-2 rounded-lg w-full h-32 object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Yandex Maps route button */}
                <a
                  href={`https://yandex.ru/maps/?rtext=~55.680707,37.715830&rtt=${routeRtt[route.icon]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <ExternalLink className="w-4 h-4" />
                  Построить маршрут
                </a>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Сотрудничество */}
      <Section id="partners" title={contactsContent.partnersTitle || 'Сотрудничество'} subtitle={contactsContent.partnersSubtitle || 'Открыты для партнёрства и совместных проектов'}>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — направления */}
          <div className="grid gap-4 sm:grid-cols-2 content-start">
            {partnerDirections.map((dir) => (
              <div
                key={dir.title}
                className="rounded-2xl bg-surface border border-border/50 p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <dir.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-text-primary mb-1">{dir.title}</h3>
                <p className="text-xs text-text-secondary">{dir.description}</p>
              </div>
            ))}
          </div>

          {/* Right — форма */}
          <div>
            {partnerSubmitted ? (
              <div className="rounded-2xl bg-surface border border-primary/30 p-10 text-center">
                <Handshake className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold text-text-primary mb-2">Заявка отправлена!</h3>
                <p className="text-text-secondary">Мы свяжемся с вами в ближайшее время.</p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="rounded-2xl bg-surface border border-border/50 p-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Компания</label>
                    <input
                      type="text"
                      required
                      value={partnerForm.company}
                      onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                      placeholder="ООО «Название»"
                      className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">Ваше имя</label>
                    <input
                      type="text"
                      required
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      placeholder="Иван Иванов"
                      className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="ivan@company.ru"
                    className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Сообщение</label>
                  <textarea
                    required
                    rows={3}
                    value={partnerForm.message}
                    onChange={(e) => setPartnerForm({ ...partnerForm, message: e.target.value })}
                    placeholder="Расскажите о вашем предложении..."
                    className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-light transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Отправить заявку
                  </button>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm text-primary hover:text-primary-light transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* Секция "Работа у нас" убрана — есть отдельная страница /careers */}
    </PageLayout>
  );
}
