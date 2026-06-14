'use client';

import { TICKER_ITEMS } from '@/lib/constants';

export default function BrandTicker() {
  // Duplicate items so the loop is seamless
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <section
      aria-label="Trusted by learners from"
      style={{
        backgroundColor: '#0a0a0a',
        padding: '20px 0',
        overflow: 'hidden',
        borderTop: '1px solid #1a1a1a',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      <div className="animate-marquee" role="list">
        {items.map((name, i) => (
          <div
            key={`${name}-${i}`}
            role="listitem"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 40px',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: '#f97316', flexShrink: 0,
              }}
            />
            <span style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}>
              {name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
