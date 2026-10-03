'use client';

import { INSTRUMENTS } from '@/lib/constant';
import type { MemberRole } from '@/types/database';
import type { RoleSelectorProps } from '@/types';

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
        Pilih Instrumen
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {INSTRUMENTS.map((instrument) => {
          const isActive = selectedRole === instrument.id;
          return (
            <button
              key={instrument.id}
              type="button"
              onClick={() => onSelect(instrument.id as MemberRole)}
              className={[
                'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                'text-sm font-medium border-2 transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2',
                isActive
                  ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37] shadow-md scale-[1.02]'
                  : 'bg-white text-[#0A192F] border-slate-200 hover:border-[#D4AF37] hover:shadow-sm',
              ].join(' ')}
              aria-pressed={isActive}
            >
              {instrument.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
