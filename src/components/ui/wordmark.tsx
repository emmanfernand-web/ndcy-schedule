import { cn } from '@/lib/cn';

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.2em] text-accent',
        className
      )}
    >
      NDCYC
    </span>
  );
}
