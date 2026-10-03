import React from 'react';

// --- Variant definitions ---

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Navy background, white text — main CTA
  primary:
    'bg-[#0A192F] text-white hover:bg-[#112240] border border-[#0A192F] disabled:opacity-50',
  // Gold background, navy text — accent CTA
  gold:
    'bg-[#D4AF37] text-[#0A192F] hover:bg-amber-400 border border-[#D4AF37] font-semibold disabled:opacity-50',
  // Outlined navy
  secondary:
    'bg-white text-[#0A192F] border border-[#0A192F] hover:bg-slate-50 disabled:opacity-50',
  // Transparent
  ghost:
    'bg-transparent text-[#0A192F] hover:bg-slate-100 border border-transparent disabled:opacity-50',
  // Destructive
  danger:
    'bg-red-600 text-white hover:bg-red-700 border border-red-600 disabled:opacity-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition-all duration-200 cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
