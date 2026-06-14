import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import { PenLine, Bot, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Navbar />
      <HeroSection />
      
      {/* How it works section */}
      <section style={{ maxWidth: '1152px', margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111111', textAlign: 'center', marginBottom: '48px', letterSpacing: '-0.02em' }}>
          How it works
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          
          {/* Step 1 */}
          <div style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>01</div>
            <div style={{ color: '#111111' }}><PenLine size={24} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111' }}>Explain It</h3>
            <p style={{ fontSize: '0.9375rem', color: '#555555', lineHeight: 1.6 }}>Write what you know about any topic in your own words. No hints.</p>
          </div>

          <div style={{ color: '#aaaaaa', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', flexShrink: 0 }} className="arrow-icon">
            →
          </div>

          {/* Step 2 */}
          <div style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>02</div>
            <div style={{ color: '#111111' }}><Bot size={24} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111' }}>Get Questioned</h3>
            <p style={{ fontSize: '0.9375rem', color: '#555555', lineHeight: 1.6 }}>An AI Socratic agent asks targeted follow-up questions to probe your understanding.</p>
          </div>

          <div style={{ color: '#aaaaaa', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', flexShrink: 0 }} className="arrow-icon">
            →
          </div>

          {/* Step 3 */}
          <div style={{ flex: '1 1 300px', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f97316', lineHeight: 1 }}>03</div>
            <div style={{ color: '#111111' }}><BarChart3 size={24} /></div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111' }}>See Your Gaps</h3>
            <p style={{ fontSize: '0.9375rem', color: '#555555', lineHeight: 1.6 }}>Get a clarity report with scores across 4 dimensions and a personalized quiz.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <p style={{ fontSize: '1.0625rem', color: '#555555', marginBottom: '16px', fontWeight: 500 }}>Ready to find out what you really know?</p>
          <Link href="/explain" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff', backgroundColor: '#111111', padding: '14px 28px', borderRadius: '9999px', textDecoration: 'none', transition: 'background-color 0.2s' }}>
            Start now →
          </Link>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .arrow-icon {
              transform: rotate(90deg);
              margin: 16px 0;
            }
          }
        `}</style>
      </section>

      <footer style={{
        width: '100%',
        borderTop: '1px solid #f0f0f0',
        padding: '20px 24px',
        backgroundColor: '#ffffff',
        marginTop: 'auto',
      }}>
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#aaaaaa',
          letterSpacing: '0.03em',
        }}>
          Made by Ayush &middot; Built for Microsoft Agents League @ AI Skills Fest &middot; Powered by GitHub Copilot ✦
        </p>
      </footer>
    </main>
  );
}
