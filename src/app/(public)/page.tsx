'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { RoleSelector } from '@/components/forms/RoleSelector';
import { NameGrid } from '@/components/forms/NameGrid';
import {
  ScheduleSection,
  type SavedAvailability,
} from '@/components/forms/ScheduleSection';
import { SuccessPanel } from '@/components/forms/SuccessPanel';
import { PageHeader } from '@/components/public/PageHeader';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionLabel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import type { MemberRole, MonthlyPeriod } from '@/types/database';
import { targetPeriodMonth } from '@/lib/weekend';
import { createBrowserClient } from '@/lib/supabase/client';

const STEP_LABELS = ['Instrumen', 'Nama', 'Ketersediaan'];

function scrollToEl(el: HTMLElement | null) {
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function PublicAvailabilityPage() {
  const [activePeriod, setActivePeriod] = useState<MonthlyPeriod | null>(null);
  const [periodLoading, setPeriodLoading] = useState(true);
  const [periodError, setPeriodError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [saved, setSaved] = useState<SavedAvailability | null>(null);

  const nameRef = useRef<HTMLElement>(null);
  const dateRef = useRef<HTMLElement>(null);

  const step = !selectedRole ? 1 : !selectedMemberId ? 2 : 3;

  useEffect(() => {
    const fetchPeriod = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('monthly_periods')
        .select('*')
        .eq('month_year', targetPeriodMonth())
        .maybeSingle<MonthlyPeriod>();

      setPeriodError(!!error);
      setActivePeriod(data ?? null);
      setPeriodLoading(false);
    };
    fetchPeriod();
  }, [attempt]);

  // Auto-scroll ke langkah yang baru muncul
  useEffect(() => {
    if (selectedRole) scrollToEl(nameRef.current);
  }, [selectedRole]);
  useEffect(() => {
    if (selectedMemberId) scrollToEl(dateRef.current);
  }, [selectedMemberId]);

  const handleRoleSelect = (role: MemberRole) => {
    if (role !== selectedRole) {
      setSelectedMemberId(null);
      setSelectedMemberName('');
    }
    setSelectedRole(role);
  };

  const handleMemberSelect = async (memberId: string) => {
    setSelectedMemberId(memberId);
    const supabase = createBrowserClient();
    const { data } = await supabase
      .from('members')
      .select('name')
      .eq('id', memberId)
      .single();
    setSelectedMemberName(data?.name ?? '');
  };

  return (
    <main>
      <PageHeader
        title="Form Ketersediaan"
        subtitle={
          periodLoading ? (
            <Skeleton className="h-5 w-40" />
          ) : activePeriod ? (
            <>Periode: {activePeriod.label}</>
          ) : (
            'Periode belum dibuat'
          )
        }
        linkHref="/jadwal-bulan-ini"
        linkLabel="Jadwal Bulan Ini"
        linkShortLabel="Jadwal"
        linkIcon={<CalendarDays className="h-4 w-4" aria-hidden />}
      />

      <div className="mx-auto w-full max-w-3xl space-y-8 px-4">
        {periodLoading && <Skeleton className="h-64" />}

        {!periodLoading && periodError && (
          <EmptyState title="Gagal memuat periode">
            <Button
              variant="secondary"
              className="mt-2"
              onClick={() => {
                setPeriodLoading(true);
                setAttempt((a) => a + 1);
              }}
            >
              Coba lagi
            </Button>
          </EmptyState>
        )}

        {!periodLoading && !periodError && !activePeriod && (
          <EmptyState title="Periode belum dibuat">
            Hubungi admin untuk membuat periode bulan ini.
          </EmptyState>
        )}

        {activePeriod && saved && selectedRole && (
          <SuccessPanel
            name={selectedMemberName}
            role={selectedRole}
            saved={saved}
            onEdit={() => setSaved(null)}
          />
        )}

        {activePeriod && !saved && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted">
                Langkah {step} dari 3 · {STEP_LABELS[step - 1]}
              </p>
              <Progress value={step} max={3} label="Progres pengisian" />
            </div>

            <section className="space-y-3">
              <SectionLabel>Instrumen</SectionLabel>
              <RoleSelector
                selectedRole={selectedRole}
                onSelect={handleRoleSelect}
              />
            </section>

            {selectedRole && (
              <section
                ref={nameRef}
                className="reveal scroll-mt-4 space-y-3"
              >
                <SectionLabel>Nama</SectionLabel>
                <NameGrid
                  key={selectedRole}
                  role={selectedRole}
                  selectedMemberId={selectedMemberId}
                  onSelect={handleMemberSelect}
                />
              </section>
            )}

            {selectedMemberId && (
              <section
                ref={dateRef}
                className="reveal scroll-mt-4 space-y-3"
              >
                <div>
                  <SectionLabel>Ketersediaan</SectionLabel>
                  <p className="mt-2 text-sm text-muted">
                    Pilih tanggal yang kamu <strong className="text-fg">bisa hadir</strong> di {activePeriod.label}.
                  </p>
                </div>
                <ScheduleSection
                  key={selectedMemberId}
                  memberId={selectedMemberId}
                  memberName={selectedMemberName}
                  period={activePeriod}
                  onSaved={(a) => {
                    setSaved(a);
                    window.scrollTo({ top: 0 });
                  }}
                />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
