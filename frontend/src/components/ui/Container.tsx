import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={twMerge(
        clsx('max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8', className),
      )}
    >
      {children}
    </div>
  );
}
