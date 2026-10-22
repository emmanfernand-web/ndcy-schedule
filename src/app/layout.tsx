import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--nf-display',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--nf-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'NDCYC',
    template: '%s | NDCYC',
  },
  description:
    'Aplikasi penjadwalan tim musik NDCYC — kelola ketersediaan, jadwal pelayanan, dan songlist.',
};

export const viewport: Viewport = {
  themeColor: '#060d1f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
