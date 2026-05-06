// FlexiCoach Hi-Fi — Stats + Paramètres (rappels, voix)

const StatsSettingsShell = ({ mobile }) => {
  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100%' }}>
      <HEADER_HIFI active="Paramètres" isMobile={mobile} />
      <main style={{
        maxWidth: mobile ? '100%' : 1080, margin: '0 auto',
        padding: mobile ? '20px 16px 40px' : '32px 32px 64px',
        display: 'grid',
        gridTemplateColumns: mobile ? '1fr' : '1fr 360px',
        gap: 24,
      }}>
        {/* === LEFT: Stats === */}
        <div>
          <span className="type-label">Aperçu</span>
          <h1 className={mobile ? 'type-h1' : 'type-display'} style={{ margin: '4px 0 24px' }}>
            Tes 30 derniers jours.
          </h1>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12,
            marginBottom: 28,
          }}>
            <BigStat label="Série actuelle" value="7" unit="jours" hl />
            <BigStat label="Temps cumulé" value="3h 42" unit="" mono />
            <BigStat label="Séances" value="22" unit="/30" />
            <BigStat label="Régularité" value="73" unit="%" />
          </div>

          <div className="card" style={{ padding: mobile ? 18 : 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <span className="type-label">Activité par jour de la semaine</span>
              <span className="type-mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>moy. 4 séances</span>
            </div>
            {/* horizontal bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Lun', 5, true], ['Mar', 4, false], ['Mer', 3, false],
                ['Jeu', 5, true], ['Ven', 4, false], ['Sam', 1, false], ['Dim', 0, false],
              ].map(([d, n, hi]) => (
                <div key={d} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 30px', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>{d}</span>
                  <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(n/5)*100}%`, height: '100%',
                      background: hi ? 'var(--primary-500)' : 'var(--primary-300)',
                      borderRadius: 5, transition: 'width 600ms',
                    }} />
                  </div>
                  <span className="type-mono" style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'right' }}>{n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: mobile ? 18 : 22 }}>
            <span className="type-label" style={{ marginBottom: 14, display: 'block' }}>Top routines</span>
            {[
              { name: 'Squash quotidien', n: 12, pct: 1.0 },
              { name: 'Routine douce', n: 6, pct: 0.5 },
              { name: 'Bureau express', n: 4, pct: 0.33 },
            ].map(r => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{r.name}</div>
                  <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2 }}>
                    <div style={{ width: `${r.pct * 100}%`, height: '100%', background: 'var(--primary-500)', borderRadius: 2 }} />
                  </div>
                </div>
                <span className="type-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)', minWidth: 36, textAlign: 'right' }}>{r.n}×</span>
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT: Settings (rappels + voix + thème) === */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Reminders */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 className="type-h3" style={{ margin: 0 }}>Rappels</h3>
              <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                <Icon name="plus" size={14} /> Ajouter
              </button>
            </div>
            {[
              { time: '08:00', days: [1,2,3,4,5], enabled: true, label: 'Réveil' },
              { time: '19:00', days: [1,2,3,4,5,6,0], enabled: true, label: 'Soir' },
              { time: '12:30', days: [1,3,5], enabled: false, label: 'Pause déj' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
                borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
                opacity: r.enabled ? 1 : 0.55,
              }}>
                <div style={{ flex: 1 }}>
                  <div className="type-mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{r.time}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
                    {['L','M','M','J','V','S','D'].map((d, di) => (
                      <span key={di} style={{
                        width: 18, height: 18, borderRadius: 9,
                        display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700,
                        background: r.days.includes(di === 6 ? 0 : di + 1) ? 'var(--primary-500)' : 'var(--surface-2)',
                        color: r.days.includes(di === 6 ? 0 : di + 1) ? 'white' : 'var(--ink-4)',
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
                <Toggle on={r.enabled} />
              </div>
            ))}
          </div>

          {/* Voice */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="type-h3" style={{ margin: '0 0 14px' }}>Coach vocal</h3>
            <Row label="Voix" value="Camille (FR)" />
            <Slider label="Vitesse" value={1.0} min={0.5} max={2} display="1.0×" />
            <Slider label="Volume" value={0.7} min={0} max={1} display="70 %" />
            <Row label="Bips" trail={<Toggle on />} divider={false} />
          </div>

          {/* Theme */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="type-h3" style={{ margin: '0 0 14px' }}>Apparence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { k: 'light', label: 'Clair', bg: '#ffffff', dotBg: '#0f172a' },
                { k: 'dark', label: 'Sombre', bg: '#0f172a', dotBg: '#f8fafc' },
                { k: 'auto', label: 'Auto', bg: 'linear-gradient(120deg, #ffffff 50%, #0f172a 50%)', dotBg: '#3b82f6' },
              ].map((t, i) => (
                <button key={t.k} style={{
                  background: 'var(--surface)', border: i === 0 ? '2px solid var(--primary-500)' : '1px solid var(--line)',
                  borderRadius: 'var(--radius)', padding: 10, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                }}>
                  <div style={{ width: '100%', height: 40, borderRadius: 6, background: t.bg, position: 'relative' }}>
                    <span style={{ position: 'absolute', bottom: 6, left: 6, width: 14, height: 14, borderRadius: 7, background: t.dotBg }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button className="btn btn-secondary" style={{ justifyContent: 'center', color: '#dc2626', borderColor: 'rgba(220,38,38,0.15)' }}>
            Se déconnecter
          </button>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-5)' }}>FlexiCoach v1.0 · marc@exemple.fr</div>
        </aside>
      </main>
    </div>
  );
};

const BigStat = ({ label, value, unit, mono, hl }) => (
  <div className="card" style={{
    padding: '16px 18px',
    background: hl ? 'linear-gradient(135deg, #fff7ed, #ffedd5)' : 'var(--surface)',
    border: '1px solid ' + (hl ? '#fed7aa' : 'var(--line)'),
  }}>
    <div className="type-label" style={{ color: hl ? '#9a3412' : 'var(--ink-4)', marginBottom: 6 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        fontSize: 28, fontWeight: 700, color: hl ? '#9a3412' : 'var(--ink)',
        letterSpacing: '-0.02em',
      }}>{value}</span>
      {unit && <span style={{ fontSize: 13, color: hl ? '#9a3412' : 'var(--ink-3)' }}>{unit}</span>}
    </div>
  </div>
);

const Row = ({ label, value, trail, divider = true }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
    borderBottom: divider ? '1px solid var(--line)' : 'none'
  }}>
    <span style={{ flex: 1, fontSize: 14, color: 'var(--ink-2)' }}>{label}</span>
    {trail || <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{value} <Icon name="chevR" size={14} /></span>}
  </div>
);

const Slider = ({ label, value, min, max, display }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{label}</span>
        <span className="type-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-600)' }}>{display}</span>
      </div>
      <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary-500)', borderRadius: 2 }} />
        <div style={{
          position: 'absolute', left: `${pct}%`, top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16, height: 16, borderRadius: 8,
          background: 'white', border: '2px solid var(--primary-500)',
          boxShadow: 'var(--shadow-sm)',
        }} />
      </div>
    </div>
  );
};

const Toggle = ({ on }) => (
  <div style={{
    width: 38, height: 22, borderRadius: 11, padding: 2,
    background: on ? 'var(--primary-500)' : 'var(--surface-3, #e2e8f0)',
    transition: 'background 200ms', cursor: 'pointer', flexShrink: 0,
  }}>
    <div style={{
      width: 18, height: 18, borderRadius: 9, background: 'white',
      transform: `translateX(${on ? 16 : 0}px)`, transition: 'transform 200ms',
      boxShadow: 'var(--shadow-sm)',
    }} />
  </div>
);

const SettingsHiFi_Desktop = () => <StatsSettingsShell mobile={false} />;
const SettingsHiFi_Mobile  = () => <StatsSettingsShell mobile={true}  />;
window.SettingsHiFi_Desktop = SettingsHiFi_Desktop;
window.SettingsHiFi_Mobile = SettingsHiFi_Mobile;
