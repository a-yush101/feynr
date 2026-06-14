'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, PartyPopper, ThumbsUp, BookOpen } from 'lucide-react';
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
    setIsLoading(true); setError(null);
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
    setCurrentIndex(0); setAnswers({}); setRevealed(false); setFinished(false);
  }

  if (!mounted) return null;

  const scoreColor = pct >= 75 ? '#16a34a' : pct >= 50 ? '#f97316' : '#dc2626';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navbar />

      <div style={{ paddingTop: '96px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '640px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '9999px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
            <Trophy size={13} style={{ color: '#f97316' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adaptive Quiz</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#111111', marginBottom: '8px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Quiz on <span style={{ color: '#f97316' }}>{topic}</span>
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#555555', lineHeight: 1.6 }}>Targeted at your weak spots from the Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '80px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Trophy size={28} color="#f97316" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#111111', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Writing your questions…</p>
                <p style={{ color: '#555555', fontSize: '0.875rem' }}>Tailored to your specific gaps</p>
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
              <button onClick={() => router.push('/report')} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#555555', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to report
              </button>
            </motion.div>
          )}

          {/* Finished */}
          {finished && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '16px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                backgroundColor: pct >= 75 ? 'rgba(22,163,74,0.08)' : pct >= 50 ? 'rgba(249,115,22,0.08)' : 'rgba(100,116,139,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pct >= 75 ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M6 9a6 6 0 0 0 12 0V3H6v6Z"/>
                  </svg>
                ) : pct >= 50 ? (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>
                  </svg>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#111111', letterSpacing: '-0.02em' }}>
                  {score} / {total}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: scoreColor, marginTop: '4px' }}>
                  {pct}% — {pct >= 75 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}
                </div>
              </div>

              {/* Review */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {questions.map((q, i) => {
                  const ans = answers[i];
                  return (
                    <div key={i} style={{
                      padding: '18px 20px', borderRadius: '14px',
                      backgroundColor: '#f9f9f9',
                      border: `1px solid ${ans?.isCorrect ? 'rgba(22,163,74,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                        {ans?.isCorrect
                          ? <CheckCircle2 size={16} style={{ color: '#16a34a', marginTop: '3px', flexShrink: 0 }} />
                          : <XCircle size={16} style={{ color: '#dc2626', marginTop: '3px', flexShrink: 0 }} />}
                        <p style={{ fontSize: '0.9375rem', color: '#111111', fontWeight: 600 }}>{q.question}</p>
                      </div>
                      {!ans?.isCorrect && (
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#555555', marginLeft: '26px' }}>
                          Correct: <span style={{ color: '#16a34a' }}>{q.correct ?? q.answer}</span>
                        </p>
                      )}
                      <p style={{ fontSize: '0.875rem', color: '#555555', marginLeft: '26px', marginTop: '6px', lineHeight: 1.6 }}>{q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                <button id="quiz-restart-btn" onClick={handleRestart}
                  style={{ flex: 1, minWidth: '140px', padding: '13px 0', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: '#ffffff', border: '1.5px solid #e5e5e5', color: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'border-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111111')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e5e5')}
                >
                  <RotateCcw size={15} /> Retry Quiz
                </button>
                <button id="quiz-home-btn" onClick={() => router.push('/')}
                  style={{ flex: 1, minWidth: '140px', padding: '13px 0', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: '#111111', border: 'none', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
                >
                  Learn Something New <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Active quiz */}
          {!isLoading && !error && !finished && questions.length > 0 && (
            <motion.div key={`quiz-${currentIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Progress */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#555555' }}>
                  <span>Question {currentIndex + 1} of {total}</span>
                  <span style={{ color: '#16a34a' }}>{score} correct</span>
                </div>
                <div style={{ height: '5px', width: '100%', borderRadius: '9999px', backgroundColor: '#f0f0f0' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: '9999px', backgroundColor: '#111111' }}
                    animate={{ width: `${((currentIndex) / total) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex}
                  initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ padding: '24px 28px', borderRadius: '16px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#ebebeb', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                    </span>
                  </div>
                  <p style={{ fontSize: '1.0625rem', color: '#111111', fontWeight: 700, lineHeight: 1.55 }}>{currentQ.question}</p>
                </motion.div>
              </AnimatePresence>

              {/* MCQ options */}
              {currentQ.type === 'mcq' && currentQ.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentQ.options.map((opt, i) => {
                    const isSelected = currentAnswer?.selected === opt;
                    const isCorrectOpt = opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

                    let bg = '#ffffff', border = '#e5e5e5', color = '#111111';
                    if (revealed) {
                      if (isCorrectOpt) { bg = 'rgba(22,163,74,0.06)'; border = '#16a34a'; color = '#16a34a'; }
                      else if (isSelected) { bg = 'rgba(239,68,68,0.06)'; border = '#dc2626'; color = '#dc2626'; }
                      else { color = '#aaaaaa'; border = '#f0f0f0'; }
                    }

                    return (
                      <motion.button
                        key={i}
                        id={`quiz-option-${i}`}
                        onClick={() => handleSelectOption(opt)}
                        whileHover={!revealed ? { scale: 1.01 } : {}}
                        whileTap={!revealed ? { scale: 0.99 } : {}}
                        disabled={revealed}
                        aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                        style={{
                          width: '100%', textAlign: 'left', padding: '14px 18px', borderRadius: '12px',
                          border: `1.5px solid ${border}`, backgroundColor: bg, color,
                          fontSize: '0.9375rem', fontWeight: 600,
                          cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: revealed ? 'transparent' : '#f0f0f0', border: revealed ? 'none' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0, color: '#555555' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {revealed && isCorrectOpt && <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />}
                        {revealed && isSelected && !isCorrectOpt && <XCircle size={18} style={{ color: '#dc2626', flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '18px 22px', borderRadius: '12px',
                      backgroundColor: currentAnswer?.isCorrect ? 'rgba(22,163,74,0.05)' : 'rgba(239,68,68,0.05)',
                      border: `1px solid ${currentAnswer?.isCorrect ? 'rgba(22,163,74,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}
                  >
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: currentAnswer?.isCorrect ? '#16a34a' : '#dc2626', marginBottom: '6px' }}>
                      {currentAnswer?.isCorrect ? '✓ Correct!' : '✗ Not quite'}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#555555', lineHeight: 1.65 }}>{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {revealed && (
                <motion.button id="quiz-next-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                  style={{ width: '100%', padding: '13px 0', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9375rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: '#111111', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
                >
                  {currentIndex < total - 1 ? <>Next Question <ChevronRight size={18} /></> : <>See Results <Trophy size={18} /></>}
                </motion.button>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
