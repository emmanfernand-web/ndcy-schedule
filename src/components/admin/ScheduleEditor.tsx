'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import type {
  Availability,
  Member,
  MemberRole,
  ScheduleEventWithAssignments,
  Songlist,
} from '@/types/database';
import {
  groupWeekends,
  currentWeekendNumber,
  matchesWeekend,
  songWeekendLabel,
} from '@/lib/weekend';
import { Button } from '@/components/ui/button';
import { Field, inputClass } from '@/components/ui/field';
import { SectionLabel } from '@/components/ui/panel';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WeekendPicker } from '@/components/ui/weekend-picker';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { MemberPicker, type PickerTarget } from './MemberPicker';
import { TeamEditor, eventTitle, type AssignmentMap } from './TeamEditor';
import { SongEditor, type AdminSong } from './SongEditor';
import { AvailabilitySummary } from './AvailabilitySummary';
import { ExportButton } from './ExportButton';

type DresscodeUpdate = { id: string; dresscode: string };

interface Props {
  monthYear: string;
  events: ScheduleEventWithAssignments[];
  members: Member[];
  availabilities: Availability[];
  songs: Songlist[];
  onSaveDresscodes: (
    updates: DresscodeUpdate[]
  ) => Promise<{ ok: boolean; error?: string }>;
}

type Tab = 'tim' | 'dresscode' | 'songlist';
const TABS: { id: Tab; label: string }[] = [
  { id: 'tim', label: 'Tim' },
  { id: 'dresscode', label: 'Dresscode' },
  { id: 'songlist', label: 'Songlist' },
];

function buildAssignments(events: ScheduleEventWithAssignments[]) {
  const map: AssignmentMap = {};
  for (const e of events) {
    map[e.id] = {};
    for (const a of e.schedule_assignments ?? []) {
      const list = (map[e.id][a.role] ??= []);
      if (!list.some((m) => m.id === a.members.id)) list.push(a.members);
    }
  }
  return map;
}

const toAdminSong = (s: Songlist): AdminSong => ({
  key: s.id,
  id: s.id,
  weekend_dates: s.weekend_dates,
  song_title: s.song_title,
  song_by: s.song_by,
  category: s.category,
  sequencer_key: s.sequencer_key ?? '',
  suggested_key_male: s.suggested_key_male ?? '',
  suggested_key_female: s.suggested_key_female ?? '',
  is_highlighted: s.is_highlighted,
});

const assignSig = (m: AssignmentMap) =>
  JSON.stringify(
    Object.entries(m)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, roles]) => [
        id,
        Object.entries(roles)
          .map(([r, list]) => [r, (list ?? []).map((x) => x.id).sort()])
          .filter(([, ids]) => (ids as string[]).length > 0)
          .sort(([a], [b]) => String(a).localeCompare(String(b))),
      ])
  );

const dressSig = (d: Record<string, string>) =>
  JSON.stringify(Object.entries(d).sort(([a], [b]) => a.localeCompare(b)));

const songSig = (s: AdminSong[]) =>
  JSON.stringify(s.map(({ key, ...rest }) => (void key, rest)));

