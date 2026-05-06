// FlexiCoach wireframes — Player (lecteur de routine) variations

// V1 — "Minuterie dominante centrée" : classique mais bien fait
const PlayerV1Mobile = () => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--paper)' }}>
    <div className="row" style={{ justifyContent: 'space-between', padding: '4px 4px 8px', borderBottom: '1px dashed var(--ink-faint)' }}>
      <span className="sk-arrow">←</span>
      <div className="sk-h sm">Squash quotidien</div>
      <span className="tiny muted">3/8</span>
    </div>
    {/* progress */}
    <div style={{ height: 4, background: 'var(--paper-2)', borderRadius: 2, margin: '8px 0' }}>
      <div style={{ width: '37%', height: '100%', background: 'var(--accent)', borderRadius: 2 }}></div>
    </div>
    <div className="tiny muted center">37% · 5:34 restantes</div>

    <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 8 }}>
      <div>
        <div className="sk-pill calm" style={{ fontSize: 12 }}>● mouvement</div>
        <div className="sk-h lg" style={{ marginTop: 10, fontSize: 24 }}>Mobilité thoracique</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 80, fontWeight: 700, lineHeight: 1, margin: '14px 0', color: 'var(--accent)' }}>0:42</div>
        <div className="sk-note" style={{ fontSize: 13, maxWidth: 260, margin: '0 auto' }}>Bras croisés. Rotations contrôlées du buste droite/gauche.</div>
      </div>
    </div>

    <div className="sk-box dashed" style={{ padding: 8, marginBottom: 10 }}>
      <div className="tiny muted">suivant</div>
      <div className="sk-h sm">Étirement ischios · 60s</div>
    </div>

    <div className="row" style={{ justifyContent: 'space-around', padding: '8px 0' }}>
      <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏮</div>
      <div className="sk-btn primary big" style={{ width: 70, height: 70, borderRadius: 35, fontSize: 28 }}>⏸</div>
      <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏭</div>
    </div>
    <div className="row" style={{ justifyContent: 'center', gap: 12 }}>
      <span className="sk-pill tiny">🔊 voix</span>
      <span className="sk-pill tiny">⏹ stop</span>
    </div>
  </div>
);

