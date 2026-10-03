'use client';

import { useEffect, useState, useTransition } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Availability } from '@/types/database';
import type { ScheduleSectionProps } from '@/types';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

function generateWeekendDates(monthYear: string): {
  cp: Array<{ label: string; value: string }>;
  lw: Array<{ label: string; value: string }>;
} {
  // monthYear format: 'YYYY-MM' (contoh: '2026-10')
  const [year, month] = monthYear.split('-').map(Number);
  const cpDates: Array<{ label: string; value: string }> = [];
  const lwDates: Array<{ label: string; value: string }> = [];

  const daysInMonth = new Date(year, month, 0).getDate();

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const current = new Date(year, month - 1, day);
    const dayOfWeek = current.getDay(); // 0 = Minggu, 6 = Sabtu
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // CP hanya untuk hari Sabtu (6)
    if (dayOfWeek === 6) {
      cpDates.push({
        label: formatDate(isoDate),
        value: isoDate,
      });
    }
    // LW hanya untuk hari Minggu (0)
    else if (dayOfWeek === 0) {
      lwDates.push({
        label: formatDate(isoDate),
        value: isoDate,
      });
    }
  }

  return { cp: cpDates, lw: lwDates };
}

type FeedbackState =
  | { type: 'idle' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string };

export function ScheduleSection({
  memberId,
  memberName,
  period,
}: ScheduleSectionProps) {
  const [cpSelected, setCpSelected] = useState<string[]>([]);
  const [lwSelected, setLwSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle' });
  const [isPending, startTransition] = useTransition();

  const { cp: cpDates, lw: lwDates } = generateWeekendDates(period.month_year);

  // Pre-fill existing availability if present
  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('availabilities')
        .select('cp_dates, lw_dates')
        .eq('member_id', memberId)
        .eq('month_year', period.month_year)
        .maybeSingle<Availability>();

      if (data) {
        setCpSelected(data.cp_dates ?? []);
        setLwSelected(data.lw_dates ?? []);
      } else {
        setCpSelected([]);
        setLwSelected([]);
      }
    };
    load();
  }, [memberId, period.month_year]);

  const toggleDate = (
    date: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSelected((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  const handleSubmit = () => {
    startTransition(async () => {
      setFeedback({ type: 'idle' });
      try {
        const res = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            member_id: memberId,
            month_year: period.month_year,
            cp_dates: cpSelected,
            lw_dates: lwSelected,
          }),
        });

        const json = await res.json();

        if (!res.ok) {
          setFeedback({
            type: 'error',
            message: json.error ?? 'Terjadi kesalahan. Coba lagi.',
          });
        } else {
          setFeedback({
            type: 'success',
            message: `Ketersediaan ${memberName} untuk ${period.label} berhasil disimpan! ✨`,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Koneksi gagal. Periksa internet Anda dan coba lagi.',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CP Section (Hanya Sabtu) */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#0A192F] uppercase tracking-wide border-b-2 border-[#D4AF37] pb-1">
            🏛️️ CP – Tanggal Tersedia (Sabtu)
          </p>
          <div className="space-y-2">
            {cpDates.map(({ label, value }) => (
              <label
                key={`cp-${value}`}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={value}
                  checked={cpSelected.includes(value)}
                  onChange={() =>
                    toggleDate(value, cpSelected, setCpSelected)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-[#0A192F] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* LW Section (Hanya Minggu) */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#0A192F] uppercase tracking-wide border-b-2 border-[#D4AF37] pb-1">
            🏠 LW – Tanggal Tersedia (Minggu)
          </p>
          <div className="space-y-2">
            {lwDates.map(({ label, value }) => (
              <label
                key={`lw-${value}`}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  value={value}
                  checked={lwSelected.includes(value)}
                  onChange={() =>
                    toggleDate(value, lwSelected, setLwSelected)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-[#D4AF37] accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-sm text-slate-700 group-hover:text-[#0A192F] transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback.type !== 'idle' && (
        <div
          className={[
            'flex items-start gap-2 px-4 py-3 rounded-xl text-sm',
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200',
          ].join(' ')}
          role="alert"
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <Button
        variant="gold"
        size="lg"
        onClick={handleSubmit}
        isLoading={isPending}
        className="w-full"
      >
        {isPending ? 'Menyimpan...' : '✅ Simpan Ketersediaan'}
      </Button>
    </div>
  );
}