import { CalendarCheck, CalendarX } from 'lucide-react';
import { createServerClient } from '@/lib/supabase/server';
import { ScheduleMatrixView } from '@/components/public/ScheduleMatrixView';
import { PageHeader } from '@/components/public/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { targetPeriodMonth, currentWeekendNumber, groupWeekends } from '@/lib/weekend';
import type {
  MonthlyPeriod,
  ScheduleEventWithAssignments,
  Songlist,
} from '@/types/database';

export const revalidate = 0;

export default async function JadwalBulanIniPage({
  searchParams,
}: {
  searchParams: Promise<{ weekend?: string }>;
}) {
  const { weekend: weekendParam } = await searchParams;
  const supabase = await createServerClient();

  const { data: period } = await supabase
    .from('monthly_periods')
    .select('*')
    .eq('month_year', targetPeriodMonth())
    .maybeSingle<MonthlyPeriod>();

  const header = (subtitle: React.ReactNode) => (
    <PageHeader
      title="Jadwal Bulan Ini"
      subtitle={subtitle}
      linkHref="/"
      linkLabel="Form Ketersediaan"
      linkShortLabel="Form"
      linkIcon={<CalendarCheck className="h-4 w-4" aria-hidden />}
    />
  );

  if (!period) {
    return (
      <main>
        {header('Periode belum dibuat')}
        <div className="mx-auto max-w-3xl px-4">
          <EmptyState
            icon={<CalendarX className="h-6 w-6" strokeWidth={1.5} />}
            title="Jadwal belum tersedia"
          >
            Jadwal bulan ini sedang dipersiapkan. Cek lagi nanti ya.
          </EmptyState>
        </div>
      </main>
    );
  }

  const { data: rawEvents } = await supabase
    .from('schedule_events')
    .select(
      `*, schedule_assignments (*, members (id, name, role, is_probation))`
    )
    .eq('month_year', period.month_year)
    .order('week_number', { ascending: true })
    .order('service_date', { ascending: true });

  const events = (rawEvents ?? []) as ScheduleEventWithAssignments[];

  const { data: songs } = await supabase
    .from('songlists')
    .select('*')
    .eq('month_year', period.month_year)
    .order('order_index', { ascending: true });

  const weekends = groupWeekends(events);
  const requested = Number(weekendParam);
  const initialWeekend = weekends.some((w) => w.number === requested)
    ? requested
    : currentWeekendNumber(weekends);

  return (
    <main>
      {header(<>Periode: {period.label}</>)}
      <div className="mx-auto w-full max-w-3xl px-4 xl:max-w-5xl">
        <ScheduleMatrixView
          events={events}
          songs={(songs ?? []) as Songlist[]}
          initialWeekend={initialWeekend}
        />
      </div>
    </main>
  );
}
