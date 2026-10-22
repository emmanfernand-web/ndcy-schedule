import Link from 'next/link';
import { CalendarDays, Home } from 'lucide-react';
import { Wordmark } from '@/components/ui/wordmark';
import { buttonClasses } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="theme-dark starfield flex min-h-dvh flex-col items-center justify-center px-4 text-center text-fg">
      <Wordmark />
      <h1 className="gold-text mt-6 font-display text-[8rem] font-semibold leading-none sm:text-[11rem]">
        404
      </h1>
      <p className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        Halaman ini tidak ditemukan
      </p>
      <p className="mt-3 max-w-sm text-muted">
        Mungkin alamatnya salah ketik, atau halamannya sudah dipindahkan.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Link href="/" className={buttonClasses('primary', 'lg')}>
          <Home className="h-5 w-5" aria-hidden /> Ke Form Ketersediaan
        </Link>
        <Link href="/jadwal-bulan-ini" className={buttonClasses('secondary', 'lg')}>
          <CalendarDays className="h-5 w-5" aria-hidden /> Lihat Jadwal
        </Link>
      </div>
    </div>
  );
}
