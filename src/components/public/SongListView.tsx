import { ListMusic } from 'lucide-react';
import type { Songlist, SongCategory } from '@/types/database';
import type { SongListViewProps } from '@/types';
import { NewTag } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

function CategoryBadge({ category }: { category: SongCategory }) {
  const parts =
    category === 'P/W'
      ? [{ k: 'P', l: 'Praise' }, { k: 'W', l: 'Worship' }]
      : category === 'P'
        ? [{ k: 'P', l: 'Praise' }]
        : [{ k: 'W', l: 'Worship' }];
  return (
    <span className="flex shrink-0 items-center gap-1">
      {parts.map((p) => (
        <span
          key={p.k}
          title={p.l}
          className="inline-flex items-center gap-1 rounded-md border border-line-strong px-1.5 py-0.5 text-xs text-muted"
        >
          <span className="font-semibold text-fg">{p.k}</span>
          <span className="hidden sm:inline">{p.l}</span>
        </span>
      ))}
    </span>
  );
}

function KeyChip({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-xs">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-fg">{value}</span>
    </span>
  );
}

export function SongListView({ songs }: SongListViewProps) {
  if (songs.length === 0) {
    return (
      <EmptyState
        icon={<ListMusic className="h-6 w-6" strokeWidth={1.5} />}
        title="Songlist weekend ini belum tersedia."
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted">
        <span className="font-semibold text-fg">P</span> = Praise ·{' '}
        <span className="font-semibold text-fg">W</span> = Worship
      </p>
      <ol className="divide-y divide-line rounded-2xl border border-line bg-panel">
        {songs.map((song: Songlist, i) => (
          <li key={song.id} className="flex gap-3 p-4">
            <span
              className={cn(
                'w-6 shrink-0 pt-0.5 font-display text-xl leading-none',
                song.is_highlighted ? 'text-accent' : 'text-muted'
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{song.song_title}</p>
                  {song.song_by && (
                    <p className="text-sm text-muted">{song.song_by}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {song.is_highlighted && <NewTag />}
                  <CategoryBadge category={song.category} />
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <KeyChip label="Key Seq." value={song.sequencer_key} />
                <KeyChip label="Key Pria" value={song.suggested_key_male} />
                <KeyChip label="Key Wanita" value={song.suggested_key_female} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
