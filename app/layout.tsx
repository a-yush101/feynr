import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Feynr — Learn Anything, Faster. Powered by AI.',
  description:
    'Feynr is an adaptive learning platform that breaks down complex topics into clear, personalized explanations — built around how you actually think.',
  keywords: ['adaptive learning', 'AI tutor', 'personalized study', 'Feynman technique'],
  openGraph: {
    title: 'Feynr — Learn Anything, Faster.',
    description:
      'AI-powered adaptive learning that meets you where you are. Smart explanations, adaptive quizzes, and dynamic learning paths.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`} style={{ scrollBehavior: 'smooth' }} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased" style={{ fontFamily: 'var(--font-inter)' }}>
        {children}
      </body>
    </html>
  );
}
