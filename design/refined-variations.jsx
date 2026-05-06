// FlexiCoach — sub-variations on the 3 chosen directions
// Accueil V2 (anneau de vitalité), Calendrier V2 (heatmap), Lecteur V3 (timeline parcourue)

const ModernRing = ({ size = 200, pct = 0.7, stroke = 12, color, kids }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = React.useId();
  const angle = -Math.PI / 2 + pct * 2 * Math.PI;
  const dotX = size/2 + Math.cos(angle) * r;
  const dotY = size/2 + Math.sin(angle) * r;
  const accent = color || 'var(--accent)';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gr-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
          <filter id={`gl-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={size * 0.022} />
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.12"
                strokeWidth={Math.max(1, stroke * 0.32)} strokeDasharray="1 4" strokeLinecap="round" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeOpacity="0.22"
                strokeWidth={stroke * 1.5} strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} filter={`url(#gl-${id})`} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#gr-${id})`}
                strokeWidth={stroke * 0.65} strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
        <circle cx={dotX} cy={dotY} r={stroke * 0.5} fill="var(--paper)" stroke={accent} strokeWidth={stroke * 0.32} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
        {kids}
      </div>
    </div>
  );
};

const HDR = ({ active = 'Accueil' }) => (
  <div className="fc-header" style={{ paddingBottom: 12 }}>
    <div className="logo">flexi<span className="dot">.</span>coach</div>
    <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
      {['Accueil', 'Calendrier', 'Routines'].map(n => (
        <span key={n} className={n === active ? 'accent-text' : 'muted'} style={{ fontWeight: n === active ? 700 : 400 }}>{n}</span>
      ))}
    </div>
    <div className="avatar">M</div>
  </div>
);

// ============= ACCUEIL V2 — sous-variations =============

// V2.a — anneau MULTI-couches (3 anneaux concentriques style Apple Watch)
const HomeV2a = () => {
  const rings = [
    { pct: 0.7, color: 'var(--accent)', label: 'temps' },
    { pct: 0.85, color: 'var(--calm)', label: 'série' },
    { pct: 0.5, color: 'var(--warm)', label: 'objectif' },
  ];
  return (
    <>
      <HDR />
      <div className="row" style={{ alignItems: 'flex-start', gap: 32, padding: '8px 0 22px' }}>
        <div style={{ position: 'relative', flex: '0 0 auto', width: 240, height: 240 }}>
          <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: 'visible' }}>
            {rings.map((ring, i) => {
              const r = 105 - i * 22;
              const c = 2 * Math.PI * r;
              return (
                <g key={i}>
                  <circle cx="120" cy="120" r={r} fill="none" stroke={ring.color} strokeOpacity="0.15" strokeWidth="14" />
                  <circle cx="120" cy="120" r={r} fill="none" stroke={ring.color} strokeWidth="10"
                          strokeDasharray={`${c * ring.pct} ${c}`} strokeLinecap="round"
                          transform={`rotate(-90 120 120)`} />
                </g>
              );
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 42, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>14′32″</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 6 }}>aujourd'hui</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="sk-h xl">Bonjour Marc.</div>
          <div className="sk-note" style={{ marginBottom: 14 }}>3 anneaux pour 3 objectifs : temps · série · routine du jour.</div>
          <div className="stack" style={{ gap: 8 }}>
            {[
              ['var(--accent)', 'Temps', '14 min sur 20', '70%'],
              ['var(--calm)', 'Série', '7 jours / 8 hebdo', '85%'],
              ['var(--warm)', 'Routine', 'En cours', '50%'],
            ].map((r, i) => (
              <div key={i} className="row" style={{ gap: 10, padding: '6px 0', borderBottom: '1px dashed var(--ink-faint)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 6, background: r[0] }}></span>
                <div className="sk-h md" style={{ flex: 1 }}>{r[1]}</div>
                <div className="tiny muted">{r[2]}</div>
                <div className="sk-h md" style={{ width: 50, textAlign: 'right' }}>{r[3]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}><span className="sk-btn primary big">▶ Reprendre Squash · 15 min</span></div>
        </div>
      </div>
      <div className="sk-h lg" style={{ marginBottom: 8 }}>Tes routines</div>
      <div className="grid-3">
        {[['Routine douce', '🌿'], ['Squash', '🎾'], ['Bureau', '💼']].map((r, i) => (
          <div key={i} className="sk-box row" style={{ padding: 10, gap: 8 }}>
            <div style={{ width: 36, height: 36, border: '1.2px solid var(--ink)', borderRadius: 8, display:'grid', placeItems:'center', fontSize: 18 }}>{r[1]}</div>
            <div className="sk-h sm" style={{ flex: 1 }}>{r[0]}</div>
            <span className="sk-arrow">→</span>
          </div>
        ))}
      </div>
    </>
  );
};

// V2.b — anneau XXL hero centré + stats en grille sous (style fitness app)
const HomeV2b = () => (
  <>
    <HDR />
    <div className="center" style={{ padding: '14px 0 18px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>mardi 28 avril · jour 7</div>
      <div className="sk-h xl" style={{ fontSize: 30, marginTop: 4 }}>Bonjour Marc.</div>
    </div>
    <div style={{ display: 'grid', placeItems: 'center', marginBottom: 18 }}>
      <ModernRing size={280} pct={0.7} stroke={16} kids={
        <>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 700 }}>70 %</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 6 }}>14′32″</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 10 }}>de 20 min · objectif jour</div>
          <div style={{ marginTop: 14 }}><span className="sk-btn primary">▶ Reprendre Squash</span></div>
        </>
      } />
    </div>
    <div className="grid-3" style={{ gap: 10 }}>
      {[
        ['🔥 7', 'série en cours'],
        ['🏆 14', 'meilleure série'],
        ['📈 87%', 'adhérence 30 j'],
        ['✅ 142', 'sessions totales'],
        ['⏱ 23h', 'temps cumulé'],
        ['⭐ Squash', 'favorite'],
      ].map((s, i) => (
        <div key={i} className="sk-box" style={{ padding: 10, textAlign: 'left' }}>
          <div className="sk-h md">{s[0]}</div>
          <div className="tiny muted">{s[1]}</div>
        </div>
      ))}
    </div>
  </>
);

// V2.c — anneau + comparaison "vs hier / cette semaine" (motivation par delta)
const HomeV2c = () => (
  <>
    <HDR />
    <div className="row" style={{ alignItems: 'flex-start', gap: 32, padding: '8px 0 22px' }}>
      <div style={{ flex: '0 0 auto' }}>
        <ModernRing size={220} pct={0.7} stroke={14} kids={
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--accent)', fontWeight: 700 }}>AUJOURD'HUI</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 50, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 4 }}>14′32″</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--calm)', marginTop: 8, fontWeight: 700 }}>↑ +4 min vs hier</div>
          </>
        } />
      </div>
      <div style={{ flex: 1 }}>
        <div className="sk-h xl">Bonjour Marc.</div>
        <div className="sk-note" style={{ marginBottom: 14 }}>Tu fais mieux qu'hier. Continue, encore 6 min et l'objectif est plié.</div>
        <div className="stack" style={{ gap: 6 }}>
          {[
            ['Hier', '10:24', '50%', 'var(--ink-faint)'],
            ['Aujourd\'hui', '14:32', '70%', 'var(--accent)'],
            ['Demain (objectif)', '20:00', '100%', 'var(--ink-faint)'],
          ].map((r, i) => (
            <div key={i} className="row" style={{ gap: 10, alignItems: 'center' }}>
              <div style={{ width: 110, fontSize: 12, color: r[3], fontWeight: i === 1 ? 700 : 400 }}>{r[0]}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--paper-2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: r[2], height: '100%', background: r[3], borderRadius: 4 }}></div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, width: 60, textAlign: 'right', color: r[3] }}>{r[1]}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 14, gap: 8 }}>
          <span className="sk-btn primary big">▶ Reprendre Squash</span>
          <span className="sk-btn ghost">voir tout</span>
        </div>
      </div>
    </div>
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <div className="sk-h lg">Tes routines</div>
      <span className="sk-pill">+ créer</span>
    </div>
    <div className="grid-3">
      {[['Routine douce', '🌿'], ['Squash', '🎾'], ['Bureau', '💼']].map((r, i) => (
        <div key={i} className="sk-box row" style={{ padding: 10, gap: 8 }}>
          <div style={{ width: 36, height: 36, border: '1.2px solid var(--ink)', borderRadius: 8, display:'grid', placeItems:'center', fontSize: 18 }}>{r[1]}</div>
          <div className="sk-h sm" style={{ flex: 1 }}>{r[0]}</div>
          <span className="sk-arrow">→</span>
        </div>
      ))}
    </div>
  </>
);

