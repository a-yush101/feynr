'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'chat' | 'report' | 'quiz' | 'text';
  lines?: number;
  className?: string;
}

const shimmer = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: { duration: 1.8, repeat: Infinity, ease: 'linear' },
  },
};

function SkeletonLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
  return (
    <motion.div
      {...shimmer}
      className={`${width} ${height} rounded-full`}
      style={{
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '400% 100%',
      }}
    />
  );
}

function ChatSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* AI message left */}
      <div className="flex items-start gap-3 max-w-[75%]">
        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
        <div className="flex-1 space-y-2 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-4/5" />
          <SkeletonLine width="w-3/5" />
        </div>
      </div>

      {/* User message right */}
      <div className="flex items-start gap-3 max-w-[75%] self-end flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex-shrink-0" />
        <div className="flex-1 space-y-2 p-4 rounded-2xl bg-[#f97316]/[0.06] border border-[#f97316]/[0.1]">
          <SkeletonLine width="w-full" />
          <SkeletonLine width="w-3/4" />
        </div>
      </div>

      {/* AI thinking */}
      <div className="flex items-start gap-3 max-w-[75%]">
        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <ThinkingDots />
        </div>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Score bars */}
      {[80, 60, 75, 55].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <SkeletonLine width="w-24" height="h-3" />
            <SkeletonLine width="w-10" height="h-3" />
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.04]">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                backgroundSize: '400% 100%',
                width: '60%',
              }}
              animate={{ backgroundPosition: ['200% center', '-200% center'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: i * 0.15 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TextSkeleton({ lines = 3 }: { lines: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-11/12', 'w-3/4', 'w-full'];
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-white/40"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function LoadingSkeleton({
  variant = 'text',
  lines = 3,
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div className={`w-full ${className}`} aria-busy="true" aria-live="polite">
      {variant === 'chat' && <ChatSkeleton />}
      {variant === 'report' && <ReportSkeleton />}
      {variant === 'text' && <TextSkeleton lines={lines} />}
      {variant === 'quiz' && <TextSkeleton lines={4} />}
    </div>
  );
}
