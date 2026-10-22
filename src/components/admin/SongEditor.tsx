'use client';

import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from 'lucide-react';
import type { SongCategory } from '@/types/database';
import { MUSICAL_KEYS, SONG_CATEGORIES } from '@/lib/constant';
import { Button } from '@/components/ui/button';
import { Field, inputClass } from '@/components/ui/field';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/cn';

export interface AdminSong {
  key: string;
  id?: string;
  weekend_dates: string;
  song_title: string;
  song_by: string;
  category: SongCategory;
  sequencer_key: string;
  suggested_key_male: string;
  suggested_key_female: string;
  is_highlighted: boolean;
}

const CATEGORY_LABEL: Record<SongCategory, string> = {
  P: 'P · Praise',
  W: 'W · Worship',
  'P/W': 'P/W · Keduanya',
};

export function SongEditor({
  songs,
  onChange,
  onAdd,
  onRemove,
  onMove,
}: {
  songs: AdminSong[];
  onChange: <K extends keyof AdminSong>(key: string, field: K, value: AdminSong[K]) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onMove: (key: string, dir: -1 | 1) => void;
}) {
  return (
    <div className="space-y-3">
      <datalist id="musical-keys">
        {MUSICAL_KEYS.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>

      {songs.length === 0 && (
        <EmptyState title="Belum ada lagu di weekend ini">
          Lagu berlaku untuk Sabtu dan Minggu sekaligus.
        </EmptyState>
      )}

      <ol className="space-y-3">
        {songs.map((song, i) => (
          <li key={song.key} className="rounded-2xl border border-line bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-2xl leading-none text-accent">
                {i + 1}
              </span>
              <div className="-mr-2 flex">
                <IconButton label="Naikkan" disabled={i === 0} onClick={() => onMove(song.key, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton label="Turunkan" disabled={i === songs.length - 1} onClick={() => onMove(song.key, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton label="Hapus lagu" danger onClick={() => onRemove(song.key)}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Judul" className="col-span-2">
                <input
                  className={inputClass}
                  value={song.song_title}
                  onChange={(e) => onChange(song.key, 'song_title', e.target.value)}
                />
              </Field>
              <Field label="Artis" className="col-span-2">
                <input
                  className={inputClass}
                  value={song.song_by}
                  onChange={(e) => onChange(song.key, 'song_by', e.target.value)}
                />
              </Field>
              <Field label="Kategori">
                <select
                  className={inputClass}
                  value={song.category}
                  onChange={(e) => onChange(song.key, 'category', e.target.value as SongCategory)}
                >
                  {SONG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Key Seq.">
                <input
                  list="musical-keys"
                  className={inputClass}
                  value={song.sequencer_key}
                  onChange={(e) => onChange(song.key, 'sequencer_key', e.target.value)}
                />
              </Field>
              <Field label="Key Pria">
                <input
                  list="musical-keys"
                  className={inputClass}
                  value={song.suggested_key_male}
                  onChange={(e) => onChange(song.key, 'suggested_key_male', e.target.value)}
                />
              </Field>
              <Field label="Key Wanita">
                <input
                  list="musical-keys"
                  className={inputClass}
                  value={song.suggested_key_female}
                  onChange={(e) => onChange(song.key, 'suggested_key_female', e.target.value)}
                />
              </Field>
            </div>

            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={song.is_highlighted}
                onChange={(e) => onChange(song.key, 'is_highlighted', e.target.checked)}
                className="h-5 w-5 accent-[#d4af37]"
              />
              <Star className="h-4 w-4 text-accent" aria-hidden />
              Lagu baru (belum pernah dibawakan)
            </label>
          </li>
        ))}
      </ol>

      <Button onClick={onAdd} leftIcon={<Plus className="h-4 w-4" />} className="w-full">
        Tambah lagu
      </Button>
    </div>
  );
}

function IconButton({
  label,
  danger,
  disabled,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-lg text-muted hover:bg-raised disabled:opacity-30 disabled:hover:bg-transparent',
        danger ? 'hover:text-danger' : 'hover:text-fg'
      )}
    >
      {children}
    </button>
  );
}
