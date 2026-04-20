import { Phone, MapPin, Train, Clock } from 'lucide-react';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import { contactInfo } from '@/data/contacts';

const contactItems = [
  {
    icon: Phone,
    label: 'Телефон',
    value: contactInfo.phone,
    href: `tel:${contactInfo.phone.replace(/[\s()-]/g, '')}`,
    highlight: true,
  },
  {
    icon: MapPin,
    label: 'Адрес',
    value: contactInfo.address,
  },
  {
    icon: Train,
    label: 'Метро',
    value: contactInfo.metro,
  },
  {
    icon: Clock,
    label: 'Режим работы',
    value: contactInfo.workingHours,
  },
];

export default function ContactsPreviewSection() {
  return (
    <Section
      warm
      title="Контакты"
      subtitle="Мы всегда рады вас видеть"
    >
      <div className="max-w-2xl mx-auto">
        <div className="space-y-5">
          {contactItems.map((item) => {
            const content = (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p
                    className={`font-medium ${
                      item.highlight
                        ? 'font-heading text-xl text-primary'
                        : 'text-text-primary'
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            );

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="block rounded-xl p-4 bg-surface border border-border/50 hover:border-border transition-all"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={item.label}
                className="rounded-xl p-4 bg-surface border border-border/50"
              >
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button variant="primary" href="/contacts">
            Как добраться
          </Button>
        </div>
      </div>
    </Section>
  );
}