const PlayerV1Desktop = () => (
  <div style={{ minHeight: 540, display: 'flex', flexDirection: 'column' }}>
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span className="sk-pill">← retour</span>
      <div className="sk-h md">Squash quotidien</div>
      <span className="tiny muted">étape 3 sur 8</span>
    </div>
    <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 3, margin: '12px 0' }}>
      <div style={{ width: '37%', height: '100%', background: 'var(--accent)', borderRadius: 3 }}></div>
    </div>

    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'center' }}>
      <div className="center">
        <div className="sk-pill calm" style={{ fontSize: 14 }}>● mode mouvement</div>
        <div className="sk-h xl" style={{ marginTop: 14, fontSize: 36 }}>Mobilité thoracique</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 160, fontWeight: 700, lineHeight: 0.9, margin: '20px 0', color: 'var(--accent)', letterSpacing: '-0.04em' }}>0:42</div>
        <div className="sk-note" style={{ fontSize: 16, maxWidth: 420, margin: '0 auto' }}>Bras croisés. Rotations contrôlées du buste droite/gauche. Respiration fluide.</div>
        <div className="row" style={{ justifyContent: 'center', gap: 18, marginTop: 24 }}>
          <div className="sk-btn ghost" style={{ width: 60, height: 60, borderRadius: 30 }}>⏮</div>
          <div className="sk-btn primary big" style={{ width: 84, height: 84, borderRadius: 42, fontSize: 32 }}>⏸</div>
          <div className="sk-btn ghost" style={{ width: 60, height: 60, borderRadius: 30 }}>⏭</div>
        </div>
      </div>
      <div className="stack">
        <div className="sk-box" style={{ padding: 10 }}>
          <div className="tiny muted">suivant</div>
          <div className="sk-h md">Étirement ischios</div>
          <div className="tiny">60s · statique</div>
        </div>
        <div className="sk-box dashed" style={{ padding: 10 }}>
          <div className="tiny muted">puis</div>
          <div className="sk-h sm">Gainage planche</div>
          <div className="tiny">45s · statique</div>
        </div>
        <div className="sk-box" style={{ padding: 10 }}>
          <div className="sk-h sm">Étapes faites</div>
          <div className="row tiny" style={{ gap: 4, marginTop: 6, flexWrap:'wrap' }}>
            {Array.from({length:8}).map((_,i)=>
              <span key={i} style={{ width: 22, height: 22, background: i < 2 ? 'var(--calm)' : i === 2 ? 'var(--accent)' : 'transparent', border: '1px solid var(--ink)', borderRadius: 4, display:'grid', placeItems:'center', fontFamily:'var(--font-hand)', color: i <=2 ? 'white':'var(--ink)' }}>{i+1}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// V2 — "Anneau qui se vide / mode immersif" : focus extrême, peu de chrome
const PlayerV2Mobile = () => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'oklch(0.18 0.02 230)', color: 'white', borderRadius: 28, margin: -18, padding: 22 }}>
    <div className="row" style={{ justifyContent: 'space-between', opacity: 0.6 }}>
      <span style={{ color: 'white' }}>×</span>
      <div className="tiny" style={{ color: 'white' }}>3 / 8 · Squash</div>
      <span style={{ color: 'white' }}>🔊</span>
    </div>
    <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
          <circle cx="120" cy="120" r="108" fill="none" stroke="white" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 108 * 0.7} ${2 * Math.PI * 108}`}
            strokeLinecap="round" transform="rotate(-90 120 120)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 700, lineHeight: 1 }}>0:42</div>
          <div className="tiny" style={{ opacity: 0.7, marginTop: 6 }}>● mouvement</div>
        </div>
      </div>
    </div>
    <div className="center" style={{ marginBottom: 18 }}>
      <div className="sk-h md" style={{ color: 'white' }}>Mobilité thoracique</div>
      <div className="tiny" style={{ opacity: 0.7, marginTop: 4 }}>Bras croisés, rotations lentes du buste</div>
    </div>
    <div className="row" style={{ justifyContent: 'center', gap: 18 }}>
      <div style={{ width: 48, height: 48, borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.4)', display: 'grid', placeItems: 'center' }}>⏮</div>
      <div style={{ width: 72, height: 72, borderRadius: 36, background: 'white', color: 'oklch(0.18 0.02 230)', display: 'grid', placeItems: 'center', fontSize: 28 }}>⏸</div>
      <div style={{ width: 48, height: 48, borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.4)', display: 'grid', placeItems: 'center' }}>⏭</div>
    </div>
    <div className="tiny center" style={{ opacity: 0.5, marginTop: 12 }}>suivant : Étirement ischios · 60s</div>
  </div>
);

const PlayerV2Desktop = () => (
  <div style={{ minHeight: 540, background: 'oklch(0.18 0.02 230)', color: 'white', borderRadius: 14, margin: '-18px -26px -26px', padding: '32px 40px', display: 'flex', flexDirection: 'column' }}>
    <div className="row" style={{ justifyContent: 'space-between', opacity: 0.7 }}>
      <span style={{ color: 'white' }}>× quitter</span>
      <div className="tiny" style={{ color: 'white' }}>Squash quotidien · étape 3 / 8</div>
      <span style={{ color: 'white' }}>🔊 guidage on</span>
    </div>
    <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
      <div className="center">
        <div style={{ position: 'relative' }}>
          <svg width="380" height="380" viewBox="0 0 380 380">
            <circle cx="190" cy="190" r="170" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
            <circle cx="190" cy="190" r="170" fill="none" stroke="white" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 170 * 0.7} ${2 * Math.PI * 170}`}
              strokeLinecap="round" transform="rotate(-90 190 190)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 110, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>0:42</div>
            <div className="tiny" style={{ opacity: 0.7, marginTop: 8, fontSize: 14 }}>● MODE MOUVEMENT</div>
          </div>
        </div>
        <div className="sk-h xl" style={{ color: 'white', marginTop: 22, fontSize: 38 }}>Mobilité thoracique</div>
        <div style={{ opacity: 0.7, marginTop: 6, fontSize: 16, maxWidth: 480 }}>Bras croisés. Rotations contrôlées du buste droite/gauche. Respiration fluide.</div>
      </div>
    </div>
    <div className="row" style={{ justifyContent: 'center', gap: 22 }}>
      <div style={{ width: 56, height: 56, borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.35)', display: 'grid', placeItems: 'center', fontSize: 22 }}>⏮</div>
      <div style={{ width: 88, height: 88, borderRadius: 44, background: 'white', color: 'oklch(0.18 0.02 230)', display: 'grid', placeItems: 'center', fontSize: 36 }}>⏸</div>
      <div style={{ width: 56, height: 56, borderRadius: 28, border: '1.5px solid rgba(255,255,255,0.35)', display: 'grid', placeItems: 'center', fontSize: 22 }}>⏭</div>
    </div>
    <div className="tiny center" style={{ opacity: 0.55, marginTop: 14 }}>suivant : Étirement ischios · 60s · statique</div>
  </div>
);

