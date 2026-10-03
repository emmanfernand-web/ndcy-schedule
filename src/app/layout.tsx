import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NDC Music Ministry',
    template: '%s | NDC Music Ministry',
  },
  description:
    'Aplikasi penjadwalan tim musik NDC — kelola ketersediaan, jadwal pelayanan, dan songlist.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
