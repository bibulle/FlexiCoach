# Architecture FlexiCoach

## Vue d'ensemble

Application PWA full-stack pour coaching d'exercices de dos avec suivi quotidien.

## Structure du projet

```
flexicoach/
├── apps/
│   ├── backend/              # API NestJS
│   │   └── src/
│   │       ├── auth/         # Authentification JWT (Passport)
│   │       ├── admin/        # Gestion admin (users, passwords)
│   │       ├── users/        # Profils utilisateurs
│   │       ├── routines/     # CRUD routines
│   │       ├── sessions/     # Enregistrement séances + stats
│   │       ├── schemas/      # Schémas MongoDB/Mongoose
│   │       └── scripts/      # Scripts utilitaires (seed)
│   │
│   ├── frontend/             # Application Angular
│   │   └── src/
│   │       ├── app/
│   │       │   ├── components/   # Composants standalone
│   │       │   │   ├── routine-list/
│   │       │   │   ├── routine-player/
│   │       │   │   ├── completion/
│   │       │   │   ├── calendar/
│   │       │   │   ├── stats/
│   │       │   │   ├── login/
│   │       │   │   ├── signup/
│   │       │   │   └── admin/
│   │       │   └── services/     # Services HTTP
│   │       └── styles.sass       # Styles globaux
│   │
│   ├── backend-e2e/          # Tests e2e backend (Jest)
│   └── frontend-e2e/         # Tests e2e frontend (Playwright)
│
├── libs/
│   └── shared/               # Bibliothèque partagée
│       └── src/lib/models.ts # Interfaces TypeScript
│
├── routines/                 # Données JSON des routines
│   ├── douce-10min.json
│   └── bureau-5min.json
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # Ce fichier
│   ├── SPECIFICATION.md      # Spécification fonctionnelle
│   └── google-oauth-setup.md # Configuration OAuth Google
│
├── Dockerfile                # Build multi-stage
├── docker-test.sh            # Test local de l'image Docker
├── release-please-config.json # Versions & CHANGELOG automatiques
└── .github/workflows/        # CI/CD : build-and-publish (tests, e2e, build Docker de vérification sur les PR),
                              #         release (release-please, image VX.Y.Z + GitOps), docker (réutilisable)
```

## Stack technique

### Backend (NestJS)
- **Framework**: NestJS 11.2 (TypeScript 6)
- **Base de données**: MongoDB 8 avec Mongoose 9.11
- **Authentification**: JWT (Passport strategy)
- **Validation**: class-validator, class-transformer
- **Sécurité**: bcrypt (hachage mots de passe), helmet (en-têtes HTTP et CSP en production : `script-src 'self'`, aucun `<script>` inline autorisé)

