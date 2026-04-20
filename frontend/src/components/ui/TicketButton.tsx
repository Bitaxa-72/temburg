import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TicketButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function TicketButton({
  children,
  onClick,
  className,
}: TicketButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center gap-2',
          'px-8 py-3.5 rounded-xl text-base font-medium',
          'bg-primary text-white',
          'hover:bg-primary-light',
          'transition-all duration-300 ease-out',
          'hover:-translate-y-0.5',
          'active:translate-y-0',
          'cursor-pointer',
          className,
        ),
      )}
    >
      {children}
    </button>
  );
}
