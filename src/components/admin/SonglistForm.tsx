'use client';

import { useState, useTransition } from 'react';
import type { SonglistFormProps } from '@/types';
import type { Songlist, SongCategory } from '@/types/database';
import { SONG_CATEGORIES, MUSICAL_KEYS } from '@/lib/constant';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from '@/components/ui/table';
import { Plus, Trash2, Save, Star, GripVertical } from 'lucide-react';

type SongDraft = Omit<Songlist, 'id'> & { id?: string };

const emptySong = (monthYear: string): SongDraft => ({
  month_year: monthYear,
  weekend_dates: '',
  song_title: '',
  song_by: '',
  category: 'P',
  sequencer_key: '',
  suggested_key_male: '',
  suggested_key_female: '',
  order_index: 0,
  is_highlighted: false,
});

export function SonglistForm({ monthYear, initialSongs }: SonglistFormProps) {
  const [songs, setSongs] = useState<SongDraft[]>(
    initialSongs.length > 0
      ? initialSongs
      : [emptySong(monthYear)]
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = <K extends keyof SongDraft>(
    index: number,
    field: K,
    value: SongDraft[K]
  ) => {
    setSongs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddRow = () => {
    setSongs((prev) => [
      ...prev,
      { ...emptySong(monthYear), order_index: prev.length },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setSongs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startTransition(async () => {
      setFeedback(null);

      // Assign order_index based on current position
      const payload = songs.map((song, i) => ({
        ...song,
        order_index: i,
        month_year: monthYear,
      }));

      const res = await fetch('/api/songlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: payload }),
      });

      if (res.ok) {
        const json = await res.json();
        // Update IDs returned from server
        if (json.data) {
          setSongs(json.data);
        }
        setFeedback('✅ Songlist berhasil disimpan!');
      } else {
        const json = await res.json();
        setFeedback(`❌ Error: ${json.error ?? 'Gagal menyimpan.'}`);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Tambah, edit, atau hapus lagu untuk bulan{' '}
          <span className="font-semibold text-[#0A192F]">{monthYear}</span>.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {feedback && (
            <span
              className={[
                'text-sm font-medium',
                feedback.startsWith('✅') ? 'text-green-600' : 'text-red-600',
              ].join(' ')}
            >
              {feedback}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddRow}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Tambah Lagu
          </Button>
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            isLoading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Simpan Semua
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableTh>#</TableTh>
              <TableTh>Weekend</TableTh>
              <TableTh>Judul Lagu</TableTh>
              <TableTh>Artis</TableTh>
              <TableTh>Kategori</TableTh>
              <TableTh>Key Seq.</TableTh>
              <TableTh>Key Pria</TableTh>
              <TableTh>Key Wanita</TableTh>
              <TableTh>★</TableTh>
              <TableTh></TableTh>
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map((song, index) => (
              <TableRow key={song.id ?? index}>
                {/* Order index */}
                <TableTd className="text-slate-400 w-8">
                  <span className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3 text-slate-300" />
                    {index + 1}
                  </span>
                </TableTd>

                {/* Weekend dates */}
                <TableTd>
                  <input
                    type="text"
                    value={song.weekend_dates}
                    onChange={(e) =>
                      handleChange(index, 'weekend_dates', e.target.value)
                    }
                    placeholder="e.g. Oct 5-6"
                    className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </TableTd>

                {/* Song title */}
                <TableTd>
                  <input
                    type="text"
                    value={song.song_title}
                    onChange={(e) =>
                      handleChange(index, 'song_title', e.target.value)
                    }
                    placeholder="Judul lagu"
                    className="w-40 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </TableTd>

                {/* Artist */}
                <TableTd>
                  <input
                    type="text"
                    value={song.song_by}
                    onChange={(e) =>
                      handleChange(index, 'song_by', e.target.value)
                    }
                    placeholder="Artis"
                    className="w-32 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </TableTd>

                {/* Category */}
                <TableTd>
                  <select
                    value={song.category}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'category',
                        e.target.value as SongCategory
                      )
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white"
                  >
                    {SONG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </TableTd>

                {/* Sequencer key */}
                <TableTd>
                  <select
                    value={song.sequencer_key}
                    onChange={(e) =>
                      handleChange(index, 'sequencer_key', e.target.value)
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white font-mono"
                  >
                    <option value="">—</option>
                    {MUSICAL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </TableTd>

                {/* Male key */}
                <TableTd>
                  <select
                    value={song.suggested_key_male}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'suggested_key_male',
                        e.target.value
                      )
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white font-mono"
                  >
                    <option value="">—</option>
                    {MUSICAL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </TableTd>

                {/* Female key */}
                <TableTd>
                  <select
                    value={song.suggested_key_female}
                    onChange={(e) =>
                      handleChange(
                        index,
                        'suggested_key_female',
                        e.target.value
                      )
                    }
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white font-mono"
                  >
                    <option value="">—</option>
                    {MUSICAL_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </TableTd>

                {/* Highlighted */}
                <TableTd className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        index,
                        'is_highlighted',
                        !song.is_highlighted
                      )
                    }
                    className={[
                      'transition-colors',
                      song.is_highlighted
                        ? 'text-[#D4AF37]'
                        : 'text-slate-200 hover:text-slate-400',
                    ].join(' ')}
                    aria-label="Toggle highlight"
                  >
                    <Star
                      className="h-4 w-4"
                      fill={song.is_highlighted ? '#D4AF37' : 'none'}
                    />
                  </button>
                </TableTd>

                {/* Remove */}
                <TableTd>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                    aria-label="Remove song"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TableTd>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {songs.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          Belum ada lagu. Klik &quot;Tambah Lagu&quot; untuk mulai.
        </div>
      )}
    </div>
  );
}