// V3 — "Timeline horizontale + carte étape" : voir tout le parcours d'un coup d'œil
const PlayerV3Mobile = () => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="sk-arrow">←</span>
      <div className="sk-h sm">Squash quotidien</div>
      <span>⋯</span>
    </div>
    {/* segmented timeline */}
    <div className="row" style={{ gap: 3, marginBottom: 4 }}>
      {[60, 60, 60, 60, 45, 60, 60, 30].map((s, i) => {
        const status = i < 2 ? 'done' : i === 2 ? 'current' : 'todo';
        const colors = { mvt: 'var(--accent)', stat: 'var(--calm)', resp: 'oklch(0.55 0.15 295)' };
        const mode = ['resp','mvt','mvt','stat','stat','mvt','stat','resp'][i];
        return (
          <div key={i} style={{
            flex: s,
            height: status === 'current' ? 18 : 10,
            background: status === 'done' ? colors[mode] : status === 'current' ? colors[mode] : 'transparent',
            border: `1px solid ${status === 'todo' ? 'var(--ink-faint)' : colors[mode]}`,
            borderRadius: 3,
            opacity: status === 'todo' ? 0.5 : 1,
            transition: 'all 0.2s'
          }}/>
        );
      })}
    </div>
    <div className="row tiny muted" style={{ justifyContent: 'space-between' }}>
      <span>0:00</span><span>5:34 / 15:00</span>
    </div>

    <div className="sk-box accent" style={{ padding: 14, marginTop: 12, textAlign: 'center' }}>
      <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
        <span className="sk-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>3/8 · mouvement</span>
      </div>
      <div className="sk-h md" style={{ marginTop: 8, fontSize: 22 }}>Mobilité thoracique</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 700, color: 'var(--accent)', lineHeight: 1, margin: '10px 0' }}>0:42</div>
      <div className="tiny" style={{ maxWidth: 240, margin: '0 auto' }}>Bras croisés. Rotations contrôlées du buste.</div>
    </div>

    <div className="row" style={{ justifyContent: 'space-around', padding: '14px 0', marginTop: 'auto' }}>
      <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏮</div>
      <div className="sk-btn primary big" style={{ width: 70, height: 70, borderRadius: 35, fontSize: 28 }}>⏸</div>
      <div className="sk-btn ghost" style={{ width: 50, height: 50, borderRadius: 25 }}>⏭</div>
    </div>

    <div className="stack tiny" style={{ marginBottom: 8 }}>
      <div className="row" style={{ justifyContent:'space-between', opacity: 0.4 }}><span>1. Respiration</span><span>60s ✓</span></div>
      <div className="row" style={{ justifyContent:'space-between', opacity: 0.4 }}><span>2. Cervicales</span><span>60s ✓</span></div>
      <div className="row" style={{ justifyContent:'space-between', fontWeight: 700 }}><span className="accent-text">3. Mobilité thoracique</span><span className="accent-text">42s</span></div>
      <div className="row" style={{ justifyContent:'space-between' }}><span>4. Étirement ischios</span><span>60s</span></div>
      <div className="row" style={{ justifyContent:'space-between', opacity: 0.5 }}><span>5. Gainage planche</span><span>45s</span></div>
    </div>
  </div>
);

