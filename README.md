# FlexiCoach

Application Progressive Web App (PWA) pour routines d'exercices guidées avec suivi quotidien, visualisation des progrès et programmes d'entraînement multiples.

[![Release](https://img.shields.io/github/v/release/bibulle/FlexiCoach?sort=semver)](https://github.com/bibulle/FlexiCoach/releases)

Historique des versions : [CHANGELOG.md](./CHANGELOG.md) et [GitHub Releases](https://github.com/bibulle/FlexiCoach/releases)
(versions gérées automatiquement, voir [Versions et releases](#-versions-et-releases)).

## 🏗️ Architecture

Monorepo Nx avec:

- **Backend** (NestJS) - API REST avec MongoDB
- **Frontend** (Angular) - Interface utilisateur responsive
- **Shared** - Bibliothèque TypeScript partagée (modèles de données)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 24 LTS (version utilisée par la CI et l'image Docker ; Angular 22 / Vite 8 exigent Node ≥ 22)
- MongoDB 8.0.1+ (local ou distant)
- npm 11 (fourni avec Node 24)

### Installation

```bash
npm install
```

### Configuration MongoDB

Assurez-vous que MongoDB est en cours d'exécution sur `localhost:27017`.

### Chargement des données initiales

```bash
npx tsx apps/backend/src/scripts/seed-routines.ts
```

### Démarrage des serveurs de développement

**Workflow recommandé : 4 terminaux en mode watch**

**Terminal 1 - Backend** (port 3000):
```bash
npx nx serve backend
```

**Terminal 2 - Frontend** (port 4200):
```bash
npx nx serve frontend
```

**Terminal 3 - Tests frontend** (watch mode):
```bash
npx nx test frontend --watch
```

**Terminal 4 - Tests backend e2e** (manuel):
```bash
npx nx run backend-e2e:e2e
```

L'application sera accessible sur `http://localhost:4200`

> 💡 **Note**: Les serveurs backend et frontend doivent tourner en permanence en mode watch. Les tests frontend se relancent automatiquement. Les tests e2e backend se lancent manuellement quand nécessaire.

## 🧪 Tests

### Tests unitaires frontend

**Mode watch (recommandé pour développement):**
```bash
npx nx test frontend --watch
```

**Mode single run:**
```bash
npx nx test frontend --run
```

### Tests e2e (backend API + frontend Playwright)

Prérequis : MongoDB démarré et backend lancé **avec `THROTTLE_DISABLED=true`** (l'inscription est limitée à 3/h).
`admin@example.com` doit figurer dans `ADMIN_EMAILS` pour les tests admin.

```bash
npx playwright install chromium        # une seule fois (et après chaque mise à jour de Playwright)

npx nx build backend && THROTTLE_DISABLED=true node dist/apps/backend/main.js   # terminal 1

npm run test:e2e:backend                                                       # terminal 2
MONGODB_URI=mongodb://localhost:27017/flexicoach npm run test:e2e:frontend     # démarre le frontend
```

Détails (prérequis, bonnes pratiques, CI) : voir [TESTING.md](./TESTING.md). Les deux suites tournent en CI
(job `e2e`, avec un service `mongo:8`) et conditionnent la publication de l'image Docker.

### Image Docker en local

```bash
./docker-test.sh   # build de l'image, démarrage du conteneur et vérifications de base
```

## 📁 Structure du projet

```
apps/
├── backend/           # API NestJS
│   ├── src/
│   │   ├── routines/  # Module routines (CRUD)
│   │   ├── sessions/  # Module sessions de pratique
│   │   ├── users/     # Module utilisateurs
│   │   ├── schemas/   # Schémas MongoDB/Mongoose
│   │   └── scripts/   # Scripts (seed-routines.ts)
│   └── ...
├── frontend/          # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Composants (list, player)
│   │   │   └── services/    # Services HTTP
│   │   └── styles.sass      # Styles globaux
│   └── ...
└── backend-e2e/       # Tests e2e du backend

libs/
└── shared/            # Bibliothèque partagée
    └── src/lib/models.ts  # Modèles TypeScript

routines/              # Données JSON des routines
├── douce-10min.json
└── bureau-5min.json
```

## 🎯 Fonctionnalités

### Implémentées ✅

- **Liste des routines** avec badges (durée, niveau, nombre d'exercices)
- **Lecteur de routine** avec:
  - Timer compte à rebours
  - Instructions vocales (Web Speech API)
  - Barre de progression fluide
  - Affichage des étapes
  - Périodes de repos automatiques (10s entre exercices)
- **Écran de complétion** avec évaluation du ressenti (1-5 étoiles)
- **Enregistrement des sessions** en base de données
- **Authentification utilisateur** (JWT) avec login/inscription
- **Administration** : gestion des utilisateurs, reset de mot de passe
- **Statistiques complètes**:
  - Compteur de série actuelle et record
  - Temps total d'entraînement
  - Taux d'adhérence sur 30 jours
  - Routine favorite
- **Calendrier mensuel** avec suivi de l'adhérence quotidienne
- **Éditeur de routines personnalisées** avec:
  - Création et modification de routines
  - Drag & drop pour réorganiser les étapes
  - Modal d'édition d'étapes avec cues audio
  - Export de routines en JSON (`.routine.json`)
  - Import de routines depuis JSON
  - Validation complète (durées, champs obligatoires)
  - Gestion de l'ownership (routines utilisateur)
- **API REST complète** (routines, sessions, users, auth, admin, stats, calendar)
- **Base de données MongoDB** avec Mongoose
- **Tests** (frontend: Vitest 235 tests, backend: Jest 151 tests, E2E: Playwright + Jest)
- **Docker** avec CI/CD GitHub Actions
- **Design unifié** avec cards blanches et ombres douces

### Planifiées 📋

- Fonctionnalités PWA (service worker, manifest, mode offline)
- Page de paramètres (profil, préférences)
- Notifications de rappel (Web Push)
- Mode sombre

## 🎨 Design

Interface « hi-fi » (refonte 2026) :

- Palette de couleurs: bleu (#3b82f6) comme accent
- Cards arrondies (16px border-radius)
- Badges colorés (bleu pour durée, vert pour niveau)
- Boutons en forme de pilule (999px border-radius)
- Ombres douces pour la profondeur
- Max-width 820px pour une lecture optimale

## 🛠️ Technologies

- **Node.js** 24 LTS (CI, Docker)
- **Nx** 23.3 - Monorepo intégré
- **NestJS** 11.2 - Framework backend
- **Angular** 22.2 (+ Angular Material 22.2) - Framework frontend
- **MongoDB** + Mongoose 9.11 - Base de données
- **Vitest** 4.1 (+ jsdom) - Tests unitaires frontend
- **Jest** 30 - Tests unitaires et e2e backend
- **Playwright** 1.64 - Tests e2e frontend
- **TypeScript** 6.0 (imposé par Angular 22)
- **SASS** - Préprocesseur CSS

## 📝 Notes de développement

### Commandes utiles

```bash
# Voir le graphe de dépendances
npx nx graph

# Lancer tous les tests
npx nx run-many -t test

# Builder le frontend
npx nx build frontend

# Builder le backend
npx nx build backend
```

### Configuration importante

- Les dépendances Angular sont alignées (`~22.2`, pas besoin de `--legacy-peer-deps`)
- Le frontend utilise un proxy (`proxy.conf.json`) pour rediriger `/api` et `/uploads` vers `localhost:3000`
- Les schémas MongoDB sont dans `apps/backend/src/schemas/`
- Les modèles partagés sont dans `libs/shared/src/lib/models.ts`
- La règle de mot de passe partagée (front + back) est dans `libs/shared/src/lib/password-policy.ts`

### Mises à jour des dépendances (Dependabot)

Dependabot est configuré dans `.github/dependabot.yml` et ouvre des PR chaque lundi :

- **npm** : mises à jour groupées (`angular`, `nx`, `nestjs`, puis mineures/patch dev et prod). Les montées **majeures** d'Angular et de Nx sont ignorées : elles se font manuellement via `npx nx migrate latest`.
- **GitHub Actions** : actions du workflow `build-and-publish.yml`, regroupées en une PR.
- **Docker** : image de base `node:24-alpine` (patch/mineur uniquement, on reste sur la LTS 24).

Les PR de sécurité dépendent de l'option *Dependabot security updates* (Settings → Code security du dépôt).

**Montées majeures volontairement reportées** (à traiter dans des PR dédiées) :
- **NestJS 12** : publié en ESM uniquement ; le runtime fonctionne (Node 24 `require(esm)`) mais les tests backend (Jest/ts-jest en CommonJS) doivent d'abord être migrés.
- **Vitest 5** : casse la compilation des composants Angular via `@analogjs/vitest-angular` (Vite 8 / oxc) ; on reste en Vitest 4.1.
- **TypeScript 7** : Angular 22 impose `typescript >=6.0 <6.1`.
- `npm audit` remonte encore 29 alertes modérées via `sprintf-js` (outillage de couverture Jest, aucune version corrigée publiée).

## 🏷️ Versions et releases

Les versions sont gérées par **[release-please](https://github.com/googleapis/release-please)** à partir des
messages de commit ([Conventional Commits](https://www.conventionalcommits.org/fr/)) :

| Préfixe du commit | Effet sur la version | Section du CHANGELOG |
|---|---|---|
| `fix: …` | patch (0.8.7 → 0.8.8) | Corrections |
| `feat: …` | minor (0.8.7 → 0.9.0) | Fonctionnalités |
| `feat!: …` ou `BREAKING CHANGE:` | major | — |
| `perf`, `refactor`, `test`, `docs`, `build`, `ci` | patch (section visible : une Release PR est proposée) | section dédiée |
| `chore: …` (dont `chore(deps)` de Dependabot) | aucune | masqué |

**Cycle :**
1. Les PR **ne touchent plus à la version** (plus de `npm version patch`).
2. À chaque merge sur `main`, le workflow `Release` ouvre ou met à jour une PR **« chore: release X.Y.Z »**
   qui met à jour `package.json`, `package-lock.json`, `apps/frontend/src/app/version.ts` et `CHANGELOG.md`.
3. **Merger cette Release PR** crée le tag `vX.Y.Z` et la GitHub Release, publie l'image Docker
   `bibulle/flexicoach:VX.Y.Z` (+ `:latest`) et met à jour le dépôt GitOps (déploiement).

**CI de la Release PR et de son merge sur `main` :** seuls les tests unitaires y tournent (ils valident `npm ci`
et la compilation de `version.ts`) ; les E2E et le build Docker de `Build and Publish` sont sautés, le code ayant
déjà été testé sur `main`. L'image de la release n'est donc construite qu'une fois, par le workflow `Release`.

**Images Docker :** chaque merge sur `main` publie `:latest` ; seules les releases publient une image versionnée
et déclenchent le déploiement GitOps. Les PR ne font qu'un build (rien n'est publié).

**Réglages GitHub nécessaires** (une fois) :
- *Settings → Actions → General → Workflow permissions* : cocher **Allow GitHub Actions to create and approve pull requests**.
- Optionnel : secret **`RELEASE_PLEASE_TOKEN`** (PAT avec droits `contents` + `pull-requests` sur ce dépôt).
  Sans lui, la Release PR est créée avec le `GITHUB_TOKEN` et GitHub n'y lance pas la CI
  (elle ne contient que la montée de version et le changelog).

## 🌐 API Endpoints

### Routines
- `GET /api/routines` - Liste routines (built-in + utilisateur) - **Protégé JWT**
- `POST /api/routines` - Créer une routine utilisateur - **Protégé JWT**
- `POST /api/routines/import` - Importer une routine depuis JSON - **Protégé JWT**
- `GET /api/routines/:id` - Détails d'une routine par ID - **Protégé JWT**
- `GET /api/routines/slug/:slug` - Détails d'une routine par slug - **Protégé JWT**
- `PATCH /api/routines/:id` - Modifier une routine utilisateur - **Protégé JWT**
- `DELETE /api/routines/:id` - Supprimer une routine utilisateur - **Protégé JWT**

### Sessions
- `POST /api/sessions` - Créer une session de pratique
- `GET /api/sessions` - Liste des sessions (filtrable par userId)
- `GET /api/sessions/:id` - Détails d'une session
- `PATCH /api/sessions/:id/complete` - Marquer une session comme complétée
- `GET /api/sessions/stats` - Statistiques basiques
- `GET /api/sessions/stats/summary` - Statistiques détaillées (streaks, adhérence)
- `GET /api/sessions/calendar` - Données calendrier (filtrable par dates)

### Utilisateurs
- `GET /api/users/:id` - Profil utilisateur
- `PATCH /api/users/me/password` - Changer son mot de passe (`currentPassword`, `newPassword`) - **Protégé JWT**

### Authentification
- `POST /api/auth/register` - Inscription (`email`, `password`, `displayName` optionnel)
- `POST /api/auth/login` - Connexion (retourne JWT)
- `GET /api/auth/is-admin` - Vérifier si admin

### Administration
- `GET /api/admin/users` - Liste des utilisateurs (admin)
- `PATCH /api/admin/users/:userId/password` - Reset du mot de passe d'un utilisateur (`newPassword`) (admin)

#### Règle de mot de passe

Une seule règle, définie dans `libs/shared/src/lib/password-policy.ts` et appliquée partout
(inscription, changement de mot de passe, réinitialisation par un administrateur) :
**8 caractères minimum, avec au moins une majuscule, une minuscule et un chiffre**.

- Frontend : `passwordPolicyValidator` (formulaire d'inscription) et la modale de reset admin
  affichent la règle et bloquent l'envoi tant qu'elle n'est pas respectée.
- Backend : décorateur `@IsValidPassword()` sur `RegisterDto`, `UpdatePasswordDto` et `ResetPasswordDto`.
  Un mot de passe non conforme renvoie `400` avec un tableau `message` listant les règles non respectées
  (le frontend les affiche une par ligne).

## 📄 Licence

Projet personnel - Tous droits réservés
