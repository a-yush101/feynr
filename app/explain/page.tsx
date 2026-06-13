'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
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
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <motion.circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={pct >= 1 ? '#f97316' : '#1e3a5f'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color: pct >= 1 ? '#f97316' : 'rgba(255,255,255,0.4)', zIndex: 1 }}>
        {count}
      </span>
    </div>
  );
}

const TIPS = [
  '💡 Explain as if teaching a friend — no jargon.',
  '⚡ Cover the core idea first, then details.',
  '🎯 Aim for 80+ words for thorough analysis.',
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
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(30,58,95,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, backgroundColor: 'rgba(30,58,95,0.3)', border: '1px solid rgba(30,58,95,0.5)', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(147,197,253,0.8)' }}>Teaching topic</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            Explain{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
            Teach it to me like I have no background. The AI will probe your understanding.
          </p>
        </motion.div>

        {/* Tips */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {TIPS.map((tip, i) => (
            <div key={i} style={{ padding: '6px 12px', borderRadius: 9999, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {tip}
            </div>
          ))}
        </motion.div>

        {/* Main card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', marginBottom: 16 }}>
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
                width: '100%', minHeight: 260, padding: '24px 24px 60px', backgroundColor: 'transparent',
                color: '#fff', resize: 'none', border: 'none', outline: 'none',
                fontSize: 15, lineHeight: 1.7, fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', bottom: 16, right: 16 }}>
              <WordCountRing count={words} target={WORD_TARGET} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <span style={{ fontSize: 12, color: words < WORD_TARGET ? 'rgba(255,255,255,0.3)' : 'rgba(249,115,22,0.7)' }}>
              {words < WORD_TARGET ? `${WORD_TARGET - words} more words for best results` : '✓ Ready to analyze'}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>⌘+Enter to submit</span>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 14, marginBottom: 16 }}>
              <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
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
            width: '100%', padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
            cursor: isReady ? 'pointer' : 'not-allowed', border: 'none', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff',
            background: isReady ? 'linear-gradient(135deg, #1e3a5f 0%, #f97316 100%)' : 'rgba(255,255,255,0.07)',
            boxShadow: isReady ? '0 8px 24px rgba(249,115,22,0.25)' : 'none',
          }}
          aria-disabled={!isReady}
        >
          {isLoading ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={18} />
              </motion.div>
              Analyzing your explanation…
            </>
          ) : (
            <>Analyze My Understanding <ChevronRight size={18} /></>
          )}
        </motion.button>
      </div>
    </div>
  );
}
