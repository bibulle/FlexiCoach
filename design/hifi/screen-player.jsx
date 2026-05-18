// FlexiCoach Hi-Fi — Lecteur (timeline horizontale + grand chrono)

const ROUTINE = [
  { name: 'Respiration', dur: 60, mode: 'resp', desc: 'Inspirations 4s / expirations 6s. Détend les épaules.' },
  { name: 'Cervicales', dur: 60, mode: 'mvt', desc: 'Rotations lentes droite/gauche, puis flexion/extension.' },
  { name: 'Mobilité thoracique', dur: 60, mode: 'mvt', desc: 'Bras croisés. Rotations contrôlées du buste droite/gauche.', image: true },
  { name: 'Étirement ischios', dur: 60, mode: 'stat', desc: 'Talon au sol, jambe tendue. Tiens 30s par jambe.', image: true },
  { name: 'Planche', dur: 45, mode: 'stat', desc: 'Gainage. Bassin aligné, regard vers le sol.', image: true },
  { name: 'Hanches', dur: 60, mode: 'mvt', desc: 'Cercles larges, debout. Ouvre la hanche au maximum.' },
  { name: 'Mollets', dur: 60, mode: 'stat', desc: 'Étirement contre mur, jambe arrière tendue.', image: true },
  { name: 'Retour au calme', dur: 30, mode: 'resp', desc: 'Trois grandes respirations. Bravo.' },
];

// Placeholder visual for steps with an image (figure stylisée en mode du mouvement)
const StepImage = ({ mode, size = 160 }) => {
  const color = MODE_COLOR[mode];
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 120" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`si-${mode}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.12" />
          <stop offset="100%" stopColor={color} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill={`url(#si-${mode})`} />
      {/* simple stick figure */}
      <g stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="80" cy="34" r="10" />
        <line x1="80" y1="44" x2="80" y2="78" />
        <path d="M 80 56 L 56 50" />
        <path d="M 80 56 L 104 50" />
        <path d="M 80 78 L 68 102" />
        <path d="M 80 78 L 92 102" />
      </g>
    </svg>
  );
};

const MODE_COLOR = {
  resp: 'var(--mode-resp)',
  mvt: 'var(--primary-500)',
  stat: 'var(--mode-stat)',
};
const MODE_LABEL = { resp: 'Respiration', mvt: 'Mouvement', stat: 'Statique' };

