import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Badge({
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-line-strong px-1.5 py-0.5 text-xs text-muted',
        className
      )}
      {...rest}
    />
  );
}

/** Penanda Probation: titik emas + teks, tidak hanya warna. */
export function ProbationMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden />
      Probation
    </span>
  );
}

export function CanTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-ok/15 px-1.5 py-0.5 text-xs font-medium text-ok',
        className
      )}
    >
      <Check className="h-3 w-3" aria-hidden /> Bisa
    </span>
  );
}

export function NewTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-accent',
        className
      )}
    >
      <Star className="h-3 w-3 fill-current" aria-hidden /> Baru
    </span>
  );
}
