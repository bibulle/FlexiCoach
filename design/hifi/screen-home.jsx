// FlexiCoach Hi-Fi — Accueil (multi-rings + routines)

const HEADER_HIFI = ({ active = 'Accueil', isMobile }) => (
  <header style={{
    display: 'flex', alignItems: 'center', gap: 16,
    padding: isMobile ? '14px 18px' : '16px 24px',
    borderBottom: '1px solid var(--line)',
    background: 'var(--surface)',
    position: 'sticky', top: 0, zIndex: 5,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
        display: 'grid', placeItems: 'center', color: 'white', fontSize: 15
      }}>F</div>
      <span>FlexiCoach</span>
    </div>
    {!isMobile && (
      <nav style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {[['Accueil', 'cal'], ['Calendrier', 'cal'], ['Routines', 'star']].map(([n]) => (
          <span key={n} style={{
            padding: '8px 14px', borderRadius: 'var(--radius)',
            fontSize: 14, fontWeight: 500,
            color: n === active ? 'var(--primary-600)' : 'var(--ink-3)',
            background: n === active ? 'var(--primary-50)' : 'transparent',
            cursor: 'pointer'
          }}>{n}</span>
        ))}
      </nav>
    )}
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
      <button className="btn btn-ghost btn-icon" aria-label="Notifications"><Icon name="bell" size={20} /></button>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: 'linear-gradient(135deg, #fbbf24, #f97316)',
        color: 'white', display: 'grid', placeItems: 'center',
        fontWeight: 600, fontSize: 14
      }}>M</div>
    </div>
  </header>
);

// Stat card for mobile
const StatTile = ({ icon, value, label, color }) => (
  <div className="card" style={{ padding: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: color + '22', color,
        display: 'grid', placeItems: 'center'
      }}>
        <Icon name={icon} size={16} stroke={2.2} />
      </div>
    </div>
    <div className="type-h2" style={{ fontSize: 22, marginTop: 4 }}>{value}</div>
    <div className="type-caption">{label}</div>
  </div>
);

