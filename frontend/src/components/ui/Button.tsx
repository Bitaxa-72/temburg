import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  href?: string;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-primary-dark text-white hover:bg-primary active:bg-primary-dark shadow-md hover:shadow-lg',
  accent:
    'bg-accent text-white hover:bg-accent-light active:bg-accent shadow-md hover:shadow-lg',
  outline:
    'border-2 border-primary-dark text-primary-dark hover:bg-primary-dark hover:text-white',
  ghost:
    'text-primary-dark hover:bg-surface-warm active:bg-surface-warm/80',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-10 py-4 text-lg rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  href,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = twMerge(
    clsx(
      'inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none',
      variantStyles[variant],
      sizeStyles[size],
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      className,
    ),
  );

  if (href) {
    // Internal links use react-router Link for SPA navigation
    if (href.startsWith('/')) {
      return (
        <Link to={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
