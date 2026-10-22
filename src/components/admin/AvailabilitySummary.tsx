import { Users } from 'lucide-react';
import type { Availability, Member } from '@/types/database';

export function AvailabilitySummary({
  members,
  availabilities,
}: {
  members: Member[];
  availabilities: Availability[];
}) {
  const filled = new Set(availabilities.map((a) => a.member_id));
  const missing = members.filter((m) => !filled.has(m.id));
  const done = members.length - missing.length;

  return (
    <details className="rounded-2xl border border-line bg-panel px-4">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 text-sm">
        <Users className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
        <span>
          Sudah mengisi{' '}
          <strong className="text-accent">{done}</strong> dari {members.length}{' '}
          anggota
        </span>
        {missing.length > 0 && (
          <span className="ml-auto text-xs text-muted">
            {missing.length} belum
          </span>
        )}
      </summary>
      {missing.length > 0 ? (
        <ul className="flex flex-wrap gap-2 pb-4 pt-1">
          {missing.map((m) => (
            <li key={m.id} className="rounded-lg bg-raised px-3 py-1.5 text-sm">
              {m.name}
              <span className="ml-2 text-xs text-muted">{m.role}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pb-4 text-sm text-muted">Semua anggota sudah mengisi.</p>
      )}
    </details>
  );
}
