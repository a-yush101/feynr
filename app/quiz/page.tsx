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
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 64, paddingLeft: 16, paddingRight: 16, maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 12 }}>
            <Trophy size={14} style={{ color: 'var(--yellow)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chalk-dim)' }}>Adaptive Quiz</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-chalk)', fontSize: 'clamp(3rem, 7vw, 4.5rem)', fontWeight: 700, color: 'var(--chalk)', marginBottom: 8, lineHeight: 1.1, transform: 'rotate(-1deg)' }}>
            Quiz on{' '}
            <span style={{ color: 'var(--yellow)' }}>
              {topic}
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-chalk)', fontSize: 24, color: 'var(--chalk-dim)', fontWeight: 500, transform: 'rotate(-1deg)' }}>Targeted at your weak spots from the Socratic session.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Loading */}
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '64px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Trophy size={28} color="var(--yellow)" />
                </motion.div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--chalk)', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Writing questions…</p>
                <p style={{ color: 'var(--chalk-dim)', fontSize: 14, fontWeight: 600 }}>Tailored to your specific gaps</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '64px 0' }}>
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(224, 144, 128, 0.1)', border: '2px solid rgba(224, 144, 128, 0.2)', color: 'var(--coral)', fontSize: 14, fontWeight: 600 }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} /> {error}
              </div>
              <button onClick={() => router.push('/report')} style={{ fontSize: 14, fontWeight: 700, color: 'var(--chalk-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Back to report
              </button>
            </motion.div>
          )}

          {/* Finished */}
          {finished && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                {pct >= 75 ? <PartyPopper size={64} style={{ color: '#8ecfb0' }} /> : pct >= 50 ? <ThumbsUp size={64} style={{ color: '#e0d080' }} /> : <BookOpen size={64} style={{ color: '#e09080' }} />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-chalk)', fontSize: 44, fontWeight: 700, color: 'var(--chalk)', marginBottom: 6, transform: 'rotate(-2deg)' }}>{score} / {total} correct</h2>
                <p style={{ fontFamily: 'var(--font-chalk)', fontSize: 28, fontWeight: 700, color: pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--coral)', transform: 'rotate(-1deg)' }}>
                  {pct}% — {pct >= 75 ? 'Excellent!' : pct >= 50 ? 'Good effort!' : 'Keep studying!'}
                </p>
              </div>

              {/* Review */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {questions.map((q, i) => {
                  const ans = answers[i];
                  return (
                    <div key={i} style={{ padding: '20px', borderRadius: 20, backgroundColor: 'var(--surface)', border: `2px solid ${ans?.isCorrect ? 'rgba(142, 207, 176, 0.3)' : 'rgba(224, 144, 128, 0.3)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        {ans?.isCorrect ? <CheckCircle2 size={18} style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }} /> : <XCircle size={18} style={{ color: 'var(--coral)', marginTop: 2, flexShrink: 0 }} />}
                        <p style={{ fontSize: 16, color: 'var(--chalk)', fontWeight: 700 }}>{q.question}</p>
                      </div>
                      {!ans?.isCorrect && (
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--chalk-dim)', marginLeft: 30 }}>
                          Correct: <span style={{ color: 'var(--green)' }}>{q.correct ?? q.answer}</span>
                        </p>
                      )}
                      <p style={{ fontSize: 14, color: 'var(--chalk-dim)', marginLeft: 30, marginTop: 6, lineHeight: 1.6, fontWeight: 600 }}>{q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 16, width: '100%', flexWrap: 'wrap', marginTop: 8 }}>
                <motion.button id="quiz-restart-btn" onClick={handleRestart} whileHover={{ scale: 1.02, backgroundColor: 'rgba(245, 240, 232, 0.1)', color: '#f5f0e8' }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, minWidth: 160, padding: '16px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, border: '2px dashed var(--border)', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: 'var(--chalk-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                  <RotateCcw size={16} /> Retry Quiz
                </motion.button>
                <motion.button id="quiz-home-btn" onClick={() => router.push('/')} whileHover={{ scale: 1.02, backgroundColor: '#80cbc4', color: '#1a2e1a' }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, minWidth: 160, padding: '16px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, border: '2px dashed #80cbc4', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: '#80cbc4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                  Learn Something New <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Active quiz */}
          {!isLoading && !error && !finished && questions.length > 0 && (
            <motion.div key={`quiz-${currentIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Progress */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: 'var(--chalk-dim)' }}>
                  <span>Question {currentIndex + 1} of {total}</span>
                  <span>{score} correct</span>
                </div>
                <div style={{ height: 6, width: '100%', borderRadius: 9999, backgroundColor: 'var(--surface-2)' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 9999, backgroundColor: '#8bbfd4' }}
                    animate={{ width: `${(currentIndex / total) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex}
                  initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ padding: '28px', borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8, backgroundColor: 'var(--surface-2)', marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--chalk-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {currentQ.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                    </span>
                  </div>
                  <p style={{ fontSize: 19, color: 'var(--chalk)', fontWeight: 800, lineHeight: 1.5 }}>{currentQ.question}</p>
                </motion.div>
              </AnimatePresence>

              {/* MCQ options */}
              {currentQ.type === 'mcq' && currentQ.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentQ.options.map((opt, i) => {
                    const isSelected = currentAnswer?.selected === opt;
                    const isCorrectOpt = opt.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

                    let bg = '#181818', border = 'rgba(220, 215, 200, 0.1)', color = '#e8e2d4';
                    if (revealed) {
                      if (isCorrectOpt) { bg = 'rgba(142, 207, 176, 0.15)'; border = '#8ecfb0'; color = '#8ecfb0'; }
                      else if (isSelected) { bg = 'rgba(224, 144, 128, 0.15)'; border = '#e09080'; color = '#e09080'; }
                      else { color = 'rgba(232, 226, 212, 0.28)'; }
                    }

                    return (
                      <motion.button
                        key={i}
                        id={`quiz-option-${i}`}
                        onClick={() => handleSelectOption(opt)}
                        whileHover={!revealed ? { scale: 1.01, backgroundColor: '#212121' } : {}}
                        whileTap={!revealed ? { scale: 0.99 } : {}}
                        disabled={revealed}
                        aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
                        style={{
                          width: '100%', textAlign: 'left', padding: '16px 20px', borderRadius: 16,
                          border: `2px solid ${border}`, backgroundColor: bg, color, fontSize: 15, fontWeight: 700,
                          cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, flexShrink: 0, color: 'var(--chalk-dim)' }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ flex: 1 }}>{opt}</span>
                        {revealed && isCorrectOpt && <CheckCircle2 size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />}
                        {revealed && isSelected && !isCorrectOpt && <XCircle size={20} style={{ color: 'var(--coral)', flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '20px 24px', borderRadius: 16, backgroundColor: 'var(--surface)', border: `2px solid ${currentAnswer?.isCorrect ? 'var(--green)' : 'var(--coral)'}` }}>
                    <p style={{ fontWeight: 900, fontSize: 16, color: currentAnswer?.isCorrect ? 'var(--green)' : 'var(--coral)', marginBottom: 8 }}>
                      {currentAnswer?.isCorrect ? '✓ Correct!' : '✗ Not quite'}
                    </p>
                    <p style={{ fontSize: 15, color: 'var(--chalk-dim)', lineHeight: 1.6, fontWeight: 600 }}>{currentQ.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next button */}
              {revealed && (
                <motion.button id="quiz-next-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                  whileHover={{ scale: 1.02, backgroundColor: '#80cbc4', color: '#1a2e1a' }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '18px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, border: '2px dashed #80cbc4', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: '#80cbc4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, transition: 'all 0.2s' }}>
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
