import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({
  className = '',
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    error: 'bg-rose-50 text-rose-800 border-rose-200/80',
    info: 'bg-teal-50 text-teal-800 border-teal-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
