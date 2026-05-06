// FlexiCoach wireframes — variation components

const Ring = ({ size = 64, pct = 0.65, label = "65%", stroke = 6, color, modern = false }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const id = React.useId();
  if (modern) {
    // angle of the progress endpoint (start at top, clockwise)
    const angle = -Math.PI / 2 + pct * 2 * Math.PI;
    const dotX = size/2 + Math.cos(angle) * r;
    const dotY = size/2 + Math.sin(angle) * r;
    const accent = color || 'var(--accent)';
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={size * 0.025} />
          </filter>
        </defs>
        {/* dotted track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeOpacity="0.14"
                strokeWidth={Math.max(1, stroke * 0.35)} strokeDasharray="1 4" strokeLinecap="round" />
        {/* glow halo */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent} strokeOpacity="0.25"
                strokeWidth={stroke * 1.6} strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} filter={`url(#glow-${id})`} />
        {/* main arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#g-${id})`}
                strokeWidth={stroke * 0.7} strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
        {/* endpoint dot */}
        <circle cx={dotX} cy={dotY} r={stroke * 0.55} fill="var(--paper)" stroke={accent} strokeWidth={stroke * 0.35} />
        {label && <text x="50%" y="54%" textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size * 0.22} fontWeight="700" fill="var(--ink)">{label}</text>}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--ink-faint)" strokeOpacity="0.3" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color || "var(--accent)"}
        strokeWidth={stroke}
        strokeDasharray={`${c * pct} ${c}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" fontFamily="var(--font-hand)" fontSize={size * 0.32} fill="var(--ink)">{label}</text>
    </svg>
  );
};

// ============= ACCUEIL =============

// V1 — "Dashboard de stats" : grid de cartes de stats classique + grid de routines
const HomeV1Mobile = () => (
  <>
    <div className="fc-header">
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="avatar">M</div>
    </div>
    <div className="sk-h lg" style={{ marginTop: 4 }}>Bonjour Marc</div>
    <div className="sk-note" style={{ marginBottom: 10 }}>mardi 28 avril</div>

    <div className="grid-3" style={{ marginBottom: 8 }}>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md accent-text">7</div>
        <div className="tiny muted">série 🔥</div>
      </div>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md">142</div>
        <div className="tiny muted">sessions</div>
      </div>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md">87%</div>
        <div className="tiny muted">adhérence</div>
      </div>
    </div>
    <div className="grid-3" style={{ marginBottom: 12 }}>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md">23h</div>
        <div className="tiny muted">total</div>
      </div>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md">14</div>
        <div className="tiny muted">record</div>
      </div>
      <div className="sk-box" style={{ padding: '6px 6px 4px', textAlign: 'center' }}>
        <div className="sk-h md" style={{ fontSize: 16 }}>Squash</div>
        <div className="tiny muted">favorite</div>
      </div>
    </div>

    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
      <div className="sk-h md">Routines</div>
      <span className="sk-pill">+ créer</span>
    </div>
    <div className="stack" style={{ flex: 1, overflow: 'hidden' }}>
      {[
        ['Routine douce', '10 min', 'Débutant'],
        ['Squash quotidien', '15 min', 'Intermédiaire'],
        ['Bureau 5 min', '5 min', 'Débutant'],
      ].map((r, i) => (
        <div key={i} className="sk-box row" style={{ padding: 8, gap: 10 }}>
          <div style={{ width: 32, height: 32, border: '1.2px solid var(--ink)', borderRadius: 6, display:'grid', placeItems:'center', fontFamily:'var(--font-hand)' }}>★</div>
          <div style={{ flex: 1 }}>
            <div className="sk-h sm">{r[0]}</div>
            <div className="row" style={{ gap: 4 }}>
              <span className="sk-pill tiny">{r[1]}</span>
              <span className="sk-pill tiny calm">{r[2]}</span>
            </div>
          </div>
          <span className="sk-arrow">→</span>
        </div>
      ))}
    </div>
    <div className="fc-bottom-nav">
      <div className="it active"><div className="ic"></div>Accueil</div>
      <div className="it"><div className="ic"></div>Calendrier</div>
      <div className="it"><div className="ic"></div>Routines</div>
      <div className="it"><div className="ic"></div>Profil</div>
    </div>
  </>
);

const HomeV1Desktop = () => (
  <>
    <div className="fc-header" style={{ paddingBottom: 12 }}>
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
        <span className="accent-text" style={{ fontWeight: 700 }}>Accueil</span>
        <span className="muted">Calendrier</span>
        <span className="muted">Routines</span>
      </div>
      <div className="avatar">M</div>
    </div>

    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Bonjour Marc 👋</div>
        <div className="sk-note">mardi 28 avril — 7 jours d'affilée, continue !</div>
      </div>
      <span className="sk-btn primary big">▶ Reprendre Squash quotidien</span>
    </div>

    <div className="grid-6" style={{ marginBottom: 18 }}>
      {[
        ['7', 'série 🔥', 'accent'],
        ['14', 'record 🏆'],
        ['142', 'sessions ✅'],
        ['23h', 'minutes ⏱'],
        ['87%', 'adhérence 📈'],
        ['Squash', 'favorite ⭐'],
      ].map((s, i) => (
        <div key={i} className={`sk-box ${s[2] === 'accent' ? 'accent' : ''}`} style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div className="sk-h lg">{s[0]}</div>
          <div className="tiny muted">{s[1]}</div>
        </div>
      ))}
    </div>

    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <div className="sk-h lg">Toutes les routines</div>
      <div className="row">
        <span className="sk-pill">+ créer</span>
        <span className="sk-pill">⤓ importer</span>
      </div>
    </div>
    <div className="grid-3">
      {[
        ['Routine douce', '10 min', 'Débutant', '🌿'],
        ['Squash quotidien', '15 min', 'Intermédiaire', '🎾'],
        ['Bureau 5 min', '5 min', 'Débutant', '💼'],
        ['Golfeur 60+', '20 min', 'Avancé', '⛳'],
        ['Cervicales', '8 min', 'Débutant', '🦴'],
        ['+ Nouvelle', '', '', '＋'],
      ].map((r, i) => (
        <div key={i} className={`sk-box ${r[0].startsWith('+') ? 'dashed' : ''}`} style={{ padding: 10 }}>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, border: '1.2px solid var(--ink)', borderRadius: 8, display:'grid', placeItems:'center', fontSize: 18 }}>{r[3]}</div>
            <div style={{ flex: 1 }}>
              <div className="sk-h sm">{r[0]}</div>
              {r[1] && <div className="tiny muted">{r[2]}</div>}
            </div>
          </div>
          {r[1] && (
            <div className="row" style={{ gap: 4 }}>
              <span className="sk-pill tiny">{r[1]}</span>
              <span className="sk-pill tiny">8 étapes</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </>
);

// V2 — "Anneau de vitalité" : grand cercle de progression, stats orbitales, routines en liste éditoriale
const HomeV2Mobile = () => (
  <>
    <div className="fc-header">
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="avatar">M</div>
    </div>

    <div style={{ position: 'relative', textAlign: 'center', padding: '12px 0 18px' }}>
      <div className="sk-note">objectif du jour</div>
      <div style={{ display: 'inline-block', position: 'relative' }}>
        <Ring size={170} pct={0.7} label="" stroke={10} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
          <div className="sk-h xl">14:32</div>
          <div className="tiny muted">/ 20 min</div>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 16, marginTop: 10, fontFamily: 'var(--font-hand)' }}>
        <div><span className="accent-text" style={{ fontSize: 22 }}>🔥7</span> <span className="tiny muted">série</span></div>
        <div><span style={{ fontSize: 22 }}>87%</span> <span className="tiny muted">adhér.</span></div>
        <div><span style={{ fontSize: 22 }}>142</span> <span className="tiny muted">tot.</span></div>
      </div>
    </div>

    <div className="sk-h md" style={{ marginBottom: 6 }}>Pour aujourd'hui</div>
    <div className="sk-box accent" style={{ padding: 10, marginBottom: 10 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div className="sk-h sm">Squash quotidien</div>
          <div className="tiny muted">15 min · 8 étapes</div>
        </div>
        <span className="sk-btn primary">▶</span>
      </div>
    </div>

    <div className="sk-h md" style={{ marginBottom: 6 }}>Autres routines</div>
    <div className="stack" style={{ flex: 1, overflow: 'hidden' }}>
      {['Routine douce · 10 min', 'Bureau 5 min · 5 min', 'Golfeur 60+ · 20 min'].map((r, i) => (
        <div key={i} className="sk-box row" style={{ padding: 8 }}>
          <div className="sk-h sm" style={{ flex: 1 }}>{r}</div>
          <span className="sk-arrow">→</span>
        </div>
      ))}
    </div>
    <div className="fc-bottom-nav">
      <div className="it active"><div className="ic"></div>Accueil</div>
      <div className="it"><div className="ic"></div>Calendrier</div>
      <div className="it"><div className="ic"></div>Routines</div>
      <div className="it"><div className="ic"></div>Profil</div>
    </div>
  </>
);

const HomeV2Desktop = () => (
  <>
    <div className="fc-header" style={{ paddingBottom: 12 }}>
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
        <span className="accent-text" style={{ fontWeight: 700 }}>Accueil</span>
        <span className="muted">Calendrier</span>
        <span className="muted">Routines</span>
      </div>
      <div className="avatar">M</div>
    </div>

    <div className="row" style={{ alignItems: 'flex-start', gap: 32, padding: '8px 0 22px' }}>
      <div style={{ position: 'relative', flex: '0 0 auto' }}>
        <Ring size={220} pct={0.7} label="" stroke={14} modern />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.18em', color: 'var(--accent)', fontWeight: 700 }}>70%</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 4 }}>
            14<span style={{ color: 'var(--ink-faint)' }}>′</span>32<span style={{ color: 'var(--ink-faint)' }}>″</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 8 }}>
            de 20 min · objectif jour
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="sk-h xl">Bonjour Marc.</div>
        <div className="sk-note" style={{ marginBottom: 14 }}>Tu es à 70% de ton objectif. Encore 6 minutes ✨</div>
        <div className="grid-3" style={{ marginBottom: 14 }}>
          {[
            ['🔥 7', 'jours d\'affilée'],
            ['🏆 14', 'meilleure série'],
            ['📈 87%', 'adhérence 30 j'],
            ['✅ 142', 'sessions au total'],
            ['⏱ 23h', 'temps cumulé'],
            ['⭐ Squash', 'routine favorite'],
          ].map((s, i) => (
            <div key={i} className="row" style={{ gap: 8, padding: '6px 0', borderBottom: '1px dashed var(--ink-faint)' }}>
              <div className="sk-h md">{s[0]}</div>
              <div className="tiny muted">{s[1]}</div>
            </div>
          ))}
        </div>
        <span className="sk-btn primary big">▶ Reprendre Squash quotidien · 15 min</span>
      </div>
    </div>

    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <div className="sk-h lg">Tes routines</div>
      <div className="row"><span className="sk-pill">+ créer</span><span className="sk-pill">⤓ importer</span></div>
    </div>
    <div className="stack">
      {[
        ['Routine douce', '10 min · 6 étapes', 'Débutant', 'Mobilité douce et étirements pour soulager les tensions'],
        ['Squash quotidien', '15 min · 8 étapes', 'Intermédiaire', 'Mobilité, gainage et prévention pour joueur de squash'],
        ['Bureau 5 min', '5 min · 4 étapes', 'Débutant', 'Décompression rapide entre deux réunions'],
        ['Golfeur 60+', '20 min · 12 étapes', 'Avancé', 'Entretien longévité pour golfeur senior'],
      ].map((r, i) => (
        <div key={i} className="sk-box row" style={{ padding: 12, gap: 14 }}>
          <div style={{ width: 44, height: 44, border: '1.2px solid var(--ink)', borderRadius: 10, display:'grid', placeItems:'center', fontSize: 22 }}>★</div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 10 }}>
              <div className="sk-h md">{r[0]}</div>
              <span className="sk-pill tiny calm">{r[2]}</span>
            </div>
            <div className="tiny muted">{r[1]} — {r[3]}</div>
          </div>
          <span className="sk-btn ghost">▶</span>
        </div>
      ))}
    </div>
  </>
);

// V3 — "Jardin / constellation" : métaphore de plante qui pousse, gamification forte
const HomeV3Mobile = () => (
  <>
    <div className="fc-header">
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="avatar">M</div>
    </div>

    {/* Garden viz */}
    <div className="sk-box" style={{ padding: 0, position: 'relative', height: 180, marginBottom: 12, overflow: 'hidden', background: 'var(--paper-2)' }}>
      <svg viewBox="0 0 280 160" width="100%" height="100%">
        <line x1="0" y1="140" x2="280" y2="140" stroke="var(--ink)" strokeWidth="1.5" />
        {/* sprouts representing days */}
        {[20, 50, 80, 110, 140, 170, 200].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="140" x2={x} y2={140 - (i+1)*8 - 20} stroke="var(--calm)" strokeWidth="2" />
            <circle cx={x} cy={140 - (i+1)*8 - 22} r="6" fill="var(--calm)" opacity="0.7" />
          </g>
        ))}
        {/* today bigger */}
        <line x1="230" y1="140" x2="230" y2="60" stroke="var(--accent)" strokeWidth="3" />
        <circle cx="230" cy="58" r="10" fill="var(--accent)" />
        <text x="230" y="62" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="11" fill="white">7</text>
      </svg>
      <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: 'var(--font-hand)', fontSize: 18 }}>Ton jardin · 7 j 🌿</div>
      <div style={{ position: 'absolute', bottom: 4, right: 10 }} className="tiny muted">+1 pousse / jour</div>
    </div>

    <div className="row" style={{ gap: 8, marginBottom: 10 }}>
      <div className="sk-box accent" style={{ flex: 1, padding: 8, textAlign: 'center' }}>
        <div className="sk-h md">87%</div><div className="tiny muted">adhérence</div>
      </div>
      <div className="sk-box" style={{ flex: 1, padding: 8, textAlign: 'center' }}>
        <div className="sk-h md">142</div><div className="tiny muted">sessions</div>
      </div>
      <div className="sk-box" style={{ flex: 1, padding: 8, textAlign: 'center' }}>
        <div className="sk-h md">23h</div><div className="tiny muted">total</div>
      </div>
    </div>

    {/* Quest of the day */}
    <div className="sk-box" style={{ padding: 10, marginBottom: 10, borderWidth: 2 }}>
      <div className="row" style={{ justifyContent:'space-between' }}>
        <div className="sk-pill solid">Quête du jour</div>
        <div className="tiny muted">+1 🌿 · +50 xp</div>
      </div>
      <div className="sk-h md" style={{ marginTop: 6 }}>Squash quotidien</div>
      <div className="tiny muted">15 min · 8 étapes</div>
      <div style={{ marginTop: 8 }}><span className="sk-btn primary">▶ Faire pousser</span></div>
    </div>

    <div className="row" style={{ justifyContent:'space-between' }}>
      <div className="sk-h md">Cueillette libre</div>
      <span className="tiny muted">5 routines</span>
    </div>
    <div className="grid-2" style={{ marginTop: 6 }}>
      {['Douce', 'Bureau', 'Golfeur', 'Cervicales'].map((n, i) => (
        <div key={i} className="sk-box" style={{ padding: 6, textAlign: 'center' }}>
          <div className="sk-h sm">{n}</div>
          <div className="tiny muted">{[10,5,20,8][i]} min</div>
        </div>
      ))}
    </div>
    <div className="fc-bottom-nav">
      <div className="it active"><div className="ic"></div>Jardin</div>
      <div className="it"><div className="ic"></div>Calendrier</div>
      <div className="it"><div className="ic"></div>Routines</div>
      <div className="it"><div className="ic"></div>Profil</div>
    </div>
  </>
);

const HomeV3Desktop = () => (
  <>
    <div className="fc-header" style={{ paddingBottom: 12 }}>
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
        <span className="accent-text" style={{ fontWeight: 700 }}>Jardin</span>
        <span className="muted">Calendrier</span>
        <span className="muted">Routines</span>
      </div>
      <div className="avatar">M</div>
    </div>

    {/* Big garden hero */}
    <div className="sk-box" style={{ padding: 0, position: 'relative', height: 220, marginBottom: 14, overflow: 'hidden', background: 'var(--paper-2)' }}>
      <svg viewBox="0 0 800 200" width="100%" height="100%" preserveAspectRatio="none">
        <line x1="0" y1="180" x2="800" y2="180" stroke="var(--ink)" strokeWidth="1.5" />
        {Array.from({length: 30}).map((_, i) => {
          const x = 30 + i * 25;
          const h = i < 23 ? 30 + (i % 7) * 10 + Math.min(i, 14) * 4 : 0;
          const isToday = i === 22;
          return h ? (
            <g key={i}>
              <line x1={x} y1="180" x2={x} y2={180 - h} stroke={isToday ? 'var(--accent)' : 'var(--calm)'} strokeWidth={isToday ? 3 : 2} />
              <circle cx={x} cy={180 - h - 4} r={isToday ? 9 : 5} fill={isToday ? 'var(--accent)' : 'var(--calm)'} opacity={isToday ? 1 : 0.7} />
            </g>
          ) : (
            <circle key={i} cx={x} cy="180" r="2" fill="var(--ink-faint)" />
          );
        })}
      </svg>
      <div style={{ position: 'absolute', top: 12, left: 16 }}>
        <div className="sk-h lg">Ton jardin de 30 jours</div>
        <div className="tiny muted">23 pousses · 7 d'affilée · 7 jours à venir</div>
      </div>
      <div style={{ position: 'absolute', top: 12, right: 16, textAlign: 'right' }}>
        <div className="sk-h lg accent-text">+50 xp</div>
        <div className="tiny muted">si tu fais ta routine du jour</div>
      </div>
    </div>

    <div className="row" style={{ alignItems: 'flex-start', gap: 18 }}>
      <div className="sk-box" style={{ flex: 1, padding: 14, borderWidth: 2 }}>
        <div className="row" style={{ justifyContent:'space-between', marginBottom: 6 }}>
          <div className="sk-pill solid">Quête du jour</div>
          <div className="tiny muted">+1 🌿 · +50 xp</div>
        </div>
        <div className="sk-h xl">Squash quotidien</div>
        <div className="sk-note">Mobilité, gainage et prévention. 15 min · 8 étapes.</div>
        <div className="row" style={{ marginTop: 10, gap: 8 }}>
          <span className="sk-btn primary big">▶ Faire pousser</span>
          <span className="sk-btn ghost">changer</span>
        </div>
      </div>
      <div className="stack" style={{ flex: 1 }}>
        <div className="sk-box row" style={{ padding: 10, justifyContent:'space-between' }}>
          <div><div className="sk-h md">🔥 7 jours</div><div className="tiny muted">prochaine étape : 14 (record)</div></div>
          <div style={{ width: 60 }}><Ring size={50} pct={0.5} label="50%" stroke={5} /></div>
        </div>
        <div className="sk-box row" style={{ padding: 10, justifyContent:'space-between' }}>
          <div><div className="sk-h md">📈 87% adhérence</div><div className="tiny muted">30 derniers jours</div></div>
          <div style={{ width: 60 }}><Ring size={50} pct={0.87} label="87" stroke={5} color="var(--calm)" /></div>
        </div>
        <div className="sk-box row" style={{ padding: 10, justifyContent:'space-between' }}>
          <div><div className="sk-h md">⭐ Squash</div><div className="tiny muted">favorite · 38 fois</div></div>
          <span className="sk-arrow">→</span>
        </div>
      </div>
    </div>

    <div className="row" style={{ justifyContent:'space-between', marginTop: 18, marginBottom: 8 }}>
      <div className="sk-h lg">Cueillette libre — toutes les routines</div>
      <div className="row"><span className="sk-pill">+ créer</span><span className="sk-pill">⤓ importer</span></div>
    </div>
    <div className="grid-3">
      {[
        ['Routine douce', '🌿', 10],
        ['Bureau 5 min', '💼', 5],
        ['Golfeur 60+', '⛳', 20],
        ['Cervicales', '🦴', 8],
        ['Squash', '🎾', 15],
        ['+ Nouvelle', '＋', 0],
      ].map((r, i) => (
        <div key={i} className={`sk-box ${i === 5 ? 'dashed' : ''}`} style={{ padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>{r[1]}</div>
          <div className="sk-h md">{r[0]}</div>
          {r[2] ? <div className="tiny muted">{r[2]} min</div> : null}
        </div>
      ))}
    </div>
  </>
);

window.HomeV1Mobile = HomeV1Mobile;
window.HomeV1Desktop = HomeV1Desktop;
window.HomeV2Mobile = HomeV2Mobile;
window.HomeV2Desktop = HomeV2Desktop;
window.HomeV3Mobile = HomeV3Mobile;
window.HomeV3Desktop = HomeV3Desktop;
window.Ring = Ring;
