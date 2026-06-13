'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronRight, Award, Zap, TrendingUp, Target, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession, setSession } from '@/lib/storage';

interface Misconception { excerpt?: string; problem?: string; correction?: string; }
interface ScoreData {
  scores: { accuracy: number; depth: number; clarity: number; completeness: number };
  misconceptions: (Misconception | string)[];
  nextSteps: string[];
  overallScore: number;
}

const SCORE_META = [
  { key: 'accuracy' as const, label: 'Accuracy', icon: Target, color: '#8bbfd4' },
  { key: 'depth' as const, label: 'Depth', icon: TrendingUp, color: '#b0a0d8' },
  { key: 'clarity' as const, label: 'Clarity', icon: Zap, color: '#8ecfb0' },
  { key: 'completeness' as const, label: 'Completeness', icon: BookOpen, color: '#e0d080' },
];

function ScoreBar({ label, score, color, icon: Icon, index }: { label: string; score: number; color: string; icon: React.ElementType; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.12 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} style={{ color }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--chalk-dim)' }}>{label}</span>
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>
          {score}<span style={{ color: 'var(--chalk-dimmer)', fontWeight: 600 }}>/100</span>
        </span>
      </div>
      <div style={{ height: 8, width: '100%', borderRadius: 9999, backgroundColor: 'var(--surface-2)', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: 9999, backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.4 + index * 0.12, type: 'spring', stiffness: 60, damping: 20 }}
        />
      </div>
    </motion.div>
  );
}

function OverallRing({ score }: { score: number }) {
  const radius = 56;
  const circ = 2 * Math.PI * radius;
  const color = score >= 75 ? '#8ecfb0' : score >= 50 ? '#e0d080' : '#e09080';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Developing' : 'Needs Work';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 144, height: 144, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="144" height="144">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
          <motion.circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ fontSize: 40, fontWeight: 900, color }}>
            {score}
          </motion.span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chalk-dimmer)' }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-chalk)', fontSize: 28, fontWeight: 700, color, transform: 'rotate(-2deg)' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--chalk-dim)', marginTop: 2 }}>Clarity Score</div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session?.topic || !session.messages?.length) { router.replace('/'); return; }
    setTopic(session.topic);
    const explanation = session.messages.find((m) => m.role === 'user')?.content ?? '';
    const conversationHistory = session.messages.map((m) => ({ role: m.role, content: m.content }));
    fetchReport(session.topic, explanation, conversationHistory);
  }, [router]);

  async function fetchReport(topicVal: string, explanation: string, conversationHistory: { role: string; content: string }[]) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicVal, explanation, conversationHistory }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(e.error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as ScoreData;
      setReportData(data);
      const session = getSession();
      if (session) {
        setSession({ ...session, step: 'quiz', clarityScore: data.overallScore, updatedAt: new Date().toISOString() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.');
    } finally {
      setIsLoading(false);
    }
  }

  function getMisconceptionText(m: Misconception | string) {
    if (typeof m === 'string') return { title: m, detail: '' };
    return { title: m.excerpt ?? m.problem ?? '', detail: m.correction ?? m.problem ?? '' };
  }

  const handleTakeQuiz = () => {
    if (reportData) {
      const session = getSession();
      if (session) {
        setSession({ ...session, step: 'quiz', updatedAt: new Date().toISOString(), tags: [...(session.tags ?? []), ...reportData.nextSteps] });
      }
    }
    router.push('/quiz');
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 12 }}>
            <Award size={14} style={{ color: 'var(--purple)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chalk-dim)' }}>Clarity Report</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-chalk)', fontSize: 'clamp(3rem, 7vw, 4.5rem)', fontWeight: 700, color: 'var(--chalk)', marginBottom: 8, lineHeight: 1.1, transform: 'rotate(-1deg)' }}>
            Your understanding of{' '}
            <span style={{ color: 'var(--yellow)' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-chalk)', fontSize: 24, color: 'var(--chalk-dim)', fontWeight: 500, transform: 'rotate(-1deg)' }}>Based on your explanation and Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '64px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Award size={28} color="var(--purple)" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--chalk)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Writing on the board…</p>
                <p style={{ color: 'var(--chalk-dim)', fontSize: 14, fontWeight: 600 }}>Analyzing explanation quality and gaps</p>
              </div>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0' }}>
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(224, 144, 128, 0.1)', border: '2px solid rgba(224, 144, 128, 0.2)', color: 'var(--coral)', fontSize: 14, fontWeight: 600 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
              </div>
              <button onClick={() => router.push('/session')} style={{ fontSize: 14, fontWeight: 700, color: 'var(--chalk-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to session
              </button>
            </motion.div>
          )}

          {reportData && !isLoading && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Scores grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Overall ring */}
                <div style={{ padding: 32, borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <OverallRing score={Math.round(reportData.overallScore)} />
                </div>
                {/* Score bars */}
                <div style={{ padding: 32, borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {SCORE_META.map((meta, i) => (
                    <ScoreBar key={meta.key} label={meta.label} score={reportData.scores[meta.key]} color={meta.color} icon={meta.icon} index={i} />
                  ))}
                </div>
              </div>

              {/* Misconceptions */}
              {reportData.misconceptions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ padding: 28, borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid rgba(224, 144, 128, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <AlertCircle size={16} style={{ color: 'var(--coral)' }} />
                    <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--coral)' }}>Misconceptions Detected</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reportData.misconceptions.map((m, i) => {
                      const { title, detail } = getMisconceptionText(m);
                      return (
                        <div key={i}>
                          <p style={{ fontSize: 15, color: 'var(--chalk)', fontWeight: 700 }}>{title}</p>
                          {detail && detail !== title && <p style={{ fontSize: 14, color: 'var(--chalk-dim)', marginTop: 4, lineHeight: 1.6, fontWeight: 500 }}>{detail}</p>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Next steps */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                style={{ padding: 28, borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <Zap size={16} style={{ color: 'var(--yellow)' }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--chalk)' }}>Next Steps to Improve</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reportData.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--yellow)', marginTop: 2, width: 20, flexShrink: 0 }}>{i + 1}.</span>
                      <p style={{ fontSize: 15, color: 'var(--chalk)', lineHeight: 1.6, fontWeight: 600 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <motion.button id="take-quiz-btn" onClick={handleTakeQuiz} whileHover={{ scale: 1.02, backgroundColor: '#80cbc4', color: '#1a2e1a' }} whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, minWidth: 200, padding: '16px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, border: '2px dashed #80cbc4', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: '#80cbc4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                    Take the Quiz <ChevronRight size={18} />
                  </motion.button>
                  <motion.button id="start-over-btn" onClick={() => router.push('/')} whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 240, 232, 0.1)', color: '#f5f0e8' }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '16px 28px', borderRadius: 16, fontWeight: 700, fontSize: 15, border: '2px dashed var(--border)', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: 'var(--chalk-dim)', transition: 'all 0.2s' }}>
                    Start Over
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
