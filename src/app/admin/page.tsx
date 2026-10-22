import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogOut, ExternalLink } from 'lucide-react';
import { targetPeriodMonth } from '@/lib/weekend';
import { createServerClient } from '@/lib/supabase/server';
import { ScheduleEditor } from '@/components/admin/ScheduleEditor';
import { Wordmark } from '@/components/ui/wordmark';
import { Button, buttonClasses } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type {
  Availability,
  Member,
  MonthlyPeriod,
  ScheduleEventWithAssignments,
  Songlist,
} from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: period } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('month_year', targetPeriodMonth())
    .maybeSingle<MonthlyPeriod>();

  const [eventsRes, membersRes, availRes, songsRes] = period
    ? await Promise.all([
        supabase
          .from('schedule_events')
          .select(
            `*, schedule_assignments(*, members(id, name, role, is_probation, is_active))`
          )
          .eq('month_year', period.month_year)
          .order('week_number')
          .order('service_date'),
        supabase.from('members').select('*').eq('is_active', true).order('name'),
        supabase.from('availabilities').select('*').eq('month_year', period.month_year),
        supabase
          .from('songlists')
          .select('*')
          .eq('month_year', period.month_year)
          .order('order_index'),
      ])
    : [null, null, null, null];

  async function saveDresscodes(updates: { id: string; dresscode: string }[]) {
    'use server';
    const s = await createServerClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user) return { ok: false, error: 'Sesi berakhir. Masuk lagi.' };
    for (const u of updates) {
      const { error } = await s
        .from('schedule_events')
        .update({ dresscode: u.dresscode })
        .eq('id', u.id);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  async function handleSignOut() {
    'use server';
    const s = await createServerClient();
    await s.auth.signOut();
    redirect('/admin/login');
  }

  return (
    <>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <Wordmark />
            <p className="truncate text-sm text-muted">
              Admin · {period?.label ?? 'Periode belum dibuat'}
            </p>
          </div>
          <nav className="flex items-center gap-1" aria-label="Admin">
            <Link href="/jadwal-bulan-ini" className={buttonClasses('ghost', 'sm')}>
              <ExternalLink className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Lihat Publik</span>
              <span className="sm:hidden">Publik</span>
            </Link>
            <form action={handleSignOut}>
              <Button type="submit" variant="ghost" size="sm" leftIcon={<LogOut className="h-4 w-4" />}>
                Keluar
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {!period ? (
          <EmptyState title="Periode belum dibuat">
            Buat periode untuk bulan ini di database. Periode berganti otomatis tiap tanggal 15.
          </EmptyState>
        ) : (
          <ScheduleEditor
            monthYear={period.month_year}
            events={(eventsRes?.data ?? []) as ScheduleEventWithAssignments[]}
            members={(membersRes?.data ?? []) as Member[]}
            availabilities={(availRes?.data ?? []) as Availability[]}
            songs={(songsRes?.data ?? []) as Songlist[]}
            onSaveDresscodes={saveDresscodes}
          />
        )}
      </main>
    </>
  );
}
