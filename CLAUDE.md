# Règles de travail — FlexiCoach

## Contexte du projet
Flexy Coach est une application web de coaching personnel.

**Stack technique :** monorepo Nx 23 — frontend Angular 22, backend NestJS 11 (API REST), MongoDB, Node.js 24.

---

## Contraintes critiques (OBLIGATOIRES)
- **Toujours commencer par un `git pull` sur `main`** avant de créer une branche ou de commencer à travailler, afin de partir de la version la plus récente du code
- Travailler exclusivement dans une branche dédiée (pas dans `main`)
- Ne jamais pousser de modifications directement sur la branche `main`
- Ne jamais commiter sans feu vert explicite de l'utilisateur
- Ne jamais créer de pull request sans validation explicite de l'utilisateur
- **Avant de demander le feu vert de l'utilisateur, lancer les serveurs** (`npx nx serve backend` et `npx nx serve frontend`) afin qu'il puisse tester l'application localement
- Attendre explicitement le feu vert de l'utilisateur après qu'il ait exécuté les tests localement
- Ne pas modifier le code fonctionnel existant (hors ajustements mineurs strictement nécessaires aux tests)
- Aucun test ne doit être supprimé, désactivé ou ignoré (`skip`, `xit`, `pending`, etc.)

---

## Tests (EXIGENCE ABSOLUE)
Mettre à jour et compléter :
- les tests unitaires backend (controllers, services, middlewares)
- les tests unitaires frontend (components, services, guards/pipes)
- les tests end-to-end (E2E)

Ajouter des tests manquants pour couvrir :
- les parcours critiques
- les cas limites
- les scénarios d'erreur

Règles :
- Mocker systématiquement les dépendances externes
- Garantir que les tests sont reproductibles, indépendants et lisibles

---

## Boucle de validation des tests (POINT CRITIQUE)
Si un ou plusieurs tests échouent :
1. Analyser précisément la cause de l'échec
2. Corriger les tests ou leur configuration
3. Relancer l'ensemble des tests

- Cette boucle doit être répétée autant de fois que nécessaire
- Aucun contournement n'est autorisé pour forcer un résultat vert
- Le travail n'est terminé que lorsque **tous les tests sont au vert**

---

## Documentation (OBLIGATOIRE)
Mettre à jour et aligner la documentation avec le comportement réel :
- README
- Documentation API
- Documentation technique
- Documentation fonctionnelle si existante

Clarifier :
- les flux applicatifs
- les prérequis
- les commandes de lancement et de test

Supprimer les incohérences ou informations obsolètes.

---

## Actions GitHub (OBLIGATOIRES)
- Toute interaction avec GitHub liée à la tâche cible doit être réalisée **exclusivement via le serveur MCP configuré**
- Ne jamais utiliser d'accès GitHub directs en dehors du serveur MCP
- Indiquer clairement les actions GitHub réalisées via le MCP

---

## Vérification des environnements (OBLIGATOIRE AVANT VALIDATION)
Avant de demander à l'utilisateur de tester :
- Vérifier que le backend démarre correctement
- Vérifier que le frontend démarre correctement
- Vérifier que les dépendances sont installées
- Vérifier que les suites de tests s'exécutent sans erreur d'infrastructure

Ne demander de tester que lorsque les environnements sont fonctionnels et stables.

---

## Livrables attendus
- Liste des tests ajoutés ou modifiés
- Liste des sections de documentation mises à jour
- Nom de la branche dédiée utilisée
- Contenu complet des modifications (tests + documentation)
- Commandes exactes pour :
  - lancer les serveurs
  - exécuter les tests unitaires
  - exécuter les tests E2E
- État final confirmé : tous les tests sont verts et la documentation est à jour

---

## Commandes

| Usage | Commande |
|---|---|
| Backend (port 3000) | `npx nx serve backend` (ou `npx nx build backend && node dist/apps/backend/main.js`) |
| Frontend (port 4200) | `npx nx serve frontend` |
| Tests unitaires | `npm run test:backend`, `npm run test:frontend` (ou `npm test`) |
| E2E backend | backend lancé avec `THROTTLE_DISABLED=true`, puis `npm run test:e2e:backend` |
| E2E frontend | `npx playwright install chromium` (une fois), puis `MONGODB_URI=<base du backend> npm run test:e2e:frontend` |

Détails et prérequis des E2E (MongoDB, `ADMIN_EMAILS`…) : voir `TESTING.md`.

## Lancement des serveurs dans un worktree

Dans un git worktree, le fichier `.env` et le dossier `dist/` ne sont pas présents par défaut.
Depuis le répertoire du worktree :

```bash
# 1. Copier le .env depuis le dépôt principal (chemin à adapter)
cp <chemin-du-depot-principal>/.env .env

# 2. Builder puis lancer le backend (nx serve backend dépend d'un build préalable)
npx nx build backend
node dist/apps/backend/main.js &
```

Le frontend se lance normalement (`npx nx serve frontend` ou `preview_start` via `.claude/launch.json`).

Pourquoi : le backend charge le `.env` depuis la racine (`ConfigModule.forRoot({ envFilePath: '.env' })`)
et crashe sans lui (`OAuth2Strategy requires a clientID option`).

---

## Versioning (automatique — release-please)
- **Ne jamais modifier la version à la main** : pas de `npm version`, pas d'édition de `package.json` (`version`),
  `apps/frontend/src/app/version.ts` ni `CHANGELOG.md`. Release-please s'en charge (voir README › Versions et releases).
- **Messages de commit au format [Conventional Commits](https://www.conventionalcommits.org/fr/)** : ils déterminent
  la prochaine version et le contenu du CHANGELOG.
  - `fix: …` → patch, `feat: …` → minor, `feat!: …` / `BREAKING CHANGE:` → major
  - `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:` → pas de montée de version ; `chore:` → masqué du CHANGELOG
  - Portée recommandée : `feat(editor): …`, `fix(auth): …`
- Une release = merger la PR « chore: release X.Y.Z » ouverte par release-please (décision de l'utilisateur).

---

## Méthodologie attendue
- Travailler par étapes : analyse → proposition → implémentation → validation
- Justifier les choix effectués
- Prioriser la clarté, la cohérence et la maintenabilité
- **Ne jamais merger la Release PR (« chore: release X.Y.Z ») sans feu vert explicite de l'utilisateur**
