// FlexiCoach Hi-Fi — Calendrier (heatmap annuelle + courbe de tendance)

const heatColor = (intensity) => {
  if (intensity === 0) return 'var(--surface-2)';
  // green scale
  return `oklch(${0.85 - intensity * 0.25} ${0.06 + intensity * 0.1} 145)`;
};

// Deterministic mock data
const buildYearData = () => {
  const weeks = [];
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const seed = ((w * 7 + d) * 31 + 11) % 13;
      const future = w > 17;
      let intensity = 0;
      if (!future) {
        if (seed > 9) intensity = 0;
        else if (seed > 6) intensity = 0.4;
        else if (seed > 3) intensity = 0.7;
        else intensity = 1;
      }
      days.push({ intensity, future });
    }
    weeks.push(days);
  }
  return weeks;
};

const TREND = [
  { m: 'Jan', v: 18 }, { m: 'Fév', v: 22 }, { m: 'Mar', v: 28 },
  { m: 'Avr', v: 24 }, { m: 'Mai', v: 19 }, { m: 'Jun', v: 15 },
  { m: 'Jul', v: 12 }, { m: 'Aoû', v: 17 }, { m: 'Sep', v: 23 },
  { m: 'Oct', v: 27 }, { m: 'Nov', v: 26 }, { m: 'Déc', v: 24 },
];

