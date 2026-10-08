import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading = false,
      icon,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isBtnLoading = isLoading || loading;
    const effectiveLeftIcon = leftIcon || icon;

    // Base styles: consistent typography, focus ring, transition, touch target
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    // Standardized variants using single primary brand rule
    const variantStyles = {
      primary:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-xs border border-teal-700/30',
      secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:border-slate-400',
      destructive:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700/30',
      ghost:
        'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
      link:
        'text-teal-600 hover:text-teal-700 underline-offset-4 hover:underline p-0 h-auto font-medium',
    };

    // Standardized sizes
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 h-9.5 gap-2',
      lg: 'text-sm px-5 py-2.5 h-11 gap-2.5',
      icon: 'h-9.5 w-9.5 p-0 shrink-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isBtnLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isBtnLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : effectiveLeftIcon ? (
          <span className="shrink-0">{effectiveLeftIcon}</span>
        ) : null}
        {children}
        {!isBtnLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
