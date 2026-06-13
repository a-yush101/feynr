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
  { key: 'accuracy' as const, label: 'Accuracy', icon: Target, color: '#3b82f6' },
  { key: 'depth' as const, label: 'Depth', icon: TrendingUp, color: '#8b5cf6' },
  { key: 'clarity' as const, label: 'Clarity', icon: Zap, color: '#10b981' },
  { key: 'completeness' as const, label: 'Completeness', icon: BookOpen, color: '#f59e0b' },
];

function ScoreBar({ label, score, color, icon: Icon, index }: { label: string; score: number; color: string; icon: React.ElementType; index: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.12 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={13} style={{ color }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {score}<span style={{ color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>/100</span>
        </span>
      </div>
      <div style={{ height: 6, width: '100%', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
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
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Developing' : 'Needs Work';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ position: 'relative', width: 144, height: 144, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="144" height="144">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <motion.circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ fontSize: 40, fontWeight: 800, color }}>
            {score}
          </motion.span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{label}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Clarity Score</div>
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
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 760, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', marginBottom: 12 }}>
            <Award size={11} style={{ color: '#a78bfa' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(167,139,250,0.8)' }}>Clarity Report</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            Your understanding of{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Based on your explanation and Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '64px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1e3a5f, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Award size={24} color="#fff" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 4 }}>Generating your report…</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Analyzing explanation quality and gaps</p>
              </div>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0' }}>
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 14 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
              </div>
              <button onClick={() => router.push('/session')} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to session
              </button>
            </motion.div>
          )}

          {reportData && !isLoading && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Scores grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Overall ring */}
                <div style={{ padding: 28, borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <OverallRing score={Math.round(reportData.overallScore)} />
                </div>
                {/* Score bars */}
                <div style={{ padding: 28, borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {SCORE_META.map((meta, i) => (
                    <ScoreBar key={meta.key} label={meta.label} score={reportData.scores[meta.key]} color={meta.color} icon={meta.icon} index={i} />
                  ))}
                </div>
              </div>

              {/* Misconceptions */}
              {reportData.misconceptions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ padding: 24, borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <AlertCircle size={14} style={{ color: '#f87171' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(248,113,113,0.8)' }}>Misconceptions Detected</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reportData.misconceptions.map((m, i) => {
                      const { title, detail } = getMisconceptionText(m);
                      return (
                        <div key={i}>
                          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{title}</p>
                          {detail && detail !== title && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3, lineHeight: 1.6 }}>{detail}</p>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Next steps */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                style={{ padding: 24, borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Zap size={14} style={{ color: '#f97316' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>Next Steps to Improve</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {reportData.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginTop: 2, width: 18, flexShrink: 0 }}>{i + 1}.</span>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <motion.button id="take-quiz-btn" onClick={handleTakeQuiz} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    style={{ flex: 1, minWidth: 200, padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg, #1e3a5f, #f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}>
                    Take the Quiz <ChevronRight size={18} />
                  </motion.button>
                  <motion.button id="start-over-btn" onClick={() => router.push('/')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '16px 24px', borderRadius: 14, fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: '#111118', color: 'rgba(255,255,255,0.45)' }}>
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
