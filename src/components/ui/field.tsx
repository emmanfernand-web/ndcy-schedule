import { cn } from '@/lib/cn';

export const inputClass =
  'min-h-11 w-full rounded-xl border border-line-strong bg-panel px-3.5 text-base text-fg placeholder:text-muted/70 focus:border-gold-500';

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
