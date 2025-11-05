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

**Backend** (port 3000):
```bash
npx nx serve backend
```

**Frontend** (port 4200):
```bash
npx nx serve frontend
```

L'application sera accessible sur `http://localhost:4200`

## 🧪 Tests

### Tests unitaires frontend

```bash
npx nx test frontend
```

### Tests e2e backend

```bash
npx nx run backend-e2e:e2e
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

- Liste des routines disponibles avec badges (durée, niveau, nombre d'exercices)
- Lecteur de routine avec:
  - Timer compte à rebours
  - Instructions vocales (Web Speech API)
  - Barre de progression
  - Affichage des étapes
  - Périodes de repos automatiques (10s entre exercices)
- API REST complète (routines, sessions, users)
- Connexion MongoDB avec Mongoose
- Tests unitaires (frontend: Vitest, backend-e2e: Jest)
- Design moderne avec thème bleu

### En cours ⏳

- Enregistrement des sessions après complétion
- Écran de complétion avec évaluation du ressenti

### Planifiées 📋

- Compteur de série (streak)
- Vue calendrier des pratiques
- Statistiques et graphiques de progrès
- Authentification utilisateur (JWT)
- Fonctionnalités PWA (service worker, manifest)
- Page de paramètres

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

- `.npmrc` contient `legacy-peer-deps=true` pour résoudre les conflits de dépendances
- Le frontend utilise un proxy (`proxy.conf.json`) pour rediriger `/api` vers `localhost:3000`
- Les schémas MongoDB sont dans `apps/backend/src/schemas/`
- Les modèles partagés sont dans `libs/shared/src/lib/models.ts`

## 🌐 API Endpoints

- `GET /api/routines` - Liste toutes les routines
- `GET /api/routines/:slug` - Détails d'une routine
- `POST /api/sessions` - Créer une session de pratique
- `GET /api/sessions/stats` - Statistiques utilisateur
- `GET /api/users/:id` - Profil utilisateur

## 📄 Licence

Projet personnel - Tous droits réservés
