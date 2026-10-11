# Tests - FlexiCoach

## Statut des tests

| Suite | Outil | Tests | Lancée en CI |
|---|---|---|---|
| Unitaires backend | Jest | 224 | ✅ job `test` |
| Unitaires frontend | Vitest | 474 | ✅ job `test` |
| E2E backend (API) | Jest + axios | 77 | ✅ job `e2e` |
| E2E frontend (UI) | Playwright (Chromium) | 59 | ✅ job `e2e` |

Aucun test n'est ignoré (`skip`, `xit`, `fixme`…).

### Architecture des tests

Les tests des services backend (RoutinesService, UsersService, SessionsService) utilisent des mocks Mongoose au lieu de MongoDB Memory Server. Cette approche :
- ✅ Fonctionne sur toutes les architectures (ARM64/Apple Silicon, x86_64)
- ✅ Est plus rapide à exécuter
- ✅ Isole les tests unitaires des dépendances externes
- ✅ Suit les meilleures pratiques de tests unitaires

Les tests d'intégration avec une vraie base de données sont couverts par les tests E2E.

## Commandes de test

### Tests unitaires

```bash
# Tous les tests unitaires
npm run test

# Tests unitaires backend uniquement
npm run test:backend

# Tests unitaires frontend uniquement
npm run test:frontend

# Mode watch (développement)
npm run test:watch:backend
npm run test:watch:frontend

# Avec couverture de code
npm run test:cov:backend
npm run test:cov:frontend
```

> ℹ️ Nx injecte le `.env` de la racine dans les tâches. `apps/frontend/.env.test` force `NODE_ENV=test`
> pour la cible `test` du frontend : avec `NODE_ENV=production` dans le `.env` local,
> `src/build-config.spec.ts` échoue avec `Cannot find package 'node:'`.

### Tests E2E

Les E2E tournent contre un **vrai backend** et une **vraie base MongoDB**.

**Prérequis**

1. MongoDB démarré (local ou `docker run -d -p 27017:27017 mongo:8`).
2. Backend lancé avec le rate limiting désactivé : l'inscription est limitée à 3 requêtes/heure, or chaque suite crée ses propres utilisateurs.
   ```bash
   npx nx build backend
   THROTTLE_DISABLED=true node dist/apps/backend/main.js
   ```
   ⚠️ `THROTTLE_DISABLED=true` est réservé aux tests : ne jamais le définir en production.
3. Navigateur Playwright installé (une fois, et après chaque mise à jour de `@playwright/test`) :
   ```bash
   npx playwright install chromium
   ```
   Sans lui : `Executable doesn't exist at …/ms-playwright/chromium_headless_shell-XXXX`.
4. Pour les tests admin du frontend : `admin@example.com` doit figurer dans `ADMIN_EMAILS` du backend
   (ou définir `E2E_ADMIN_EMAIL` avec un email présent dans `ADMIN_EMAILS`). Le compte est créé au premier lancement
   avec le mot de passe `Password123`.

```bash
# E2E backend (API) — le backend doit tourner sur http://localhost:3000
npm run test:e2e:backend

# E2E frontend (Playwright / Chromium) — Playwright démarre lui-même le frontend (nx serve)
# MONGODB_URI doit pointer vers la base du backend : les routines intégrées
# (douce-10min, bureau-5min) y sont insérées/mises à jour avant les tests.
MONGODB_URI=mongodb://localhost:27017/flexicoach npm run test:e2e:frontend

# Tous les tests (unitaires + E2E)
npm run test:all
```

Bonnes pratiques suivies par les suites E2E :
- chaque test crée ses propres utilisateurs (emails uniques) : les suites sont indépendantes, rejouables
  sur une base existante et parallélisables ;
- l'authentification UI est simulée en injectant le JWT dans `localStorage` (sauf pour les tests du parcours
  de connexion/inscription eux-mêmes) ;
- aucune donnée existante n'est supprimée (les routines intégrées sont mises à jour par *upsert*).

