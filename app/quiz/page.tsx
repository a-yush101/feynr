'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession } from '@/lib/storage';

interface QuizQuestion {
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correct?: string;
  answer?: string;
  explanation: string;
}

type AnswerState = { selected: string; isCorrect: boolean };

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [topic, setTopic] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session?.topic) { router.replace('/'); return; }
    setTopic(session.topic);
    const depthLevel = session.tags?.[0] ?? 'intermediate';
    const weakSpots = (session.tags ?? []).filter((t) => t !== depthLevel);
    fetchQuiz(session.topic, weakSpots.length > 0 ? weakSpots : ['general understanding']);
  }, [router]);

  async function fetchQuiz(topicVal: string, weakSpots: string[]) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicVal, weakSpots }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(e.error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as { questions: QuizQuestion[] };
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  }

  const currentQ = questions[currentIndex];
  const correctAnswer = currentQ?.correct ?? currentQ?.answer ?? '';
  const currentAnswer = answers[currentIndex];
  const total = questions.length;
  const score = Object.values(answers).filter((a) => a.isCorrect).length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  function handleSelectOption(option: string) {
    if (revealed || answers[currentIndex]) return;
    const isCorrect = option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    setAnswers((p) => ({ ...p, [currentIndex]: { selected: option, isCorrect } }));
    setRevealed(true);
  }

  function handleNext() {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setRevealed(!!answers[currentIndex + 1]);
    } else {
      setFinished(true);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setAnswers({});
    setRevealed(false);
    setFinished(false);
  }

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '25%', left: '20%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '25%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: 12 }}>
            <Trophy size={11} style={{ color: '#34d399' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(52,211,153,0.8)' }}>Adaptive Quiz</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
            Quiz on{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Targeted at your weak spots from the Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '64px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1e3a5f, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Trophy size={24} color="#fff" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 4 }}>Generating your quiz…</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Tailored to your specific gaps</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0' }}>
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 14 }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
              </div>
              <button onClick={() => router.push('/report')} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to report
              </button>
            </motion.div>
          )}

          {/* Finished */}
          {finished && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 16 }}>
              <div style={{ fontSize: 56 }}>{pct >= 75 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{score} / {total} correct</h2>
                <p style={{ fontSize: 18, fontWeight: 700, color: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {pct}% — {pct >= 75 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}
                </p>
              </div>

              {/* Review */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {questions.map((q, i) => {
                  const ans = answers[i];
                  return (
                    <div key={i} style={{ padding: '16px 18px', borderRadius: 16, backgroundColor: '#111118', border: `1px solid ${ans?.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                        {ans?.isCorrect ? <CheckCircle2 size={15} style={{ color: '#10b981', marginTop: 2, flexShrink: 0 }} /> : <XCircle size={15} style={{ color: '#ef4444', marginTop: 2, flexShrink: 0 }} />}
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{q.question}</p>
                      </div>
                      {!ans?.isCorrect && (
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 25 }}>
                          Correct: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{q.correct ?? q.answer}</span>
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginLeft: 25, marginTop: 4, lineHeight: 1.6 }}>{q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 12, width: '100%', flexWrap: 'wrap' }}>
                <motion.button id="quiz-restart-btn" onClick={handleRestart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, minWidth: 140, padding: '14px 0', borderRadius: 12, fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: '#111118', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RotateCcw size={14} /> Retry Quiz
                </motion.button>
                <motion.button id="quiz-home-btn" onClick={() => router.push('/')} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, minWidth: 140, padding: '14px 0', borderRadius: 12, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg, #1e3a5f, #f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}>
                  Learn Something New <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Active quiz */}
          {!isLoading && !error && !finished && questions.length > 0 && (
            <motion.div key={`quiz-${currentIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Progress */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  <span>Question {currentIndex + 1} of {total}</span>
                  <span>{score} correct</span>
                </div>
                <div style={{ height: 4, width: '100%', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #1e3a5f, #f97316)' }}
                    animate={{ width: `${(currentIndex / total) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex}
                  initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: '24px', borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                    </span>
                  </div>
                  <p style={{ fontSize: 17, color: '#fff', fontWeight: 600, lineHeight: 1.55 }}>{currentQ.question}</p>
                </motion.div>
              </AnimatePresence>

              {/* MCQ options */}
              {currentQ.type === 'mcq' && currentQ.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentQ.options.map((opt, i) => {
                    const isSelected = currentAnswer?.selected === opt;
                    const isCorrectOpt = opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

                    let bg = '#111118', border = 'rgba(255,255,255,0.1)', color = 'rgba(255,255,255,0.7)';
                    if (revealed) {
                      if (isCorrectOpt) { bg = 'rgba(16,185,129,0.1)'; border = 'rgba(16,185,129,0.35)'; color = '#6ee7b7'; }
                      else if (isSelected) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.35)'; color = '#fca5a5'; }
                      else { color = 'rgba(255,255,255,0.3)'; }
                    }

                    return (
                      <motion.button
                        key={i}
                        id={`quiz-option-${i}`}
                        onClick={() => handleSelectOption(opt)}
                        whileHover={!revealed ? { scale: 1.01, x: 4 } : {}}
                        whileTap={!revealed ? { scale: 0.99 } : {}}
                        disabled={revealed}
                        aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                        style={{
                          width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: 14,
                          border: `1px solid ${border}`, backgroundColor: bg, color, fontSize: 14, fontWeight: 500,
                          cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: 26, height: 26, borderRadius: '50%', border: `1px solid currentColor`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, opacity: 0.7 }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {revealed && isCorrectOpt && <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />}
                        {revealed && isSelected && !isCorrectOpt && <XCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '16px 20px', borderRadius: 14, backgroundColor: '#111118', border: `1px solid ${currentAnswer?.isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    <p style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                      {currentAnswer?.isCorrect ? '✓ Correct!' : '✗ Not quite'}
                    </p>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {revealed && (
                <motion.button id="quiz-next-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '16px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'linear-gradient(135deg, #1e3a5f, #f97316)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}>
                  {currentIndex < total - 1 ? (<>Next Question <ChevronRight size={18} /></>) : (<>See Results <Trophy size={18} /></>)}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
