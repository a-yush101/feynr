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
  { key: 'accuracy'     as const, label: 'Accuracy',     icon: Target,    color: '#f97316' },
  { key: 'depth'        as const, label: 'Depth',         icon: TrendingUp, color: '#1e3a5f' },
  { key: 'clarity'      as const, label: 'Clarity',       icon: Zap,       color: '#16a34a' },
  { key: 'completeness' as const, label: 'Completeness',  icon: BookOpen,  color: '#7c3aed' },
];

function ScoreBar({ label, score, color, icon: Icon, index }: {
  label: string; score: number; color: string; icon: React.ElementType; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.12 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon size={14} style={{ color }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#555555' }}>{label}</span>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 800, color }}>
          {score}<span style={{ color: '#aaaaaa', fontWeight: 600 }}>/100</span>
        </span>
      </div>
      <div style={{ height: '7px', width: '100%', borderRadius: '9999px', backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', borderRadius: '9999px', backgroundColor: color }}
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
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#f97316' : '#dc2626';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Developing' : 'Needs Work';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: '144px', height: '144px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} width="144" height="144">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="8" />
          <motion.circle cx="72" cy="72" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (score / 100) * circ }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }} />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ fontSize: '40px', fontWeight: 900, color, lineHeight: 1 }}>
            {score}
          </motion.span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#aaaaaa' }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color }}>{label}</div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#aaaaaa', marginTop: '2px' }}>Clarity Score</div>
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
    setIsLoading(true); setError(null);
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
      if (session) setSession({ ...session, step: 'quiz', clarityScore: data.overallScore, updatedAt: new Date().toISOString() });
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
      if (session) setSession({ ...session, step: 'quiz', updatedAt: new Date().toISOString(), tags: [...(session.tags ?? []), ...reportData.nextSteps] });
    }
    router.push('/quiz');
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navbar />

      <div style={{ paddingTop: '96px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '9999px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
            <Award size={13} style={{ color: '#f97316' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clarity Report</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#111111', marginBottom: '8px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Your understanding of{' '}
            <span style={{ color: '#f97316' }}>{topic}</span>
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#555555', lineHeight: 1.6 }}>Based on your explanation and Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '80px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Award size={28} color="#f97316" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#111111', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Generating your report…</p>
                <p style={{ color: '#555555', fontSize: '0.875rem' }}>Analyzing explanation quality and gaps</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '80px 0' }}>
              <div style={{ display: 'flex', gap: '10px', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> {error}
              </div>
              <button onClick={() => router.push('/session')} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#555555', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to session
              </button>
            </motion.div>
          )}

          {/* Report */}
          {reportData && !isLoading && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Score cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <OverallRing score={Math.round(reportData.overallScore)} />
                </div>
                <div style={{ padding: '28px 32px', borderRadius: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ebebeb', display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {SCORE_META.map((meta, i) => (
                    <ScoreBar key={meta.key} label={meta.label} score={reportData.scores[meta.key]} color={meta.color} icon={meta.icon} index={i} />
                  ))}
                </div>
              </div>

              {/* Misconceptions */}
              {reportData.misconceptions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  style={{ padding: '24px 28px', borderRadius: '16px', backgroundColor: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertCircle size={15} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#dc2626' }}>Misconceptions Detected</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {reportData.misconceptions.map((m, i) => {
                      const { title, detail } = getMisconceptionText(m);
                      return (
                        <div key={i}>
                          <p style={{ fontSize: '0.9375rem', color: '#111111', fontWeight: 600 }}>{title}</p>
                          {detail && detail !== title && <p style={{ fontSize: '0.875rem', color: '#555555', marginTop: '4px', lineHeight: 1.6 }}>{detail}</p>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Next steps */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                style={{ padding: '24px 28px', borderRadius: '16px', backgroundColor: '#f9f9f9', border: '1px solid #ebebeb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <Zap size={15} style={{ color: '#f97316' }} />
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111111' }}>Next Steps to Improve</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reportData.nextSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        backgroundColor: '#111111', color: '#ffffff',
                        fontSize: '11px', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px',
                      }}>{i + 1}</span>
                      <p style={{ fontSize: '0.9375rem', color: '#111111', lineHeight: 1.65, fontWeight: 500 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '8px' }}>
                <button
                  id="take-quiz-btn"
                  onClick={handleTakeQuiz}
                  style={{
                    flex: 1, minWidth: '200px', padding: '13px 0', borderRadius: '9999px',
                    fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', backgroundColor: '#111111', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
                >
                  Take the Adaptive Quiz <ChevronRight size={18} />
                </button>
                <button
                  id="start-over-btn"
                  onClick={() => router.push('/')}
                  style={{
                    padding: '13px 24px', borderRadius: '9999px',
                    fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
                    fontFamily: 'inherit', backgroundColor: '#ffffff',
                    border: '1.5px solid #e5e5e5', color: '#555555',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111111')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e5e5')}
                >
                  Start Over
                </button>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
