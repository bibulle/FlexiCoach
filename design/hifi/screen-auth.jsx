// FlexiCoach Hi-Fi — Login + Signup

const AuthShell = ({ mode, mobile }) => {
  const isLogin = mode === 'login';
  return (
    <div style={{
      minHeight: '100%', background: 'var(--surface-2)',
      display: 'flex', flexDirection: 'column',
      padding: mobile ? '36px 22px 24px' : '0',
    }}>
      {!mobile && (
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: 720,
        }}>
          {/* Left brand panel */}
          <div style={{
            background: 'linear-gradient(160deg, var(--primary-700) 0%, var(--primary-500) 60%, #0e7490 100%)',
            color: 'white',
            padding: '60px 56px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 10%, rgba(255,255,255,0.18), transparent 50%)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', color: 'var(--primary-600)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>F</div>
                FlexiCoach
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 18px', color: 'white' }}>
                Garde ton dos en mouvement.
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.9, margin: 0, maxWidth: 420 }}>
                Routines guidées de 5 à 15 minutes, séries quotidiennes, suivi visuel sur l'année. Construit avec un kiné.
              </p>
              <div style={{ marginTop: 32, display: 'flex', gap: 24, fontSize: 13 }}>
                {[['12 routines', 'curées'], ['Voix FR', 'guidée'], ['Hors-ligne', 'PWA']].map(([a,b]) => (
                  <div key={a}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18 }}>{a}</div>
                    <div style={{ opacity: 0.7 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', fontSize: 12, opacity: 0.6 }}>v1.0 · MVP</div>
          </div>
          {/* Right form */}
          <div style={{ display: 'grid', placeItems: 'center', padding: '60px 56px' }}>
            <AuthForm isLogin={isLogin} />
          </div>
        </div>
      )}
      {mobile && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18, marginBottom: 28, color: 'var(--ink)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14 }}>F</div>
            FlexiCoach
          </div>
          <h1 className="type-h1" style={{ marginTop: 0, marginBottom: 6 }}>
            {isLogin ? 'Bon retour.' : 'Crée ton compte.'}
          </h1>
          <p className="type-body" style={{ color: 'var(--ink-3)', marginTop: 0, marginBottom: 28 }}>
            {isLogin ? 'Reprends ta série là où tu l\'as laissée.' : 'Trois minutes pour démarrer ta première routine.'}
          </p>
          <AuthForm isLogin={isLogin} mobile />
        </>
      )}
    </div>
  );
};

const AuthForm = ({ isLogin, mobile }) => (
  <div style={{ width: '100%', maxWidth: 380 }}>
    {!mobile && (
      <>
        <h1 className="type-h1" style={{ marginTop: 0, marginBottom: 6 }}>
          {isLogin ? 'Bon retour.' : 'Crée ton compte.'}
        </h1>
        <p className="type-body" style={{ color: 'var(--ink-3)', marginTop: 0, marginBottom: 32 }}>
          {isLogin ? 'Reprends ta série là où tu l\'as laissée.' : 'Trois minutes pour démarrer ta première routine.'}
        </p>
      </>
    )}

    {/* Google button */}
    <button className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M16.51 8.18c0-.59-.05-1.16-.15-1.71H8.85v3.24h4.29c-.18 1-.74 1.85-1.59 2.41v2h2.57c1.5-1.39 2.39-3.43 2.39-5.94z"/>
        <path fill="#34A853" d="M8.85 16.5c2.16 0 3.97-.72 5.29-1.94l-2.57-2c-.71.48-1.62.76-2.72.76-2.09 0-3.87-1.41-4.5-3.31H1.7v2.07c1.32 2.62 4.04 4.42 7.15 4.42z"/>
        <path fill="#FBBC04" d="M4.35 10.01c-.16-.48-.25-.99-.25-1.51s.09-1.03.25-1.51V4.92H1.7C1.16 5.99.85 7.21.85 8.5s.31 2.51.85 3.58l2.65-2.07z"/>
        <path fill="#EA4335" d="M8.85 3.68c1.18 0 2.24.41 3.07 1.2l2.28-2.28C12.81 1.32 11 .5 8.85.5 5.74.5 3.02 2.3 1.7 4.92l2.65 2.07c.63-1.9 2.41-3.31 4.5-3.31z"/>
      </svg>
      Continuer avec Google
    </button>

    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--ink-4)', fontSize: 12 }}>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      OU
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>

    {!isLogin && (
      <AuthField label="Prénom" placeholder="Marc" />
    )}
    <AuthField label="Email" placeholder="marc@exemple.fr" />
    <AuthField label="Mot de passe" placeholder="••••••••" type="password"
      hint={isLogin ? <a style={{ color: 'var(--primary-600)', fontSize: 12, textDecoration: 'none' }}>Oublié ?</a> : null} />

    {!isLogin && (
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 22px', cursor: 'pointer' }}>
        <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
        <span>J'accepte les <a style={{ color: 'var(--primary-600)' }}>conditions</a> et la politique de confidentialité.</span>
      </label>
    )}

    <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: isLogin ? 8 : 0, marginBottom: 18 }}>
      {isLogin ? 'Se connecter' : 'Créer mon compte'}
    </button>

    <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
      {isLogin ? 'Nouveau ici ? ' : 'Déjà un compte ? '}
      <a style={{ color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
        {isLogin ? 'Crée un compte' : 'Connecte-toi'}
      </a>
    </p>
  </div>
);

const AuthField = ({ label, placeholder, type = 'text', hint }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{label}</label>
      {hint}
    </div>
    <input className="input" type={type} placeholder={placeholder} style={{ width: '100%' }} />
  </div>
);

const LoginHiFi_Desktop  = () => <AuthShell mode="login"  mobile={false} />;
const LoginHiFi_Mobile   = () => <AuthShell mode="login"  mobile={true}  />;
const SignupHiFi_Desktop = () => <AuthShell mode="signup" mobile={false} />;
const SignupHiFi_Mobile  = () => <AuthShell mode="signup" mobile={true}  />;

window.LoginHiFi_Desktop = LoginHiFi_Desktop;
window.LoginHiFi_Mobile = LoginHiFi_Mobile;
window.SignupHiFi_Desktop = SignupHiFi_Desktop;
window.SignupHiFi_Mobile = SignupHiFi_Mobile;
