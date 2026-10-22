'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import type { Toast, ToastType } from '@/types';
import { cn } from '@/lib/cn';

interface ToastContextValue {
  push: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ push: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="no-print pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'reveal pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border bg-navy-900 px-4 py-3 text-sm text-ink-100',
              t.type === 'error' ? 'border-[#ff9d9d]/60' : 'border-gold-500/50'
            )}
          >
            {t.type === 'error' ? (
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#ff9d9d]" aria-hidden />
            ) : (
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden />
            )}
            <p className="flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Tutup"
              className="-m-2 flex h-9 w-9 items-center justify-center text-ink-300 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
