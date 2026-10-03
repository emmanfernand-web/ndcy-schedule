import { createServerClient } from '@/lib/supabase/server';
import { ScheduleMatrixView } from '@/components/public/ScheduleMatrixView';
import { SongListView } from '@/components/public/SongListView';
import type {
  MonthlyPeriod,
  ScheduleEventWithAssignments,
  Songlist,
} from '@/types/database';
import { Calendar, ListMusic, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0;

export default async function JadwalBulanIniPage() {
  const supabase = await createServerClient();

  // 1. Fetch active period
  const { data: period } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('is_active', true)
    .maybeSingle<MonthlyPeriod>();

  if (!period) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <Calendar className="h-12 w-12 text-slate-300" />
        <h1 className="text-2xl font-bold text-[#0A192F]">
          Jadwal Belum Tersedia
        </h1>
        <p className="text-slate-500 text-center max-w-sm">
          Jadwal bulan ini sedang dalam persiapan. Silakan cek kembali nanti.
        </p>
        <Link
          href="/"
          className="text-[#D4AF37] font-medium hover:underline text-sm"
        >
          ← Kembali ke Form Ketersediaan
        </Link>
      </main>
    );
  }

  // 2. Fetch events dengan JOIN schedule_assignments & members
  const { data: rawEvents } = await supabase
    .from('schedule_events')
    .select(
      `
      *,
      schedule_assignments (
        *,
        members (
          id,
          name,
          role,
          is_probation
        )
      )
    `
    )
    .eq('month_year', period.month_year)
    .order('week_number', { ascending: true })
    .order('service_date', { ascending: true });

  const events = (rawEvents ?? []) as ScheduleEventWithAssignments[];

  // 3. Fetch songlist
  const { data: songs } = await supabase
    .from('songlists')
    .select('*')
    .eq('month_year', period.month_year)
    .order('order_index', { ascending: true });

  const songlist = (songs ?? []) as Songlist[];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header Utama disamakan dengan Form Ketersediaan */}
      <header className="bg-[#0A192F] text-white py-8 px-4 shadow-lg relative">
        <div className="max-w-5xl mx-auto flex flex-col items-center space-y-4">
          {/* Top Row Header: Logo SVG & Quick Button */}
          <div className="w-full flex items-center justify-between">
            {/* Logo Clickable kembali ke Form Ketersediaan */}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/ndcy-logo.svg"
                alt="NDCY Logo"
                width={160}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* Tombol kembali ke Form Ketersediaan di Pojok Kanan */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-xs font-semibold transition-all shadow-sm"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              <span>Form Ketersediaan</span>
            </Link>
          </div>

          {/* Title Section Header */}
          <div className="text-center space-y-1 pt-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Jadwal Bulan Ini
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-normal">
              Periode:{' '}
              <span className="text-[#D4AF37] font-semibold">
                {period.label}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Schedule Matrix Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold text-[#0A192F]">
              Jadwal Pelayanan
            </h2>
          </div>
          <ScheduleMatrixView events={events} />
        </section>

        <hr className="border-slate-200" />

        {/* Song List Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <ListMusic className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold text-[#0A192F]">
              Songlist Bulan Ini
            </h2>
          </div>
          <SongListView songs={songlist} />
        </section>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-100 mt-10">
        © {new Date().getFullYear()} NDC Music Ministry — All rights reserved.
      </footer>
    </main>
  );
}