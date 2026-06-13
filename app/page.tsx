'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
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
      style={{ backgroundColor: '#0a0a0f', minHeight: '100vh' }}
      className="overflow-hidden flex items-center justify-center px-4 relative"
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          style={{
            position: 'absolute', top: '10%', left: '5%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(30,58,95,0.25) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '10%', right: '5%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
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
              backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f97316' }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
              Feynman Technique — Reimagined
            </span>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
            <span style={{ color: '#fff' }}>Explain it.</span>
            <br />
            <span style={{ color: '#fff' }}>Understand it.</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Own it.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Teach a concept to an AI. Get Socratic follow-up questions. Discover exactly what you don't know.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          style={{
            padding: '32px',
            borderRadius: 20,
            backgroundColor: '#111118',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 32,
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            What do you want to explain?
          </label>
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isButtonDisabled) handleStart(); }}
            placeholder="e.g., Quantum entanglement, Photosynthesis, Machine learning..."
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: 15, outline: 'none',
              marginBottom: 24, boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />

          {/* Depth selector */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
              Understanding level
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDepthLevel(level)}
                  id={`depth-${level}`}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontWeight: 600,
                    fontSize: 13, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                    backgroundColor: depthLevel === level ? '#f97316' : 'rgba(255,255,255,0.07)',
                    color: depthLevel === level ? '#fff' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.2s',
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </motion.button>
              ))}
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
              width: '100%', padding: '14px 0', borderRadius: 12,
              fontWeight: 700, fontSize: 15, cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              border: 'none', fontFamily: 'inherit',
              background: isButtonDisabled
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(135deg, #1e3a5f 0%, #f97316 100%)',
              color: isButtonDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: isButtonDisabled ? 'none' : '0 8px 24px rgba(249,115,22,0.25)',
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={18} />
                </motion.div>
                Starting…
              </>
            ) : (
              <>Start Explaining <span style={{ fontSize: 18 }}>→</span></>
            )}
          </motion.button>
        </motion.div>

        {/* Feature pills */}
        <motion.div variants={itemVariants} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {[
            { icon: '🎯', text: 'Gap Detection' },
            { icon: '🧠', text: 'Socratic Probing' },
            { icon: '📊', text: 'Clarity Report' },
            { icon: '🧩', text: 'Adaptive Quiz' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '8px 16px', borderRadius: 9999,
                backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 13, color: 'rgba(255,255,255,0.6)', cursor: 'default',
              }}
            >
              <span style={{ marginRight: 6 }}>{feature.icon}</span>
              {feature.text}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
