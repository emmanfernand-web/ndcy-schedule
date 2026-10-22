import type {
  ScheduleEventWithAssignments,
  ServiceLocation,
} from '@/types/database';

const LOCATION_NAME: Record<ServiceLocation, string> = {
  CP: 'Central Park',
  LW: 'Living World',
};

/** Nilai `location` di database bisa 'CP' atau 'Central Park', jadi dinormalkan. */
export function locationKey(loc: string): ServiceLocation | null {
  if (/living|\blw\b/i.test(loc)) return 'LW';
  if (/central|\bcp\b/i.test(loc)) return 'CP';
  return null;
}

export function locationName(loc: string) {
  const key = locationKey(loc);
  return key ? LOCATION_NAME[key] : loc;
}

/**
 * Periode penjadwalan (YYYY-MM): mulai tanggal 15 membuka bulan berikutnya.
 * Dihitung dengan zona Asia/Jakarta.
 */
export function targetPeriodMonth() {
  const [y, m, d] = todayJakarta().split('-').map(Number);
  const next = d >= 15 ? new Date(y, m, 1) : new Date(y, m - 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}

const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];
// Format `weekend_dates` songlist mengikuti contoh lama: "Oct 5-6"
const MONTH_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function parts(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d, dow: new Date(y, m - 1, d).getDay() };
}

/** "Sab 3 Okt" */
export function formatDateShort(iso: string) {
  const { m, d, dow } = parts(iso);
  return `${DAY_SHORT[dow]} ${d} ${MONTH_SHORT_ID[m]}`;
}

/** "3–4 Okt" atau "31 Okt – 1 Nov" */
export function formatRange(dates: string[]) {
  if (dates.length === 0) return '';
  const a = parts(dates[0]);
  const b = parts(dates[dates.length - 1]);
  if (dates.length === 1 || (a.d === b.d && a.m === b.m)) {
    return `${a.d} ${MONTH_SHORT_ID[a.m]}`;
  }
  if (a.m === b.m) return `${a.d}–${b.d} ${MONTH_SHORT_ID[a.m]}`;
  return `${a.d} ${MONTH_SHORT_ID[a.m]} – ${b.d} ${MONTH_SHORT_ID[b.m]}`;
}

/** Nilai `weekend_dates` songlist yang konsisten, mis. "Oct 3-4". */
export function songWeekendLabel(dates: string[]) {
  if (dates.length === 0) return '';
  const a = parts(dates[0]);
  const b = parts(dates[dates.length - 1]);
  if (dates.length === 1 || (a.d === b.d && a.m === b.m)) {
    return `${MONTH_SHORT_EN[a.m]} ${a.d}`;
  }
  if (a.m === b.m) return `${MONTH_SHORT_EN[a.m]} ${a.d}-${b.d}`;
  return `${MONTH_SHORT_EN[a.m]} ${a.d}-${MONTH_SHORT_EN[b.m]} ${b.d}`;
}

/**
 * Pencocokan toleran untuk nilai `weekend_dates` yang tersimpan.
 * Cocok kalau persis sama dengan label kanonik, atau semua angka tanggal
 * di dalamnya adalah tanggal weekend tersebut (mis. "Oct 3-4", "3-4 Oktober").
 */
