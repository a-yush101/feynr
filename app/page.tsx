'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Edit3, Target, MessageCircle, BarChart, Puzzle } from 'lucide-react';
import { setSession } from '@/lib/storage';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [depthLevel, setDepthLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const sessionId = `session_${Date.now()}`;
      setSession({
        sessionId,
        userId: undefined,
        topic,
        step: 'explain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        clarityScore: undefined,
        tags: [depthLevel],
      });
      router.push('/explain');
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !topic.trim() || isLoading;

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}
      className="overflow-hidden flex items-center justify-center px-4 relative"
    >
      {/* Ambient chalkboard erasures/smudges */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(232, 226, 212, 0.03) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(139, 191, 212, 0.04) 0%, transparent 60%)',
            borderRadius: '50%', filter: 'blur(40px)',
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 640 }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 9999,
              backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Edit3 size={14} style={{ color: 'var(--yellow)' }} />
            </motion.div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--chalk-dim)' }}>
              Feynman Technique
            </span>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 44 }}>
          <h1 style={{ fontFamily: 'var(--font-chalk)', fontSize: 'clamp(4rem, 11vw, 6.5rem)', fontWeight: 700, lineHeight: 1.05, marginBottom: 16, letterSpacing: '0.02em', transform: 'rotate(-2deg)' }}>
            <span style={{ color: 'var(--chalk)' }}>Explain it. </span>
            <span style={{ color: 'var(--chalk)' }}>Understand it. </span>
            <span style={{ color: 'var(--coral)' }}>
              Own it.
            </span>
          </h1>
          <p style={{ fontFamily: 'var(--font-chalk)', fontSize: 26, color: 'var(--chalk-dim)', maxWidth: 500, margin: '0 auto', lineHeight: 1.4, transform: 'rotate(-1deg)' }}>
            Teach a concept to an AI. Get friendly follow-up questions. Discover exactly what you don't know.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '32px',
            borderRadius: 24,
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--border)',
            marginBottom: 32,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--chalk)', marginBottom: 10 }}>
            What do you want to explain?
          </label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isButtonDisabled) handleStart(); }}
            placeholder="e.g., Photosynthesis, Market logic, Machine learning..."
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 14,
              backgroundColor: 'var(--surface-2)',
              border: '2px solid var(--border-soft)',
              color: 'var(--chalk)', fontSize: 16, outline: 'none',
              marginBottom: 24, boxSizing: 'border-box',
              fontFamily: 'inherit', fontWeight: 600,
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-soft)')}
          />

          {/* Depth selector */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--chalk)', marginBottom: 10 }}>
              Your level
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => {
                const isActive = depthLevel === level;
                return (
                  <motion.button
                    key={level}
                    whileHover={!isActive ? { scale: 1.02, backgroundColor: '#212121' } : {}}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDepthLevel(level)}
                    id={`depth-${level}`}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 800,
                      fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                      backgroundColor: isActive ? '#8bbfd4' : '#181818',
                      color: isActive ? '#0d0d0d' : 'rgba(232, 226, 212, 0.55)',
                      border: isActive ? '2px solid #8bbfd4' : '2px solid rgba(220, 215, 200, 0.1)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Start button */}
          <motion.button
            id="start-btn"
            onClick={handleStart}
            disabled={isButtonDisabled}
            whileHover={!isButtonDisabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 14,
              fontWeight: 800, fontSize: 16, cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              border: 'none', fontFamily: 'inherit',
              backgroundColor: isButtonDisabled ? 'var(--surface-2)' : 'var(--green)',
              color: isButtonDisabled ? 'var(--chalk-dimmer)' : 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: isButtonDisabled ? 'none' : '0 8px 24px rgba(142, 207, 176, 0.25)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={18} />
                </motion.div>
                Preparing board…
              </>
            ) : (
              <>Pick up the chalk <span style={{ fontSize: 18 }}>→</span></>
            )}
          </motion.button>
        </motion.div>

        {/* Feature pills */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {[
            { icon: Target, text: 'Gap Detection', color: '#e09080' },
            { icon: MessageCircle, text: 'Socratic Probing', color: '#8bbfd4' },
            { icon: BarChart, text: 'Clarity Report', color: '#8ecfb0' },
            { icon: Puzzle, text: 'Adaptive Quiz', color: '#e0d080' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, borderColor: feature.color, color: '#e8e2d4' }}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '8px 16px', borderRadius: 9999,
                  backgroundColor: '#181818', border: '2px solid rgba(220, 215, 200, 0.1)',
                  fontSize: 13, fontWeight: 700, color: 'rgba(232, 226, 212, 0.55)', cursor: 'default',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={15} style={{ marginRight: 6 }} />
                {feature.text}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
