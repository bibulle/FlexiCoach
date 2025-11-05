# Plan de migration - Prototype vers Architecture finale

## État actuel

### Prototype PWA (vanilla JS)
- ✅ Coaching avec timer et voix (Web Speech API)
- ✅ 2 routines fonctionnelles (douce-10min, bureau-5min)
- ✅ Persistance localStorage (sessions, préférences, stats)
- ✅ PWA basique (manifest, service worker)
- ✅ UI responsive avec design system CSS

### Code à réutiliser
1. **CoachEngine** (`prototype/assets/common.js`)
   - Timer step-based
   - Web Speech API (français)
   - WebAudio API fallback
   - Gestion cues vocales

2. **VoiceManager** (`prototype/assets/common.js`)
   - Sélection voix française
   - Paramètres voix (rate, pitch)
   - Persistance préférences

3. **ProgressManager** (`prototype/data/progress.js`)
   - Enregistrement sessions
   - Calcul streaks
   - Agrégation calendrier

4. **Design system** (`prototype/assets/common.css`)
   - CSS Custom Properties
   - Composants UI
   - Grid responsive

5. **Routines JSON** (à extraire)
   - Routine douce 10 min
   - Routine bureau 5 min

## Migration par phases

### Phase 1 : Préparation ✅

**Objectif** : Organiser le projet et documenter l'architecture

- [x] Déplacer prototype vers `prototype/`
- [x] Créer documentation (`docs/ARCHITECTURE.md`)
- [x] Créer plan de migration (`docs/MIGRATION.md`)
- [ ] Extraire routines en JSON
- [ ] Identifier dépendances à migrer

**Livrables** :
- Structure projet organisée
- Documentation architecture
- Routines au format JSON

---

### Phase 2 : Setup Nx monorepo

**Objectif** : Créer workspace Nx avec backend et frontend

**Étapes** :
1. Initialiser Nx workspace
   ```bash
   npx create-nx-workspace@latest coach-dos --preset=ts
   ```

2. Ajouter backend NestJS
   ```bash
   nx add @nx/nest
   nx g @nx/nest:app backend
   ```

3. Ajouter frontend Angular
   ```bash
   nx add @nx/angular
   nx g @nx/angular:app frontend
   ```

4. Créer library shared
   ```bash
   nx g @nx/js:lib shared
   ```

**Livrables** :
- Monorepo Nx fonctionnel
- Apps backend et frontend générées
- Library shared pour models

---

### Phase 3 : Backend NestJS

**Objectif** : API REST avec MongoDB et authentification

**Modules à créer** :
1. **Auth** - JWT, signup, login, refresh
2. **Users** - CRUD utilisateurs, settings
3. **Routines** - CRUD routines (built-in + user)
4. **Sessions** - Start, tick, finish
5. **Calendar** - Agrégation par jour
6. **Stats** - Streaks, temps total
7. **Sync** - Endpoint offline-first

**Configuration** :
- MongoDB avec Mongoose
- JWT (Passport)
- Validation (class-validator)
- CORS
- Helmet (sécurité)

**Schémas Mongoose** :
```typescript
// shared/models/user.model.ts
export interface User {
  _id: string;
  email?: string;
  displayName?: string;
  tz: string;
  settings: UserSettings;
}

// shared/models/routine.model.ts
export interface Routine {
  _id: string;
  slug: string;
  name: string;
  steps: Step[];
  totalSeconds: number;
  visibility: 'builtIn' | 'user';
}

// shared/models/session.model.ts
export interface Session {
  _id: string;
  userId: string;
  routineId: string;
  startAt: Date;
  endAt: Date;
  completed: boolean;
}
```

**Endpoints prioritaires** :
```
POST   /auth/login
GET    /routines
POST   /sessions/start
POST   /sessions/:id/finish
GET    /calendar?from=2025-11-01&to=2025-11-30
```

**Livrables** :
- API REST fonctionnelle
- Authentification JWT
- CRUD routines et sessions
- Tests unitaires (Jest)

---

### Phase 4 : Frontend Angular

**Objectif** : PWA Angular avec components migrés du prototype

**Modules à créer** :
1. **Core** - Services globaux (API, Auth, State)
2. **Coach** - CoachComponent JSON-driven
3. **Calendar** - CalendarComponent avec date-fns
4. **Stats** - StatsComponent (streaks, graphiques)
5. **Settings** - Paramètres (voix, rappels, thème)
6. **Shared** - Components UI réutilisables

**Migration CoachEngine** :

Du prototype (vanilla JS) :
```javascript
// prototype/assets/common.js
class CoachEngine {
  constructor(routine) { ... }
  start() { ... }
  tick() { ... }
  speak(text) { ... }
}
```

Vers Angular service :
```typescript
// frontend/src/app/core/services/coach-engine.service.ts
@Injectable()
export class CoachEngineService {
  private idx = -1;
  private timeLeft = 0;
  private interval?: number;
  
  start(routine: Routine): Observable<CoachEvent> { ... }
  tick(): void { ... }
  private speak(text: string): void { ... }
}
```

