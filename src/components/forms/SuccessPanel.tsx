import Link from 'next/link';
import { CalendarCheck, Pencil } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/button';
import { formatDateShort } from '@/lib/weekend';
import { RoleIcon } from '@/components/ui/role-icon';
import { INSTRUMENTS } from '@/lib/constant';
import type { MemberRole } from '@/types/database';
import type { SavedAvailability } from './ScheduleSection';

export function SuccessPanel({
  name,
  role,
  saved,
  onEdit,
}: {
  name: string;
  role: MemberRole;
  saved: SavedAvailability;
  onEdit: () => void;
}) {
  const roleLabel = INSTRUMENTS.find((i) => i.id === role)?.label ?? role;
  const groups = [
    { title: 'Sabtu · Central Park', dates: saved.cp },
    { title: 'Minggu · Living World', dates: saved.lw },
  ];

  return (
    <div className="reveal rounded-2xl border border-gold-500/40 bg-panel p-6 text-center sm:p-10">
      <h2 className="gold-text font-display text-4xl font-semibold sm:text-5xl">
        Ceritamu sudah tertulis.
      </h2>
      <p className="mt-4 flex items-center justify-center gap-2 text-lg">
        <RoleIcon role={role} className="h-5 w-5 text-accent" />
        {name} · {roleLabel}
      </p>

      <div className="mx-auto mt-6 grid max-w-md gap-4 border-t border-line pt-6 text-left sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {g.title}
            </p>
            {g.dates.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {g.dates.map((d) => (
                  <li key={d}>{formatDateShort(d)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">Tidak ada tanggal</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href="/jadwal-bulan-ini" className={buttonClasses('primary', 'lg')}>
          <CalendarCheck className="h-5 w-5" aria-hidden /> Lihat Jadwal
        </Link>
        <Button size="lg" onClick={onEdit} leftIcon={<Pencil className="h-4 w-4" />}>
          Ubah Ketersediaan
        </Button>
      </div>
    </div>
  );
}
