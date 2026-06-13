'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const fadeUpInView = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/explain');
  };

  const outlineStyle = {
    color: 'transparent',
    WebkitTextStroke: '2px #f5f0e8',
    textShadow: '2px 2px 4px rgba(245,240,232,0.3), -1px -1px 0px rgba(245,240,232,0.1)'
  };

  const outlineCoralStyle = {
    color: 'transparent',
    WebkitTextStroke: '2px #ff8a80',
    textShadow: '2px 2px 4px rgba(245,240,232,0.3), -1px -1px 0px rgba(245,240,232,0.1)'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      
      {/* SECTION 1 — HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 20px' }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 800 }}
        >
          {/* Small top badge */}
          <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: 9999,
              border: '2px dashed rgba(245,240,232,0.3)', color: 'rgba(245,240,232,0.8)',
              fontSize: 14, fontWeight: 600, backgroundColor: 'rgba(245,240,232,0.03)'
            }}>
              ✦ Feynman Technique Reimagined
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={itemVariants} style={{ fontFamily: 'var(--font-marker)', fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '0.02em', transform: 'rotate(-2deg)' }}>
            <span style={outlineStyle}>The best way to</span><br />
            <span style={outlineStyle}>learn is to </span>
            <span style={outlineCoralStyle}>teach.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={itemVariants} style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'rgba(245,240,232,0.6)', maxWidth: 600, lineHeight: 1.5, marginBottom: 40, fontWeight: 500 }}>
            Pick a topic, explain what you know, and let AI fill the gaps.
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.02, backgroundColor: '#f5f0e8', color: '#0a0a0f' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px 40px', borderRadius: 16, fontWeight: 700, fontSize: 18,
                border: '2px dashed #f5f0e8', backgroundColor: 'rgba(0,0,0,0)', color: '#f5f0e8',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              Start Learning →
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ position: 'absolute', bottom: 40, color: 'rgba(245,240,232,0.4)', fontSize: 14, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>↓</motion.div>
          see how it works
        </motion.div>
      </section>

      {/* SECTION 2 — HOW IT WORKS */}
      <section style={{ backgroundColor: '#111118', padding: '100px 20px', width: '100%' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}
        >
          {[
            { step: '1', title: '✏️ Explain', desc: 'Write out what you know about any topic in your own words' },
            { step: '2', title: '🧠 Get Questioned', desc: 'An AI Socratic agent probes your understanding with targeted follow-ups' },
            { step: '3', title: '📊 See Your Gaps', desc: 'Get a clarity report with scores and exactly what to study next' }
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUpInView}
              style={{
                border: '2px dashed rgba(245,240,232,0.2)', backgroundColor: 'rgba(245,240,232,0.03)',
                borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', position: 'relative'
              }}
            >
              <div style={{ position: 'absolute', top: 20, right: 24, fontFamily: 'var(--font-marker)', fontSize: 48, color: '#ff8a80', opacity: 0.3, transform: 'rotate(5deg)' }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f5f0e8', marginBottom: 16 }}>{item.title}</h3>
              <p style={{ fontSize: 16, color: 'rgba(245,240,232,0.6)', lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 3 — WHY IT WORKS */}
      <section style={{ padding: '120px 20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpInView}
          style={{ fontFamily: 'var(--font-marker)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', textAlign: 'center', marginBottom: 60, ...outlineStyle, transform: 'rotate(-1deg)' }}
        >
          Why explaining works
        </motion.h2>
        
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', maxWidth: 1000 }}
        >
          {[
            { main: '90% retention', sub: 'vs 10% from passive reading' },
            { main: 'Used by top students', sub: 'Nobel laureates swear by it' },
            { main: 'Instant feedback', sub: 'Know your gaps in minutes' }
          ].map((pill, i) => (
            <motion.div key={i} variants={fadeUpInView}
              style={{
                border: '2px dashed rgba(245,240,232,0.2)', borderRadius: 9999, padding: '20px 40px',
                textAlign: 'center', backgroundColor: 'rgba(245,240,232,0.02)'
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f5f0e8', marginBottom: 6 }}>{pill.main}</div>
              <div style={{ fontSize: 14, color: 'rgba(245,240,232,0.6)', fontWeight: 500 }}>{pill.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 4 — FEATURES */}
      <section style={{ backgroundColor: '#111118', padding: '120px 20px', width: '100%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpInView}
            style={{ fontFamily: 'var(--font-marker)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', textAlign: 'center', marginBottom: 60, ...outlineStyle, transform: 'rotate(-2deg)' }}
          >
            Everything you need
          </motion.h2>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}
          >
            {[
              { title: '🎯 Gap Detection', desc: "AI identifies exactly what's missing from your explanation" },
              { title: '🔍 Socratic Probing', desc: 'Targeted follow-up questions that expose blind spots' },
              { title: '📊 Clarity Report', desc: 'Scores across accuracy, depth, clarity and completeness' },
              { title: '🧩 Adaptive Quiz', desc: 'Quiz questions built from your specific weak spots' }
            ].map((feat, i) => (
              <motion.div key={i} variants={fadeUpInView}
                style={{
                  border: '2px dashed rgba(245,240,232,0.2)', backgroundColor: 'rgba(245,240,232,0.03)',
                  borderRadius: 24, padding: 32
                }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f5f0e8', marginBottom: 12 }}>{feat.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.6)', lineHeight: 1.6, fontWeight: 500 }}>{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — CTA BANNER */}
      <section style={{ padding: '140px 20px', width: '100%', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
          <motion.h2 variants={itemVariants} style={{ fontFamily: 'var(--font-marker)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: '#f5f0e8', marginBottom: 16, transform: 'rotate(-1deg)' }}>
            Ready to find out what you really know?
          </motion.h2>
          <motion.p variants={itemVariants} style={{ fontSize: 20, color: 'rgba(245,240,232,0.6)', marginBottom: 40, fontWeight: 500 }}>
            It takes 5 minutes. No signup needed.
          </motion.p>
          <motion.div variants={itemVariants}>
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,138,128,0.1)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '20px 48px', borderRadius: 16, fontWeight: 800, fontSize: 18,
                border: '2px dashed #ff8a80', backgroundColor: 'rgba(0,0,0,0)', color: '#ff8a80',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
            >
              Pick up the chalk →
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(245,240,232,0.1)', padding: '40px 20px', backgroundColor: '#0a0a0f', width: '100%' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, color: 'rgba(245,240,232,0.4)', fontSize: 13, fontWeight: 500 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-marker)', fontSize: 24, color: 'rgba(245,240,232,0.6)', transform: 'rotate(-2deg)' }}>Feynr</span>
            <span>Understand it. Explain it. Own it.</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            Built with GitHub Copilot ✦ Microsoft Agents League 2026
          </div>
          <div style={{ textAlign: 'right' }}>
            Made for learners everywhere
          </div>
        </div>
      </footer>
    </div>
  );
}
