'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { formatRange, type Weekend } from '@/lib/weekend';

export function WeekendPicker({
  weekends,
  value,
  onChange,
}: {
  weekends: Weekend[];
  value: number | null;
  onChange: (n: number) => void;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
    });
  }, [value]);

  return (
    <div
      role="tablist"
      aria-label="Pilih weekend"
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
    >
      {weekends.map((w) => {
        const active = w.number === value;
        return (
          <button
            key={w.number}
            ref={active ? activeRef : undefined}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(w.number)}
            className={cn(
              'flex min-h-14 min-w-24 shrink-0 flex-col items-center justify-center rounded-xl border px-4 transition-colors',
              active
                ? 'border-gold-500 bg-gold-500/10 text-fg'
                : 'border-line text-muted hover:border-line-strong hover:text-fg'
            )}
          >
            <span className={cn('text-sm font-semibold', active && 'text-accent')}>
              Weekend {w.number}
            </span>
            <span className="text-xs">{formatRange(w.dates)}</span>
          </button>
        );
      })}
    </div>
  );
}
