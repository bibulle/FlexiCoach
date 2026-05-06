// FlexiCoach Hi-Fi — Fin de séance

const FEELINGS = [
  { emoji: '😊', label: 'Top', value: 'great' },
  { emoji: '🙂', label: 'Bien', value: 'good' },
  { emoji: '😐', label: 'Moyen', value: 'meh' },
  { emoji: '😣', label: 'Difficile', value: 'hard' },
];

const CompletionShell = ({ mobile }) => {
  const selected = 'good';
  const today = '28 avril';
  const dur = '8:32';
  const routine = 'Squash quotidien';
  const newStreak = 7;

  return (
    <div style={{
      minHeight: '100%', background: 'var(--surface-2)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: mobile ? '32px 18px 28px' : '56px 48px',
    }}>
      {/* Hero check */}
      <div style={{
        width: mobile ? 84 : 110, height: mobile ? 84 : 110,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--success), #15803d)',
        display: 'grid', placeItems: 'center', color: 'white',
        boxShadow: '0 10px 30px -8px rgba(34,197,94,0.5)',
        marginBottom: mobile ? 18 : 24,
        position: 'relative',
      }}>
        <svg width={mobile ? 44 : 56} height={mobile ? 44 : 56} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {/* sparkle */}
        <div style={{ position: 'absolute', top: -8, right: -6, fontSize: 20 }}>✨</div>
      </div>

      <span className="type-label" style={{ color: 'var(--success)', marginBottom: 8 }}>● Séance terminée</span>
      <h1 className={mobile ? 'type-h1' : 'type-display'} style={{ margin: '0 0 10px', textAlign: 'center' }}>
        Bravo, Marc !
      </h1>
      <p className="type-body" style={{ color: 'var(--ink-3)', textAlign: 'center', maxWidth: 420, margin: '0 0 28px' }}>
        Tu viens de boucler <strong style={{ color: 'var(--ink)' }}>{routine}</strong> en {dur}. Ta série continue.
      </p>

      {/* Stat strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3, 1fr)',
        gap: 10, width: '100%', maxWidth: 540, marginBottom: 32,
      }}>
        <StatBlock label="Durée" value={dur} mono />
        <StatBlock label="Étapes" value="8 / 8" mono />
        <StatBlock label="Série" value={`🔥 ${newStreak} j`} highlight />
      </div>

      {/* Feeling */}
      <div style={{ width: '100%', maxWidth: 540, marginBottom: 28 }}>
        <h3 className="type-h3" style={{ margin: '0 0 14px', textAlign: 'center' }}>
          Comment tu te sens ?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {FEELINGS.map(f => {
            const sel = f.value === selected;
            return (
              <button key={f.value} style={{
                background: sel ? 'var(--primary-50)' : 'var(--surface)',
                border: sel ? '2px solid var(--primary-500)' : '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: mobile ? '14px 6px 10px' : '16px 8px 12px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-sans)', color: 'var(--ink-2)',
                transform: sel ? 'translateY(-2px)' : 'none',
                boxShadow: sel ? 'var(--shadow)' : 'none',
                transition: 'all 160ms ease',
              }}>
                <span style={{ fontSize: mobile ? 26 : 30 }}>{f.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div style={{ width: '100%', maxWidth: 540, marginBottom: 28 }}>
        <label className="type-label" style={{ display: 'block', marginBottom: 6 }}>Note rapide (option.)</label>
        <textarea className="input" placeholder="Hanche droite tendue ce matin…"
          style={{ width: '100%', minHeight: 64, padding: 12, resize: 'vertical', fontFamily: 'var(--font-sans)' }} />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 10, width: '100%', maxWidth: 540 }}>
        <button className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
          Voir mon calendrier
        </button>
        <button className="btn btn-secondary btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
          Refaire une routine
        </button>
      </div>

      <p style={{ marginTop: 20, color: 'var(--ink-4)', fontSize: 13, textAlign: 'center' }}>
        Prochain rappel à <strong style={{ color: 'var(--ink-2)' }}>19:00</strong> · {today}
      </p>
    </div>
  );
};

const StatBlock = ({ label, value, mono, highlight }) => (
  <div style={{
    background: highlight ? 'linear-gradient(135deg, #fff7ed, #ffedd5)' : 'var(--surface)',
    border: '1px solid ' + (highlight ? '#fed7aa' : 'var(--line)'),
    borderRadius: 'var(--radius)', padding: '14px 16px',
    textAlign: 'center',
  }}>
    <div className="type-label" style={{ color: highlight ? '#9a3412' : 'var(--ink-4)', marginBottom: 4 }}>{label}</div>
    <div style={{
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: 22, fontWeight: 700, color: highlight ? '#9a3412' : 'var(--ink)',
      letterSpacing: mono ? '-0.02em' : 0,
    }}>{value}</div>
  </div>
);

const CompletionHiFi_Desktop = () => <CompletionShell mobile={false} />;
const CompletionHiFi_Mobile  = () => <CompletionShell mobile={true}  />;
window.CompletionHiFi_Desktop = CompletionHiFi_Desktop;
window.CompletionHiFi_Mobile = CompletionHiFi_Mobile;
