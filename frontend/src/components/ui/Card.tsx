import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, dark = false, onClick }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl transition-all duration-300 p-6',
          dark
            ? 'bg-white/5 border border-white/10 hover:border-white/20'
            : 'bg-surface border border-border/50 hover:border-border',
          className,
        ),
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      {children}
    </div>
  );
}
