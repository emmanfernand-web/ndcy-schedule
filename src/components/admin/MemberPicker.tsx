'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Availability, Member, MemberRole } from '@/types/database';
import { CanTag, ProbationMark } from '@/components/ui/badge';
import { inputClass } from '@/components/ui/field';
import { cn } from '@/lib/cn';

export interface PickerTarget {
  eventId: string;
  role: MemberRole;
  title: string;
  serviceDate: string;
  location: 'CP' | 'LW';
}

export function isAvailable(
  memberId: string,
  serviceDate: string,
  location: 'CP' | 'LW',
  availabilities: Availability[]
) {
  const a = availabilities.find((x) => x.member_id === memberId);
  if (!a) return false;
  return (location === 'CP' ? a.cp_dates : a.lw_dates)?.includes(serviceDate) ?? false;
}

/** Bottom sheet di HP, dialog di tengah di layar besar. */
export function MemberPicker({
  target,
  members,
  assignedIds,
  availabilities,
  onPick,
  onClose,
}: {
  target: PickerTarget | null;
  members: Member[];
  assignedIds: string[];
  availabilities: Availability[];
  onPick: (target: PickerTarget, memberId: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [allRoles, setAllRoles] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target && !el.open) {
      setQuery('');
      setAllRoles(false);
      el.showModal();
    }
    if (!target && el.open) el.close();
  }, [target]);

  const { can, others } = useMemo(() => {
    if (!target) return { can: [], others: [] };
    const q = query.trim().toLowerCase();
    const pool = members
      .filter((m) => (allRoles ? true : m.role === target.role))
      .filter((m) => !assignedIds.includes(m.id))
      .filter((m) => !q || m.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
    const ok = (m: Member) =>
      isAvailable(m.id, target.serviceDate, target.location, availabilities);
    return { can: pool.filter(ok), others: pool.filter((m) => !ok(m)) };
  }, [target, members, assignedIds, availabilities, query, allRoles]);

  const row = (m: Member, bisa: boolean) => (
    <li key={m.id}>
      <button
        type="button"
        onClick={() => target && onPick(target, m.id)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 text-left hover:bg-raised"
      >
        <span className={cn('flex flex-col', !bisa && 'text-muted')}>
          <span className={cn('font-medium', !bisa && 'font-normal')}>
            {m.name}
          </span>
          {m.is_probation && <ProbationMark />}
        </span>
        <span className="flex items-center gap-2">
          {allRoles && <span className="text-xs text-muted">{m.role}</span>}
          {bisa && <CanTag />}
        </span>
      </button>
    </li>
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-full rounded-t-2xl border border-line bg-panel p-0 text-fg backdrop:bg-navy-950/60 md:m-auto md:max-w-md md:rounded-2xl"
    >
      {target && (
        <div className="flex max-h-[85dvh] flex-col pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-start justify-between gap-3 border-b border-line p-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Pilih pelayan
              </h2>
              <p className="text-sm text-muted">
                {target.role} · {target.title}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="-m-2 flex h-11 w-11 items-center justify-center text-muted hover:text-fg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2 border-b border-line p-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama"
                aria-label="Cari nama"
                className={`${inputClass} pl-10`}
              />
            </div>
            <label className="flex min-h-11 items-center gap-3 text-sm text-muted">
              <input
                type="checkbox"
                checked={allRoles}
                onChange={(e) => setAllRoles(e.target.checked)}
                className="h-5 w-5 accent-[#d4af37]"
              />
              Tampilkan semua instrumen
            </label>
          </div>

          <div className="overflow-y-auto p-2">
            {can.length + others.length === 0 && (
              <p className="p-6 text-center text-sm text-muted">
                Tidak ada nama yang cocok.
              </p>
            )}
            {can.length > 0 && <ul>{can.map((m) => row(m, true))}</ul>}
            {can.length > 0 && others.length > 0 && (
              <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Lainnya
              </p>
            )}
            {others.length > 0 && <ul>{others.map((m) => row(m, false))}</ul>}
          </div>
        </div>
      )}
    </dialog>
  );
}