### Frontend (Angular)
- **Framework**: Angular 22.2 (standalone components)
- **Build**: Vite via Nx
- **Tests**: Vitest 4 (unitaires), Playwright (e2e)
- **État**: Services Angular + RxJS + Signals
- **UI**: SASS avec CSS Custom Properties ; styles globaux dans `styles.sass`, chargés par un `<link>` classique (l'inlining du CSS critique est désactivé en production, son script inline serait bloqué par la CSP)
- **Voice**: Web Speech API (français)
- **Audio**: Web Audio API (bips de secours)

### Monorepo (Nx)
- **Version**: Nx 23.3
- **Workspace**: Integrated monorepo
- **Shared**: `@flexicoach/shared` pour les modèles TypeScript et la règle de mot de passe

### DevOps
- **Containerisation**: Docker (multi-stage build)
- **CI/CD**: GitHub Actions (tests unitaires + e2e, image Docker)
- **Versions**: release-please (Conventional Commits → Release PR → tag `vX.Y.Z` + CHANGELOG)
- **Registry**: Docker Hub (`:VX.Y.Z` + `:latest` à chaque release uniquement ; rien n'est publié au merge sur `main`)
- **Déploiement**: Kubernetes (GitOps, mis à jour à chaque release)

## Architecture des données

### User
```typescript
{
  _id: ObjectId,
  email: string,
  password: string,          // bcrypt hash
  displayName?: string,
  timezone?: string,
  settings?: {
    theme: 'light' | 'dark',
    voiceEnabled: boolean,
    notificationsEnabled: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Routine
```typescript
{
  _id: ObjectId,
  slug: string,              // URL-friendly identifier
  name: string,
  description?: string,
  steps: Step[],
  totalSeconds: number,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  visibility: 'builtIn' | 'user',
  ownerId?: ObjectId
}
```

### Step
```typescript
{
  name: string,
  seconds: number,
  mode: 'mouvement' | 'statique' | 'respiration',
  text: string,
  cues?: Array<{
    at: number,              // secondes depuis début
    say: string              // texte à annoncer
  }>
}
```

### Session
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  routineId: ObjectId,
  startedAt: Date,
  completedAt?: Date,
  durationSeconds: number,
  completed: boolean,
  feeling?: number           // 1-5 étoiles
}
```

## API REST

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion (retourne JWT)
- `GET /api/auth/is-admin` - Vérifier statut admin

### Routines
- `GET /api/routines` - Liste des routines
- `GET /api/routines/:slug` - Routine par slug
- `GET /api/routines/:id` - Routine par ID

### Sessions
- `POST /api/sessions` - Créer une session
- `GET /api/sessions` - Liste (filtrable par userId)
- `GET /api/sessions/:id` - Détails session
- `PATCH /api/sessions/:id/complete` - Marquer complétée + feeling
- `GET /api/sessions/stats` - Stats basiques
- `GET /api/sessions/stats/summary?tz=<fuseau IANA>` - Stats détaillées (streaks, adhérence) + activité des
  30 derniers jours : `recentSessions`, `weekdayActivity` (lundi → dimanche, dans le fuseau `tz`, UTC par défaut)
  et `topRoutines` (3 au plus). Calculé en mémoire par `SessionsService.getSummary()` à partir des sessions de
  l'utilisateur déjà chargées pour les autres indicateurs ; alimente les blocs « Activité par jour de la semaine »
  et « Top routines » de la page Paramètres (`StatsComponent`), qui affichent un état vide sans séance.
- `GET /api/sessions/calendar` - Données calendrier

### Utilisateurs
- `GET /api/users/:id` - Profil utilisateur
- `PATCH /api/users/me/password` - Changer son mot de passe

### Administration
- `GET /api/admin/users` - Liste utilisateurs (admin)
- `PATCH /api/admin/users/:userId/password` - Reset mot de passe d'un utilisateur (admin)

### Règle de mot de passe (partagée front/back)

Définie une seule fois dans `libs/shared/src/lib/password-policy.ts` : 8 caractères minimum,
au moins une majuscule, une minuscule et un chiffre.

| Parcours | Backend (DTO, `@IsValidPassword()`) | Frontend |
|---|---|---|
| Inscription `POST /api/auth/register` | `RegisterDto.password` | `SignupComponent` + `passwordPolicyValidator` |
| Changement `PATCH /api/users/me/password` | `UpdatePasswordDto.newPassword` | (pas d'écran à ce jour) |
| Reset admin `PATCH /api/admin/users/:userId/password` | `ResetPasswordDto.newPassword` | modale de `AdminComponent` |

Le backend importe la règle à l'exécution : webpack l'embarque dans `main.js` (aucune dépendance npm
supplémentaire). Côté tests frontend, l'alias `@flexicoach/shared` est déclaré dans `apps/frontend/vite.config.mts`.
Les erreurs de validation de l'API (`message` sous forme de tableau) sont mises en forme par
`apps/frontend/src/app/utils/api-error.ts`.

## Contrôle d'accès et autorisation

### Frontend
- **Authentification**: Contrôlée par `authGuard` sur les routes protégées
- **Statut admin**: fourni par `GET /api/auth/is-admin`. `AuthService.resolveAdminStatus()` renvoie un `Observable<boolean>`
  partagé et mis en cache pour la session (une seule requête pour `AppComponent` et le guard ; un échec n'est pas mis
  en cache), et met à jour le signal `isAdmin`. Le cache est vidé à la connexion et à la déconnexion.
- **Route `/admin`**: protégée par `adminGuard`, qui **attend** la réponse de `resolveAdminStatus()` — un administrateur
  peut donc ouvrir `/admin` directement ou recharger la page. Non connecté → `/login` ; connecté non-admin → `/`.
- **Mode administration**: bascule du menu utilisateur (visible si `isAdmin()`), signal `isAdminMode` conservé dans
  `sessionStorage` (clé `admin_mode`) : il survit au rechargement, est propre à l'onglet, et est effacé à la
  déconnexion ou si le backend répond que l'utilisateur n'est pas admin. Il conditionne les éléments UI admin
  (lien « Admin » du header, création/édition de routines). `/admin` reste accessible à un admin même mode OFF.
- **Masquage UI**: Les utilisateurs non-admin ne voient pas les boutons "Nouvelle routine", "Éditer", "Supprimer"

### Backend
- **Protection API**: Endpoints admin protégés par décorateurs/guards
- **Validation stricte**: `forbidNonWhitelisted: true` sur ValidationPipe pour rejeter les champs non autorisés
- **Rôles**: Seuls les administrateurs peuvent créer/modifier/supprimer des routines

## Tests

### Frontend (Vitest)
- Tests unitaires des composants
- 11 fichiers de specs
- Mode watch pour développement

### Backend E2E (Jest)
- Tests d'intégration API
- 28+ tests couvrant auth, routines, sessions
- Nécessite backend en cours d'exécution

## Déploiement

### Docker
Le Dockerfile utilise un build multi-stage :
1. **Builder**: Compile frontend (Angular) et backend (NestJS) avec Nx
2. **Production**: Image minimale avec uniquement les dépendances de production

### Production
- Le backend NestJS sert l'API sur `/api/*`
- Le frontend Angular est servi comme fichiers statiques depuis `/`
- Conteneur unique pour simplifier le déploiement

## Fonctionnalités implémentées

- ✅ Liste et lecture des routines
- ✅ Timer avec annonces vocales (Web Speech API)
- ✅ Enregistrement des sessions
- ✅ Authentification JWT (login/signup)
- ✅ Statistiques (streaks, temps total, adhérence)
- ✅ Calendrier mensuel
- ✅ Administration utilisateurs
- ✅ Docker + CI/CD

## Fonctionnalités planifiées

- 📋 PWA offline (Service Worker, IndexedDB, Background Sync)
- 📋 Page de paramètres (profil, préférences voix)
- 📋 Notifications de rappel (Web Push)
- 📋 Mode sombre
- 📋 Éditeur de routine visuel (V2)
- 📋 Import/Export JSON (V2)
- 📋 Partage de routines (V2)

## Références

- Spécification complète : `docs/SPECIFICATION.md`
- Tests : `TESTING.md`
- Versions et releases : `README.md` (section « Versions et releases ») et `CHANGELOG.md`