**CoachComponent** :
```typescript
@Component({
  selector: 'app-coach',
  template: `
    <div class="coach-container">
      <div class="timer">{{ timeLeft }}</div>
      <h2>{{ currentStep?.name }}</h2>
      <p>{{ currentStep?.text }}</p>
      <button (click)="togglePause()">{{ paused ? 'Reprendre' : 'Pause' }}</button>
    </div>
  `
})
export class CoachComponent {
  @Input() routine!: Routine;
  currentStep?: Step;
  timeLeft = 0;
  paused = false;
  
  constructor(private coachEngine: CoachEngineService) {}
  
  ngOnInit() {
    this.coachEngine.start(this.routine).subscribe(event => {
      // Handle coach events
    });
  }
}
```

**PWA Configuration** :
```bash
ng add @angular/pwa
```

- Service Worker (workbox)
- Web App Manifest
- IndexedDB (Dexie.js)
- Background Sync

**Livrables** :
- Application Angular fonctionnelle
- CoachComponent opérationnel
- Offline-first avec IndexedDB
- PWA installable

---

### Phase 5 : Intégration & Déploiement

**Objectif** : Connecter frontend/backend et déployer

**API Integration** :
```typescript
// frontend/src/app/core/services/api.service.ts
@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getRoutines(): Observable<Routine[]> {
    return this.http.get<Routine[]>('/api/routines');
  }
  
  startSession(routineId: string): Observable<Session> {
    return this.http.post<Session>('/api/sessions/start', { routineId });
  }
}
```

**Offline Queue** :
```typescript
// frontend/src/app/core/services/sync.service.ts
@Injectable()
export class SyncService {
  private db = new Dexie('coach-dos');
  
  queueEvent(event: SessionEvent): void {
    this.db.table('queue').add(event);
  }
  
  async sync(): Promise<void> {
    const events = await this.db.table('queue').toArray();
    await this.api.post('/sync', { events }).toPromise();
    await this.db.table('queue').clear();
  }
}
```

**Déploiement** :
- Backend : Railway / Render (NestJS + MongoDB Atlas)
- Frontend : Vercel / Netlify (Angular build)
- CI/CD : GitHub Actions

**Livrables** :
- Frontend connecté au backend
- Synchronisation offline fonctionnelle
- Application déployée en production
- Tests E2E (Playwright)

---

## Checklist de migration

### Préparation
- [x] Prototype déplacé dans `prototype/`
- [x] Documentation créée
- [ ] Routines extraites en JSON
- [ ] Code réutilisable identifié

### Backend
- [ ] Nx workspace initialisé
- [ ] NestJS app créée
- [ ] MongoDB connecté
- [ ] Auth JWT implémenté
- [ ] Modules CRUD créés
- [ ] Tests backend passent

### Frontend
- [ ] Angular app créée
- [ ] CoachComponent migré
- [ ] Services API créés
- [ ] PWA configuré
- [ ] IndexedDB setup
- [ ] Tests frontend passent

### Intégration
- [ ] API connectée
- [ ] Offline-first testé
- [ ] Notifications Web Push
- [ ] Performance optimisée
- [ ] SEO configuré

### Déploiement
- [ ] Backend déployé
- [ ] Frontend déployé
- [ ] CI/CD configuré
- [ ] Monitoring actif
- [ ] Documentation utilisateur

---

## Prochaines étapes immédiates

1. **Extraire routines en JSON** depuis les fichiers HTML
   - `prototype/coach_dos_routine_douce_10_min.html` → `routines/douce-10min.json`
   - `prototype/routines/bureau-5min.html` → `routines/bureau-5min.json`

2. **Initialiser Nx workspace** dans nouveau dossier
   - Setup backend NestJS
   - Setup frontend Angular
   - Setup shared library

3. **Migrer CoachEngine** vers service Angular
   - Extraire logique timer
   - Migrer Web Speech API
   - Adapter pour RxJS

4. **Implémenter backend minimal**
   - Auth endpoint
   - Routines endpoint
   - Sessions endpoint

5. **Connecter frontend → backend**
   - API service
   - Auth interceptor
   - Offline queue

---

## Notes techniques

### Migration CoachEngine

**État actuel** (vanilla JS) :
- Variables globales (idx, timeLeft, resting)
- setInterval pour timer
- speechSynthesis direct

**État cible** (Angular) :
- Service injectable
- RxJS Observables pour events
- State management (BehaviorSubject)

### Migration ProgressManager

**État actuel** (localStorage) :
```javascript
localStorage.setItem('progress', JSON.stringify(data));
```

**État cible** (IndexedDB + API) :
```typescript
// Local first
await this.db.sessions.add(session);

// Sync when online
this.syncService.queueEvent({ type: 'session.finish', data: session });
```

### Migration VoiceManager

**À conserver** :
- Web Speech API
- Voix française prioritaire
- Fallback WebAudio beeps

**À adapter** :
- Service Angular injectable
- Settings persistées via API
- Observable pour voix disponibles

---

## Ressources

- Spécification : `specification.md`
- Architecture : `docs/ARCHITECTURE.md`
- Prototype : `prototype/`
- Copilot instructions : `.github/copilot-instructions.md`
