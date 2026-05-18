// FlexiCoach Hi-Fi — Éditeur de routine

const EDITOR_STEPS = [
  { name: 'Respiration', dur: 60, mode: 'resp' },
  { name: 'Cervicales', dur: 60, mode: 'mvt', image: true },
  { name: 'Mobilité thoracique', dur: 60, mode: 'mvt', image: true },
  { name: 'Étirement ischios', dur: 60, mode: 'stat', image: true },
  { name: 'Planche', dur: 45, mode: 'stat', image: true },
  { name: 'Hanches', dur: 60, mode: 'mvt' },
  { name: 'Mollets', dur: 60, mode: 'stat', image: true },
  { name: 'Retour au calme', dur: 30, mode: 'resp' },
];
const EDITOR_MODE_COLORS = {
  resp: { c: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Respiration' },
  mvt:  { c: 'var(--primary-500)', bg: 'rgba(59,130,246,0.1)', label: 'Mouvement' },
  stat: { c: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: 'Statique' },
};

const RoutineEditorShell = ({ mobile }) => {
  const total = EDITOR_STEPS.reduce((a, s) => a + s.dur, 0);
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const selectedIdx = 2;

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100%' }}>
      {/* Sticky toolbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: 'var(--surface)', borderBottom: '1px solid var(--line)',
        padding: mobile ? '12px 16px' : '14px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button className="btn btn-ghost btn-icon"><Icon name="back" size={20} /></button>
        <div style={{ flex: 1 }}>
          <div className="type-caption">Édition · brouillon</div>
          <div className="type-body-sm" style={{ fontWeight: 600 }}>Squash quotidien</div>
        </div>
        <button className="btn btn-ghost">Annuler</button>
        <button className="btn btn-primary">
          <Icon name="check" size={16} stroke={2.4} /> Enregistrer
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 380px',
        gap: mobile ? 0 : 24,
        maxWidth: 1180, margin: '0 auto',
        padding: mobile ? '20px 16px 40px' : '32px 24px 64px',
      }}>
        {/* Left: meta + steps */}
        <div>
          {/* Meta card */}
          <div className="card" style={{ padding: mobile ? 18 : 22, marginBottom: 18 }}>
            <span className="type-label">Informations</span>
            <input className="input" defaultValue="Squash quotidien"
              style={{ marginTop: 8, fontSize: 22, fontWeight: 700, height: 52, fontFamily: 'var(--font-display)' }} />
            <textarea className="input" defaultValue="Hanches, mollets, ischios. Pour joueurs réguliers."
              style={{ marginTop: 10, width: '100%', minHeight: 60, padding: 12, fontFamily: 'var(--font-sans)' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <Pill label="Niveau" value="Intermédiaire" />
              <Pill label="Tag" value="Squash" />
              <Pill label="Visibilité" value="Privée" />
            </div>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14,
          }}>
            <MiniStat label="Durée totale" value={fmt(total)} mono />
            <MiniStat label="Étapes" value={EDITOR_STEPS.length} />
            <MiniStat label="Modes" value="3" />
          </div>

          {/* Steps list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span className="type-label">Étapes</span>
            <button className="btn btn-ghost" style={{ fontSize: 13 }}>
              <Icon name="plus" size={16} /> Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EDITOR_STEPS.map((s, i) => {
              const m = EDITOR_MODE_COLORS[s.mode];
              const sel = i === selectedIdx;
              return (
                <div key={i} className="card" style={{
                  padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer',
                  border: sel ? `2px solid ${m.c}` : '1px solid var(--line)',
                  background: sel ? m.bg : 'var(--surface)',
                }}>
                  <span style={{ color: 'var(--ink-4)', cursor: 'grab' }}>
                    <Icon name="grip" size={16} stroke={2} />
                  </span>
                  <span className="type-mono" style={{
                    width: 28, fontSize: 12, color: 'var(--ink-4)', fontWeight: 700,
                  }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{
                    width: 8, height: 30, borderRadius: 4, background: m.c, flexShrink: 0
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 15 }}>{s.name}</span>
                      {s.image && (
                        <span title="Avec image" style={{
                          width: 16, height: 16, borderRadius: 4,
                          background: 'var(--surface-2)', color: 'var(--ink-4)',
                          display: 'grid', placeItems: 'center', flexShrink: 0,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                            <polyline points="21 16 16 11 5 19" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="type-caption" style={{ marginTop: 2 }}>{m.label}</div>
                  </div>
                  <div className="type-mono" style={{
                    fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', minWidth: 48, textAlign: 'right',
                  }}>{fmt(s.dur)}</div>
                  <button className="btn btn-ghost btn-icon" style={{ height: 32, width: 32 }}>
                    <Icon name="more" size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: detail panel — desktop only */}
        {!mobile && (
          <aside>
            <div className="card" style={{ padding: 22, position: 'sticky', top: 88 }}>
              <span className="type-label" style={{ color: EDITOR_MODE_COLORS.mvt.c }}>● Étape sélectionnée</span>
              <h3 className="type-h2" style={{ margin: '6px 0 18px' }}>Mobilité thoracique</h3>

              <EditorField label="Nom" defaultValue="Mobilité thoracique" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <EditorField label="Durée (s)" defaultValue="60" mono />
                <div>
                  <label className="type-label" style={{ display: 'block', marginBottom: 6 }}>Mode</label>
                  <select className="input" defaultValue="mvt" style={{ width: '100%' }}>
                    <option value="resp">Respiration</option>
                    <option value="mvt">Mouvement</option>
                    <option value="stat">Statique</option>
                  </select>
                </div>
              </div>

              <EditorField label="Consigne" multiline defaultValue="Bras croisés. Rotations contrôlées du buste droite/gauche." />

              {/* Image — facultative */}
              <div style={{ marginTop: 6, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <label className="type-label">Image <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--ink-5)', fontWeight: 400 }}>· facultatif</span></label>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                    <Icon name="x" size={12} stroke={2.4} /> Retirer
                  </button>
                </div>
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'stretch',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  padding: 8,
                }}>
                  <div style={{
                    width: 88, height: 66, borderRadius: 8, overflow: 'hidden',
                    background: 'white', flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                  }}>
                    <svg width="88" height="66" viewBox="0 0 88 66">
                      <rect width="88" height="66" fill={EDITOR_MODE_COLORS.mvt.bg} />
                      <g stroke={EDITOR_MODE_COLORS.mvt.c} strokeWidth="1.8" fill="none" strokeLinecap="round">
                        <circle cx="44" cy="22" r="6" />
                        <line x1="44" y1="28" x2="44" y2="46" />
                        <path d="M 44 34 L 32 31" />
                        <path d="M 44 34 L 56 31" />
                        <path d="M 44 46 L 38 58" />
                        <path d="M 44 46 L 50 58" />
                      </g>
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>thoracique-rotation.png</div>
                      <div className="type-caption">88 ko · ajoutée 12 avril</div>
                    </div>
                    <button className="btn btn-secondary" style={{ height: 30, padding: '0 10px', fontSize: 12, alignSelf: 'flex-start' }}>
                      Remplacer
                    </button>
                  </div>
                </div>
                <p className="type-caption" style={{ marginTop: 6 }}>
                  Astuce : une illustration aide l'utilisateur à visualiser la posture sans regarder l'écran tout du long.
                </p>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <label className="type-label">Annonces vocales</label>
                  <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                    <Icon name="plus" size={14} /> Ajouter
                  </button>
                </div>
                {[[15, 'Change de côté'], [45, 'Plus que 15 secondes']].map(([t, txt]) => (
                  <div key={t} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', background: 'var(--surface-2)',
                    borderRadius: 8, marginBottom: 6,
                  }}>
                    <span className="type-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-600)', width: 32 }}>+{t}s</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>{txt}</span>
                    <button className="btn btn-ghost btn-icon" style={{ height: 24, width: 24 }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary" style={{ width: '100%', marginTop: 16, justifyContent: 'center', color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)' }}>
                <Icon name="x" size={16} /> Supprimer cette étape
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const Pill = ({ label, value }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
    background: 'var(--surface-2)', borderRadius: 999, border: '1px solid var(--line)',
    fontSize: 13,
  }}>
    <span style={{ color: 'var(--ink-4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
  </div>
);

const MiniStat = ({ label, value, mono }) => (
  <div className="card" style={{ padding: '10px 14px' }}>
    <div className="type-label" style={{ marginBottom: 2 }}>{label}</div>
    <div style={{
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: 18, fontWeight: 700, color: 'var(--ink)',
    }}>{value}</div>
  </div>
);

const EditorField = ({ label, defaultValue, multiline, mono }) => (
  <div style={{ marginBottom: 12 }}>
    <label className="type-label" style={{ display: 'block', marginBottom: 6 }}>{label}</label>
    {multiline
      ? <textarea className="input" defaultValue={defaultValue} style={{ width: '100%', minHeight: 70, padding: 12, fontFamily: 'var(--font-sans)' }} />
      : <input className="input" defaultValue={defaultValue}
                style={{ width: '100%', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)' }} />
    }
  </div>
);

const EditorHiFi_Desktop = () => <RoutineEditorShell mobile={false} />;
const EditorHiFi_Mobile  = () => <RoutineEditorShell mobile={true}  />;
window.EditorHiFi_Desktop = EditorHiFi_Desktop;
window.EditorHiFi_Mobile = EditorHiFi_Mobile;
