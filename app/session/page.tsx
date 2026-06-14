'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, AlertCircle, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getSession, setSession } from '@/lib/storage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
interface HistoryItem { role: string; content: string; }

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#d4d4d4' }}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
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
        setMessages((p) => [...p, aiMsg]);
        setConversationHistory([...updatedHistory, { role: 'assistant', content: data.nextQuestion }]);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Topic info bar */}
      <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'center', padding: '10px 16px', backgroundColor: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', fontSize: '13px', fontWeight: 600, color: '#555555' }}>
          <BookOpen size={13} style={{ color: '#f97316' }} />
          Socratic session on&nbsp;
          <span style={{ color: '#111111', fontWeight: 800 }}>{topic}</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, paddingTop: '130px', paddingBottom: '130px', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: msg.role === 'assistant' ? '#111111' : '#f97316',
                }}>
                  {msg.role === 'assistant'
                    ? <Bot size={16} color="#ffffff" />
                    : <User size={16} color="#ffffff" />}
                </div>
                {/* Bubble */}
                <div style={{
                  maxWidth: '75%', padding: '12px 18px', fontSize: '0.9375rem', lineHeight: 1.65, fontWeight: 500,
                  ...(msg.role === 'assistant'
                    ? { backgroundColor: '#f5f5f5', border: '1px solid #ebebeb', borderRadius: '4px 16px 16px 16px', color: '#111111' }
                    : { backgroundColor: '#111111', borderRadius: '16px 4px 16px 16px', color: '#ffffff' }),
                }}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          <AnimatePresence>
            {isThinking && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={16} color="#ffffff" />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', backgroundColor: '#f5f5f5', border: '1px solid #ebebeb' }}>
                  <ThinkingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session complete card */}
          <AnimatePresence>
            {shouldEnd && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', textAlign: 'center', marginTop: '8px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
                <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111111', marginBottom: '8px' }}>Session complete!</h3>
                <p style={{ fontSize: '0.9375rem', color: '#555555', marginBottom: '24px', lineHeight: 1.6 }}>
                  The AI has probed your understanding. Time to see your clarity report.
                </p>
                <button
                  id="view-report-btn"
                  onClick={handleViewReport}
                  style={{
                    width: '100%', padding: '13px 0', borderRadius: '9999px',
                    fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                    cursor: 'pointer', fontFamily: 'inherit',
                    backgroundColor: '#111111', color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
                >
                  View Clarity Report <ChevronRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: '8px', padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input bar */}
      {!shouldEnd && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          padding: '12px 16px 20px',
          background: 'linear-gradient(to top, #ffffff 70%, transparent)',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              padding: '10px 12px 10px 16px', borderRadius: '16px',
              backgroundColor: '#ffffff', border: '1.5px solid #e5e5e5',
              boxShadow: '0 -2px 20px rgba(0,0,0,0.06)',
            }}>
              <textarea
                ref={inputRef}
                id="session-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your answer… (Enter to send)"
                disabled={isThinking}
                aria-label="Your answer"
                rows={1}
                style={{
                  flex: 1, padding: '8px 4px', fontSize: '0.9375rem',
                  lineHeight: 1.5, color: '#111111', backgroundColor: 'transparent',
                  border: 'none', outline: 'none', resize: 'none',
                  minHeight: '40px', maxHeight: '120px',
                  fontFamily: 'inherit', fontWeight: 500, overflowY: 'auto',
                }}
              />
              <button
                id="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                aria-label="Send"
                style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  border: 'none', cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                  backgroundColor: input.trim() && !isThinking ? '#111111' : '#e5e5e5',
                  color: input.trim() && !isThinking ? '#ffffff' : '#999999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { if (input.trim() && !isThinking) e.currentTarget.style.backgroundColor = '#f97316'; }}
                onMouseLeave={(e) => { if (input.trim() && !isThinking) e.currentTarget.style.backgroundColor = '#111111'; }}
              >
                {isThinking ? <Sparkles size={16} /> : <Send size={16} />}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 500, color: '#aaaaaa', marginTop: '6px' }}>
              Answer honestly — this is how you actually learn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
