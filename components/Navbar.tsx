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
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group" id="nav-logo">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#f97316] flex items-center justify-center"
        >
          <Brain size={16} className="text-white" />
        </motion.div>
        <span className="text-white font-bold text-lg tracking-tight group-hover:text-white/80 transition-colors">
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
                    className={`relative w-2 h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-[#f97316] shadow-lg shadow-orange-500/40 scale-125'
                        : isCompleted
                          ? 'bg-[#f97316]/60'
                          : 'bg-white/20'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#f97316]"
                        animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>
                  {/* Step label */}
                  <span
                    className={`mt-1 text-[10px] font-medium tracking-wide transition-colors ${
                      isActive
                        ? 'text-[#f97316]'
                        : isCompleted
                          ? 'text-white/50'
                          : 'text-white/20'
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="mx-2 mb-3 relative h-[1px] w-8">
                    <div className="absolute inset-0 bg-white/10 rounded-full" />
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-[#f97316]/50 rounded-full origin-left"
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
        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
          currentIndex !== -1
            ? 'bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]'
            : 'bg-white/[0.04] border-white/[0.08] text-white/40'
        }`}
      >
        {currentIndex !== -1 ? `Step ${currentIndex + 1} of 4` : 'AI · Powered'}
      </div>
    </nav>
  );
}
