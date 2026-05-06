// FlexiCoach Hi-Fi — Catalogue de routines

const CATALOG_ROUTINES = [
  { name: 'Squash quotidien', desc: 'Hanches, mollets, ischios. Pour joueurs réguliers.', dur: 7, steps: 8, level: 'Intermédiaire', tag: 'Squash', mine: false, color: 'var(--primary-500)' },
  { name: 'Routine douce', desc: 'Réveil articulaire en 10 min. Idéale au lever.', dur: 10, steps: 12, level: 'Débutant', tag: 'Quotidien', mine: false, color: '#22c55e' },
  { name: 'Bureau express', desc: 'Pause anti-cervicales, sans tapis.', dur: 5, steps: 6, level: 'Débutant', tag: 'Bureau', mine: false, color: '#0ea5e9' },
  { name: 'Entretien golfeur 60+', desc: 'Mobilité épaules + rotation thoracique.', dur: 15, steps: 14, level: 'Intermédiaire', tag: 'Golf', mine: false, color: '#f59e0b' },
  { name: 'Mobilité hanches', desc: 'Ouverture profonde, post-running.', dur: 12, steps: 10, level: 'Avancé', tag: 'Mobilité', mine: false, color: '#a855f7' },
  { name: 'Ma routine du soir', desc: 'Étirements ischios + respiration.', dur: 8, steps: 7, level: 'Débutant', tag: 'Perso', mine: true, color: 'var(--primary-500)' },
];

const CatalogCard = ({ r, mobile }) => (
  <div className="card" style={{
    padding: mobile ? 16 : 18, display: 'flex', flexDirection: 'column', gap: 10,
    cursor: 'pointer', transition: 'all 160ms ease', position: 'relative',
  }}>
    {/* color stripe top */}
    <div style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 3, background: r.color, borderRadius: '0 0 3px 3px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
      <span className="type-label" style={{ color: r.color }}>● {r.tag}</span>
      {r.mine && <span className="badge badge-mine" style={{ fontSize: 10 }}>Ma routine</span>}
    </div>
    <h3 className="type-h3" style={{ margin: 0 }}>{r.name}</h3>
    <p className="type-body-sm" style={{ color: 'var(--ink-3)', margin: 0, minHeight: 36 }}>{r.desc}</p>
    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--ink-4)', alignItems: 'center', marginTop: 4 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="clock" size={14} stroke={2} /> {r.dur} min
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="check" size={14} stroke={2} /> {r.steps} étapes
      </span>
      <span className={`badge badge-${r.level === 'Débutant' ? 'debutant' : r.level === 'Intermédiaire' ? 'intermediaire' : 'avance'}`}
            style={{ fontSize: 10, marginLeft: 'auto' }}>{r.level}</span>
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Démarrer</button>
      {r.mine && <button className="btn btn-ghost btn-icon" aria-label="Éditer"><Icon name="more" size={18} /></button>}
    </div>
  </div>
);

const RoutineListShell = ({ mobile }) => {
  const filters = ['Tout', 'Quotidien', 'Bureau', 'Sport', 'Mes routines'];
  const active = 'Tout';
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100%' }}>
      <HEADER_HIFI active="Routines" isMobile={mobile} />
      <main style={{
        maxWidth: mobile ? '100%' : 1080,
        margin: '0 auto',
        padding: mobile ? '20px 18px 40px' : '32px 32px 64px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <div>
            <span className="type-label">Catalogue</span>
            <h1 className={mobile ? 'type-h1' : 'type-display'} style={{ margin: '4px 0 4px' }}>Routines.</h1>
            <p className="type-body" style={{ color: 'var(--ink-3)', margin: 0 }}>{CATALOG_ROUTINES.length} disponibles · 1 personnelle.</p>
          </div>
          <button className="btn btn-primary btn-lg">
            <Icon name="plus" size={18} stroke={2.4} /> Nouvelle routine
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <span key={f} style={{
              padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: f === active ? 'var(--ink)' : 'var(--surface-2)',
              color: f === active ? 'white' : 'var(--ink-2)',
              border: '1px solid ' + (f === active ? 'var(--ink)' : 'var(--line)'),
            }}>{f}</span>
          ))}
          <span style={{ flex: 1 }} />
          <div className="type-mono" style={{ fontSize: 12, color: 'var(--ink-4)', alignSelf: 'center' }}>
            Trier · Récents
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {CATALOG_ROUTINES.map(r => <CatalogCard key={r.name} r={r} mobile={mobile} />)}
        </div>
      </main>
    </div>
  );
};

const RoutineListHiFi_Desktop = () => <RoutineListShell mobile={false} />;
const RoutineListHiFi_Mobile  = () => <RoutineListShell mobile={true}  />;
window.RoutineListHiFi_Desktop = RoutineListHiFi_Desktop;
window.RoutineListHiFi_Mobile = RoutineListHiFi_Mobile;
