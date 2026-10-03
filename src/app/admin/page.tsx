'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RoleSelector } from '@/components/forms/RoleSelector';
import { NameGrid } from '@/components/forms/NameGrid';
import { ScheduleSection } from '@/components/forms/ScheduleSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MemberRole, MonthlyPeriod } from '@/types/database';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, Music2, CalendarDays } from 'lucide-react';

// Step indicator component
function StepIndicator({
  step,
  current,
  label,
}: {
  step: number;
  current: number;
  label: string;
}) {
  const isCompleted = current > step;
  const isActive = current === step;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={[
          'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
          isCompleted
            ? 'bg-[#D4AF37] text-[#0A192F]'
            : isActive
            ? 'bg-[#0A192F] text-white ring-2 ring-offset-2 ring-[#D4AF37]'
            : 'bg-slate-100 text-slate-400',
        ].join(' ')}
      >
        {isCompleted ? '✓' : step}
      </div>
      <span
        className={[
          'text-[11px] font-medium hidden sm:block',
          isActive ? 'text-[#0A192F]' : 'text-slate-400',
        ].join(' ')}
      >
        {label}
      </span>
    </div>
  );
}

export default function PublicAvailabilityPage() {
  const [activePeriod, setActivePeriod] = useState<MonthlyPeriod | null>(null);
  const [periodLoading, setPeriodLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState<MemberRole | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState<string>('');

  const currentStep = !selectedRole ? 1 : !selectedMemberId ? 2 : 3;

  useEffect(() => {
    const fetchPeriod = async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('monthly_periods')
        .select('*')
        .eq('is_active', true)
        .maybeSingle<MonthlyPeriod>();

      if (error) {
        console.error('Error fetching period:', error);
      }

      setActivePeriod(data ?? null);
      setPeriodLoading(false);
    };
    fetchPeriod();
  }, []);

  const handleRoleSelect = (role: MemberRole) => {
    setSelectedRole(role);
    setSelectedMemberId(null);
    setSelectedMemberName('');
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
    <main className="min-h-screen bg-slate-50">
      {/* Top Navbar & Header */}
      <header className="bg-[#0A192F] text-white pt-6 pb-10 px-4 shadow-lg relative">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Bar Navigation (Slotted Button) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest sm:text-sm">
                NDC Music Ministry
              </span>
            </div>

            {/* Tombol Akses Pintas ke /jadwal-bulan-ini */}
            <Link
              href="/jadwal-bulan-ini"
              className="inline-flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Jadwal Bulan Ini</span>
            </Link>
          </div>

          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Form Ketersediaan
            </h1>
            {periodLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#D4AF37]" />
              </div>
            ) : activePeriod ? (
              <p className="text-slate-300 text-base">
                Periode:{' '}
                <span className="text-[#D4AF37] font-semibold">
                  {activePeriod.label}
                </span>
              </p>
            ) : (
              <p className="text-slate-400 text-sm">
                Tidak ada periode aktif saat ini.
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Step Progress */}
        <div className="flex items-center justify-center gap-4">
          <StepIndicator step={1} current={currentStep} label="Instrumen" />
          <div className="flex-1 h-0.5 bg-slate-200 max-w-[80px]" />
          <StepIndicator step={2} current={currentStep} label="Nama" />
          <div className="flex-1 h-0.5 bg-slate-200 max-w-[80px]" />
          <StepIndicator step={3} current={currentStep} label="Jadwal" />
        </div>

        {/* Jika belum ada periode aktif */}
        {!activePeriod && !periodLoading && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <p className="text-lg font-medium">
                Belum ada periode aktif. Hubungi admin.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Jika periode aktif tersedia */}
        {activePeriod && (
          <>
            {/* Step 1: Pilih Instrumen */}
            <Card>
              <CardHeader>
                <CardTitle as="h2">
                  <span className="text-[#D4AF37] mr-2">01.</span>Pilih Instrumen Kamu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RoleSelector
                  selectedRole={selectedRole}
                  onSelect={handleRoleSelect}
                />
              </CardContent>
            </Card>

            {/* Step 2: Pilih Nama */}
            {selectedRole && (
              <Card>
                <CardHeader>
                  <CardTitle as="h2">
                    <span className="text-[#D4AF37] mr-2">02.</span>Pilih Namamu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NameGrid
                    role={selectedRole}
                    selectedMemberId={selectedMemberId}
                    onSelect={handleMemberSelect}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Pilih Tanggal Tersedia */}
            {selectedMemberId && (
              <Card>
                <CardHeader>
                  <CardTitle as="h2">
                    <span className="text-[#D4AF37] mr-2">03.</span>Pilih Tanggal Tersedia
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Centang semua tanggal yang kamu <strong>bisa hadir</strong> di bulan{' '}
                    <span className="text-[#0A192F] font-semibold">
                      {activePeriod.label}
                    </span>
                    .
                  </p>
                </CardHeader>
                <CardContent>
                  <ScheduleSection
                    memberId={selectedMemberId}
                    memberName={selectedMemberName}
                    period={activePeriod}
                  />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} NDC Music Ministry — All rights reserved.
      </footer>
    </main>
  );
}