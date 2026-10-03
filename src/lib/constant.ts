import type { Instrument } from '@/types';

export const INSTRUMENTS: Instrument[] = [
  { id: 'Gitar', label: '🎸 Gitar' },
  { id: 'Bass', label: '🎵 Bass' },
  { id: 'Drum', label: '🥁 Drum' },
  { id: 'Lead Keys', label: '🎹 Lead Keys' },
  { id: 'Filler', label: '🎼 Filler' },
  { id: 'WL', label: '🎤 Worship Leader' },
  { id: 'Singers', label: '🎶 Singers' },
];

export const LOCATIONS = ['CP', 'LW'] as const;

export const SUB_SERVICES = ['Pagi', 'Siang', 'Malam'] as const;

export const SONG_CATEGORIES = ['P', 'W', 'P/W'] as const;

export const MUSICAL_KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
] as const;
