'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STEPS = [
  { label: 'Explain',  path: '/explain'  },
  { label: 'Session',  path: '/session'  },
  { label: 'Report',   path: '/report'   },
  { label: 'Quiz',     path: '/quiz'     },
] as const;

function StepProgress({ currentPath }: { currentPath: string }) {
  const activeIndex = STEPS.findIndex((s) => currentPath.startsWith(s.path));
  if (activeIndex === -1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
      }}
      aria-label="Progress steps"
      role="list"
    >
      {STEPS.map((step, i) => {
        const isActive   = i === activeIndex;
        const isComplete = i < activeIndex;
        const isDimmed   = i > activeIndex;

        return (
          <div key={step.path} style={{ display: 'flex', alignItems: 'center' }} role="listitem">
            {/* Step pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#111111' : isComplete ? '#111111' : '#e5e5e5',
                  color: isActive || isComplete ? '#ffffff' : '#aaaaaa',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {isComplete ? (
                  // Checkmark for completed steps
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>

              {/* Label — only show on active step */}
              {isActive && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#111111',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector line between steps */}
            {i < STEPS.length - 1 && (
              <div
                style={{
                  width: isActive ? '32px' : '20px',
                  height: '1px',
                  backgroundColor: isComplete ? '#111111' : '#e5e5e5',
                  margin: '0 6px',
                  transition: 'all 0.3s',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
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
        transition: 'all 0.3s ease',
      }}
    >
      <nav
        style={{
          maxWidth: '1152px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        aria-label="Main navigation"
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
          <span
            aria-hidden="true"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '8px',
              backgroundColor: '#111111', color: '#ffffff',
              fontSize: '13px', fontWeight: 900, lineHeight: 1,
            }}
          >
            F
          </span>
          <span style={{
            fontSize: '1.1rem', fontWeight: 800,
            letterSpacing: '-0.02em', color: '#111111',
          }}>
            feynr
          </span>
        </Link>

        {/* Center: Step progress (app pages only) */}
        {!isLanding && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <StepProgress currentPath={pathname} />
          </div>
        )}

        {/* Right: Agent League badge */}
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#111111',
            border: '1px solid #e5e5e5',
            backgroundColor: 'transparent',
            padding: '6px 14px',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Built for Agent League ✦
        </span>
      </nav>
    </header>
  );
}
