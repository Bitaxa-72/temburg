import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'default' | 'success' | 'info' | 'gold';
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  gold: 'bg-primary/15 text-primary-dark font-semibold',
};

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
          variantStyles[variant],
          className,
        ),
      )}
    >
      {children}
    </span>
  );
}
