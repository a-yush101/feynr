import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
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
