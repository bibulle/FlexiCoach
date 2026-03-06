# Règles de travail — FlexiCoach

## Contexte du projet
Flexy Coach est une application web de coaching personnel.

**Stack technique :**
- Frontend : Angular
- Backend : Node.js (API REST)

---

## Contraintes critiques (OBLIGATOIRES)
- **Toujours commencer par un `git pull` sur `master`** avant de créer une branche ou de commencer à travailler, afin de partir de la version la plus récente du code
- Travailler exclusivement dans une branche dédiée (pas dans `main`)
- Ne jamais pousser de modifications directement sur la branche `main`
- Ne jamais commiter sans feu vert explicite de l'utilisateur
- Ne jamais créer de pull request sans validation explicite de l'utilisateur
- **Avant de demander le feu vert de l'utilisateur, lancer les serveurs** (`npm run start:api` et `npm run start:frontend`) afin qu'il puisse tester l'application localement
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

## Méthodologie attendue
- Travailler par étapes : analyse → proposition → implémentation → validation
- Justifier les choix effectués
- Prioriser la clarté, la cohérence et la maintenabilité
- **Attendre explicitement le feu vert de l'utilisateur avant toute action de versioning**
