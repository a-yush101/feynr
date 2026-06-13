import type { Metadata } from 'next';
import { Inter, Caveat, Permanent_Marker } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-chalk',
});

const marker = Permanent_Marker({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-marker',
});


export const metadata: Metadata = {
  title: 'Feynr — Learn by Explaining',
  description:
    'AI-powered Socratic learning using the Feynman Technique. Explain a concept, get targeted follow-up questions, and discover exactly what you don\'t know.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable} ${marker.variable} font-sans h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-inter)' }}>{children}</body>
    </html>
  );
}
