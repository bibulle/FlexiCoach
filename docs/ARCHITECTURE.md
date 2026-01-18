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
├── prototype/                # Prototype HTML/CSS/JS original
│
├── routines/                 # Données JSON des routines
│   ├── douce-10min.json
│   └── bureau-5min.json
│
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # Ce fichier
│   ├── SPECIFICATION.md      # Spécification fonctionnelle
│   └── MIGRATION.md          # Plan de migration
│
├── Dockerfile                # Build multi-stage
├── docker-test.sh            # Script de test Docker
└── .github/workflows/        # CI/CD GitHub Actions
```

## Stack technique

### Backend (NestJS)
- **Framework**: NestJS 11 (TypeScript)
- **Base de données**: MongoDB 8.0.1 avec Mongoose 8.19
- **Authentification**: JWT (Passport strategy)
- **Validation**: class-validator, class-transformer
- **Sécurité**: bcrypt (hachage mots de passe)

### Frontend (Angular)
- **Framework**: Angular 20.3 (standalone components)
- **Build**: Vite via Nx
- **Tests**: Vitest
- **État**: Services Angular + RxJS + Signals
- **UI**: SASS avec CSS Custom Properties
- **Voice**: Web Speech API (français)
- **Audio**: Web Audio API (bips de secours)

### Monorepo (Nx)
- **Version**: Nx 22.0.2
- **Workspace**: Integrated monorepo
- **Shared**: `@flexicoach/shared` pour les modèles TypeScript

### DevOps
- **Containerisation**: Docker (multi-stage build)
- **CI/CD**: GitHub Actions
- **Registry**: Docker Hub
- **Déploiement**: Kubernetes (GitOps)

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
- `GET /api/sessions/stats/summary` - Stats détaillées (streaks, adhérence)
- `GET /api/sessions/calendar` - Données calendrier

### Utilisateurs
- `GET /api/users/:id` - Profil utilisateur

### Administration
- `GET /api/admin/users` - Liste utilisateurs (admin)
- `PATCH /api/admin/password` - Reset mot de passe (admin)

## Contrôle d'accès et autorisation

### Frontend
- **Authentification**: Contrôlée par `authGuard` sur les routes protégées
- **Administration**: Les éléments UI admin (création/édition de routines) sont conditionnés par `authService.isAdmin()` signal
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
- Guide Docker : `DOCKER.md`
- Prototype fonctionnel : `prototype/`
