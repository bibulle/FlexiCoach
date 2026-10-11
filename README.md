# FlexiCoach

Application Progressive Web App (PWA) pour routines d'exercices guidées avec suivi quotidien, visualisation des progrès et programmes d'entraînement multiples.

## 📝 Version actuelle : 0.8.6

### Corrections récentes
- ✅ Authentification Google OAuth2 implémentée
- ✅ Tests backend migrés vers mocks (compatibilité Apple Silicon)
- ✅ Menu utilisateur avec navigation cohérente

Voir [CHANGELOG.md](./CHANGELOG.md) pour l'historique complet.

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

### Tests e2e backend (développement)

**Exécution unique:**
```bash
npx nx run backend-e2e:e2e
```

> ⚠️ **Important**: Le backend doit être lancé (`npx nx serve backend`) avant de lancer les tests e2e.

### Tests e2e complets (production)

Pour tester l'application complète en mode production avec MongoDB local:

```bash
./test-e2e-local.sh
```

Ce script:
- ✅ Vérifie que MongoDB est installé (Homebrew)
- ✅ Nettoie la base de données
- ✅ Build le backend et le frontend en mode production
- ✅ Démarre le backend sur le port 3000
- ✅ Exécute tous les tests automatiques (validation, rate limiting)
- ✅ Crée un utilisateur admin (`famille.martin@gmail.com` / `Martin2024!Test`)
- ✅ Charge les routines de test

L'environnement reste actif pour validation manuelle. Appuyez sur Ctrl+C pour arrêter.

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

prototype/             # Prototype HTML/CSS/JS original
├── index.html
├── assets/common.css
└── routines/

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

Le design s'inspire du prototype vanilla JS avec:

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

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion (retourne JWT)
- `GET /api/auth/is-admin` - Vérifier si admin

### Administration
- `GET /api/admin/users` - Liste des utilisateurs (admin)
- `PATCH /api/admin/password` - Reset mot de passe (admin)

## 📄 Licence

Projet personnel - Tous droits réservés
