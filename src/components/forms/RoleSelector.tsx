'use client';

import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { INSTRUMENTS } from '@/lib/constant';
import { RoleIcon } from '@/components/ui/role-icon';
import { cn } from '@/lib/cn';
import type { RoleSelectorProps } from '@/types';

export function RoleSelector({ selectedRole, onSelect }: RoleSelectorProps) {
  const [changing, setChanging] = useState(false);
  const selected = INSTRUMENTS.find((i) => i.id === selectedRole);

  if (selected && !changing) {
    return (
      <button
        type="button"
        onClick={() => setChanging(true)}
        className="reveal inline-flex min-h-11 items-center gap-3 rounded-full border border-gold-500 bg-gold-500/10 py-2 pl-4 pr-4 text-fg"
      >
        <RoleIcon role={selected.id} className="h-5 w-5 text-accent" />
        <span className="font-medium">{selected.label}</span>
        <span className="flex items-center gap-1 text-sm text-muted">
          · <Pencil className="h-3.5 w-3.5" aria-hidden /> Ubah
        </span>
      </button>
    );
  }

  return (
    <fieldset>
      <legend className="sr-only">Pilih instrumen</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {INSTRUMENTS.map((inst) => (
          <label key={inst.id} className="block cursor-pointer">
            <input
              type="radio"
              name="instrument"
              value={inst.id}
              checked={selectedRole === inst.id}
              onChange={() => {
                onSelect(inst.id);
                setChanging(false);
              }}
              onClick={() => {
                // klik ulang pada pilihan yang sama tetap menutup daftar
                if (selectedRole === inst.id) setChanging(false);
              }}
              className="peer sr-only"
            />
            <span
              className={cn(
                'flex min-h-14 items-center gap-4 rounded-xl border border-line bg-panel px-4 transition-colors',
                'hover:border-line-strong peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold-500',
                'peer-checked:border-gold-500 peer-checked:bg-gold-500/10'
              )}
            >
              <RoleIcon role={inst.id} className="h-6 w-6 text-muted" />
              <span className="flex-1 text-base font-medium">{inst.label}</span>
              {selectedRole === inst.id && (
                <Check className="h-5 w-5 text-accent" aria-hidden />
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
