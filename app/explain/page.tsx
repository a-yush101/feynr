'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { setSession } from '@/lib/storage';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function ExplainPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [depthLevel, setDepthLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'topic' | 'explain'>('topic');

  const words = wordCount(explanation);
  const isExplainReady = words > 0 && !isLoading;
  const isTopicReady = topic.trim().length > 0;

  const handleNextStep = () => {
    if (isTopicReady) setStep('explain');
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
        sessionId,
        userId: undefined,
        topic: topic,
        step: 'followup',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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

  const outlineStyle = {
    color: 'transparent',
    WebkitTextStroke: '2px #f5f0e8',
    textShadow: '2px 2px 4px rgba(245,240,232,0.3), -1px -1px 0px rgba(245,240,232,0.1)'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Back Arrow */}
      <button 
        onClick={() => router.push('/')}
        style={{
          position: 'absolute', top: 40, left: 40,
          background: 'rgba(0,0,0,0)', border: 'none', color: 'rgba(245,240,232,0.6)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600,
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#f5f0e8'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,232,0.6)'}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 600, padding: 20 }}
      >
        
        {/* Label */}
        <label style={{ 
          fontFamily: 'var(--font-marker)', fontSize: 32, display: 'block', marginBottom: 20, transform: 'rotate(-1deg)',
          ...outlineStyle 
        }}>
          {step === 'topic' ? 'What do you want to explain?' : `Explain ${topic}`}
        </label>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          {step === 'topic' ? (
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && isTopicReady) handleNextStep(); }}
              placeholder="e.g., Quantum Computing, React Hooks..."
              disabled={isLoading}
              style={{
                width: '100%', padding: '24px',
                backgroundColor: 'rgba(245,240,232,0.04)',
                border: '2px dashed rgba(245,240,232,0.2)', borderRadius: 20,
                color: '#ffffff', outline: 'none', fontSize: 18,
                fontFamily: 'inherit', boxSizing: 'border-box'
              }}
            />
          ) : (
            <>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder={`Start explaining ${topic} here. Think out loud...`}
                disabled={isLoading}
                style={{
                  width: '100%', minHeight: 240, padding: '24px 24px 48px 24px',
                  backgroundColor: 'rgba(245,240,232,0.04)',
                  border: '2px dashed rgba(245,240,232,0.2)', borderRadius: 20,
                  color: '#ffffff', outline: 'none', fontSize: 18, lineHeight: 1.6,
                  fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box'
                }}
              />
              <div style={{ position: 'absolute', bottom: 16, right: 24, fontSize: 14, fontWeight: 700, color: 'rgba(245,240,232,0.4)' }}>
                {words} word{words !== 1 ? 's' : ''}
              </div>
            </>
          )}
        </div>

        {/* Depth Selector - Only show on topic step */}
        {step === 'topic' && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
                const isActive = depthLevel === level;
                return (
                  <motion.button 
                    key={level} 
                    onClick={() => setDepthLevel(level)}
                    whileHover={!isActive ? { scale: 1.02, backgroundColor: 'rgba(245, 240, 232, 0.05)' } : {}} 
                    whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1, padding: '14px 0', borderRadius: 16, fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                      backgroundColor: isActive ? 'rgba(255,138,128,0.05)' : 'rgba(0,0,0,0)',
                      color: isActive ? '#ff8a80' : 'rgba(245, 240, 232, 0.4)',
                      border: isActive ? '2px dashed #ff8a80' : '2px dashed rgba(245, 240, 232, 0.2)',
                      transition: 'all 0.2s', textTransform: 'capitalize'
                    }}
                  >
                    {level}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', borderRadius: 12, backgroundColor: 'rgba(255, 138, 128, 0.05)', border: '2px solid rgba(255, 138, 128, 0.2)', color: '#ff8a80', fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
              <AlertCircle size={18} style={{ marginTop: 2, flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        {step === 'topic' ? (
          <motion.button 
            onClick={handleNextStep} 
            disabled={!isTopicReady}
            whileHover={isTopicReady ? { scale: 1.02, backgroundColor: 'rgba(255,138,128,0.1)' } : {}}
            whileTap={isTopicReady ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '18px 0', borderRadius: 16, fontWeight: 800, fontSize: 18,
              border: isTopicReady ? '2px dashed #ff8a80' : '2px dashed rgba(245,240,232,0.1)',
              cursor: isTopicReady ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              backgroundColor: 'rgba(0,0,0,0)',
              color: isTopicReady ? '#ff8a80' : 'rgba(245,240,232,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
            }}
          >
            Pick up the chalk <ChevronRight size={20} />
          </motion.button>
        ) : (
          <motion.button 
            onClick={handleSubmit} 
            disabled={!isExplainReady}
            whileHover={isExplainReady ? { scale: 1.02, backgroundColor: 'rgba(255,138,128,0.1)' } : {}}
            whileTap={isExplainReady ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '18px 0', borderRadius: 16, fontWeight: 800, fontSize: 18,
              border: isExplainReady ? '2px dashed #ff8a80' : '2px dashed rgba(245,240,232,0.1)',
              cursor: isExplainReady ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              backgroundColor: 'rgba(0,0,0,0)',
              color: isExplainReady ? '#ff8a80' : 'rgba(245,240,232,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
            }}
          >
            {isLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={18} />
                </motion.div>
                Reading your thoughts…
              </>
            ) : (
              <>Analyze My Understanding <ChevronRight size={20} /></>
            )}
          </motion.button>
        )}

      </motion.div>
    </div>
  );
}
