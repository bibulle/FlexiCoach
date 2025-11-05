# Architecture Coach Dos

## Vue d'ensemble

Application PWA full-stack pour coaching d'exercices de dos avec suivi quotidien.

## Structure du projet

```
coach-dos/
├── prototype/              # Prototype PWA vanilla (HTML/CSS/JS)
│   ├── index.html         # Hub principal
│   ├── app.js             # Logic app
│   ├── assets/            # CSS et JS communs
│   ├── data/              # ProgressManager
│   ├── routines/          # Routines HTML individuelles
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service Worker
│
├── backend/               # API NestJS (à créer)
│   ├── src/
│   │   ├── auth/          # Module authentification (JWT)
│   │   ├── users/         # Gestion utilisateurs
│   │   ├── routines/      # CRUD routines
│   │   ├── sessions/      # Enregistrement séances
│   │   ├── calendar/      # Agrégation par jour
│   │   ├── stats/         # Statistiques et streaks
│   │   └── sync/          # Endpoint offline-first
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/              # Application Angular (à créer)
│   ├── src/
│   │   ├── app/
│   │   │   ├── coach/             # CoachComponent JSON-driven
│   │   │   ├── calendar/          # CalendarComponent
│   │   │   ├── stats/             # StatsComponent
│   │   │   ├── settings/          # SettingsComponent
│   │   │   ├── reminders/         # RemindersComponent
│   │   │   └── core/              # Services partagés
│   │   ├── assets/
│   │   ├── environments/
│   │   └── manifest.webmanifest
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                # Code partagé (à créer)
│   ├── models/            # Interfaces TypeScript
│   │   ├── user.model.ts
│   │   ├── routine.model.ts
│   │   ├── session.model.ts
│   │   └── step.model.ts
│   └── utils/             # Utilitaires communs
│
└── docs/                  # Documentation
    ├── ARCHITECTURE.md    # Ce fichier
    └── MIGRATION.md       # Plan de migration
```

## Stack technique

### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (Passport)
- **API**: REST + endpoints de synchronisation offline
- **Notifications**: Web Push (VAPID)

### Frontend (Angular)
- **Framework**: Angular 18+
- **PWA**: Service Worker (Workbox)
- **État**: Services Angular + RxJS
- **Offline**: IndexedDB + Background Sync
- **UI**: CSS Custom Properties (design system existant)
- **Voice**: Web Speech API (français)

### Shared
- **Langage**: TypeScript
- **Models**: Interfaces partagées backend/frontend
- **Validation**: Class-validator compatible

## Architecture des données

### User
```typescript
{
  _id: ObjectId,
  email?: string,
  displayName?: string,
  tz: string,
  settings: {
    theme: 'light' | 'dark',
    voiceRate: number,
    voicePitch: number,
    sound: boolean,
    reminders: Array<{
      hh: string,
      mm: string,
      days: number[],
      enabled: boolean
    }>
  }
}
```

### Routine
```typescript
{
  _id: ObjectId,
  slug: string,
  name: string,
  description?: string,
  steps: Step[],
  totalSeconds: number,
  version: number,
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
    at: number,
    say: string
  }>
}
```

### Session
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  routineId: ObjectId,
  startAt: Date,
  endAt: Date,
  durationSec: number,
  completed: boolean,
  progress?: number
}
```

### DailySummary
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  date: string, // 'YYYY-MM-DD'
  routines: Array<{
    routineId: ObjectId,
    completed: boolean,
    durationSec: number
  }>,
  totalSec: number,
  streakAfter: number
}
```

## API REST

### Authentication
- `POST /auth/signup` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Refresh token

### Routines
- `GET /routines` - Liste routines (built-in + user)
- `GET /routines/:id` - Détails routine
- `POST /routines` - Créer routine
- `PUT /routines/:id` - Modifier routine
- `DELETE /routines/:id` - Supprimer routine

### Sessions
- `POST /sessions/start` - Démarrer séance
- `POST /sessions/:id/tick` - Update progression (optionnel)
- `POST /sessions/:id/finish` - Terminer séance

### Calendar
- `GET /calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` - Données calendrier

### Stats
- `GET /stats/summary?range=30d` - Statistiques (streaks, temps total)

### Settings
- `GET /settings` - Paramètres utilisateur
- `PUT /settings` - Modifier paramètres

### Sync (offline-first)
- `POST /sync` - Synchroniser events offline (start/finish)

## Stratégie offline-first

### Frontend
1. **IndexedDB** stocke :
   - Routines téléchargées
   - Sessions en attente de sync
   - Paramètres utilisateur
   - Cache calendrier

2. **Service Worker** :
   - Cache assets statiques
   - Cache API responses (stale-while-revalidate)
   - Background Sync pour `/sync`

3. **Flux offline** :
   - Session démarre → écrit dans IndexedDB
   - Session termine → événement dans queue
   - Réseau disponible → Background Sync push vers `/sync`

## Migration depuis prototype

### Phase 1 : Extraction
1. ✅ Déplacer prototype vers `prototype/`
2. Extraire routines JSON depuis HTML
3. Identifier code réutilisable (CoachEngine, VoiceManager)

### Phase 2 : Backend
1. Init NestJS project dans `backend/`
2. Setup MongoDB + Mongoose
3. Implémenter modules (auth, users, routines, sessions)
4. Endpoints API REST

### Phase 3 : Frontend
1. Init Angular project dans `frontend/`
2. Setup PWA + Service Worker
3. Migrer CoachEngine vers CoachComponent
4. Implémenter modules (calendar, stats, settings)

### Phase 4 : Intégration
1. Connecter frontend → backend API
2. Implémenter offline-first avec IndexedDB
3. Tests end-to-end
4. Déploiement

## Principes de conception

1. **Offline-first** : app fonctionnelle sans réseau
2. **Progressive** : enrichissement progressif (PWA → native)
3. **Accessible** : Web Speech API + contrôles clavier
4. **Performant** : lazy loading, code splitting
5. **Sécurisé** : JWT, HTTPS, CORS, validation
6. **RGPD** : export/suppression données, consentement

## Roadmap

### Sprint 1 - MVP (2 semaines)
- Backend NestJS avec auth + CRUD routines
- Frontend Angular avec CoachComponent
- Calendrier + enregistrement sessions
- PWA offline basique

### Sprint 2 - V1 (2 semaines)
- Rappels et notifications Web Push
- Statistiques et streaks
- Multi-routines
- Paramètres voix/son

### Sprint 3 - V2 (3 semaines)
- Éditeur de routine visuel
- Import/Export JSON
- Partage routines (URL/QR)
- Mode Kiné (opt-in)

## Références

- Spécification complète : `specification.md`
- Copilot instructions : `.github/copilot-instructions.md`
- Prototype fonctionnel : `prototype/`
