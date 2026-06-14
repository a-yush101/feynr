'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ── 5-step journey definition ──────────────────────────────────────────────
// Path rules:
//   /explain  (no ?s)  → step 0  — Pick Topic
//   /explain  ?s=2     → step 1  — Write
//   /session           → step 2  — Discuss
//   /report            → step 3  — Insight
//   /quiz              → step 4  — Challenge
const STEPS = [
  { label: 'Pick Topic' },
  { label: 'Write'      },
  { label: 'Discuss'    },
  { label: 'Insight'    },
  { label: 'Challenge'  },
] as const;

function resolveActiveIndex(pathname: string, searchParams: ReturnType<typeof useSearchParams>): number {
  if (pathname.startsWith('/quiz'))    return 4;
  if (pathname.startsWith('/report'))  return 3;
  if (pathname.startsWith('/session')) return 2;
  if (pathname.startsWith('/explain')) return searchParams.get('s') === '2' ? 1 : 0;
  return -1;
}

// Inline SVG checkmark
function Check() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Separated into its own component so Suspense can wrap useSearchParams
function StepProgress() {
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const activeIndex = resolveActiveIndex(pathname, searchParams);

  if (activeIndex === -1) return null;

  return (
    <nav
      aria-label="Learning journey progress"
      style={{ display: 'flex', alignItems: 'center' }}
    >
      {STEPS.map((step, i) => {
        const isActive   = i === activeIndex;
        const isComplete = i < activeIndex;

        return (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step node */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Circle */}
              <div
                aria-current={isActive ? 'step' : undefined}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  backgroundColor: isActive || isComplete ? '#111111' : '#ebebeb',
                  color: isActive || isComplete ? '#ffffff' : '#aaaaaa',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.3s ease',
                }}
              >
                {isComplete ? <Check /> : i + 1}
              </div>

              {/* Label — only active step */}
              {isActive && (
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: '#111111', whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: isActive ? '28px' : '16px',
                height: '1px',
                margin: '0 5px',
                backgroundColor: isComplete ? '#111111' : '#e5e5e5',
                transition: 'all 0.3s ease',
              }} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    <header
      id="navbar"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <nav
        style={{
          maxWidth: '1152px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}
        aria-label="Site navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Feynr home"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            textDecoration: 'none', userSelect: 'none', flexShrink: 0,
          }}
        >
          <span aria-hidden="true" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '30px', height: '30px', borderRadius: '8px',
            backgroundColor: '#111111', color: '#ffffff',
            fontSize: '13px', fontWeight: 900, lineHeight: 1,
          }}>F</span>
          <span style={{
            fontSize: '1.1rem', fontWeight: 800,
            letterSpacing: '-0.02em', color: '#111111',
          }}>feynr</span>
        </Link>

        {/* Center: 5-step progress — only on app pages */}
        {!isLanding && (
          <div className="navbar-center" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0, padding: '0 16px' }}>
            <Suspense fallback={<div style={{ width: '200px', height: '22px' }} />}>
              <StepProgress />
            </Suspense>
          </div>
        )}

        {/* Right: Agent League badge */}
        <div className="navbar-right" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <span className="badge-primary" style={{
            fontSize: '0.75rem', fontWeight: 500, color: '#111111',
            border: '1px solid #e5e5e5', backgroundColor: 'transparent',
            padding: '6px 14px', borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}>
            Microsoft Agents League @ AI Skills Fest
          </span>
          <span className="badge-secondary" style={{
            fontSize: '0.75rem', fontWeight: 500, color: '#111111',
            border: '1px solid #e5e5e5', backgroundColor: 'transparent',
            padding: '6px 14px', borderRadius: '9999px',
            whiteSpace: 'nowrap',
          }}>
            ✦ Built with GitHub Copilot
          </span>
        </div>
      </nav>
      
      <style>{`
        @media (max-width: 1024px) {
          .badge-secondary { display: none !important; }
        }
        @media (max-width: 860px) {
          .navbar-right { display: none !important; }
        }
        @media (max-width: 640px) {
          .navbar-center { justify-content: flex-end !important; }
        }
      `}</style>
    </header>
  );
}
