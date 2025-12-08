# FlexiCoach

Application Progressive Web App (PWA) pour routines d'exercices guidées avec suivi quotidien, visualisation des progrès et programmes d'entraînement multiples.

## 🏗️ Architecture

Monorepo Nx avec:

- **Backend** (NestJS) - API REST avec MongoDB
- **Frontend** (Angular) - Interface utilisateur responsive
- **Shared** - Bibliothèque TypeScript partagée (modèles de données)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- MongoDB 8.0.1+ (local ou distant)
- npm ou yarn

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

### Tests e2e backend

**Exécution unique:**
```bash
npx nx run backend-e2e:e2e
```

> ⚠️ **Important**: Le backend doit être lancé (`npx nx serve backend`) avant de lancer les tests e2e.

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
- **API REST complète** (routines, sessions, users, auth, admin, stats, calendar)
- **Base de données MongoDB** avec Mongoose
- **Tests** (frontend: Vitest, backend-e2e: Jest - 28+ tests)
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

- **Nx** 22.0.2 - Monorepo intégré
- **NestJS** - Framework backend
- **Angular** 20.3 - Framework frontend
- **MongoDB** 8.0.1 + Mongoose - Base de données
- **Vitest** - Tests unitaires frontend
- **Jest** - Tests e2e backend
- **TypeScript** 5.8.0
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

- Les dépendances Angular sont alignées (`~20.3.0`, pas besoin de `--legacy-peer-deps`)
- Le frontend utilise un proxy (`proxy.conf.json`) pour rediriger `/api` vers `localhost:3000`
- Les schémas MongoDB sont dans `apps/backend/src/schemas/`
- Les modèles partagés sont dans `libs/shared/src/lib/models.ts`

## 🌐 API Endpoints

### Routines
- `GET /api/routines` - Liste toutes les routines
- `GET /api/routines/:slug` - Détails d'une routine par slug
- `GET /api/routines/:id` - Détails d'une routine par ID

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
