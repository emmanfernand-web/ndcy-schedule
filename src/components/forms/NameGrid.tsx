'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Member } from '@/types/database';
import type { NameGridProps } from '@/types';
import { Loader2, UserX } from 'lucide-react';

export function NameGrid({ role, selectedMemberId, onSelect }: NameGridProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      const supabase = createBrowserClient();
      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (fetchError) {
        setError('Gagal memuat anggota. Coba lagi.');
        setMembers([]);
      } else {
        setMembers(data ?? []);
      }

      setIsLoading(false);
    };

    fetchMembers();
  }, [role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Memuat anggota...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-red-500">
        <UserX className="h-5 w-5" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
        <UserX className="h-5 w-5" />
        <span className="text-sm">Tidak ada anggota aktif untuk instrumen ini.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
        Pilih Nama
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => {
          const isSelected = selectedMemberId === member.id;
          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member.id)}
              className={[
                'relative flex flex-col items-center justify-center px-4 py-4 rounded-xl',
                'text-sm font-medium border-2 transition-all duration-200 text-center',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-[#0A192F] text-white border-[#0A192F] shadow-md scale-[1.02]'
                  : 'bg-white text-[#0A192F] border-slate-200 hover:border-[#0A192F] hover:shadow-sm',
              ].join(' ')}
              aria-pressed={isSelected}
            >
              <span>{member.name}</span>
              {member.is_probation && (
                <span
                  className={[
                    'mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold tracking-wide',
                    isSelected
                      ? 'bg-[#D4AF37] text-[#0A192F]'
                      : 'bg-amber-100 text-amber-800',
                  ].join(' ')}
                >
                  Probation
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