export function matchesWeekend(stored: string, dates: string[]) {
  if (!stored || dates.length === 0) return false;
  if (stored.trim() === songWeekendLabel(dates)) return true;
  const nums = (stored.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return false;
  const days = dates.map((d) => parts(d).d);
  return nums.every((n) => days.includes(n));
}

export interface Weekend {
  number: number;
  events: ScheduleEventWithAssignments[];
  dates: string[];
}

/** Kelompokkan event menjadi weekend berdasarkan week_number. */
export function groupWeekends(
  events: ScheduleEventWithAssignments[]
): Weekend[] {
  const map = new Map<number, ScheduleEventWithAssignments[]>();
  for (const e of events) {
    map.set(e.week_number, [...(map.get(e.week_number) ?? []), e]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([number, evs]) => {
      const sorted = [...evs].sort((a, b) =>
        a.service_date === b.service_date
          ? (a.sub_service ?? '').localeCompare(b.sub_service ?? '')
          : a.service_date.localeCompare(b.service_date)
      );
      return {
        number,
        events: sorted,
        dates: [...new Set(sorted.map((e) => e.service_date))],
      };
    });
}

/** Tanggal hari ini (YYYY-MM-DD) di zona Asia/Jakarta. */
export function todayJakarta() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
}

/** Weekend yang sedang berjalan, atau yang paling dekat berikutnya. */
export function currentWeekendNumber(weekends: Weekend[]) {
  if (weekends.length === 0) return null;
  const today = todayJakarta();
  const upcoming = weekends.find(
    (w) => w.dates[w.dates.length - 1] >= today
  );
  return (upcoming ?? weekends[weekends.length - 1]).number;
}

/** Weekend untuk form ketersediaan, diturunkan dari event yang sudah dibuat. */
export function weekendsFromEvents(
  events: { week_number: number; location: string; service_date: string }[]
): AvailabilityWeekend[] {
  const byWeek = new Map<number, AvailabilityWeekend>();
  for (const e of [...events].sort((a, b) => a.service_date.localeCompare(b.service_date))) {
    const w = byWeek.get(e.week_number) ?? { index: e.week_number };
    if (locationKey(e.location) === 'LW') w.sun ??= e.service_date;
    else w.sat ??= e.service_date;
    byWeek.set(e.week_number, w);
  }
  return [...byWeek.values()].sort((a, b) => a.index - b.index);
}

/** Fallback: weekend dari kalender (Sabtu + Minggu setelahnya) kalau event belum dibuat. */
export interface AvailabilityWeekend {
  index: number;
  sat?: string;
  sun?: string;
}

export function availabilityWeekends(monthYear: string): AvailabilityWeekend[] {
  const [year, month] = monthYear.split('-').map(Number);
  const days = new Date(year, month, 0).getDate();
  const iso = (d: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const out: AvailabilityWeekend[] = [];
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 6) {
      out.push({ index: out.length + 1, sat: iso(d) });
    } else if (dow === 0) {
      const last = out[out.length - 1];
      if (last?.sat && !last.sun) last.sun = iso(d);
      else out.push({ index: out.length + 1, sun: iso(d) });
    }
  }
  return out;
}

// --- Dresscode: swatch hanya untuk warna yang jelas dikenali ---

const COLOR_MAP: Record<string, string> = {
  black: '#111111',
  hitam: '#111111',
  white: '#f5f5f5',
  putih: '#f5f5f5',
  'dark navy': '#0f1f45',
  navy: '#1b2a5c',
  'dark blue': '#14285a',
  blue: '#2f5fd0',
  biru: '#2f5fd0',
  grey: '#8a8f9c',
  gray: '#8a8f9c',
  abu: '#8a8f9c',
  'abu-abu': '#8a8f9c',
  red: '#c0392b',
  merah: '#c0392b',
  maroon: '#6d1a2a',
  gold: '#d4af37',
  emas: '#d4af37',
  green: '#2e8b57',
  hijau: '#2e8b57',
  brown: '#6b4a2f',
  coklat: '#6b4a2f',
  cream: '#f1e6c8',
  krem: '#f1e6c8',
  beige: '#d8c7a3',
  pink: '#e58ab0',
  purple: '#6b4aa5',
  ungu: '#6b4aa5',
  orange: '#e07a2f',
  oranye: '#e07a2f',
  yellow: '#e8c547',
  kuning: '#e8c547',
};

export function dresscodeSwatches(text: string) {
  return text
    .split(/[/,&+]|\bdan\b|\band\b/i)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => ({ name: t, hex: COLOR_MAP[t.toLowerCase()] }))
    .filter((s): s is { name: string; hex: string } => Boolean(s.hex));
}
