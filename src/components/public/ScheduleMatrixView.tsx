'use client';

import { useMemo, useState } from 'react';
import { CalendarX, Shirt } from 'lucide-react';
import type { ScheduleMatrixViewProps } from '@/types';
import type { MemberRole } from '@/types/database';
import { INSTRUMENTS } from '@/lib/constant';
import {
  locationName,
  dresscodeSwatches,
  formatDateShort,
  groupWeekends,
  matchesWeekend,
} from '@/lib/weekend';
import { WeekendPicker } from '@/components/ui/weekend-picker';
import { RoleIcon } from '@/components/ui/role-icon';
import { ProbationMark } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionLabel } from '@/components/ui/panel';
import { SongListView } from './SongListView';
import { cn } from '@/lib/cn';

export function ScheduleMatrixView({
  events,
  songs,
  initialWeekend,
}: ScheduleMatrixViewProps) {
  const weekends = useMemo(() => groupWeekends(events), [events]);
  const [weekendNo, setWeekendNo] = useState<number | null>(
    initialWeekend ?? weekends[0]?.number ?? null
  );
  const [locChoice, setLocChoice] = useState<string | null>(null);

  const weekend = weekends.find((w) => w.number === weekendNo) ?? null;

  const handleWeekend = (n: number) => {
    setWeekendNo(n);
    setLocChoice(null);
    const url = new URL(window.location.href);
    url.searchParams.set('weekend', String(n));
    window.history.replaceState(null, '', url);
  };

  if (!weekend) {
    return (
      <EmptyState
        icon={<CalendarX className="h-6 w-6" strokeWidth={1.5} />}
        title="Belum ada jadwal"
      >
        Jadwal bulan ini belum dipublikasikan. Cek lagi nanti ya.
      </EmptyState>
    );
  }

  // Tab lokasi: satu per lokasi, urut tanggal
  const locations: { loc: string; date: string }[] = [];
  for (const e of weekend.events) {
    if (!locations.some((l) => l.loc === e.location)) {
      locations.push({ loc: e.location, date: e.service_date });
    }
  }
  const activeLoc =
    locations.find((l) => l.loc === locChoice)?.loc ?? locations[0]?.loc;
  const locEvents = weekend.events.filter((e) => e.location === activeLoc);

  const weekendSongs = songs.filter((s) =>
    matchesWeekend(s.weekend_dates, weekend.dates)
  );
  const hasTeam = weekend.events.some(
    (e) => (e.schedule_assignments ?? []).length > 0
  );

  return (
    <div className="space-y-8">
      <WeekendPicker
        weekends={weekends}
        value={weekendNo}
        onChange={handleWeekend}
      />

      <section className="space-y-4" aria-label="Tim pelayan">
        <div
          role="tablist"
          aria-label="Lokasi"
          className="grid grid-cols-1 gap-1 rounded-xl border border-line bg-panel p-1 min-[420px]:grid-cols-2"
        >
          {locations.map(({ loc, date }) => {
            const active = loc === activeLoc;
            return (
              <button
                key={loc}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setLocChoice(loc)}
                className={cn(
                  'min-h-11 rounded-lg px-3 text-sm transition-colors',
                  active
                    ? 'bg-gold-500/10 font-semibold text-fg ring-1 ring-gold-500'
                    : 'text-muted hover:text-fg'
                )}
              >
                {locationName(loc)} · {formatDateShort(date)}
              </button>
            );
          })}
        </div>

        {locEvents.map((event) => {
          const byRole = new Map<MemberRole, typeof event.schedule_assignments>();
          for (const a of event.schedule_assignments ?? []) {
            byRole.set(a.role, [...(byRole.get(a.role) ?? []), a]);
          }
          const swatches = event.dresscode
            ? dresscodeSwatches(event.dresscode)
            : [];

          return (
            <div key={event.id} className="space-y-4">
              {locEvents.length > 1 && (
                <SectionLabel>{event.sub_service}</SectionLabel>
              )}

              {event.dresscode && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <Shirt className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
                  <span className="text-muted">Dresscode</span>
                  <span className="font-medium">{event.dresscode}</span>
                  {swatches.length > 0 && (
                    <span className="flex items-center gap-1.5" aria-hidden>
                      {swatches.map((s) => (
                        <span
                          key={s.name}
                          title={s.name}
                          className="h-4 w-4 rounded-full border border-line-strong"
                          style={{ backgroundColor: s.hex }}
                        />
                      ))}
                    </span>
                  )}
                </p>
              )}

              {!hasTeam ? (
                <EmptyState title="Tim weekend ini belum ditentukan">
                  Admin sedang menyusun jadwal. Cek lagi nanti ya.
                </EmptyState>
              ) : (
                <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {INSTRUMENTS.map((inst) => {
                    const list = byRole.get(inst.id) ?? [];
                    return (
                      <li
                        key={inst.id}
                        className="rounded-2xl border border-line bg-panel p-4"
                      >
                        <p className="flex items-center gap-2 text-sm font-medium text-muted">
                          <RoleIcon role={inst.id} className="h-4 w-4" />
                          {inst.label}
                        </p>
                        {list.length > 0 ? (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {list.map((a) => (
                              <li
                                key={a.id}
                                className="rounded-lg bg-raised px-3 py-1.5"
                              >
                                <span className="font-medium">
                                  {a.members?.name}
                                </span>
                                {a.members?.is_probation && (
                                  <ProbationMark className="ml-2" />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm italic text-muted">
                            Belum ditentukan
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </section>

      <section className="space-y-3" aria-label="Songlist">
        <SectionLabel>Songlist · Weekend {weekend.number}</SectionLabel>
        <SongListView songs={weekendSongs} />
      </section>
    </div>
  );
}