const PlayerHiFi = ({ mobile }) => {
  const cur = 2;          // current step index
  const elapsed = 18;     // seconds into current step
  const stepLeft = ROUTINE[cur].dur - elapsed;
  const totalDur = ROUTINE.reduce((a, b) => a + b.dur, 0);
  const sumDone = ROUTINE.slice(0, cur).reduce((a, b) => a + b.dur, 0) + elapsed;
  const overallPct = sumDone / totalDur;
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const stepPct = elapsed / ROUTINE[cur].dur;

  // Timeline segments
  const Timeline = ({ height = 18 }) => (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
      {ROUTINE.map((s, i) => {
        const status = i < cur ? 'done' : i === cur ? 'current' : 'todo';
        const color = MODE_COLOR[s.mode];
        return (
          <div key={i} style={{ flex: s.dur, position: 'relative' }}>
            <div style={{
              height: status === 'current' ? height * 2.2 : height,
              background: status === 'todo' ? 'transparent' : color,
              border: status === 'todo' ? `1.5px dashed ${color}` : 'none',
              opacity: status === 'todo' ? 0.45 : 1,
              borderRadius: 6,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {status === 'current' && (
                <>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)',
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${stepPct * 100}%`,
                    background: 'rgba(255,255,255,0.35)',
                  }} />
                </>
              )}
              {status === 'done' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'grid', placeContent: 'center',
                  color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: 11
                }}>✓</div>
              )}
            </div>
            {status === 'current' && (
              <div style={{
                position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: color, letterSpacing: '0.1em', whiteSpace: 'nowrap',
                textTransform: 'uppercase'
              }}>● en cours</div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: mobile ? '14px 16px 10px' : '20px 32px 14px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)'
      }}>
        <button className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}>
          <Icon name="back" size={20} stroke={2} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="type-caption">Routine en cours</div>
          <div className="type-body-sm" style={{ fontWeight: 600 }}>Squash quotidien</div>
        </div>
        <button className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}>
          <Icon name="more" size={20} stroke={2} />
        </button>
      </header>

      {/* Timeline section */}
      <section style={{ padding: mobile ? '32px 18px 12px' : '34px 32px 18px', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: mobile ? 30 : 32 }}>
          <span className="type-caption">Étape {cur + 1} / {ROUTINE.length}</span>
          <span className="type-mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            <span style={{ color: 'var(--primary-600)', fontWeight: 700 }}>{fmt(sumDone)}</span> / {fmt(totalDur)}
          </span>
        </div>
        <Timeline height={mobile ? 14 : 18} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(MODE_LABEL).map(([k, l]) => {
            const count = ROUTINE.filter(s => s.mode === k).length;
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: MODE_COLOR[k] }} />
                <span className="type-caption" style={{ color: 'var(--ink-3)' }}>{l} · {count}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Big chrono */}
      <section style={{
        flex: 1, padding: mobile ? '32px 20px' : '56px 32px',
        background: 'var(--surface-2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <span className="badge" style={{
          background: `${MODE_COLOR[ROUTINE[cur].mode]}1f`,
          color: MODE_COLOR[ROUTINE[cur].mode],
          fontWeight: 700,
          marginBottom: 14,
          letterSpacing: '0.12em'
        }}>● {MODE_LABEL[ROUTINE[cur].mode].toUpperCase()}</span>
        <h1 className={mobile ? 'type-h1' : 'type-display'} style={{ margin: '0 0 18px', maxWidth: 560 }}>
          {ROUTINE[cur].name}
        </h1>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: mobile ? 110 : 168,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
          marginBottom: 14,
        }}>
          0:{String(stepLeft).padStart(2,'0')}
        </div>
        <p className="type-body" style={{ color: 'var(--ink-3)', margin: 0, maxWidth: 480 }}>
          {ROUTINE[cur].desc}
        </p>

        {/* Optional image — passive visual aid, always visible when present */}
        {ROUTINE[cur].image && (
          <figure style={{
            marginTop: mobile ? 22 : 32,
            margin: `${mobile ? 22 : 32}px 0 0`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: mobile ? 180 : 240,
              height: mobile ? 135 : 180,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-sm)',
              display: 'grid', placeItems: 'center',
            }}>
              <StepImage mode={ROUTINE[cur].mode} size={mobile ? 180 : 240} />
            </div>
            <figcaption className="type-caption" style={{ fontSize: 11, letterSpacing: '0.04em' }}>
              Aide visuelle
            </figcaption>
          </figure>
        )}
      </section>

      {/* Up next + controls */}
      <footer style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        padding: mobile ? '14px 18px 22px' : '20px 32px 28px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
          background: 'var(--surface-2)', borderRadius: 'var(--radius)', marginBottom: 16,
        }}>
          <span style={{ width: 8, height: 32, borderRadius: 4, background: MODE_COLOR[ROUTINE[cur+1].mode] }} />
          <div style={{ flex: 1 }}>
            <div className="type-caption">À suivre · {MODE_LABEL[ROUTINE[cur+1].mode]}</div>
            <div className="type-body-sm" style={{ fontWeight: 600 }}>{ROUTINE[cur+1].name}</div>
          </div>
          <span className="type-mono" style={{ fontSize: 13, color: 'var(--ink-3)' }}>{fmt(ROUTINE[cur+1].dur)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: mobile ? 18 : 28 }}>
          <button className="btn btn-ghost" style={{
            width: mobile ? 52 : 60, height: mobile ? 52 : 60, padding: 0, borderRadius: '50%',
            border: '1px solid var(--line)'
          }}>
            <Icon name="prev" size={mobile ? 22 : 26} stroke={2} />
          </button>
          <button className="btn btn-primary" style={{
            width: mobile ? 76 : 88, height: mobile ? 76 : 88, padding: 0, borderRadius: '50%',
            boxShadow: '0 8px 24px -8px var(--primary-500)'
          }}>
            <Icon name="pause" size={mobile ? 30 : 34} stroke={2.4} />
          </button>
          <button className="btn btn-ghost" style={{
            width: mobile ? 52 : 60, height: mobile ? 52 : 60, padding: 0, borderRadius: '50%',
            border: '1px solid var(--line)'
          }}>
            <Icon name="next" size={mobile ? 22 : 26} stroke={2} />
          </button>
        </div>
      </footer>
    </div>
  );
};

const PlayerHiFi_Desktop = () => <PlayerHiFi mobile={false} />;
const PlayerHiFi_Mobile = () => <PlayerHiFi mobile={true} />;

window.PlayerHiFi_Desktop = PlayerHiFi_Desktop;
window.PlayerHiFi_Mobile = PlayerHiFi_Mobile;
