import { cn } from '@/lib/cn';

/** Panel datar: pemisah lewat border tipis, tanpa shadow. */
export function Panel({
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' }) {
  return (
    <section
      className={cn('rounded-2xl border border-line bg-panel', className)}
      {...rest}
    />
  );
}

export function SectionLabel({
  className,
  ...rest
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <h2
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.16em] text-muted',
        className
      )}
      {...rest}
    />
  );
}
