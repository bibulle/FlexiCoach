# Tests - FlexiCoach

## Statut des tests

### ✅ Tests qui passent

**Frontend** : Tous les tests passent (235 tests, 3 skipped)
- Auth tests : OK
- Component tests : OK (calendar, completion, login, signup, routine-player, routine-list, routine-editor, etc.)
- Service tests : OK (auth.service, session.service, stats.service, sw-update.service)
- Guard/Interceptor tests : OK (auth.guard, auth.interceptor)

**Backend** : Tous les tests passent (151 tests)
- ✅ AuthService (8 tests)
- ✅ AuthController tests : OK
- ✅ AdminGuard tests : OK
- ✅ RoutinesService (19 tests) - Tests avec mocks
- ✅ RoutinesController tests : OK
- ✅ UsersService (15 tests) - Tests avec mocks
- ✅ UsersController tests : OK
- ✅ SessionsService (26 tests) - Tests avec mocks
- ✅ SessionsController tests : OK
- ✅ AdminService tests : OK
- ✅ AdminController tests : OK
- ✅ AllExceptionsFilter tests : OK
- ✅ HttpLoggerMiddleware tests : OK
- ✅ AppService/AppController tests : OK

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

### Tests E2E

```bash
# Tests E2E backend (nécessite backend en cours d'exécution)
npm run test:e2e:backend

# Tests E2E frontend (Playwright)
npm run test:e2e:frontend

# Tous les tests (unitaires + E2E)
npm run test:all
```

### Tests E2E complets (production)

Pour tester l'application complète en mode production avec MongoDB local :

```bash
./test-e2e-local.sh
```

Ce script :
- ✅ Vérifie que MongoDB est installé (Homebrew)
- ✅ Nettoie la base de données
- ✅ Build le backend et le frontend en mode production
- ✅ Démarre le backend sur le port 3000
- ✅ Exécute tous les tests automatiques
- ✅ Crée un utilisateur admin
- ✅ Charge les routines de test

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
    └── stats.spec.ts                 # E2E statistics
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
  baseURL: 'http://localhost:4200',
  testDir: './src',
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
}
```

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
