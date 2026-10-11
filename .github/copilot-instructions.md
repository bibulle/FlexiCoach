# FlexiCoach — instructions pour les agents de code

La source de vérité pour travailler sur ce dépôt est **[`CLAUDE.md`](../CLAUDE.md)** (règles de travail, commandes,
versioning) ; les consignes Nx sont dans [`AGENTS.md`](../AGENTS.md).

À lire selon le besoin :
- [`README.md`](../README.md) : démarrage, structure, API, **versions et releases** (release-please)
- [`TESTING.md`](../TESTING.md) : tests unitaires et E2E (prérequis, commandes, bonnes pratiques)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md), [`docs/SPECIFICATION.md`](../docs/SPECIFICATION.md)

## Conventions propres au projet

- **Langue** : toute l'interface, les instructions vocales et les messages de commit sont en français ;
  le coaching tutoie l'utilisateur (« Inspire, expire… »), terminologie de kinésithérapie.
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `test:`…) —
  ils pilotent la version et le CHANGELOG. Ne jamais modifier la version à la main.
- **Routines** : format JSON partagé (`libs/shared/src/lib/models.ts`, exemples dans `routines/*.json`) :
  étapes `{ name, seconds, mode: 'mouvement' | 'statique' | 'respiration', text, cues: [{ at, say }] }`,
  où `at` est le temps **écoulé** dans l'étape.
- **Tests** : aucun test supprimé ou ignoré ; unitaires + E2E verts avant toute PR.
