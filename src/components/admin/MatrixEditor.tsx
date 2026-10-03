'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { MatrixEditorProps } from '@/types';
import type { MemberRole, Member, Availability } from '@/types/database';
import { INSTRUMENTS } from '@/lib/constant';
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableTd,
  TableTh,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Save, UserPlus, X, Check } from 'lucide-react';

type AssignmentMap = Record<string, Record<MemberRole, Member[]>>;

function buildAssignmentMap(
  events: MatrixEditorProps['events']
): AssignmentMap {
  const map: AssignmentMap = {};
  for (const event of events) {
    map[event.id] = {} as Record<MemberRole, Member[]>;
    for (const assignment of event.schedule_assignments ?? []) {
      const role = assignment.role;
      if (!map[event.id][role]) map[event.id][role] = [];

      // DEDUP CHECK: Mencegah penambahan nama ganda saat pembentukan state awal
      const isAlreadyAdded = map[event.id][role].some(
        (m) => m.id === assignment.members.id
      );
      if (!isAlreadyAdded) {
        map[event.id][role].push(assignment.members);
      }
    }
  }
  return map;
}

// Helper untuk mengecek ketersediaan pelayan pada tanggal & lokasi event
function checkMemberAvailability(
  memberId: string,
  serviceDate: string, // contoh format: "2026-10-03"
  location: string,
  availabilities: Availability[]
): boolean {
  const memberAvail = availabilities.find((a) => a.member_id === memberId);
  if (!memberAvail) return false;

  const dates = location.includes('Central Park')
    ? memberAvail.cp_dates
    : memberAvail.lw_dates;

  if (!dates || dates.length === 0) return false;

  // Mendukung pencocokan format string ISO "2026-10-03" maupun string tanggal "3 Oct"
  const eventDateObj = new Date(serviceDate + 'T00:00:00');
  const dayNum = eventDateObj.getDate().toString();

  return dates.some((d) => {
    if (d === serviceDate) return true;
    if (d.startsWith(dayNum + ' ') || d.startsWith(dayNum.padStart(2, '0') + ' ')) {
      return true;
    }
    return false;
  });
}

interface AssignmentCellProps {
  eventId: string;
  serviceDate: string;
  location: string;
  role: MemberRole;
  assignedMembers: Member[];
  availableMembers: Member[];
  availabilities: Availability[];
  onAdd: (eventId: string, role: MemberRole, memberId: string) => void;
  onRemove: (eventId: string, role: MemberRole, memberId: string) => void;
}

