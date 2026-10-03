'use client';

import { useRef, useTransition } from 'react';
import type { ExportButtonProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ExportButton({
  targetRef,
  filename = 'jadwal-ndc',
}: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      const element = targetRef.current;
      if (!element) return;

      // Dynamically import html2canvas if available, otherwise fallback to print
      try {
        const moduleName = 'html2canvas';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html2canvasModule = (await import(/* webpackIgnore: true */ moduleName)) as any;
        const html2canvas = html2canvasModule?.default || html2canvasModule;
        
        if (typeof html2canvas === 'function') {
          const canvas = await html2canvas(element, {
            scale: 2, // 2x for retina quality
            useCORS: true,
            backgroundColor: '#ffffff',
          });

          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          return;
        }
      } catch {
        // Fallback: print to PDF/printer via browser print dialog
      }
      window.print();
    });
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleExport}
      isLoading={isPending}
      leftIcon={<Download className="h-4 w-4" />}
    >
      Export PNG
    </Button>
  );
}