export function ScheduleEditor({
  monthYear,
  events,
  members,
  availabilities,
  songs: initialSongs,
  onSaveDresscodes,
}: Props) {
  const router = useRouter();
  const { push } = useToast();
  const exportRef = useRef<HTMLDivElement>(null);

  const weekends = useMemo(() => groupWeekends(events), [events]);
  const [weekendNo, setWeekendNo] = useState<number | null>(
    () => currentWeekendNumber(weekends)
  );
  const [pendingWeekend, setPendingWeekend] = useState<number | null>(null);
  const [tab, setTab] = useState<Tab>('tim');
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [saving, setSaving] = useState(false);

  const [assignments, setAssignments] = useState(() => buildAssignments(events));
  const [dresscodes, setDresscodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(events.map((e) => [e.id, e.dresscode ?? '']))
  );
  const [songs, setSongs] = useState<AdminSong[]>(() =>
    initialSongs.map(toAdminSong)
  );

  const [base, setBase] = useState(() => ({
    assign: assignSig(buildAssignments(events)),
    dress: dressSig(Object.fromEntries(events.map((e) => [e.id, e.dresscode ?? '']))),
    songs: songSig(initialSongs.map(toAdminSong)),
  }));

  const dirtyAssign = assignSig(assignments) !== base.assign;
  const dirtyDress = dressSig(dresscodes) !== base.dress;
  const dirtySongs = songSig(songs) !== base.songs;
  const dirty = dirtyAssign || dirtyDress || dirtySongs;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const weekend = weekends.find((w) => w.number === weekendNo) ?? null;

  const weekendSongs = weekend
    ? songs.filter((s) => matchesWeekend(s.weekend_dates, weekend.dates))
    : [];
  const orphanCount = songs.filter(
    (s) => !weekends.some((w) => matchesWeekend(s.weekend_dates, w.dates))
  ).length;

  const changeWeekend = (n: number) => {
    if (n === weekendNo) return;
    if (dirty) setPendingWeekend(n);
    else setWeekendNo(n);
  };

  // --- Tim ---
  const addMember = (t: PickerTarget, memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    setAssignments((prev) => {
      const list = prev[t.eventId]?.[t.role] ?? [];
      if (list.some((m) => m.id === memberId)) return prev;
      return {
        ...prev,
        [t.eventId]: { ...prev[t.eventId], [t.role]: [...list, member] },
      };
    });
    setPicker(null);
  };

  const removeMember = (eventId: string, role: MemberRole, memberId: string) =>
    setAssignments((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [role]: (prev[eventId]?.[role] ?? []).filter((m) => m.id !== memberId),
      },
    }));

  // --- Songlist (hanya weekend yang terbuka; urutan global dijaga) ---
  const changeSong = <K extends keyof AdminSong>(key: string, field: K, value: AdminSong[K]) =>
    setSongs((prev) => prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)));

  const addSong = () => {
    if (!weekend) return;
    setSongs((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        weekend_dates: songWeekendLabel(weekend.dates),
        song_title: '',
        song_by: '',
        category: 'P',
        sequencer_key: '',
        suggested_key_male: '',
        suggested_key_female: '',
        is_highlighted: false,
      },
    ]);
  };

  const removeSong = (key: string) =>
    setSongs((prev) => prev.filter((s) => s.key !== key));

  const moveSong = (key: string, dir: -1 | 1) => {
    if (!weekend) return;
    setSongs((prev) => {
      const inWeekend = prev
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => matchesWeekend(s.weekend_dates, weekend.dates));
      const pos = inWeekend.findIndex(({ s }) => s.key === key);
      const other = inWeekend[pos + dir];
      if (pos < 0 || !other) return prev;
      const copy = [...prev];
      [copy[inWeekend[pos].idx], copy[other.idx]] = [copy[other.idx], copy[inWeekend[pos].idx]];
      return copy;
    });
  };

  // --- Simpan semua ---
  const save = async () => {
    setSaving(true);
    const errors: string[] = [];
    const nextBase = { ...base };

    if (dirtyAssign) {
      try {
        const payload = Object.entries(assignments).flatMap(([event_id, roles]) =>
          Object.entries(roles).flatMap(([role, list]) =>
            [...new Set((list ?? []).map((m) => m.id))].map((member_id) => ({
              event_id,
              member_id,
              role,
            }))
          )
        );
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ month_year: monthYear, assignments: payload }),
        });
        if (res.ok) nextBase.assign = assignSig(assignments);
        else errors.push((await res.json()).error ?? 'Gagal menyimpan tim.');
      } catch {
        errors.push('Koneksi gagal saat menyimpan tim.');
      }
    }

    if (dirtyDress) {
      const baseMap = new Map(JSON.parse(base.dress) as [string, string][]);
      const updates = Object.entries(dresscodes)
        .filter(([id, v]) => baseMap.get(id) !== v)
        .map(([id, dresscode]) => ({ id, dresscode }));
      const r = await onSaveDresscodes(updates);
      if (r.ok) nextBase.dress = dressSig(dresscodes);
      else errors.push(r.error ?? 'Gagal menyimpan dresscode.');
    }

    if (dirtySongs) {
      try {
        const payload = songs.map((s, i) => ({
          month_year: monthYear,
          // seragamkan format weekend untuk lagu yang cocok dengan sebuah weekend
          weekend_dates:
            weekends
              .filter((w) => matchesWeekend(s.weekend_dates, w.dates))
              .map((w) => songWeekendLabel(w.dates))[0] ?? s.weekend_dates,
          song_title: s.song_title,
          song_by: s.song_by,
          category: s.category,
          sequencer_key: s.sequencer_key,
          suggested_key_male: s.suggested_key_male,
          suggested_key_female: s.suggested_key_female,
          order_index: i,
          is_highlighted: s.is_highlighted,
        }));

        if (payload.length === 0) {
          // API POST menolak array kosong, hapus satu per satu
          const ids = JSON.parse(base.songs) as { id?: string }[];
          const results = await Promise.all(
            ids.filter((s) => s.id).map((s) =>
              fetch(`/api/songlist?id=${s.id}`, { method: 'DELETE' })
            )
          );
          if (results.every((r) => r.ok)) {
            nextBase.songs = songSig(songs);
          } else errors.push('Gagal menghapus songlist.');
        } else {
          const res = await fetch('/api/songlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songs: payload }),
          });
          const json = await res.json();
          if (res.ok) {
            const saved = (json.data as Songlist[])
              .sort((a, b) => a.order_index - b.order_index)
              .map(toAdminSong);
            setSongs(saved);
            nextBase.songs = songSig(saved);
          } else errors.push(json.error ?? 'Gagal menyimpan songlist.');
        }
      } catch {
        errors.push('Koneksi gagal saat menyimpan songlist.');
      }
    }

    setBase(nextBase);
    setSaving(false);
    if (errors.length === 0) {
      push('success', 'Perubahan berhasil disimpan.');
      router.refresh();
    } else {
      push('error', errors.join(' '));
    }
  };

  if (events.length === 0 || !weekend) {
    return (
      <EmptyState title="Belum ada event untuk bulan ini">
        Event jadwal dibuat lewat database. Setelah ada, editor akan muncul di sini.
      </EmptyState>
    );
  }

  const assignedIds = picker
    ? (assignments[picker.eventId]?.[picker.role] ?? []).map((m) => m.id)
    : [];

  return (
    <div className="space-y-5 pb-28">
      <AvailabilitySummary members={members} availabilities={availabilities} />

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <WeekendPicker weekends={weekends} value={weekendNo} onChange={changeWeekend} />
        </div>
        <ExportButton targetRef={exportRef} filename={`jadwal-${monthYear}-weekend-${weekend.number}`} />
      </div>

      <div
        role="tablist"
        aria-label="Bagian editor"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-panel p-1 lg:hidden"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'min-h-11 rounded-lg text-sm transition-colors',
              tab === t.id
                ? 'bg-gold-500/15 font-semibold ring-1 ring-gold-500'
                : 'text-muted hover:text-fg'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section
          ref={exportRef}
          className={cn('space-y-3 lg:col-span-7 lg:block', tab === 'tim' ? 'block' : 'hidden')}
        >
          <SectionLabel>Tim · Weekend {weekend.number}</SectionLabel>
          <TeamEditor
            events={weekend.events}
            assignments={assignments}
            onOpenPicker={setPicker}
            onRemove={removeMember}
          />
        </section>

        <div className="space-y-8 lg:col-span-5 lg:block">
          <section className={cn('space-y-3 lg:block', tab === 'dresscode' ? 'block' : 'hidden')}>
            <SectionLabel>Dresscode</SectionLabel>
            <div className="space-y-3 rounded-2xl border border-line bg-panel p-4">
              {weekend.events.map((e) => (
                <Field key={e.id} label={eventTitle(e, weekend.events.length > 2)}>
                  <input
                    className={inputClass}
                    value={dresscodes[e.id] ?? ''}
                    placeholder="mis. Black / Dark Navy"
                    onChange={(ev) =>
                      setDresscodes((prev) => ({ ...prev, [e.id]: ev.target.value }))
                    }
                  />
                </Field>
              ))}
            </div>
          </section>

          <section className={cn('space-y-3 lg:block', tab === 'songlist' ? 'block' : 'hidden')}>
            <SectionLabel>Songlist · Sabtu &amp; Minggu</SectionLabel>
            {orphanCount > 0 && (
              <p className="text-xs text-muted">
                {orphanCount} lagu lama tidak cocok dengan weekend mana pun dan
                tidak ditampilkan di sini (tetap tersimpan).
              </p>
            )}
            <SongEditor
              songs={weekendSongs}
              onChange={changeSong}
              onAdd={addSong}
              onRemove={removeSong}
              onMove={moveSong}
            />
          </section>
        </div>
      </div>

      {/* Bar simpan */}
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <p className={cn('flex-1 text-sm', dirty ? 'font-medium text-fg' : 'text-muted')}>
            {dirty ? (
              <>
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gold-500" aria-hidden />
                Ada perubahan belum disimpan
              </>
            ) : (
              'Semua perubahan tersimpan'
            )}
          </p>
          <Button
            variant="primary"
            size="lg"
            isLoading={saving}
            onClick={save}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Simpan
          </Button>
        </div>
      </div>

      <MemberPicker
        target={picker}
        members={members}
        assignedIds={assignedIds}
        availabilities={availabilities}
        onPick={addMember}
        onClose={() => setPicker(null)}
      />

      <ConfirmDialog
        open={pendingWeekend !== null}
        title="Pindah weekend?"
        description="Ada perubahan yang belum disimpan. Perubahan tetap ada selama halaman ini terbuka, tapi hilang kalau halaman ditutup sebelum disimpan."
        confirmLabel="Pindah"
        onCancel={() => setPendingWeekend(null)}
        onConfirm={() => {
          setWeekendNo(pendingWeekend);
          setPendingWeekend(null);
        }}
      />
    </div>
  );
}
