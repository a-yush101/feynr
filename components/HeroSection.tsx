'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

export default function HeroSection() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const transition = reduced ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' };

  return (
    <section
      id="home"
      aria-label="Hero section"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '64px',
      }}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.4, pointerEvents: 'none',
        }}
      />

      {/* Soft orange glow — right side */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', right: '-10%', top: '20%',
          width: '55%', height: '60%', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, rgba(30,58,95,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main container */}
      <div
        style={{
          maxWidth: '1152px', margin: '0 auto',
          padding: '80px 24px', width: '100%',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '64px', alignItems: 'center',
        }}
        className="hero-grid"
      >

        {/* ── Left: Copy ── */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} transition={transition} style={{ marginBottom: '24px' }}>
            <span
              id="hero-badge"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#f97316',
                border: '1px solid rgba(249,115,22,0.3)',
                backgroundColor: 'rgba(249,115,22,0.06)',
                padding: '6px 14px', borderRadius: '9999px',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: '#f97316',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              ✦ Feynman Technique Reimagined
            </span>
          </motion.div>

          {/* Headline — original Feynr copy */}
          <motion.h1
            variants={fadeUp}
            transition={transition}
            style={{
              fontSize: 'clamp(2.6rem, 4.5vw, 4.25rem)',
              fontWeight: 900, lineHeight: 1.08,
              letterSpacing: '-0.02em', color: '#111111',
              marginBottom: '24px',
            }}
          >
            The best way<br />
            to learn is to{' '}
            <span style={{ color: '#f97316' }}>teach.</span>
          </motion.h1>

          {/* Subtext — original Feynr copy */}
          <motion.p
            variants={fadeUp}
            transition={transition}
            style={{
              fontSize: '1.0625rem', lineHeight: 1.7,
              color: '#555555', marginBottom: '40px', maxWidth: '42ch',
            }}
          >
            Pick a topic, explain what you know, and let AI fill the gaps.
          </motion.p>

          {/* Single CTA */}
          <motion.div variants={fadeUp} transition={transition}>
            <button
              id="hero-cta-primary"
              onClick={() => router.push('/explain')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '0.9375rem', fontWeight: 700,
                color: '#ffffff', backgroundColor: '#111111',
                padding: '14px 28px', borderRadius: '9999px',
                border: 'none', cursor: 'pointer',
                letterSpacing: '0.01em', transition: 'background-color 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#111111')}
            >
              Pick up the chalk
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>

          {/* 3-stat strip */}
          <motion.div
            variants={fadeUp}
            transition={transition}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '40px',
              marginTop: '24px', paddingTop: '24px',
              borderTop: '1px solid #f0f0f0', width: '100%',
            }}
          >
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', display: 'block' }}>6 Stage</span>
              <p style={{ fontSize: '0.75rem', color: '#555555', marginTop: '2px' }}>AI reasoning pipeline</p>
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', display: 'block' }}>4 Dimensions</span>
              <p style={{ fontSize: '0.75rem', color: '#555555', marginTop: '2px' }}>of understanding scored</p>
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316', display: 'block' }}>Feynman</span>
              <p style={{ fontSize: '0.75rem', color: '#555555', marginTop: '2px' }}>technique, reimagined</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: Illustration ── */}
        <motion.div
          style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={reduced ? {} : { opacity: 0, x: 40 }}
          animate={reduced ? {} : { opacity: 1, x: 0 }}
          transition={reduced ? {} : { duration: 0.65, ease: 'easeOut', delay: 0.25 }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '520px', aspectRatio: '1/1' }}>

            {/* Floating stat — top left */}
            <motion.div
              aria-label="90% knowledge retention stat"
              initial={reduced ? {} : { opacity: 0, y: -12 }}
              animate={reduced ? {} : { opacity: 1, y: 0 }}
              transition={reduced ? {} : { duration: 0.4, delay: 0.75 }}
              style={{
                position: 'absolute', top: '6%', left: '-6%',
                backgroundColor: '#ffffff', border: '1px solid #e5e5e5',
                borderRadius: '12px', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', zIndex: 10, whiteSpace: 'nowrap',
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111111', lineHeight: 1.3 }}>90% Retention</div>
                <div style={{ fontSize: '10px', color: '#555555', lineHeight: 1.3 }}>vs 10% passive reading</div>
              </div>
            </motion.div>

            {/* Floating stat — bottom right */}
            <motion.div
              aria-label="Adaptive learning paths"
              initial={reduced ? {} : { opacity: 0, y: 12 }}
              animate={reduced ? {} : { opacity: 1, y: 0 }}
              transition={reduced ? {} : { duration: 0.4, delay: 0.9 }}
              style={{
                position: 'absolute', bottom: '8%', right: '-6%',
                backgroundColor: '#111111', borderRadius: '12px',
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 10, whiteSpace: 'nowrap',
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#ffffff' }} aria-hidden="true">AI</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>Adaptive Paths</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>Generated in real time</div>
              </div>
            </motion.div>

            {/* Main illustration */}
            <Image
              src="/hero-illustration.png"
              alt="A student using AI-powered learning tools on a laptop with data visualizations"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 90vw, 520px"
            />
          </div>
        </motion.div>

      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 767px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            padding: 48px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
