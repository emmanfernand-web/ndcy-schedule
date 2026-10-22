import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold-500 text-navy-950 font-semibold hover:bg-gold-400 active:bg-gold-500',
  secondary:
    'border border-line-strong text-fg hover:bg-raised',
  ghost: 'text-muted hover:text-fg hover:bg-raised',
  danger:
    'border border-danger/50 text-danger hover:bg-danger/10',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3.5 text-sm',
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-12 px-6 text-base',
};

/** Kelas tombol, bisa dipakai juga untuk <Link>. */
export function buttonClasses(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string
) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl transition-colors',
    'disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  isLoading,
  leftIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