const PlayerV3Desktop = () => (
  <div style={{ minHeight: 540 }}>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span className="sk-pill">← retour</span>
      <div className="sk-h lg">Squash quotidien</div>
      <div className="row tiny muted" style={{ gap: 10 }}><span>🔊 guidage on</span><span>⋯</span></div>
    </div>

    {/* segmented timeline + duration labels */}
    <div style={{ marginTop: 14 }}>
      <div className="row" style={{ gap: 4, marginBottom: 4 }}>
        {[60, 60, 60, 60, 45, 60, 60, 30].map((s, i) => {
          const status = i < 2 ? 'done' : i === 2 ? 'current' : 'todo';
          const colors = { mvt: 'var(--accent)', stat: 'var(--calm)', resp: 'oklch(0.55 0.15 295)' };
          const mode = ['resp','mvt','mvt','stat','stat','mvt','stat','resp'][i];
          return (
            <div key={i} style={{ flex: s, position: 'relative' }}>
              <div style={{
                height: status === 'current' ? 26 : 14,
                background: status === 'todo' ? 'transparent' : colors[mode],
                border: `1.2px solid ${status === 'todo' ? 'var(--ink-faint)' : colors[mode]}`,
                borderRadius: 4,
                opacity: status === 'todo' ? 0.5 : 1
              }}/>
              <div className="tiny center" style={{ marginTop: 4, opacity: status === 'todo' ? 0.5 : 1, fontWeight: status === 'current' ? 700 : 400 }}>
                {i + 1}. {['Respi','Cervic.','Thorax','Ischios','Planche','Hanches','Mollets','Calme'][i]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="row tiny muted" style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <span>début</span><span style={{ fontWeight: 700, color: 'var(--accent)' }}>5:34 écoulées · 9:26 restantes</span><span>fin</span>
      </div>
    </div>

    <div className="row" style={{ marginTop: 22, gap: 22, alignItems: 'stretch' }}>
      <div className="sk-box accent" style={{ flex: 1, padding: 24, textAlign: 'center', minHeight: 280, display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <div><span className="sk-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>étape 3 sur 8 · ● mouvement</span></div>
        <div className="sk-h xl" style={{ marginTop: 14, fontSize: 32 }}>Mobilité thoracique</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 130, fontWeight: 700, color: 'var(--accent)', lineHeight: 0.9, margin: '14px 0', letterSpacing:'-0.03em' }}>0:42</div>
        <div className="sk-note" style={{ fontSize: 15, maxWidth: 420, margin: '0 auto' }}>Bras croisés. Rotations contrôlées du buste droite/gauche. Respiration fluide.</div>
        <div className="row" style={{ justifyContent: 'center', gap: 18, marginTop: 22 }}>
          <div className="sk-btn ghost" style={{ width: 56, height: 56, borderRadius: 28 }}>⏮</div>
          <div className="sk-btn primary big" style={{ width: 78, height: 78, borderRadius: 39, fontSize: 30 }}>⏸</div>
          <div className="sk-btn ghost" style={{ width: 56, height: 56, borderRadius: 28 }}>⏭</div>
        </div>
      </div>
      <div className="stack" style={{ width: 240 }}>
        <div className="sk-box" style={{ padding: 10 }}>
          <div className="sk-h sm">Toutes les étapes</div>
        </div>
        {[
          ['Respiration', '60s', 'done'],
          ['Cervicales', '60s', 'done'],
          ['Thorax', '60s', 'current'],
          ['Ischios', '60s', 'next'],
          ['Planche', '45s', 'todo'],
          ['Hanches', '60s', 'todo'],
        ].map((s, i) => (
          <div key={i} className={`sk-box row ${s[2] === 'current' ? 'accent' : ''} ${s[2] === 'next' ? 'dashed' : ''}`} style={{ padding: 8, opacity: s[2] === 'todo' ? 0.5 : 1, justifyContent: 'space-between' }}>
            <div className="sk-h sm">{i+1}. {s[0]}</div>
            <span className="tiny">{s[1]} {s[2]==='done' && '✓'}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

window.PlayerV1Mobile = PlayerV1Mobile;
window.PlayerV1Desktop = PlayerV1Desktop;
window.PlayerV2Mobile = PlayerV2Mobile;
window.PlayerV2Desktop = PlayerV2Desktop;
window.PlayerV3Mobile = PlayerV3Mobile;
window.PlayerV3Desktop = PlayerV3Desktop;
