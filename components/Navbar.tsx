'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const STEPS = [
  { label: 'Explain', href: '/explain', path: '/explain' },
  { label: 'Session', href: '/session', path: '/session' },
  { label: 'Report', href: '/report', path: '/report' },
  { label: 'Quiz', href: '/quiz', path: '/quiz' },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
        <motion.div
          whileHover={{ rotate: -5, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="w-8 h-8 rounded bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--yellow)]"
        >
          <Brain size={18} />
        </motion.div>
        <span className="text-[var(--chalk)] font-bold text-xl tracking-tight group-hover:text-[var(--chalk-dim)] transition-colors">
          Feynr
        </span>
      </Link>

      {/* Progress steps — only shown inside the app flow */}
      {currentIndex !== -1 && (
        <div className="flex items-center gap-1" id="nav-progress">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;
            const isFuture = i > currentIndex;

            return (
               <div key={step.path} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex flex-col items-center"
                >
                  {/* Step dot */}
                  <div
                    className={`relative w-[10px] h-[10px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--blue)] shadow-[0_0_8px_var(--blue)] scale-110'
                        : isCompleted
                          ? 'bg-[var(--blue)] opacity-60'
                          : 'bg-[var(--chalk-dimmer)]'
                    }`}
                  >
                  </div>
                  {/* Step label */}
                  <span
                    className={`mt-1.5 text-[10px] font-bold tracking-wide transition-colors ${
                      isActive
                        ? 'text-[var(--blue)]'
                        : isCompleted
                          ? 'text-[var(--chalk-dim)]'
                          : 'text-[var(--chalk-dimmer)]'
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="mx-2 mb-4 relative h-[2px] w-8">
                    <div className="absolute inset-0 bg-[var(--border-soft)] rounded-full" />
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-[var(--blue)]/50 rounded-full origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Right side pill */}
      <div
        className={`text-xs font-bold px-4 py-1.5 rounded border transition-all ${
          currentIndex !== -1
            ? 'bg-[var(--blue)]/10 border-[var(--blue)]/20 text-[var(--blue)]'
            : 'bg-[var(--surface-2)] border-[var(--border)] text-[var(--chalk-dim)]'
        }`}
      >
        {currentIndex !== -1 ? `Step ${currentIndex + 1} of 4` : 'AI Tutor'}
      </div>
    </nav>
  );
}
