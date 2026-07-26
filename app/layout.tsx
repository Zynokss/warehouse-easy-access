import type { Metadata } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Warehouse Express | ويرهاوس إكسبريس',
  description: 'B2B Express Requisition & Catalog Terminal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#f8fafc]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}