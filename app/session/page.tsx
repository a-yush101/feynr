'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, User, AlertCircle, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession, setSession } from '@/lib/storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface HistoryItem {
  role: string;
  content: string;
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--chalk-dim)' }}
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export default function SessionPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [shouldEnd, setShouldEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [depthLevel, setDepthLevel] = useState('intermediate');
  const [conversationHistory, setConversationHistory] = useState<HistoryItem[]>([]);
  const [questionCount, setQuestionCount] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session?.topic || !session.messages?.length) { router.replace('/'); return; }
    setTopic(session.topic);
    setDepthLevel(session.tags?.[0] ?? 'intermediate');
    const firstQ = session.messages.find((m) => m.role === 'assistant');
    if (firstQ) {
      setMessages([{ id: firstQ.id, role: 'assistant', content: firstQ.content }]);
      setConversationHistory([{ role: 'assistant', content: firstQ.content }]);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [router]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking || shouldEnd) return;
    setError(null);
    setInput('');

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((p) => [...p, userMsg]);
    const updatedHistory: HistoryItem[] = [...conversationHistory, { role: 'user', content: trimmed }];
    setConversationHistory(updatedHistory);
    setIsThinking(true);

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, conversationHistory: updatedHistory, userAnswer: trimmed, questionCount, depthLevel }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(e.error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as { nextQuestion: string | null; shouldEnd: boolean };

      if (data.shouldEnd || !data.nextQuestion) {
        setShouldEnd(true);
        const session = getSession();
        if (session) {
          setSession({
            ...session, step: 'report', updatedAt: new Date().toISOString(),
            messages: updatedHistory.map((m, i) => ({ id: `msg-${i}`, role: m.role as 'user' | 'assistant', content: m.content, createdAt: new Date().toISOString() })),
          });
        }
      } else {
        const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, role: 'assistant', content: data.nextQuestion };
        const newHistory: HistoryItem[] = [...updatedHistory, { role: 'assistant', content: data.nextQuestion }];
        setMessages((p) => [...p, aiMsg]);
        setConversationHistory(newHistory);
        setQuestionCount((c) => c + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleViewReport = () => {
    const session = getSession();
    if (session) {
      setSession({
        ...session, step: 'report', updatedAt: new Date().toISOString(),
        messages: conversationHistory.map((m, i) => ({
          id: `msg-${i}`, role: m.role as 'user' | 'assistant',
          content: m.content, createdAt: new Date().toISOString(),
        })),
      });
    }
    router.push('/report');
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Topic info bar */}
      <div style={{ position: 'fixed', top: 72, left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'center', padding: '12px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9999, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--chalk-dim)' }}>
          <BookOpen size={14} style={{ color: 'var(--yellow)' }} />
          Socratic session on&nbsp;
          <span style={{ color: 'var(--chalk)', fontWeight: 800 }}>{topic}</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, paddingTop: 150, paddingBottom: 140, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'assistant' ? '#212121' : '#8bbfd4',
                  border: msg.role === 'assistant' ? '2px solid rgba(220, 215, 200, 0.1)' : 'none',
                }}>
                  {msg.role === 'assistant' ? <Smile size={18} color="var(--green)" /> : <User size={18} color="var(--bg)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '75%', padding: '14px 20px', borderRadius: 20,
                  fontSize: 15, lineHeight: 1.6, fontWeight: 500,
                  ...(msg.role === 'assistant'
                    ? { backgroundColor: '#181818', border: '2px solid rgba(220, 215, 200, 0.1)', color: '#e8e2d4', borderTopLeftRadius: 6 }
                    : { backgroundColor: '#212121', border: '2px solid rgba(220, 215, 200, 0.06)', color: '#e8e2d4', borderTopRightRadius: 6 }),
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking */}
          <AnimatePresence>
            {isThinking && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface-2)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Smile size={18} color="var(--green)" />
                </div>
                <div style={{ padding: '16px 20px', borderRadius: 20, borderTopLeftRadius: 6, backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}>
                  <ThinkingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End card */}
          <AnimatePresence>
            {shouldEnd && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 32, borderRadius: 24, backgroundColor: 'var(--surface)', border: '2px solid var(--blue)', textAlign: 'center', marginTop: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><Sparkles size={40} style={{ color: '#8bbfd4' }} /></div>
                <h3 style={{ fontFamily: 'var(--font-chalk)', color: 'var(--chalk)', fontWeight: 700, fontSize: 32, marginBottom: 8, transform: 'rotate(-1deg)' }}>Session complete!</h3>
                <p style={{ fontFamily: 'var(--font-chalk)', color: 'var(--chalk-dim)', fontSize: 24, fontWeight: 500, marginBottom: 24, lineHeight: 1.4, transform: 'rotate(-1deg)' }}>
                  The AI has probed your understanding. Time to see your clarity report.
                </p>
                <motion.button id="view-report-btn" onClick={handleViewReport} whileHover={{ scale: 1.02, backgroundColor: '#80cbc4', color: '#1a2e1a' }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '16px 0', borderRadius: 14, fontWeight: 800, fontSize: 16, border: '2px dashed #80cbc4', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'rgba(0,0,0,0)', color: '#80cbc4', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  View Clarity Report <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 8, padding: '12px 14px', borderRadius: 12, backgroundColor: 'rgba(224, 144, 128, 0.1)', border: '2px solid rgba(224, 144, 128, 0.2)', color: 'var(--coral)', fontSize: 14, fontWeight: 600 }}>
                <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input bar */}
      {!shouldEnd && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '20px 16px', background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: '12px 16px', borderRadius: 20, backgroundColor: 'var(--surface)', border: '2px solid var(--border)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)' }}>
              <textarea
                ref={inputRef}
                id="session-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onFocus={(e) => (e.target.style.borderColor = '#80cbc4')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                placeholder="Type your answer… (Enter to send)"
                disabled={isThinking}
                aria-label="Your answer"
                rows={1}
                style={{ flex: 1, padding: '14px 20px', fontSize: 16, lineHeight: 1.5, color: 'var(--chalk)', backgroundColor: 'rgba(0,0,0,0)', border: '2px solid var(--border)', borderRadius: 16, resize: 'none', outline: 'none', minHeight: 52, maxHeight: 150, fontFamily: 'inherit', fontWeight: 500, overflowY: 'auto' }}
              />
              <motion.button
                id="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                whileHover={input.trim() && !isThinking ? { scale: 1.05, backgroundColor: '#fff176', color: '#1a2e1a' } : {}}
                whileTap={input.trim() && !isThinking ? { scale: 0.95 } : {}}
                aria-label="Send"
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0, border: input.trim() && !isThinking ? '2px dashed #fff176' : '2px dashed var(--border)', cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                  backgroundColor: 'rgba(0,0,0,0)',
                  color: input.trim() && !isThinking ? '#fff176' : 'rgba(245, 240, 232, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Send size={18} />
              </motion.button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--chalk-dimmer)', marginTop: 8 }}>
              Answer honestly — this is how you actually learn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
