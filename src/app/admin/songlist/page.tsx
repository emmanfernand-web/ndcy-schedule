import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SonglistForm } from '@/components/admin/SonglistForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyPeriod, Songlist } from '@/types/database';
import { ListMusic, LogOut, Music2 } from 'lucide-react';
import Link from 'next/link';

export default async function AdminSonglistPage() {
  const supabase = await createServerClient();

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Active period
  const { data: period } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('is_active', true)
    .maybeSingle<MonthlyPeriod>();

  // Existing songs
  const { data: songs } = period
    ? await supabase
        .from('songlists')
        .select('*')
        .eq('month_year', period.month_year)
        .order('order_index')
    : { data: [] };

  const initialSongs = (songs ?? []) as Songlist[];

  async function handleSignOut() {
    'use server';
    const serverSupabase = await createServerClient();
    await serverSupabase.auth.signOut();
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Nav */}
      <nav className="bg-[#0A192F] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Music2 className="h-5 w-5 text-[#D4AF37]" />
          <span className="font-bold text-base">NDC Admin</span>
          <span className="hidden sm:block text-slate-400 text-sm">
            · {period?.label ?? 'Tidak ada periode aktif'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/matrix"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Matrix Jadwal
          </Link>
          <Link
            href="/jadwal-bulan-ini"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Lihat Publik
          </Link>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!period && (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              <p className="text-lg font-medium">
                Tidak ada periode aktif. Aktifkan periode di Supabase terlebih dahulu.
              </p>
            </CardContent>
          </Card>
        )}

        {period && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <ListMusic className="h-5 w-5 text-[#D4AF37] shrink-0" />
              <div>
                <CardTitle as="h2">Editor Songlist</CardTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  Kelola daftar lagu untuk {period.label}. Termasuk key sequencer dan key vokal.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <SonglistForm
                monthYear={period.month_year}
                initialSongs={initialSongs}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