// Routine card
const RoutineCard = ({ name, duration, level, steps, emoji, mine, large }) => {
  const levelClass = { 'Débutant': 'badge-debutant', 'Intermédiaire': 'badge-intermediaire', 'Avancé': 'badge-avance' }[level];
  return (
    <div className="card card-hover" style={{ padding: large ? 18 : 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: large ? 52 : 44, height: large ? 52 : 44, borderRadius: 12,
          background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
          fontSize: large ? 26 : 22
        }}>{emoji}</div>
        {mine && <span className="badge badge-mine">Ma routine</span>}
      </div>
      <div className="type-h3" style={{ marginBottom: 4 }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span className={`badge ${levelClass}`}>{level}</span>
        <span className="type-caption" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="clock" size={13} stroke={2} /> {duration}
        </span>
        <span className="type-caption">· {steps} étapes</span>
      </div>
    </div>
  );
};

const HOME_ROUTINES = [
  { name: 'Routine douce matinale', duration: '10 min', level: 'Débutant',     steps: 6, emoji: '🌿', mine: false },
  { name: 'Squash quotidien',       duration: '15 min', level: 'Intermédiaire', steps: 8, emoji: '🎾', mine: true },
  { name: 'Bureau express',         duration: '5 min',  level: 'Débutant',     steps: 4, emoji: '💼', mine: false },
  { name: 'Golfeur 60+',            duration: '20 min', level: 'Avancé',       steps: 12, emoji: '⛳', mine: true },
  { name: 'Cervicales',             duration: '8 min',  level: 'Débutant',     steps: 6, emoji: '🦴', mine: false },
  { name: 'Dos & lombaires',        duration: '12 min', level: 'Intermédiaire', steps: 8, emoji: '🌊', mine: false },
];

const RINGS = [
  { color: 'var(--primary-500)', pct: 0.72, label: 'Temps',  current: '14 min',  goal: 'sur 20 min' },
  { color: '#22c55e',            pct: 0.85, label: 'Série',  current: '7 jours', goal: 'sur 8 hebdo' },
  { color: '#f59e0b',            pct: 0.50, label: 'Routine', current: 'En cours', goal: 'Squash 15 min' },
];

// === DESKTOP ===
const HomeHiFi_Desktop = () => (
  <>
    <HEADER_HIFI active="Accueil" />
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 64px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div className="type-label">Mardi 28 avril · jour 7 de ta série</div>
        <h1 className="type-display" style={{ marginTop: 4, marginBottom: 6 }}>Bonjour, Marc.</h1>
        <p className="type-body" style={{ color: 'var(--ink-3)', margin: 0 }}>
          Tu es à 6 min de ton objectif du jour. Petite session ?
        </p>
      </div>

      {/* Hero ring + ring details */}
      <section className="card" style={{ padding: 24, marginBottom: 32, display: 'flex', gap: 32, alignItems: 'center' }}>
        <div style={{ flex: '0 0 auto' }}>
          <TripleRing size={220} rings={RINGS} center={
            <>
              <div className="type-mono" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>14:32</div>
              <div className="type-label" style={{ marginTop: 6 }}>aujourd'hui</div>
            </>
          } />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {RINGS.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: r.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="type-h3" style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</span>
                    <span className="type-mono" style={{ fontSize: 13, fontWeight: 600, color: r.color }}>{Math.round(r.pct * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct * 100}%`, height: '100%', background: r.color, borderRadius: 3 }} />
                  </div>
                  <div className="type-caption" style={{ marginTop: 4 }}>{r.current} <span style={{ color: 'var(--ink-5)' }}>· {r.goal}</span></div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            <Icon name="play" size={18} /> Reprendre Squash · 15 min
          </button>
        </div>
      </section>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 36 }}>
        <StatTile icon="flame"  value="7"    label="série en cours" color="#f97316" />
        <StatTile icon="trophy" value="14"   label="meilleure série" color="#eab308" />
        <StatTile icon="check"  value="142"  label="sessions totales" color="#22c55e" />
        <StatTile icon="trend"  value="87%"  label="adhérence 30 j" color="var(--primary-500)" />
      </div>

      {/* Routines */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h2 className="type-h1" style={{ fontSize: 22, margin: 0 }}>Tes routines</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ height: 38 }}><Icon name="upload" size={16} /> Importer</button>
          <button className="btn btn-primary" style={{ height: 38 }}><Icon name="plus" size={16} /> Créer</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {HOME_ROUTINES.map((r, i) => <RoutineCard key={i} {...r} />)}
      </div>
    </main>
  </>
);

// === MOBILE ===
const HomeHiFi_Mobile = () => (
  <>
    <HEADER_HIFI active="Accueil" isMobile />
    <main style={{ padding: '20px 18px 100px' }}>
      <div style={{ marginBottom: 18 }}>
        <div className="type-label">Mardi · jour 7</div>
        <h1 className="type-h1" style={{ fontSize: 24, marginTop: 2, marginBottom: 4 }}>Bonjour, Marc.</h1>
        <p className="type-body-sm" style={{ color: 'var(--ink-3)', margin: 0 }}>6 min pour ton objectif du jour.</p>
      </div>

      {/* Hero ring */}
      <section className="card" style={{ padding: 20, marginBottom: 18, textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
          <TripleRing size={200} rings={RINGS} center={
            <>
              <div className="type-mono" style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>14:32</div>
              <div className="type-label" style={{ marginTop: 4, fontSize: 10 }}>aujourd'hui</div>
            </>
          } />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14, padding: '0 4px' }}>
          {RINGS.map((r, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 0, flex: 1 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: r.color, margin: '0 auto 4px' }} />
              <div className="type-mono" style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{Math.round(r.pct * 100)}%</div>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 500 }}>{r.label}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          <Icon name="play" size={18} /> Reprendre Squash
        </button>
      </section>

      {/* Stats — 2 cols on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
        <StatTile icon="flame"  value="7"    label="série" color="#f97316" />
        <StatTile icon="trophy" value="14"   label="record" color="#eab308" />
        <StatTile icon="check"  value="142"  label="sessions" color="#22c55e" />
        <StatTile icon="trend"  value="87%"  label="adhérence" color="var(--primary-500)" />
      </div>

      {/* Routines */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 className="type-h2" style={{ margin: 0 }}>Routines</h2>
        <button className="btn btn-ghost" style={{ height: 36, padding: '0 10px' }}><Icon name="plus" size={16} /> Créer</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {HOME_ROUTINES.slice(0, 4).map((r, i) => <RoutineCard key={i} {...r} />)}
      </div>
    </main>

    {/* Mobile bottom nav */}
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--surface)', borderTop: '1px solid var(--line)',
      display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px'
    }}>
      {[['Accueil', 'star', true], ['Calendrier', 'cal'], ['Profil', 'user']].map(([n, ic, on]) => (
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

window.HomeHiFi_Desktop = HomeHiFi_Desktop;
window.HomeHiFi_Mobile = HomeHiFi_Mobile;
