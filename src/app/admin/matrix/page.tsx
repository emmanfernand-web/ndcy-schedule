import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MatrixEditor } from '@/components/admin/MatrixEditor';
import { DressCodeEditor } from '@/components/admin/DressCodeEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  MonthlyPeriod,
  Member,
  ScheduleEventWithAssignments,
  Availability,
} from '@/types/database';
import { revalidatePath } from 'next/cache';
import { Calendar, Shirt, LogOut, Music2 } from 'lucide-react';
import Link from 'next/link';

export default async function AdminMatrixPage() {
  const supabase = await createServerClient();

  // Auth guard (backup to proxy)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Fetch active period
  const { data: period } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('is_active', true)
    .maybeSingle<MonthlyPeriod>();

  // Fetch events
  const { data: rawEvents } = period
    ? await supabase
        .from('schedule_events')
        .select(
          `*, schedule_assignments(*, members(id, name, role, is_probation, is_active))`
        )
        .eq('month_year', period.month_year)
        .order('week_number')
        .order('service_date')
    : { data: [] };

  const events = (rawEvents ?? []) as ScheduleEventWithAssignments[];

  // Fetch all active members (for assignment picker)
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('name');

  const allMembers = (members ?? []) as Member[];

  // ---------------------------------------------------------------------------
  // FETCH AVAILABILITIES (Data ketersediaan yang diisi pelayan dari form publik)
  // ---------------------------------------------------------------------------
  const { data: availabilitiesData } = period
    ? await supabase
        .from('availabilities')
        .select('*')
        .eq('month_year', period.month_year)
    : { data: [] };

  const availabilities = (availabilitiesData ?? []) as Availability[];

  // Server action: update dresscode
  async function updateDresscode(eventId: string, dresscode: string) {
    'use server';
    const serverSupabase = await createServerClient();
    await serverSupabase
      .from('schedule_events')
      .update({ dresscode })
      .eq('id', eventId);
    revalidatePath('/admin/matrix');
  }

  // Server action: sign out
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
            href="/admin/songlist"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Songlist
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
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
          <>
            {/* Matrix Editor */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Calendar className="h-5 w-5 text-[#D4AF37] shrink-0" />
                <div>
                  <CardTitle as="h2">Matrix Jadwal</CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Plot anggota ke dalam jadwal pelayanan {period.label}.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <MatrixEditor
                  monthYear={period.month_year}
                  events={events}
                  availableMembers={allMembers}
                  availabilities={availabilities}
                />
              </CardContent>
            </Card>

            {/* Dresscode Editor */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <Shirt className="h-5 w-5 text-[#D4AF37] shrink-0" />
                <div>
                  <CardTitle as="h2">Editor Dresscode</CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Atur dresscode untuk setiap service.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <DressCodeEditor
                  events={events}
                  onUpdate={updateDresscode}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}