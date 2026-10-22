'use client';

import { useEffect, useState } from 'react';
import { Check, CircleAlert, UserX } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Member } from '@/types/database';
import type { NameGridProps } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ProbationMark } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

export function NameGrid({ role, selectedMemberId, onSelect }: NameGridProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const supabase = createBrowserClient();
      const { data, error: fetchError } = await supabase
        .from('members')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (cancelled) return;
      if (fetchError) {
        setError('Gagal memuat daftar nama.');
        setMembers([]);
      } else {
        setError(null);
        setMembers(data ?? []);
      }
      setIsLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [role, attempt]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-busy>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<CircleAlert className="h-6 w-6" strokeWidth={1.5} />}
        title={error}
      >
        <Button variant="secondary" className="mt-2" onClick={() => {
            setIsLoading(true);
            setAttempt((a) => a + 1);
          }}>
          Coba lagi
        </Button>
      </EmptyState>
    );
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon={<UserX className="h-6 w-6" strokeWidth={1.5} />}
        title="Belum ada nama untuk instrumen ini"
      >
        Hubungi admin kalau namamu belum terdaftar.
      </EmptyState>
    );
  }

  return (
    <fieldset>
      <legend className="sr-only">Pilih namamu</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {members.map((member) => (
          <label key={member.id} className="block cursor-pointer">
            <input
              type="radio"
              name="member"
              value={member.id}
              checked={selectedMemberId === member.id}
              onChange={() => onSelect(member.id)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex min-h-14 flex-col justify-center rounded-xl border border-line bg-panel px-4 py-2 transition-colors',
                'hover:border-line-strong peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500',
                'peer-checked:border-gold-500 peer-checked:bg-gold-500/10'
              )}
            >
              <span className="flex items-center justify-between gap-2 font-medium">
                <span className="truncate">{member.name}</span>
                {selectedMemberId === member.id && (
                  <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                )}
              </span>
              {member.is_probation && <ProbationMark />}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
