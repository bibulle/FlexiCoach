// FlexiCoach wireframes — Calendar variations

// V1 — "Grille classique colorée"
const CalV1Mobile = () => (
  <>
    <div className="fc-header">
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="avatar">M</div>
    </div>
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
      <span className="sk-arrow">←</span>
      <div className="sk-h lg">Avril 2026</div>
      <span className="sk-arrow">→</span>
    </div>
    <div className="grid-6" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
      {['L','M','M','J','V','S','D'].map((d,i) => <div key={i} className="tiny center muted">{d}</div>)}
    </div>
    <div className="grid-6" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 12 }}>
      {Array.from({length: 35}).map((_, i) => {
        const day = i - 1;
        const status = day < 0 || day > 28 ? 'empty' : (day < 22 ? ['done','done','partial','done','done','miss','done'][day % 7] : day === 22 ? 'today' : 'future');
        const bg = { done: 'var(--calm)', partial: 'var(--warm)', miss: 'var(--paper-2)', today: 'var(--accent)', future: 'transparent', empty: 'transparent' }[status];
        const color = ['done','today'].includes(status) ? 'white' : 'var(--ink)';
        return (
          <div key={i} style={{
            aspectRatio: '1',
            border: status === 'empty' ? 'none' : `1px ${status === 'future' ? 'dashed' : 'solid'} var(--ink)`,
            borderRadius: 4, background: bg, color,
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-hand)', fontSize: 13,
            fontWeight: status === 'today' ? 700 : 400
          }}>{day >= 0 && day < 30 ? day + 1 : ''}</div>
        );
      })}
    </div>
    <div className="stack">
      <div className="row tiny"><span style={{ width: 12, height: 12, background: 'var(--calm)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> complet</div>
      <div className="row tiny"><span style={{ width: 12, height: 12, background: 'var(--warm)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> partiel</div>
      <div className="row tiny"><span style={{ width: 12, height: 12, background: 'var(--paper-2)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> manqué</div>
    </div>
    <div className="fc-bottom-nav">
      <div className="it"><div className="ic"></div>Accueil</div>
      <div className="it active"><div className="ic"></div>Calendrier</div>
      <div className="it"><div className="ic"></div>Routines</div>
      <div className="it"><div className="ic"></div>Profil</div>
    </div>
  </>
);

const CalV1Desktop = () => (
  <>
    <div className="fc-header" style={{ paddingBottom: 12 }}>
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
        <span className="muted">Accueil</span>
        <span className="accent-text" style={{ fontWeight: 700 }}>Calendrier</span>
        <span className="muted">Routines</span>
      </div>
      <div className="avatar">M</div>
    </div>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Avril 2026</div>
        <div className="sk-note">22 jours actifs · 87% d'adhérence</div>
      </div>
      <div className="row"><span className="sk-pill">← mars</span><span className="sk-pill">aujourd'hui</span><span className="sk-pill">mai →</span></div>
    </div>
    <div className="row" style={{ alignItems: 'flex-start', gap: 22 }}>
      <div style={{ flex: 1 }}>
        <div className="grid-6" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
          {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((d,i) => <div key={i} className="tiny center muted">{d}</div>)}
        </div>
        <div className="grid-6" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {Array.from({length: 35}).map((_, i) => {
            const day = i - 1;
            const status = day < 0 || day > 28 ? 'empty' : (day < 22 ? ['done','done','partial','done','done','miss','done'][day % 7] : day === 22 ? 'today' : 'future');
            const bg = { done: 'var(--calm)', partial: 'var(--warm)', miss: 'var(--paper-2)', today: 'var(--accent)', future: 'transparent', empty: 'transparent' }[status];
            const color = ['done','today'].includes(status) ? 'white' : 'var(--ink)';
            return (
              <div key={i} style={{
                aspectRatio: '1',
                border: status === 'empty' ? 'none' : `1.2px ${status === 'future' ? 'dashed' : 'solid'} var(--ink)`,
                borderRadius: 8, background: bg, color,
                padding: 6, position: 'relative',
                fontFamily: 'var(--font-hand)', fontSize: 18,
                fontWeight: status === 'today' ? 700 : 400
              }}>
                {day >= 0 && day < 30 ? day + 1 : ''}
                {status === 'done' && <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 10 }}>15m</span>}
                {status === 'partial' && <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 10 }}>5m</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ width: 220 }}>
        <div className="sk-h md" style={{ marginBottom: 6 }}>Légende</div>
        <div className="stack tiny">
          <div className="row"><span style={{ width: 14, height: 14, background: 'var(--calm)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> Complet</div>
          <div className="row"><span style={{ width: 14, height: 14, background: 'var(--warm)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> Partiel</div>
          <div className="row"><span style={{ width: 14, height: 14, background: 'var(--paper-2)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> Manqué</div>
          <div className="row"><span style={{ width: 14, height: 14, background: 'var(--accent)', border: '1px solid var(--ink)', borderRadius: 3 }}></span> Aujourd'hui</div>
        </div>
        <div style={{ marginTop: 16 }} className="sk-box">
          <div className="sk-h md">Ce mois</div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Sessions</span><b>23</b></div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Minutes</span><b>4h12</b></div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Adhérence</span><b className="accent-text">87%</b></div>
        </div>
      </div>
    </div>
  </>
);

// V2 — "Heatmap GitHub-style annuelle, dense"
const CalV2Mobile = () => (
  <>
    <div className="fc-header">
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="avatar">M</div>
    </div>
    <div className="sk-h lg" style={{ marginBottom: 4 }}>2026</div>
    <div className="sk-note" style={{ marginBottom: 12 }}>164 jours actifs sur 118</div>

    {/* vertical heatmap on mobile : weeks horizontal scroll */}
    <div style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({length: 26}).map((_, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({length: 7}).map((_, d) => {
              const seed = (w * 7 + d) % 11;
              const intensity = seed > 7 ? 0 : seed / 7;
              const bg = intensity === 0 ? 'var(--paper-2)' : `oklch(0.7 0.12 145 / ${0.3 + intensity * 0.7})`;
              return <div key={d} style={{ width: 9, height: 9, background: bg, border: '0.5px solid var(--ink-faint)', borderRadius: 2 }} />;
            })}
          </div>
        ))}
      </div>
    </div>
    <div className="row tiny" style={{ marginTop: 8, gap: 4, color: 'var(--ink-faint)' }}>
      moins
      {[0.2, 0.4, 0.6, 0.8, 1].map((o, i) => (
        <span key={i} style={{ width: 10, height: 10, background: i === 0 ? 'var(--paper-2)' : `oklch(0.7 0.12 145 / ${o})`, border: '0.5px solid var(--ink-faint)', borderRadius: 2 }} />
      ))}
      plus
    </div>

    <div className="sk-box" style={{ marginTop: 12 }}>
      <div className="sk-h md">Cette semaine</div>
      <div className="grid-6" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 6 }}>
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <div key={i} className="center">
            <div className="tiny muted">{d}</div>
            <div style={{ width: '100%', aspectRatio: 1, background: i < 5 ? 'var(--calm)' : i === 5 ? 'var(--accent)' : 'var(--paper-2)', border: '1px solid var(--ink)', borderRadius: 6, marginTop: 4 }}></div>
          </div>
        ))}
      </div>
    </div>

    <div className="sk-box accent" style={{ marginTop: 10 }}>
      <div className="sk-h md">🔥 Série actuelle : 7</div>
      <div className="tiny">Plus que 7 pour battre ton record (14)</div>
    </div>

    <div className="fc-bottom-nav">
      <div className="it"><div className="ic"></div>Accueil</div>
      <div className="it active"><div className="ic"></div>Calendrier</div>
      <div className="it"><div className="ic"></div>Routines</div>
      <div className="it"><div className="ic"></div>Profil</div>
    </div>
  </>
);

const CalV2Desktop = () => (
  <>
    <div className="fc-header" style={{ paddingBottom: 12 }}>
      <div className="logo">flexi<span className="dot">.</span>coach</div>
      <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
        <span className="muted">Accueil</span>
        <span className="accent-text" style={{ fontWeight: 700 }}>Calendrier</span>
        <span className="muted">Routines</span>
      </div>
      <div className="avatar">M</div>
    </div>
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
      <div>
        <div className="sk-h xl">Année 2026</div>
        <div className="sk-note">164 séances · 27h cumulées · meilleur mois : mars</div>
      </div>
      <div className="row"><span className="sk-pill">2025</span><span className="sk-pill solid">2026</span></div>
    </div>

    {/* heatmap year */}
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div className="row" style={{ gap: 8, marginBottom: 6, paddingLeft: 22 }}>
          {['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aou','Sep','Oct','Nov','Déc'].map((m, i) => (
            <div key={i} className="tiny muted" style={{ flex: 1 }}>{m}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
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
                  const bg = future ? 'transparent' : (intensity === 0 ? 'var(--paper-2)' : `oklch(0.7 0.12 145 / ${0.3 + intensity * 0.7})`);
                  return <div key={d} style={{ aspectRatio: 1, background: bg, border: '0.8px solid var(--ink-faint)', borderRadius: 2 }} />;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="row tiny" style={{ marginTop: 10, gap: 4, color: 'var(--ink-faint)', justifyContent:'flex-end' }}>
          moins
          {[0.2, 0.4, 0.6, 0.8, 1].map((o, i) => (
            <span key={i} style={{ width: 11, height: 11, background: i === 0 ? 'var(--paper-2)' : `oklch(0.7 0.12 145 / ${o})`, border: '0.5px solid var(--ink-faint)', borderRadius: 2 }} />
          ))}
          plus
        </div>
      </div>
      <div style={{ width: 220 }} className="stack">
        <div className="sk-box accent">
          <div className="sk-h md">🔥 Série : 7 jours</div>
          <div className="tiny">Record perso : 14 (mars)</div>
        </div>
        <div className="sk-box">
          <div className="sk-h md">Records</div>
          <div className="tiny muted">Plus longue série</div>
          <div className="sk-h md">14 jours</div>
          <div className="tiny muted" style={{ marginTop: 6 }}>Mois le plus actif</div>
          <div className="sk-h md">Mars · 28 j</div>
        </div>
        <div className="sk-box">
          <div className="sk-h md">Mois</div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Avril</span><b>23/30</b></div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Mars</span><b>28/31</b></div>
          <div className="row" style={{ justifyContent:'space-between' }}><span>Février</span><b>22/28</b></div>
        </div>
      </div>
    </div>
  </>
);

// V3 — "Constellation circulaire" : un anneau par mois, gamification forte
const CalV3Mobile = () => {
  const days = Array.from({length: 30}).map((_, i) => i < 22 ? (i % 7 === 5 ? 'miss' : i % 7 === 2 ? 'partial' : 'done') : i === 22 ? 'today' : 'future');
  return (
    <>
      <div className="fc-header">
        <div className="logo">flexi<span className="dot">.</span>coach</div>
        <div className="avatar">M</div>
      </div>
      <div className="center" style={{ margin: '4px 0' }}>
        <div className="sk-h lg">Avril · constellation</div>
        <div className="tiny muted">22 / 30 jours</div>
      </div>
      <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto' }}>
        <svg viewBox="0 0 280 280" width="280" height="280">
          <circle cx="140" cy="140" r="110" fill="none" stroke="var(--ink-faint)" strokeOpacity="0.4" strokeDasharray="2 4" />
          {days.map((s, i) => {
            const angle = (i / 30) * 2 * Math.PI - Math.PI / 2;
            const x = 140 + Math.cos(angle) * 110;
            const y = 140 + Math.sin(angle) * 110;
            const fill = { done: 'var(--calm)', partial: 'var(--warm)', miss: 'var(--paper-2)', today: 'var(--accent)', future: 'transparent' }[s];
            const r = s === 'today' ? 11 : s === 'future' ? 4 : 8;
            return <circle key={i} cx={x} cy={y} r={r} fill={fill} stroke="var(--ink)" strokeWidth={s === 'future' ? 1 : 1.5} strokeDasharray={s === 'future' ? '2 2' : 'none'} />;
          })}
          {/* connecting line through done days */}
          <polyline
            points={days.map((s, i) => {
              if (s === 'future' || s === 'miss') return null;
              const angle = (i / 30) * 2 * Math.PI - Math.PI / 2;
              const x = 140 + Math.cos(angle) * 110;
              const y = 140 + Math.sin(angle) * 110;
              return `${x},${y}`;
            }).filter(Boolean).join(' ')}
            fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.35"
          />
          <text x="140" y="135" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="34" fill="var(--ink)">22</text>
          <text x="140" y="158" textAnchor="middle" fontFamily="var(--font-note)" fontSize="11" fill="var(--ink-faint)">jours actifs</text>
        </svg>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
        <span className="sk-arrow">←</span>
        <div className="sk-note">avril 2026</div>
        <span className="sk-arrow">→</span>
      </div>
      <div className="row tiny" style={{ justifyContent:'center', gap: 10, marginTop: 6 }}>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--calm)', borderRadius: 50, marginRight: 3 }}></span>complet</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--warm)', borderRadius: 50, marginRight: 3 }}></span>partiel</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--accent)', borderRadius: 50, marginRight: 3 }}></span>aujourd'hui</span>
      </div>
      <div className="fc-bottom-nav" style={{ marginTop: 'auto' }}>
        <div className="it"><div className="ic"></div>Accueil</div>
        <div className="it active"><div className="ic"></div>Calendrier</div>
        <div className="it"><div className="ic"></div>Routines</div>
        <div className="it"><div className="ic"></div>Profil</div>
      </div>
    </>
  );
};

const CalV3Desktop = () => {
  const months = [
    { name: 'Jan', count: 24 },
    { name: 'Fév', count: 22 },
    { name: 'Mar', count: 28 },
    { name: 'Avr', count: 22, current: true },
  ];
  return (
    <>
      <div className="fc-header" style={{ paddingBottom: 12 }}>
        <div className="logo">flexi<span className="dot">.</span>coach</div>
        <div className="row" style={{ gap: 16, marginLeft: 24, fontSize: 13 }}>
          <span className="muted">Accueil</span>
          <span className="accent-text" style={{ fontWeight: 700 }}>Calendrier</span>
          <span className="muted">Routines</span>
        </div>
        <div className="avatar">M</div>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 0 14px' }}>
        <div>
          <div className="sk-h xl">Constellations 2026</div>
          <div className="sk-note">Chaque anneau = un mois. Chaque point = un jour.</div>
        </div>
        <span className="sk-pill solid">🔥 série de 7</span>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {months.map((m, mi) => {
          const total = 30;
          const days = Array.from({length: total}).map((_, i) => {
            if (m.current) return i < 22 ? (i % 7 === 5 ? 'miss' : i % 7 === 2 ? 'partial' : 'done') : i === 22 ? 'today' : 'future';
            return i < m.count ? (i % 8 === 0 ? 'partial' : 'done') : 'miss';
          });
          return (
            <div key={mi} className={`sk-box ${m.current ? 'accent' : ''}`} style={{ padding: 12, textAlign: 'center' }}>
              <div className="sk-h md">{m.name}</div>
              <div className="tiny muted" style={{ marginBottom: 6 }}>{m.count} jours</div>
              <svg viewBox="0 0 140 140" width="100%" style={{ maxWidth: 160 }}>
                <circle cx="70" cy="70" r="55" fill="none" stroke="var(--ink-faint)" strokeOpacity="0.3" strokeDasharray="2 3" />
                {days.map((s, i) => {
                  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                  const x = 70 + Math.cos(angle) * 55;
                  const y = 70 + Math.sin(angle) * 55;
                  const fill = { done: 'var(--calm)', partial: 'var(--warm)', miss: 'var(--paper-2)', today: 'var(--accent)', future: 'transparent' }[s];
                  const r = s === 'today' ? 6 : s === 'future' ? 2 : 4;
                  return <circle key={i} cx={x} cy={y} r={r} fill={fill} stroke="var(--ink)" strokeWidth="0.8" />;
                })}
                <text x="70" y="68" textAnchor="middle" fontFamily="var(--font-hand)" fontSize="20" fill="var(--ink)">{m.count}</text>
                <text x="70" y="82" textAnchor="middle" fontFamily="var(--font-note)" fontSize="8" fill="var(--ink-faint)">jours</text>
              </svg>
            </div>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 18, gap: 14 }}>
        <div className="sk-box" style={{ flex: 1, padding: 12 }}>
          <div className="sk-h md">Records de l'année</div>
          <div className="grid-3" style={{ marginTop: 8 }}>
            <div><div className="sk-h lg accent-text">14</div><div className="tiny muted">+ longue série</div></div>
            <div><div className="sk-h lg">96</div><div className="tiny muted">jours actifs</div></div>
            <div><div className="sk-h lg">87%</div><div className="tiny muted">adhérence moy.</div></div>
          </div>
        </div>
        <div className="sk-box" style={{ flex: 1, padding: 12 }}>
          <div className="sk-h md">Légende</div>
          <div className="row tiny" style={{ gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--calm)', borderRadius: 50, marginRight: 4, verticalAlign: 'middle' }}></span>complet</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--warm)', borderRadius: 50, marginRight: 4, verticalAlign: 'middle' }}></span>partiel</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--paper-2)', border: '1px solid var(--ink)', borderRadius: 50, marginRight: 4, verticalAlign: 'middle' }}></span>manqué</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 50, marginRight: 4, verticalAlign: 'middle' }}></span>aujourd'hui</span>
          </div>
        </div>
      </div>
    </>
  );
};

window.CalV1Mobile = CalV1Mobile;
window.CalV1Desktop = CalV1Desktop;
window.CalV2Mobile = CalV2Mobile;
window.CalV2Desktop = CalV2Desktop;
window.CalV3Mobile = CalV3Mobile;
window.CalV3Desktop = CalV3Desktop;
