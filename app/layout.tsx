import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Feynr — Learn by Explaining',
  description:
    'AI-powered Socratic learning using the Feynman Technique. Explain a concept, get targeted follow-up questions, and discover exactly what you do not know.',
  keywords: ['feynman technique', 'socratic learning', 'AI tutor', 'active recall', 'learning'],
  openGraph: {
    title: 'Feynr — Learn by Explaining',
    description: 'Teach a concept to an AI. Get Socratic questions. Own your understanding.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
