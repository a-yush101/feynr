'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, User, AlertCircle, ChevronRight } from 'lucide-react';
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}
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
  const [conversationHistory, setConversationHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSession();
    if (!session?.topic || !session.messages?.length) { router.replace('/'); return; }
    setTopic(session.topic);
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
        body: JSON.stringify({ topic, conversationHistory: updatedHistory, userAnswer: trimmed }),
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
    <div style={{ backgroundColor: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Ambient */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '30%', left: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(30,58,95,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '30%', right: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* Topic info bar */}
      <div style={{ position: 'fixed', top: 72, left: 0, right: 0, zIndex: 40, display: 'flex', justifyContent: 'center', padding: '8px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <Brain size={11} style={{ color: 'rgba(249,115,22,0.6)' }} />
          Socratic session on&nbsp;
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{topic}</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, paddingTop: 140, paddingBottom: 140, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}
              >
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'assistant' ? 'linear-gradient(135deg, #1e3a5f, #f97316)' : '#1e1e2a',
                  border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}>
                  {msg.role === 'assistant' ? <Brain size={14} color="#fff" /> : <User size={14} color="rgba(255,255,255,0.6)" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '75%', padding: '12px 16px', borderRadius: 16,
                  fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.9)',
                  ...(msg.role === 'assistant'
                    ? { backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderTopLeftRadius: 4 }
                    : { backgroundColor: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderTopRightRadius: 4 }),
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
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a5f, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={14} color="#fff" />
                </div>
                <div style={{ padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ThinkingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* End card */}
          <AnimatePresence>
            {shouldEnd && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: 24, borderRadius: 20, backgroundColor: '#111118', border: '1px solid rgba(249,115,22,0.2)', textAlign: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>✨</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Session complete!</h3>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                  The AI has probed your understanding. Time to see your clarity report.
                </p>
                <motion.button id="view-report-btn" onClick={handleViewReport} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #1e3a5f, #f97316)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}>
                  View My Report <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', gap: 8, padding: '12px 14px', borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13 }}>
                <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input bar */}
      {!shouldEnd && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '16px', background: 'linear-gradient(to top, #0a0a0f 60%, transparent)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '10px 14px', borderRadius: 18, backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 -4px 24px rgba(0,0,0,0.4)' }}>
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
                style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', resize: 'none', border: 'none', outline: 'none', fontSize: 14, lineHeight: 1.6, maxHeight: 120, minHeight: 36, paddingTop: 6, fontFamily: 'inherit' }}
              />
              <motion.button
                id="session-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                whileHover={input.trim() && !isThinking ? { scale: 1.08 } : {}}
                whileTap={input.trim() && !isThinking ? { scale: 0.92 } : {}}
                aria-label="Send"
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0, border: 'none', cursor: input.trim() && !isThinking ? 'pointer' : 'not-allowed',
                  backgroundColor: input.trim() && !isThinking ? '#f97316' : 'rgba(255,255,255,0.07)',
                  color: input.trim() && !isThinking ? '#fff' : 'rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: input.trim() && !isThinking ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
                }}
              >
                <Send size={16} />
              </motion.button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 6 }}>
              Answer honestly — this is how you actually learn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