> Note Linux sans locale UTF-8 : Chromium remplace les noms de fichiers accentués des téléchargements par
> `download`. Lancer les E2E avec `LANG=C.UTF-8` (c'est le cas par défaut sur les runners GitHub).

## Structure des tests

```
apps/
├── backend/src/
│   ├── auth/
│   │   ├── auth.service.spec.ts      # Tests auth service
│   │   ├── auth.controller.spec.ts   # Tests auth controller
│   │   └── admin.guard.spec.ts       # Tests admin guard
│   ├── routines/
│   │   ├── routines.service.spec.ts  # Tests routines (mocks)
│   │   └── routines.controller.spec.ts
│   ├── sessions/
│   │   ├── sessions.service.spec.ts  # Tests sessions (mocks)
│   │   └── sessions.controller.spec.ts
│   ├── users/
│   │   ├── users.service.spec.ts     # Tests users (mocks)
│   │   └── users.controller.spec.ts
│   ├── admin/
│   │   ├── admin.service.spec.ts
│   │   └── admin.controller.spec.ts
│   ├── app/
│   │   ├── app.service.spec.ts
│   │   └── app.controller.spec.ts
│   └── common/
│       ├── filters/all-exceptions.filter.spec.ts
│       └── middleware/http-logger.middleware.spec.ts
├── backend-e2e/src/backend/
│   ├── auth.spec.ts                  # E2E auth
│   ├── users.spec.ts                 # E2E users
│   ├── sessions.spec.ts              # E2E sessions
│   ├── routines.spec.ts              # E2E routines
│   ├── routines-editor.spec.ts       # E2E routine editing
│   └── backend.spec.ts               # E2E général
├── backend-e2e/src/support/           # global setup/teardown, auth-helper.ts
├── frontend/src/app/
│   ├── components/
│   │   ├── calendar/calendar.component.spec.ts
│   │   ├── completion/completion.component.spec.ts
│   │   ├── login/login.component.spec.ts
│   │   ├── signup/signup.component.spec.ts
│   │   ├── routine-player/routine-player.component.spec.ts
│   │   ├── routine-list/routine-list.component.spec.ts
│   │   ├── routine-editor/routine-editor.component.spec.ts
│   │   └── ... (13 component tests)
│   └── services/
│       ├── auth.service.spec.ts
│       ├── session.service.spec.ts
│       ├── stats.service.spec.ts
│       └── sw-update.service.spec.ts
└── frontend-e2e/src/
    ├── auth.spec.ts                  # E2E auth flows
    ├── navigation.spec.ts            # E2E navigation
    ├── routines.spec.ts              # E2E routines
    ├── admin.spec.ts                 # E2E admin panel
    ├── stats.spec.ts                 # E2E statistics
    └── support/                      # helpers.ts, global-setup.ts (seed)
```

## Comment tester manuellement

### 1. Backend

```bash
# Démarrer le backend
npx nx serve backend

# Le backend démarre sur http://localhost:3000
```

### 2. Frontend

```bash
# Démarrer le frontend
npx nx serve frontend

# Le frontend démarre sur http://localhost:4200
```

### 3. Test OAuth

1. Configurer Google OAuth (voir `docs/google-oauth-setup.md`)
2. Aller sur http://localhost:4200/login
3. Cliquer sur "Se connecter avec Google"
4. Vérifier la redirection vers Google
5. Autoriser l'application
6. Vérifier la redirection vers l'app avec session active
7. Vérifier que l'avatar Google s'affiche dans le menu utilisateur

### 4. Test de liaison automatique de compte

1. Créer un compte avec email/password
2. Se déconnecter
3. Se connecter avec Google en utilisant le même email
4. Vérifier que le compte est lié
5. Vérifier que l'avatar Google est maintenant affiché
6. Se déconnecter et se reconnecter avec email/password → devrait fonctionner
7. Se déconnecter et se reconnecter avec Google → devrait fonctionner

## Configuration des tests

### Backend (Jest)

```typescript
// apps/backend/jest.config.ts
{
  displayName: 'backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Frontend (Vitest)

```typescript
// apps/frontend/vite.config.mts
{
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.{test,spec}.{js,ts,tsx}']
  }
}
```

### Frontend E2E (Playwright)

```typescript
// apps/frontend-e2e/playwright.config.ts
{
  baseURL: 'http://localhost:4200',          // ou BASE_URL
  testDir: './src',
  globalSetup: './src/support/global-setup.ts', // seed des routines intégrées
  webServer: { command: 'npx nx run frontend:serve', reuseExistingServer: true },
  projects: [{ name: 'chromium' }, { name: 'firefox' }, { name: 'webkit' }]
}
```

`npm run test:e2e:frontend` et la CI ne lancent que le projet `chromium`
(`npx playwright install --with-deps chromium`). Helpers partagés : `apps/frontend-e2e/src/support/helpers.ts`.

### Backend E2E (Jest)

`apps/backend-e2e/src/support/auth-helper.ts` fournit `registerUser()` (utilisateur unique + JWT),
`authHeaders()` et `errorMessage()`. Le `globalTeardown` n'arrête le backend (port 3000) que pour la cible
`e2e` (qui le démarre elle-même), jamais pour `e2e-dev`.

## Couverture de code

Les seuils de couverture sont configurés à 80% pour le backend :
- branches: 80%
- functions: 80%
- lines: 80%
- statements: 80%

Pour générer les rapports de couverture :

```bash
# Backend
npm run test:cov:backend
# Rapport dans: coverage/apps/backend/

# Frontend
npm run test:cov:frontend
# Rapport dans: coverage/apps/frontend/
```