// ============= CALENDRIER V2 — sous-variations =============

const heatCell = (intensity, future) => {
  if (future) return 'transparent';
  if (intensity === 0) return 'var(--paper-2)';
  return `oklch(0.7 0.12 145 / ${0.3 + intensity * 0.7})`;
};

// V2.a — heatmap propre + mini-stats hebdo en encart à droite
const CalV2a = () => (
  <>
    <HDR active="Calendrier" />
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Année 2026</div>
        <div className="sk-note">164 séances · 27h cumulées</div>
      </div>
      <div className="row"><span className="sk-pill">2025</span><span className="sk-pill solid">2026</span></div>
    </div>
    <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="row" style={{ gap: 8, marginBottom: 6, paddingLeft: 22 }}>
          {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Déc'].map((m, i) => (
            <div key={i} className="tiny muted" style={{ flex: 1 }}>{m}</div>
          ))}
        </div>
        <div className="row" style={{ gap: 6, alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 2, fontSize: 9, color: 'var(--ink-faint)', justifyContent:'space-around' }}>
            <span>L</span><span></span><span>M</span><span></span><span>V</span><span></span><span>D</span>
          </div>
          <div style={{ display: 'flex', gap: 3, flex: 1 }}>
            {Array.from({length: 52}).map((_, w) => (
              <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {Array.from({length: 7}).map((_, d) => {
                  const seed = ((w * 7 + d) * 13) % 11;
                  const future = w > 17;
                  const intensity = seed > 7 ? 0 : seed / 7;
                  return <div key={d} style={{ aspectRatio: 1, background: heatCell(intensity, future), border: '0.8px solid var(--ink-faint)', borderRadius: 2 }} />;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: 220 }} className="stack">
        <div className="sk-box accent">
          <div className="sk-h md">🔥 Série : 7</div>
          <div className="tiny">Record : 14 (mars)</div>
        </div>
        <div className="sk-box">
          <div className="sk-h md">Mois</div>
          {[['Avril', '23/30'], ['Mars', '28/31'], ['Février', '22/28']].map((r, i) => (
            <div key={i} className="row" style={{ justifyContent:'space-between', borderBottom: i < 2 ? '1px dashed var(--ink-faint)' : 'none', padding: '4px 0' }}>
              <span>{r[0]}</span><b>{r[1]}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

// V2.b — heatmap + courbe d'évolution sous (intensité par mois)
const CalV2b = () => (
  <>
    <HDR active="Calendrier" />
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Année 2026</div>
        <div className="sk-note">tendance + détail jour par jour</div>
      </div>
      <div className="row"><span className="sk-pill">3 mois</span><span className="sk-pill solid">12 mois</span></div>
    </div>
    {/* trend chart */}
    <div className="sk-box" style={{ padding: '14px 16px 8px', marginBottom: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="sk-h md">Tendance · sessions / mois</div>
        <span className="tiny calm-text" style={{ fontWeight: 700 }}>↑ +12% vs 2025</span>
      </div>
      <svg viewBox="0 0 700 110" width="100%" height="110">
        <defs>
          <linearGradient id="trend-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20,40,60,80].map(y => <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="var(--ink-faint)" strokeOpacity="0.15" strokeDasharray="2 4" />)}
        <path d="M 0 70 L 60 60 L 120 50 L 180 30 L 240 35 L 300 55 L 360 45 L 420 40 L 480 50 L 540 35 L 600 25 L 660 30 L 700 35" fill="url(#trend-g)" stroke="none" />
        <path d="M 0 70 L 60 60 L 120 50 L 180 30 L 240 35 L 300 55 L 360 45 L 420 40 L 480 50 L 540 35 L 600 25 L 660 30 L 700 35" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {[[60,60],[180,30],[420,40],[600,25]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="var(--paper)" stroke="var(--accent)" strokeWidth="2" />
        ))}
      </svg>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Déc'].map(m => <span key={m} className="tiny muted">{m}</span>)}
      </div>
    </div>
    {/* heatmap */}
    <div className="row" style={{ gap: 6, alignItems: 'flex-start' }}>
      <div className="stack" style={{ gap: 2, fontSize: 9, color: 'var(--ink-faint)', justifyContent:'space-around' }}>
        <span>L</span><span></span><span>M</span><span></span><span>V</span><span></span><span>D</span>
      </div>
      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
        {Array.from({length: 52}).map((_, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {Array.from({length: 7}).map((_, d) => {
              const seed = ((w * 7 + d) * 13) % 11;
              const future = w > 17;
              const intensity = seed > 7 ? 0 : seed / 7;
              return <div key={d} style={{ aspectRatio: 1, background: heatCell(intensity, future), border: '0.8px solid var(--ink-faint)', borderRadius: 2 }} />;
            })}
          </div>
        ))}
      </div>
    </div>
  </>
);

// V2.c — heatmap + détail jour sélectionné (sidebar interactive)
const CalV2c = () => (
  <>
    <HDR active="Calendrier" />
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Année 2026</div>
        <div className="sk-note">clique un jour pour voir le détail</div>
      </div>
      <div className="row"><span className="sk-pill">filtrer par routine ⌄</span></div>
    </div>
    <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="row" style={{ gap: 6, alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 2, fontSize: 9, color: 'var(--ink-faint)', justifyContent:'space-around' }}>
            <span>L</span><span></span><span>M</span><span></span><span>V</span><span></span><span>D</span>
          </div>
          <div style={{ display: 'flex', gap: 3, flex: 1 }}>
            {Array.from({length: 52}).map((_, w) => (
              <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {Array.from({length: 7}).map((_, d) => {
                  const seed = ((w * 7 + d) * 13) % 11;
                  const future = w > 17;
                  const intensity = seed > 7 ? 0 : seed / 7;
                  const selected = w === 16 && d === 1;
                  return <div key={d} style={{
                    aspectRatio: 1,
                    background: heatCell(intensity, future),
                    border: selected ? '2px solid var(--accent)' : '0.8px solid var(--ink-faint)',
                    borderRadius: 2,
                    boxShadow: selected ? '0 0 0 2px var(--paper), 0 0 0 4px var(--accent)' : 'none'
                  }} />;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: 240 }} className="sk-box accent" style={{ padding: 14, width: 240 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--accent)', fontWeight: 700 }}>JOUR SÉLECTIONNÉ</div>
        <div className="sk-h xl" style={{ fontSize: 22, marginTop: 4 }}>Mardi 21 avril</div>
        <div className="tiny muted" style={{ marginBottom: 10 }}>2 séances · 22 min</div>
        <div className="stack" style={{ gap: 6 }}>
          {[['🎾 Squash quotidien', '15 min', '8h32'], ['💼 Bureau 5 min', '7 min', '14h10']].map((r, i) => (
            <div key={i} className="sk-box" style={{ padding: 8, background: 'var(--paper)' }}>
              <div className="sk-h sm">{r[0]}</div>
              <div className="row tiny muted" style={{ justifyContent: 'space-between' }}><span>{r[1]}</span><span>{r[2]}</span></div>
            </div>
          ))}
        </div>
        <div className="tiny muted" style={{ marginTop: 10 }}>Ressenti : 🙂 plutôt bien</div>
      </div>
    </div>
  </>
);

// ============= LECTEUR V3 — sous-variations =============

const Modes = { resp: 'oklch(0.55 0.15 295)', mvt: 'var(--accent)', stat: 'var(--calm)' };

// V3.a — timeline en haut + grand chrono sous, étapes en grille pas-à-pas
const PlayerV3a = () => (
  <div style={{ minHeight: 540, display: 'flex', flexDirection: 'column' }}>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span className="sk-pill">← retour</span>
      <div className="sk-h md">Squash quotidien</div>
      <div className="row tiny muted" style={{ gap: 10 }}><span>🔊</span><span>⋯</span></div>
    </div>
    {/* timeline */}
    <div style={{ marginTop: 16 }}>
      <div className="row" style={{ gap: 4, marginBottom: 8 }}>
        {[60, 60, 60, 60, 45, 60, 60, 30].map((s, i) => {
          const status = i < 2 ? 'done' : i === 2 ? 'current' : 'todo';
          const mode = ['resp','mvt','mvt','stat','stat','mvt','stat','resp'][i];
          return (
            <div key={i} style={{ flex: s }}>
              <div style={{
                height: status === 'current' ? 30 : 12,
                background: status === 'todo' ? 'transparent' : Modes[mode],
                border: `1.2px solid ${status === 'todo' ? 'var(--ink-faint)' : Modes[mode]}`,
                borderRadius: 4,
                opacity: status === 'todo' ? 0.4 : 1
              }} />
            </div>
          );
        })}
      </div>
      <div className="row tiny muted" style={{ justifyContent: 'space-between' }}>
        <span>0:00</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>5:34 / 15:00</span>
        <span>15:00</span>
      </div>
    </div>
    {/* big chrono */}
    <div className="center" style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '24px 0' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 700 }}>ÉTAPE 3 SUR 8 · MOUVEMENT</div>
        <div className="sk-h xl" style={{ fontSize: 36, marginTop: 8 }}>Mobilité thoracique</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 150, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.05em', color: 'var(--accent)', margin: '14px 0' }}>0:42</div>
        <div className="sk-note" style={{ fontSize: 15, maxWidth: 440, margin: '0 auto' }}>Bras croisés. Rotations contrôlées du buste droite/gauche.</div>
      </div>
    </div>
    <div className="row" style={{ justifyContent: 'center', gap: 20 }}>
      <div className="sk-btn ghost" style={{ width: 56, height: 56, borderRadius: 28 }}>⏮</div>
      <div className="sk-btn primary big" style={{ width: 80, height: 80, borderRadius: 40, fontSize: 32 }}>⏸</div>
      <div className="sk-btn ghost" style={{ width: 56, height: 56, borderRadius: 28 }}>⏭</div>
    </div>
  </div>
);

// V3.b — timeline verticale latérale (style chapitre vidéo) + chrono à droite
const PlayerV3b = () => (
  <div style={{ minHeight: 540 }}>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
      <span className="sk-pill">← retour</span>
      <div className="sk-h md">Squash quotidien · 5:34 / 15:00</div>
      <span>⋯</span>
    </div>
    <div className="row" style={{ gap: 24, alignItems: 'stretch' }}>
      {/* vertical timeline */}
      <div style={{ width: 220 }} className="stack">
        {[
          ['Respiration', '60s', 'resp', 'done'],
          ['Cervicales', '60s', 'mvt', 'done'],
          ['Thorax', '60s', 'mvt', 'current'],
          ['Ischios', '60s', 'stat', 'next'],
          ['Planche', '45s', 'stat', 'todo'],
          ['Hanches', '60s', 'mvt', 'todo'],
          ['Mollets', '60s', 'stat', 'todo'],
          ['Calme', '30s', 'resp', 'todo'],
        ].map((s, i) => {
          const isCur = s[3] === 'current';
          return (
            <div key={i} className="row" style={{ gap: 10, opacity: s[3] === 'todo' ? 0.4 : 1, alignItems: 'center' }}>
              <div style={{
                width: 14, height: 14, borderRadius: 7,
                background: s[3] === 'done' || isCur ? Modes[s[2]] : 'transparent',
                border: `1.5px solid ${Modes[s[2]]}`,
                boxShadow: isCur ? `0 0 0 4px ${Modes[s[2]]}33` : 'none',
                flex: '0 0 auto'
              }} />
              <div className={`sk-h sm`} style={{ flex: 1, fontWeight: isCur ? 700 : 400, color: isCur ? Modes[s[2]] : 'var(--ink)' }}>{i+1}. {s[0]}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{s[1]}</div>
              {s[3] === 'done' && <span className="tiny calm-text">✓</span>}
            </div>
          );
        })}
      </div>
      {/* chrono */}
      <div className="sk-box accent" style={{ flex: 1, padding: 30, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 380 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 700 }}>● MOUVEMENT · 3 / 8</div>
        <div className="sk-h xl" style={{ fontSize: 36, marginTop: 10 }}>Mobilité thoracique</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 160, fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.05em', color: 'var(--accent)', margin: '16px 0' }}>0:42</div>
        <div className="sk-note" style={{ fontSize: 15, maxWidth: 380 }}>Bras croisés. Rotations contrôlées du buste.</div>
        <div className="row" style={{ marginTop: 22, gap: 18 }}>
          <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏮</div>
          <div className="sk-btn primary big" style={{ width: 72, height: 72, borderRadius: 36, fontSize: 28 }}>⏸</div>
          <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏭</div>
        </div>
      </div>
    </div>
  </div>
);

// V3.c — segments en arc semi-circulaire (jauge gauge) + cards d'étapes glissantes
const PlayerV3c = () => {
  const steps = [60, 60, 60, 60, 45, 60, 60, 30];
  const total = steps.reduce((a,b) => a+b, 0);
  const cur = 2;
  let acc = 0;
  return (
    <div style={{ minHeight: 540 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="sk-pill">← retour</span>
        <div className="sk-h md">Squash quotidien</div>
        <span>⋯</span>
      </div>
      {/* arc gauge */}
      <div style={{ position: 'relative', width: '100%', height: 280, marginTop: 20, display: 'grid', placeItems: 'center' }}>
        <svg viewBox="-260 -180 520 220" width="520" height="220" style={{ overflow: 'visible' }}>
          {steps.map((s, i) => {
            const startA = -Math.PI + (acc / total) * Math.PI;
            acc += s;
            const endA = -Math.PI + (acc / total) * Math.PI;
            const r = 170;
            const sx = Math.cos(startA) * r, sy = Math.sin(startA) * r;
            const ex = Math.cos(endA) * r, ey = Math.sin(endA) * r;
            const status = i < cur ? 'done' : i === cur ? 'current' : 'todo';
            const mode = ['resp','mvt','mvt','stat','stat','mvt','stat','resp'][i];
            const stroke = status === 'current' ? 26 : 14;
            const color = status === 'todo' ? 'var(--ink-faint)' : Modes[mode];
            const opacity = status === 'todo' ? 0.3 : 1;
            return (
              <path key={i} d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`} fill="none"
                    stroke={color} strokeWidth={stroke} strokeLinecap="butt" opacity={opacity} />
            );
          })}
          {/* gap separators */}
          {(() => { let a = 0; return steps.slice(0, -1).map((s, i) => {
            a += s;
            const angle = -Math.PI + (a / total) * Math.PI;
            const x1 = Math.cos(angle) * 158, y1 = Math.sin(angle) * 158;
            const x2 = Math.cos(angle) * 182, y2 = Math.sin(angle) * 182;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--paper)" strokeWidth="3" />;
          }); })()}
          <text x="0" y="-30" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="3" fontWeight="700" fill="var(--accent)">ÉTAPE 3 / 8</text>
          <text x="0" y="20" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="80" fontWeight="700" letterSpacing="-3" fill="var(--ink)">0:42</text>
        </svg>
      </div>
      <div className="center" style={{ marginTop: -10 }}>
        <div className="sk-h xl" style={{ fontSize: 28 }}>Mobilité thoracique</div>
        <div className="sk-note" style={{ maxWidth: 460, margin: '6px auto 0' }}>Bras croisés. Rotations contrôlées du buste droite/gauche.</div>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 18, marginTop: 18 }}>
        <div className="sk-btn ghost" style={{ width: 54, height: 54, borderRadius: 27 }}>⏮</div>
        <div className="sk-btn primary big" style={{ width: 76, height: 76, borderRadius: 38, fontSize: 30 }}>⏸</div>
        <div className="sk-btn ghost" style={{ width: 54, height: 54, borderRadius: 27 }}>⏭</div>
      </div>
    </div>
  );
};

window.HomeV2a = HomeV2a;
window.HomeV2b = HomeV2b;
window.HomeV2c = HomeV2c;
window.CalV2a = CalV2a;
window.CalV2b = CalV2b;
window.CalV2c = CalV2c;
window.PlayerV3a = PlayerV3a;
window.PlayerV3b = PlayerV3b;
window.PlayerV3c = PlayerV3c;
