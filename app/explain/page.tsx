'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, AlertCircle, PenTool, Lightbulb, Zap, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession, setSession } from '@/lib/storage';

const WORD_TARGET = 80;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function WordCountRing({ count, target }: { count: number; target: number }) {
  const pct = Math.min(count / target, 1);
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const offset = circ - pct * circ;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56 }}>
      <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="56" height="56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--border)" strokeWidth="4" />
        <motion.circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={pct >= 1 ? '#8ecfb0' : '#8bbfd4'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 800, color: pct >= 1 ? 'var(--green)' : 'var(--chalk-dim)', zIndex: 1 }}>
        {count}
      </span>
    </div>
  );
}

const TIPS = [
  { icon: Lightbulb, text: 'Explain as if teaching a friend — no jargon.', color: '#e0d080' },
  { icon: Zap, text: 'Cover the core idea first, then details.', color: '#8bbfd4' },
  { icon: Target, text: 'Aim for 80+ words for thorough analysis.', color: '#e09080' },
];

export default function ExplainPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [depthLevel, setDepthLevel] = useState('intermediate');
  const [mounted, setMounted] = useState(false);

  const words = wordCount(explanation);
  const isReady = words >= 20 && !isLoading;

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session?.topic) { router.replace('/'); return; }
    setTopic(session.topic);
    setDepthLevel(session.tags?.[0] ?? 'intermediate');
    setTimeout(() => textareaRef.current?.focus(), 200);
  }, [router]);

  const handleSubmit = async () => {
    if (!isReady) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, depthLevel, explanation }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(e.error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as {
        claims: string[]; gaps: string[]; misconceptions: string[]; firstQuestion: string;
      };
      const session = getSession();
      if (session) {
        setSession({
          ...session, step: 'followup', updatedAt: new Date().toISOString(),
          messages: [
            { id: 'user-0', role: 'user', content: explanation, createdAt: new Date().toISOString() },
            {
              id: 'ai-0', role: 'assistant', content: data.firstQuestion, createdAt: new Date().toISOString(),
              metadata: {
                claims: JSON.stringify(data.claims),
                gaps: JSON.stringify(data.gaps),
                misconceptions: JSON.stringify(data.misconceptions),
              },
            },
          ],
        });
      }
      router.push('/session');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3 }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(139, 191, 212, 0.05) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(224, 144, 128, 0.05) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(30px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 12 }}>
            <PenTool size={12} style={{ color: 'var(--blue)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--chalk-dim)' }}>Teaching topic</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-chalk)', fontSize: 'clamp(3rem, 7vw, 4.5rem)', fontWeight: 700, color: 'var(--chalk)', marginBottom: 8, lineHeight: 1.1, transform: 'rotate(-1deg)' }}>
            Explain{' '}
            <span style={{ color: 'var(--yellow)' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-chalk)', fontSize: 24, color: 'var(--chalk-dim)', fontWeight: 500, transform: 'rotate(-1deg)' }}>
            Teach it to me like I have no background.
          </p>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, backgroundColor: '#212121', border: '1px solid rgba(220, 215, 200, 0.1)', fontSize: 13, fontWeight: 600, color: 'rgba(232, 226, 212, 0.55)' }}>
              <Icon size={14} style={{ color: tip.color }} />
              {tip.text}
            </div>
            );
          })}
        </motion.div>

        {/* Main card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <textarea
              ref={textareaRef}
              id="explanation-input"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && isReady) handleSubmit(); }}
              placeholder={`Start explaining ${topic} here. Think out loud — don't worry about being perfect...`}
              disabled={isLoading}
              aria-label="Explanation text area"
              style={{
                width: '100%', minHeight: 280, padding: '24px 24px 70px', backgroundColor: 'transparent',
                color: 'var(--chalk)', resize: 'none', border: 'none', outline: 'none',
                fontSize: 16, lineHeight: 1.7, fontFamily: 'inherit', boxSizing: 'border-box', fontWeight: 500,
              }}
            />
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <WordCountRing count={words} target={WORD_TARGET} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '2px solid var(--border-soft)', backgroundColor: 'var(--surface-2)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: words < WORD_TARGET ? 'var(--chalk-dimmer)' : 'var(--green)' }}>
              {words < WORD_TARGET ? `${WORD_TARGET - words} more words for best results` : '✓ Ready to analyze'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--chalk-dimmer)' }}>⌘+Enter to submit</span>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(224, 144, 128, 0.1)', border: '2px solid rgba(224, 144, 128, 0.2)', color: 'var(--coral)', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              <AlertCircle size={18} style={{ marginTop: 2, flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          id="analyze-submit-btn"
          onClick={handleSubmit}
          disabled={!isReady}
          whileHover={isReady ? { scale: 1.02, y: -2 } : {}}
          whileTap={isReady ? { scale: 0.98 } : {}}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 14, fontWeight: 800, fontSize: 16,
            cursor: isReady ? 'pointer' : 'not-allowed', border: 'none', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: isReady ? 'var(--bg)' : 'var(--chalk-dimmer)',
            backgroundColor: isReady ? 'var(--blue)' : 'var(--surface-2)',
            boxShadow: isReady ? '0 8px 24px rgba(139, 191, 212, 0.25)' : 'none',
            transition: 'all 0.2s',
          }}
          aria-disabled={!isReady}
        >
          {isLoading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={18} />
              </motion.div>
              Reading your explanation…
            </>
          ) : (
            <>Analyze My Understanding <ChevronRight size={18} /></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
