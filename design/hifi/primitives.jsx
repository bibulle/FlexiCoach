// FlexiCoach Hi-Fi — shared primitives
const { useState, useEffect, useMemo } = React;

// === Icons (inline SVG, Lucide-inspired) ===
const Icon = ({ name, size = 20, stroke = 2 }) => {
  const paths = {
    play:    <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
    pause:   <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
    skip:    <><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></>,
    prev:    <><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="5" x2="5" y2="19" /></>,
    stop:    <rect x="6" y="6" width="12" height="12" rx="1" />,
    flame:   <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4-2 0 0-4 3-6z" />,
    trophy:  <><path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0V4zM4 5h3M17 5h3" /></>,
    check:   <polyline points="4 12 10 18 20 6" />,
    clock:   <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></>,
    trend:   <><polyline points="3 17 9 11 13 15 21 7" /><polyline points="14 7 21 7 21 14" /></>,
    star:    <polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9" />,
    plus:    <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    upload:  <><polyline points="6 10 12 4 18 10" /><line x1="12" y1="4" x2="12" y2="16" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
    bell:    <><path d="M6 9a6 6 0 1 1 12 0v5l1.5 2H4.5L6 14V9z" /><path d="M9 19a3 3 0 0 0 6 0" /></>,
    chevR:   <polyline points="9 6 15 12 9 18" />,
    chevD:   <polyline points="6 9 12 15 18 9" />,
    arrowL:  <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    sound:   <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
    grip:    <><circle cx="9" cy="6" r="1" fill="currentColor" /><circle cx="15" cy="6" r="1" fill="currentColor" /><circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" /><circle cx="9" cy="18" r="1" fill="currentColor" /><circle cx="15" cy="18" r="1" fill="currentColor" /></>,
    cal:     <><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>,
    user:    <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    moon:    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="currentColor" stroke="none" />,
    back:    <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    next:    <><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></>,
    more:    <><circle cx="5" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="19" cy="12" r="1.4" fill="currentColor" /></>,
    x:       <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {paths[name]}
    </svg>
  );
};

// === Triple ring (Apple Watch style) ===
const TripleRing = ({ size = 240, rings, center }) => {
  const ringW = size * 0.058;
  const gap = size * 0.012;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          {rings.map((r, i) => (
            <linearGradient key={i} id={`tr-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={r.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={r.color} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>
        {rings.map((ring, i) => {
          const radius = size / 2 - ringW / 2 - i * (ringW + gap);
          const c = 2 * Math.PI * radius;
          const dash = c * Math.min(ring.pct, 1);
          return (
            <g key={i}>
              <circle cx={size/2} cy={size/2} r={radius} fill="none"
                      stroke={ring.color} strokeOpacity="0.16" strokeWidth={ringW} />
              <circle cx={size/2} cy={size/2} r={radius} fill="none"
                      stroke={`url(#tr-${i})`} strokeWidth={ringW}
                      strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
                      transform={`rotate(-90 ${size/2} ${size/2})`} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
        {center}
      </div>
    </div>
  );
};

// === Single ring (for mobile / Player) ===
const Ring = ({ size = 200, pct = 0.7, stroke = 12, color, track = 'var(--surface-3)', children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = React.useId();
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`r-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#r-${id})`} strokeWidth={stroke}
                strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  );
};

window.Icon = Icon;
window.TripleRing = TripleRing;
window.Ring = Ring;
