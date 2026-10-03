import type { SongListViewProps } from '@/types';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from '@/components/ui/table';
import { Music4 } from 'lucide-react';

const categoryColors: Record<string, string> = {
  P: 'bg-blue-100 text-blue-800',
  W: 'bg-purple-100 text-purple-800',
  'P/W': 'bg-indigo-100 text-indigo-800',
};

export function SongListView({ songs }: SongListViewProps) {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Music4 className="h-10 w-10" />
        <p className="text-base font-medium">Songlist belum tersedia.</p>
      </div>
    );
  }

  // Group songs by weekend_dates
  const grouped = songs.reduce<Record<string, typeof songs>>((acc, song) => {
    const key = song.weekend_dates;
    if (!acc[key]) acc[key] = [];
    acc[key].push(song);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([weekend, weekendSongs]) => (
        <section key={weekend} className="space-y-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-[#0A192F]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#D4AF37]" />
            Weekend {weekend}
          </h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>#</TableTh>
                <TableTh>Judul Lagu</TableTh>
                <TableTh>Artis / By</TableTh>
                <TableTh>Kategori</TableTh>
                <TableTh>Key Sequencer</TableTh>
                <TableTh>Key (Pria)</TableTh>
                <TableTh>Key (Wanita)</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {weekendSongs
                .sort((a, b) => a.order_index - b.order_index)
                .map((song, index) => (
                  <TableRow key={song.id} isHighlighted={song.is_highlighted}>
                    <TableTd className="text-slate-400 w-8">
                      {index + 1}
                    </TableTd>
                    <TableTd className="font-semibold text-[#0A192F]">
                      {song.song_title}
                      {song.is_highlighted && (
                        <span className="ml-2 text-[10px] bg-[#D4AF37] text-[#0A192F] px-1.5 py-0.5 rounded-full font-bold">
                          ★
                        </span>
                      )}
                    </TableTd>
                    <TableTd className="text-slate-600">{song.song_by}</TableTd>
                    <TableTd>
                      <span
                        className={[
                          'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold',
                          categoryColors[song.category] ??
                            'bg-slate-100 text-slate-700',
                        ].join(' ')}
                      >
                        {song.category}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="font-mono font-bold text-[#0A192F]">
                        {song.sequencer_key || '—'}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="font-mono text-slate-600">
                        {song.suggested_key_male || '—'}
                      </span>
                    </TableTd>
                    <TableTd>
                      <span className="font-mono text-slate-600">
                        {song.suggested_key_female || '—'}
                      </span>
                    </TableTd>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </section>
      ))}
    </div>
  );
}
