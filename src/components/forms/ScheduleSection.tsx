'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Check, CircleAlert } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Availability } from '@/types/database';
import type { ScheduleSectionProps } from '@/types';
import {
  availabilityWeekends,
  formatDateShort,
  weekendsFromEvents,
  type AvailabilityWeekend,
} from '@/lib/weekend';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

export interface SavedAvailability {
  cp: string[];
  lw: string[];
}

function DateToggle({
  label,
  date,
  checked,
  onChange,
}: {
  label: string;
  date: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="block cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className={cn(
          'flex min-h-16 items-center gap-3 rounded-xl border border-line px-4 py-2 transition-colors',
          'hover:border-line-strong peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500',
          checked && 'border-gold-500 bg-gold-500/10'
        )}
      >
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
            checked
              ? 'border-gold-500 bg-gold-500 text-navy-950'
              : 'border-line-strong'
          )}
        >
          {checked && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
        </span>
        <span className="flex flex-col">
          <span className="text-sm text-muted">{label}</span>
          <span className="font-medium">{formatDateShort(date)}</span>
        </span>
        <span className="ml-auto text-xs font-medium text-accent">
          {checked ? 'Bisa' : ''}
        </span>
      </span>
    </label>
  );
}

export function ScheduleSection({
  memberId,
  period,
  onSaved,
}: ScheduleSectionProps & { onSaved: (a: SavedAvailability) => void }) {
  const [cpSelected, setCpSelected] = useState<string[]>([]);
  const [lwSelected, setLwSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [eventWeekends, setEventWeekends] = useState<AvailabilityWeekend[]>([]);
  const weekends = useMemo(
    () =>
      eventWeekends.length > 0
        ? eventWeekends
        : availabilityWeekends(period.month_year),
    [eventWeekends, period.month_year]
  );
  const allCp = useMemo(() => weekends.flatMap((w) => (w.sat ? [w.sat] : [])), [weekends]);
  const allLw = useMemo(() => weekends.flatMap((w) => (w.sun ? [w.sun] : [])), [weekends]);

  // Prefill dari ketersediaan yang sudah tersimpan
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = createBrowserClient();
      const [{ data, error }, { data: evs }] = await Promise.all([
        supabase
          .from('availabilities')
          .select('cp_dates, lw_dates')
          .eq('member_id', memberId)
          .eq('month_year', period.month_year)
          .maybeSingle<Availability>(),
        supabase
          .from('schedule_events')
          .select('week_number, location, service_date')
          .eq('month_year', period.month_year),
      ]);
      if (cancelled) return;
      setEventWeekends(weekendsFromEvents(evs ?? []));
      if (error) {
        setLoadError(true);
      } else {
        setLoadError(false);
        setCpSelected(data?.cp_dates ?? []);
        setLwSelected(data?.lw_dates ?? []);
      }
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [memberId, period.month_year, attempt]);

  const toggle = (
    date: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) =>
    setter((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );

  const total = allCp.length + allLw.length;
  const count = cpSelected.length + lwSelected.length;

  const handleSubmit = () => {
    startTransition(async () => {
      setSaveError(null);
      try {
        const res = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: memberId,
            month_year: period.month_year,
            cp_dates: cpSelected,
            lw_dates: lwSelected,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          setSaveError(json.error ?? 'Terjadi kesalahan. Coba lagi.');
        } else {
          onSaved({ cp: [...cpSelected].sort(), lw: [...lwSelected].sort() });
        }
      } catch {
        setSaveError('Koneksi gagal. Periksa internet kamu lalu coba lagi.');
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-busy>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        icon={<CircleAlert className="h-6 w-6" strokeWidth={1.5} />}
        title="Gagal memuat ketersediaanmu"
      >
        <Button variant="secondary" className="mt-2" onClick={() => {
            setLoading(true);
            setAttempt((a) => a + 1);
          }}>
          Coba lagi
        </Button>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setCpSelected(allCp);
            setLwSelected(allLw);
          }}
        >
          Bisa semua
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCpSelected([]);
            setLwSelected([]);
          }}
        >
          Kosongkan
        </Button>
      </div>

      <div className="space-y-3">
        {weekends.map((w) => (
          <fieldset
            key={w.index}
            className="rounded-2xl border border-line bg-panel p-3"
          >
            <legend className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Weekend {w.index}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {w.sat && (
                <DateToggle
                  label="Sabtu · Central Park"
                  date={w.sat}
                  checked={cpSelected.includes(w.sat)}
                  onChange={() => toggle(w.sat!, setCpSelected)}
                />
              )}
              {w.sun && (
                <DateToggle
                  label="Minggu · Living World"
                  date={w.sun}
                  checked={lwSelected.includes(w.sun)}
                  onChange={() => toggle(w.sun!, setLwSelected)}
                />
              )}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Bar simpan menempel di bawah layar (sticky, jadi tidak menutupi konten akhir) */}
      <div className="sticky bottom-0 z-40 -mx-4 mt-6 border-t border-line bg-navy-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              <span className="text-accent">{count}</span> dari {total} tanggal
            </p>
            {saveError && (
              <p role="alert" className="truncate text-xs text-danger">
                {saveError}
              </p>
            )}
          </div>
          <Button variant="primary" size="lg" isLoading={isPending} onClick={handleSubmit}>
            {isPending ? 'Menyimpan' : 'Simpan Ketersediaan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
