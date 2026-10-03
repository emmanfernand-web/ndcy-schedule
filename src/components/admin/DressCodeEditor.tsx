'use client';

import { useState, useTransition } from 'react';
import type { DressCodeEditorProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Shirt, Save } from 'lucide-react';

export function DressCodeEditor({ events, onUpdate }: DressCodeEditorProps) {
  const [dresscodes, setDresscodes] = useState<Record<string, string>>(
    Object.fromEntries(events.map((e) => [e.id, e.dresscode ?? '']))
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedMsg, setSavedMsg] = useState<Record<string, string>>({});

  const handleSave = async (eventId: string) => {
    setSaving((prev) => ({ ...prev, [eventId]: true }));
    setSavedMsg((prev) => ({ ...prev, [eventId]: '' }));

    try {
      await onUpdate(eventId, dresscodes[eventId] ?? '');
      setSavedMsg((prev) => ({ ...prev, [eventId]: '✓ Tersimpan' }));
    } catch {
      setSavedMsg((prev) => ({ ...prev, [eventId]: '✗ Gagal' }));
    } finally {
      setSaving((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  if (events.length === 0) {
    return (
      <p className="text-slate-500 text-sm py-4">
        Belum ada event. Tambahkan event di tab Matrix terlebih dahulu.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
        >
          {/* Event info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0A192F] truncate">
              {event.sub_service} —{' '}
              {new Date(event.service_date + 'T00:00:00').toLocaleDateString(
                'id-ID',
                { weekday: 'long', day: 'numeric', month: 'long' }
              )}
            </p>
            <p className="text-xs text-slate-500">
              Lokasi: {event.location} · Minggu ke-{event.week_number}
            </p>
          </div>

          {/* Dresscode input */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Shirt className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={dresscodes[event.id] ?? ''}
                onChange={(e) =>
                  setDresscodes((prev) => ({
                    ...prev,
                    [event.id]: e.target.value,
                  }))
                }
                placeholder="e.g. Smart Casual"
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] w-44 transition-all"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSave(event.id)}
              isLoading={saving[event.id]}
              leftIcon={<Save className="h-3.5 w-3.5" />}
            >
              Simpan
            </Button>
            {savedMsg[event.id] && (
              <span
                className={[
                  'text-xs font-medium',
                  savedMsg[event.id].startsWith('✓')
                    ? 'text-green-600'
                    : 'text-red-500',
                ].join(' ')}
              >
                {savedMsg[event.id]}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
