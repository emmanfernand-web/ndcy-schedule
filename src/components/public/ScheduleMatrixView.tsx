'use client';

import type { ScheduleEventWithAssignments } from '@/types/database';
import { INSTRUMENTS } from '@/lib/constant';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from '@/components/ui/table';

interface ScheduleMatrixViewProps {
  events: ScheduleEventWithAssignments[];
}

export function ScheduleMatrixView({ events }: ScheduleMatrixViewProps) {
  if (!events || events.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-6 text-center bg-white rounded-xl border border-slate-200">
        Belum ada jadwal yang dipublikasikan.
      </p>
    );
  }

  // Kelompokkan event berdasarkan week_number
  const weeksMap: Record<number, ScheduleEventWithAssignments[]> = {};
  for (const event of events) {
    if (!weeksMap[event.week_number]) {
      weeksMap[event.week_number] = [];
    }
    weeksMap[event.week_number].push(event);
  }

  const sortedWeekNumbers = Object.keys(weeksMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {sortedWeekNumbers.map((weekNum) => {
        const weekEvents = weeksMap[weekNum];

        return (
          <div
            key={weekNum}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
          >
            {/* Header Minggu */}
            <div className="bg-[#0A192F] text-white px-6 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#D4AF37]">
                Minggu ke-{weekNum}
              </h3>
            </div>

            {/* Tabel Matriks Minggu Terkait */}
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow className="bg-slate-100/80 border-b border-slate-200">
                    <TableTh className="w-[120px]">Tanggal</TableTh>
                    <TableTh className="w-[140px]">Lokasi</TableTh>
                    {INSTRUMENTS.map((inst) => (
                      <TableTh key={inst.id} className="min-w-[130px]">
                        {inst.id}
                      </TableTh>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weekEvents.map((event) => {
                    const formattedDate = new Date(
                      event.service_date + 'T00:00:00'
                    ).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    });

                    // Peta penugasan anggota per peran/instrumen
                    const roleMembersMap: Record<string, typeof event.schedule_assignments> = {};
                    for (const assignment of event.schedule_assignments ?? []) {
                      if (!roleMembersMap[assignment.role]) {
                        roleMembersMap[assignment.role] = [];
                      }
                      roleMembersMap[assignment.role].push(assignment);
                    }

                    return (
                      <TableRow
                        key={event.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Tanggal */}
                        <TableTd className="font-semibold text-[#0A192F] whitespace-nowrap">
                          {formattedDate}
                        </TableTd>

                        {/* Lokasi */}
                        <TableTd>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {event.location}
                          </span>
                        </TableTd>

                        {/* Col untuk Setiap Instrumen */}
                        {INSTRUMENTS.map((inst) => {
                          const assignments = roleMembersMap[inst.id] ?? [];

                          return (
                            <TableTd key={inst.id}>
                              {assignments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {assignments.map((assignment) => (
                                    <span
                                      key={assignment.id}
                                      className="inline-flex items-center gap-1 bg-[#0A192F] text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm"
                                    >
                                      {assignment.members?.name}
                                      {assignment.members?.is_probation && (
                                        <span className="text-[9px] text-[#D4AF37] font-bold">
                                          (Prob)
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-xs italic">
                                  -
                                </span>
                              )}
                            </TableTd>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Information Footer Dresscode per Sesi */}
            {weekEvents.some((e) => e.dresscode) && (
              <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap gap-4">
                {weekEvents.map(
                  (e) =>
                    e.dresscode && (
                      <div key={e.id} className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#0A192F]">
                          👕 DC {e.location}:
                        </span>
                        <span>{e.dresscode}</span>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}