function AssignmentCell({
  eventId,
  serviceDate,
  location,
  role,
  assignedMembers,
  availableMembers,
  availabilities,
  onAdd,
  onRemove,
}: AssignmentCellProps) {
  const [open, setOpen] = useState(false);
  const assignedIds = assignedMembers.map((m) => m.id);

  // Filter anggota yang belum dimasukkan di slot ini
  const unassigned = availableMembers.filter(
    (m) => m.role === role && !assignedIds.includes(m.id)
  );

  // Urutkan pelayan: Yang "Bisa Hadir" diurutkan paling atas
  const sortedUnassigned = [...unassigned].sort((a, b) => {
    const aAvailable = checkMemberAvailability(
      a.id,
      serviceDate,
      location,
      availabilities
    );
    const bAvailable = checkMemberAvailability(
      b.id,
      serviceDate,
      location,
      availabilities
    );
    if (aAvailable === bAvailable) return a.name.localeCompare(b.name);
    return aAvailable ? -1 : 1;
  });

  return (
    <div className="min-w-[130px]">
      {/* Assigned Chips */}
      <div className="flex flex-wrap gap-1 mb-1">
        {assignedMembers.map((member) => (
          <span
            key={member.id}
            className="inline-flex items-center gap-1 bg-[#0A192F] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm"
          >
            {member.name}
            {member.is_probation && (
              <span className="text-[9px] text-[#D4AF37] font-semibold">
                (P)
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemove(eventId, role, member.id)}
              className="hover:text-red-300 transition-colors ml-0.5"
              aria-label={`Remove ${member.name}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>

      {/* Add button & Dropdown Picker */}
      {sortedUnassigned.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-amber-500 font-medium transition-colors"
          >
            <UserPlus className="h-3 w-3" />
            Tambah
          </button>

          {open && (
            <div className="absolute z-30 top-6 left-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[170px] max-h-[220px] overflow-y-auto">
              <div className="px-2 py-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Pilih Pelayan
              </div>
              {sortedUnassigned.map((member) => {
                const isAvailable = checkMemberAvailability(
                  member.id,
                  serviceDate,
                  location,
                  availabilities
                );

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      onAdd(eventId, role, member.id);
                      setOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={
                        isAvailable
                          ? 'font-medium text-slate-800'
                          : 'text-slate-400'
                      }
                    >
                      {member.name}
                      {member.is_probation && (
                        <span className="ml-1 text-[9px] text-amber-600 font-semibold">
                          (P)
                        </span>
                      )}
                    </span>

                    {/* Indikator Tag Status Ketersediaan */}
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="h-2.5 w-2.5" /> Bisa
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-300">-</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MatrixEditor({
  monthYear,
  events,
  availableMembers,
  availabilities = [],
}: MatrixEditorProps) {
  const router = useRouter();
  const [assignmentMap, setAssignmentMap] = useState<AssignmentMap>(
    buildAssignmentMap(events)
  );
  const [isPending, startTransition] = useTransition();
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const roles = INSTRUMENTS.map((i) => i.id as MemberRole);

  const handleAdd = (
    eventId: string,
    role: MemberRole,
    memberId: string
  ) => {
    const member = availableMembers.find((m) => m.id === memberId);
    if (!member) return;

    setAssignmentMap((prev) => {
      const copy = { ...prev };
      if (!copy[eventId]) copy[eventId] = {} as Record<MemberRole, Member[]>;
      if (!copy[eventId][role]) copy[eventId][role] = [];

      // DEDUP CHECK: Cegah penambahan jika nama sudah ada di slot tersebut
      const exists = copy[eventId][role].some((m) => m.id === memberId);
      if (exists) return prev;

      copy[eventId][role] = [...copy[eventId][role], member];
      return copy;
    });
  };

  const handleRemove = (
    eventId: string,
    role: MemberRole,
    memberId: string
  ) => {
    setAssignmentMap((prev) => {
      const copy = { ...prev };
      if (copy[eventId]?.[role]) {
        copy[eventId][role] = copy[eventId][role].filter(
          (m) => m.id !== memberId
        );
      }
      return copy;
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      setSaveMsg(null);

      // Bersihkan dan bentuk payload penugasan tanpa duplikasi ID
      const assignments: {
        event_id: string;
        member_id: string;
        role: MemberRole;
      }[] = [];

      for (const [eventId, roleMap] of Object.entries(assignmentMap)) {
        for (const [role, members] of Object.entries(roleMap)) {
          const uniqueMemberIds = new Set<string>();
          for (const member of members) {
            if (!uniqueMemberIds.has(member.id)) {
              uniqueMemberIds.add(member.id);
              assignments.push({
                event_id: eventId,
                member_id: member.id,
                role: role as MemberRole,
              });
            }
          }
        }
      }

      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month_year: monthYear, assignments }),
      });

      if (res.ok) {
        setSaveMsg('Jadwal berhasil disimpan! ✨');
        // REFRESH CACHE SERVER untuk mensinkronisasi data ke halaman publik & admin
        router.refresh();
      } else {
        const json = await res.json();
        setSaveMsg(`Error: ${json.error ?? 'Gagal menyimpan.'}`);
      }
    });
  };

  if (events.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-8 text-center">
        Belum ada event untuk bulan ini. Buat event terlebih dahulu.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Button & Informasi */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-slate-500">
          Klik nama untuk menambah atau hapus anggota dari jadwal. Nama dengan tag{' '}
          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
            ✓ Bisa
          </span>{' '}
          diurutkan paling atas.
        </p>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span
              className={[
                'text-sm font-medium',
                saveMsg.startsWith('Error')
                  ? 'text-red-600'
                  : 'text-emerald-600',
              ].join(' ')}
            >
              {saveMsg}
            </span>
          )}
          <Button
            variant="gold"
            size="sm"
            onClick={handleSave}
            isLoading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Simpan Jadwal
          </Button>
        </div>
      </div>

      {/* Tabel Matriks */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
        <Table>
          <TableHead>
            <TableRow className="bg-[#0A192F]">
              <TableTh className="text-white">Tanggal</TableTh>
              <TableTh className="text-white">Lokasi</TableTh>
              {roles.map((role) => (
                <TableTh key={role} className="text-[#D4AF37]">
                  {role}
                </TableTh>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className="hover:bg-slate-50">
                <TableTd className="text-slate-700 font-medium whitespace-nowrap">
                  {new Date(event.service_date + 'T00:00:00').toLocaleDateString(
                    'id-ID',
                    { day: 'numeric', month: 'short' }
                  )}
                </TableTd>
                <TableTd>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {event.location}
                  </span>
                </TableTd>
                {roles.map((role) => (
                  <TableTd key={role}>
                    <AssignmentCell
                      eventId={event.id}
                      serviceDate={event.service_date}
                      location={event.location}
                      role={role}
                      assignedMembers={assignmentMap[event.id]?.[role] ?? []}
                      availableMembers={availableMembers}
                      availabilities={availabilities}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                    />
                  </TableTd>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}