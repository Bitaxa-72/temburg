import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Container from './Container';

interface SectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  id?: string;
  warm?: boolean;
  dark?: boolean;
  separator?: boolean;
  ornament?: boolean;
}

export default function Section({
  children,
  className,
  title,
  subtitle,
  id,
  warm = false,
  dark = false,
  separator = false,
  ornament = false,
}: SectionProps) {
  const bgClass = dark
    ? 'bg-dark-surface'
    : warm
      ? 'bg-surface-warm'
      : 'bg-background';

  return (
    <section
      id={id}
      className={twMerge(
        clsx(
          'section-padding relative',
          bgClass,
          ornament && 'ornament-pattern',
          className,
        ),
      )}
    >
      <Container>
        {title && (
          <div className="mb-6">
            <h2
              className={clsx(
                'font-heading text-3xl md:text-4xl font-bold text-center',
                dark ? 'text-white' : 'text-text-primary',
              )}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={clsx(
                  'text-lg text-center mt-4 max-w-2xl mx-auto',
                  dark ? 'text-white/70' : 'text-text-secondary',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
      {separator && <div className="gold-separator absolute bottom-0 left-0 right-0" />}
    </section>
  );
}
