'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { setSession } from '@/lib/storage';
import Navbar from '@/components/Navbar';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const DEPTH_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Start from basics' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Assume some background' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Deep technical detail' },
] as const;

export default function ExplainPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [depthLevel, setDepthLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'topic' | 'explain'>('topic');

  const words = wordCount(explanation);
  const isExplainReady = words >= 30 && !isLoading;
  const isTopicReady = topic.trim().length > 0;

  const handleNextStep = () => {
    if (isTopicReady) {
      setStep('explain');
      router.replace('/explain?s=2', { scroll: false });
    }
  };

  const handleSubmit = async () => {
    if (!isExplainReady) return;
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
      const sessionId = `session_${Date.now()}`;
      setSession({
        sessionId, userId: undefined, topic, step: 'followup',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
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
        clarityScore: undefined,
        tags: [depthLevel],
      });
      router.push('/session');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Dot-grid */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
        backgroundSize: '28px 28px', opacity: 0.35,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 20px 60px',
      }}>

        {/* Back button */}
        <button
          onClick={() => {
            if (step === 'explain') {
              setStep('topic');
              router.replace('/explain', { scroll: false });
            } else {
              router.push('/');
            }
          }}
          style={{
            position: 'absolute', top: '88px', left: '24px',
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600, color: '#555555',
            transition: 'color 0.2s', fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#111111')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#555555')}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: '600px' }}
        >


          {/* Topic badge — only on explain step */}
          {step === 'explain' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '0.6875rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#f97316',
              border: '1px solid rgba(249,115,22,0.25)',
              backgroundColor: 'rgba(249,115,22,0.06)',
              padding: '4px 12px', borderRadius: '9999px',
              marginBottom: '10px',
            }}>
              • {topic}
            </span>
          )}

          {/* Label */}
          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.25rem)',
            fontWeight: 800, lineHeight: 1.2,
            color: '#111111', marginBottom: '8px',
          }}>
            {step === 'topic' ? 'What do you want to learn?' : `Explain "${topic}"`}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#555555', marginBottom: '28px', lineHeight: 1.6 }}>
            {step === 'topic'
              ? 'Enter any topic — a concept, theory, or skill you want to master.'
              : 'Write everything you know in your own words. Think out loud.'}
          </p>

          {/* Input area */}
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            {step === 'topic' ? (
              <input
                id="topic-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && isTopicReady) handleNextStep(); }}
                placeholder="e.g., Attention Mechanism, React Hooks, Photosynthesis…"
                disabled={isLoading}
                autoFocus
                style={{
                  width: '100%', padding: '16px 20px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e5e5e5',
                  borderRadius: '12px',
                  color: '#111111', fontSize: '1rem',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#111111')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
              />
            ) : (
              <>
                <textarea
                  id="explanation-input"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={`Start explaining ${topic} in your own words. Pretend you're teaching it to a friend…`}
                  disabled={isLoading}
                  autoFocus
                  style={{
                    width: '100%', minHeight: '220px', padding: '16px 20px 48px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #e5e5e5',
                    borderRadius: '12px',
                    color: '#111111', fontSize: '1rem', lineHeight: 1.7,
                    fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box',
                    outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#111111')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e5e5')}
                />
                <div style={{
                  position: 'absolute', bottom: '14px', right: '16px',
                  fontSize: '12px', fontWeight: 600,
                  color: words >= 60 ? '#16a34a' : words >= 30 ? '#f97316' : '#aaaaaa',
                }}>
                  {words} word{words !== 1 ? 's' : ''}{' '}
                  {words < 30 ? '(aim for 30+)' : words < 60 ? '(good, keep going)' : '(great!)'}
                </div>
              </>
            )}
          </div>

          {/* Feynman tip card — only on explain step */}
          {step === 'explain' && (
            <div style={{
              width: '100%',
              backgroundColor: '#f9f9f9',
              border: '1px solid #f0f0f0',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
            }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#aaaaaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Feynman Tip</p>
              <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: 1.65 }}>
                Don&apos;t aim for perfection. Gaps in your explanation reveal gaps in your understanding — and that&apos;s exactly what we&apos;re here to fix.
              </p>
            </div>
          )}

          {/* Depth selector */}
          {step === 'topic' && (
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#555555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your level
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {DEPTH_LEVELS.map(({ value, label }) => {
                  const isActive = depthLevel === value;
                  return (
                    <button
                      key={value}
                      id={`depth-${value}`}
                      onClick={() => setDepthLevel(value)}
                      style={{
                        flex: 1, padding: '10px 8px', borderRadius: '9999px',
                        fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.2s',
                        backgroundColor: isActive ? '#111111' : '#ffffff',
                        color: isActive ? '#ffffff' : '#555555',
                        border: isActive ? '1.5px solid #111111' : '1.5px solid #e5e5e5',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
                  backgroundColor: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#dc2626', fontSize: '0.875rem', fontWeight: 600,
                }}
              >
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA button */}
          {step === 'topic' ? (
            <button
              id="next-step-btn"
              onClick={handleNextStep}
              disabled={!isTopicReady}
              style={{
                width: '100%', padding: '14px 0',
                borderRadius: '9999px', fontWeight: 700, fontSize: '0.9375rem',
                border: 'none', cursor: isTopicReady ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                backgroundColor: isTopicReady ? '#111111' : '#e5e5e5',
                color: isTopicReady ? '#ffffff' : '#999999',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (isTopicReady) e.currentTarget.style.backgroundColor = '#f97316'; }}
              onMouseLeave={(e) => { if (isTopicReady) e.currentTarget.style.backgroundColor = '#111111'; }}
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              id="analyze-btn"
              onClick={handleSubmit}
              disabled={!isExplainReady}
              style={{
                width: '100%', padding: '14px 0',
                borderRadius: '9999px', fontWeight: 700, fontSize: '0.9375rem',
                border: 'none', cursor: isExplainReady ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                backgroundColor: isExplainReady ? '#111111' : '#e5e5e5',
                color: isExplainReady ? '#ffffff' : '#999999',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (isExplainReady) e.currentTarget.style.backgroundColor = '#f97316'; }}
              onMouseLeave={(e) => { if (isExplainReady) e.currentTarget.style.backgroundColor = '#111111'; }}
            >
              {isLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={16} />
                  </motion.div>
                  Analyzing your understanding…
                </>
              ) : (
                <>Analyze My Understanding <ChevronRight size={18} /></>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