const TrendChart = ({ height = 140, compact }) => {
  const max = 30;
  const w = compact ? 320 : 720;
  const padX = 8;
  const innerW = w - padX * 2;
  const points = TREND.map((t, i) => ({
    x: padX + (i / (TREND.length - 1)) * innerW,
    y: height - 28 - (t.v / max) * (height - 48),
  }));
  // smooth path
  const path = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
  }, '');
  const area = `${path} L ${points[points.length-1].x} ${height-28} L ${points[0].x} ${height-28} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1={padX} x2={w-padX} y1={height - 28 - p * (height-48)} y2={height - 28 - p * (height-48)}
              stroke="var(--line)" strokeDasharray="3 4" strokeOpacity="0.7" />
      ))}
      <path d={area} fill="url(#trend-area)" />
      <path d={path} fill="none" stroke="var(--primary-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          {i === 9 && <circle cx={p.x} cy={p.y} r="6" fill="var(--primary-500)" fillOpacity="0.18" />}
          <circle cx={p.x} cy={p.y} r={i === 9 ? 4 : 3}
                  fill={i === 3 ? 'var(--surface)' : 'var(--primary-500)'}
                  stroke={i === 3 ? 'var(--primary-500)' : 'none'} strokeWidth={i === 3 ? 2 : 0} />
        </g>
      ))}
      {!compact && TREND.map((t, i) => (
        <text key={i} x={points[i].x} y={height - 8}
              textAnchor="middle" fontSize="10" fontFamily="var(--font-sans)" fill="var(--ink-4)">{t.m}</text>
      ))}
    </svg>
  );
};

const Heatmap = ({ compact }) => {
  const year = useMemo(buildYearData, []);
  const cellGap = compact ? 2 : 3;
  return (
    <div style={{ overflowX: compact ? 'auto' : 'visible' }}>
      <div style={{ minWidth: compact ? 540 : 'auto' }}>
        {/* month labels */}
        <div style={{ display: 'flex', gap: cellGap, paddingLeft: compact ? 18 : 24, marginBottom: 4 }}>
          {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'].map((m, i) => (
            <div key={i} style={{ flex: 1, fontSize: 10, color: 'var(--ink-4)', fontWeight: 500 }}>{m}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: 9, color: 'var(--ink-5)', height: compact ? 84 : 112, paddingTop: 2 }}>
            <span>L</span><span>M</span><span>V</span><span>D</span>
          </div>
          <div style={{ display: 'flex', gap: cellGap, flex: 1 }}>
            {year.map((week, w) => (
              <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: cellGap, flex: 1 }}>
                {week.map((day, d) => (
                  <div key={d} style={{
                    aspectRatio: 1,
                    background: day.future ? 'transparent' : heatColor(day.intensity),
                    border: day.future ? '1px dashed var(--surface-3)' : 'none',
                    borderRadius: 2,
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
          <span className="type-caption">Moins</span>
          {[0, 0.4, 0.7, 1].map((v, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: heatColor(v) }} />
          ))}
          <span className="type-caption">Plus</span>
        </div>
      </div>
    </div>
  );
};

const CalHiFi_Desktop = () => (
  <>
    <HEADER_HIFI active="Calendrier" />
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <div className="type-label">Année 2026</div>
          <h1 className="type-display" style={{ marginTop: 4, marginBottom: 6 }}>164 séances.</h1>
          <p className="type-body" style={{ color: 'var(--ink-3)', margin: 0 }}>27h cumulées · série actuelle 7 jours</p>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
          {['2024','2025','2026'].map(y => (
            <button key={y} className={y === '2026' ? 'btn btn-primary' : 'btn btn-ghost'}
                    style={{ height: 32, padding: '0 14px', fontSize: 13, borderRadius: 8 }}>{y}</button>
          ))}
        </div>
      </div>

      {/* Trend card */}
      <section className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div>
            <div className="type-label" style={{ marginBottom: 2 }}>Tendance · sessions par mois</div>
            <h2 className="type-h2" style={{ margin: 0 }}>Pic en mars · 28 séances</h2>
          </div>
          <span className="badge badge-debutant" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="trend" size={14} stroke={2.4} /> +12% vs 2025
          </span>
        </div>
        <TrendChart height={150} />
      </section>

      {/* Heatmap card */}
      <section className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h2 className="type-h2" style={{ margin: 0 }}>Détail jour par jour</h2>
          <span className="type-caption">Cliquez un jour pour voir la séance</span>
        </div>
        <Heatmap />
      </section>
    </main>
  </>
);

const CalHiFi_Mobile = () => (
  <>
    <HEADER_HIFI active="Calendrier" isMobile />
    <main style={{ padding: '20px 18px 100px' }}>
      <div style={{ marginBottom: 16 }}>
        <div className="type-label">Année 2026</div>
        <h1 className="type-h1" style={{ fontSize: 26, marginTop: 2, marginBottom: 4 }}>164 séances.</h1>
        <p className="type-body-sm" style={{ color: 'var(--ink-3)', margin: 0 }}>27h cumulées · série 7 j</p>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface-2)', borderRadius: 10, marginBottom: 18, width: 'fit-content' }}>
        {['2024','2025','2026'].map(y => (
          <button key={y} className={y === '2026' ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ height: 30, padding: '0 12px', fontSize: 12, borderRadius: 7 }}>{y}</button>
        ))}
      </div>

      <section className="card" style={{ padding: 16, marginBottom: 14 }}>
        <div className="type-label" style={{ marginBottom: 2 }}>Tendance mensuelle</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <h3 className="type-h3" style={{ margin: 0 }}>Pic en mars</h3>
          <span className="text-success type-body-sm" style={{ fontWeight: 600 }}>+12%</span>
        </div>
        <TrendChart height={100} compact />
      </section>

      <section className="card" style={{ padding: 16 }}>
        <h3 className="type-h3" style={{ margin: '0 0 14px' }}>Jour par jour</h3>
        <Heatmap compact />
      </section>
    </main>

    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--surface)', borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px'
    }}>
      {[['Accueil', 'star'], ['Calendrier', 'cal', true], ['Profil', 'user']].map(([n, ic, on]) => (
        <button key={n} className="btn btn-ghost" style={{
          flex: 1, height: 56, flexDirection: 'column', gap: 2,
          color: on ? 'var(--primary-600)' : 'var(--ink-4)', fontWeight: 500, fontSize: 11
        }}>
          <Icon name={ic} size={22} stroke={on ? 2.4 : 1.8} />
          {n}
        </button>
      ))}
    </nav>
  </>
);

window.CalHiFi_Desktop = CalHiFi_Desktop;
window.CalHiFi_Mobile = CalHiFi_Mobile;
