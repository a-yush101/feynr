import type { Metadata } from 'next';
import { Nunito, Caveat } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-nunito',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-chalk',
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
    <html lang="en" className={`${nunito.variable} ${caveat.variable} font-sans h-full`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'var(--font-nunito)' }}>{children}</body>
    </html>
  );
}
