'use client';

import { Plus, X } from 'lucide-react';
import type { Member, MemberRole, ScheduleEvent } from '@/types/database';
import { INSTRUMENTS } from '@/lib/constant';
import { formatDateShort, locationKey, locationName } from '@/lib/weekend';
import { RoleIcon } from '@/components/ui/role-icon';
import { ProbationMark } from '@/components/ui/badge';
import type { PickerTarget } from './MemberPicker';

export type AssignmentMap = Record<string, Partial<Record<MemberRole, Member[]>>>;

export function eventTitle(e: ScheduleEvent, withSub: boolean) {
  const base = `${locationName(e.location)} · ${formatDateShort(e.service_date)}`;
  return withSub && e.sub_service ? `${base} · ${e.sub_service}` : base;
}

export function TeamEditor({
  events,
  assignments,
  onOpenPicker,
  onRemove,
}: {
  events: ScheduleEvent[];
  assignments: AssignmentMap;
  onOpenPicker: (t: PickerTarget) => void;
  onRemove: (eventId: string, role: MemberRole, memberId: string) => void;
}) {
  const multiSub = events.length > 2;

  return (
    <ul className="space-y-3">
      {INSTRUMENTS.map((inst) => (
        <li key={inst.id} className="rounded-2xl border border-line bg-panel p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <RoleIcon role={inst.id} className="h-4 w-4 text-muted" />
            {inst.label}
          </p>
          <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
            {events.map((event) => {
              const list = assignments[event.id]?.[inst.id] ?? [];
              const title = eventTitle(event, multiSub);
              return (
                <div key={event.id}>
                  <p className="mb-2 text-xs text-muted">{title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {list.map((m) => (
                      <span
                        key={m.id}
                        className="inline-flex items-center rounded-lg bg-raised pl-3 text-sm"
                      >
                        <span className="py-1.5 font-medium">{m.name}</span>
                        {m.is_probation && <ProbationMark className="ml-2" />}
                        <button
                          type="button"
                          onClick={() => onRemove(event.id, inst.id, m.id)}
                          aria-label={`Hapus ${m.name}`}
                          className="flex h-11 w-10 items-center justify-center text-muted hover:text-danger"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        onOpenPicker({
                          eventId: event.id,
                          role: inst.id,
                          title,
                          serviceDate: event.service_date,
                          location: locationKey(event.location) ?? 'CP',
                        })
                      }
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-3 text-sm text-muted hover:border-gold-500 hover:text-fg"
                    >
                      <Plus className="h-4 w-4" aria-hidden /> Tambah
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
