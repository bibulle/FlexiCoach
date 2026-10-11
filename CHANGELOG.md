# Changelog

Ce fichier est maintenu automatiquement par [release-please](https://github.com/googleapis/release-please)
à partir des messages de commit ([Conventional Commits](https://www.conventionalcommits.org/fr/)) :
ne pas l'éditer à la main. Les releases sont publiées sur
[GitHub Releases](https://github.com/bibulle/FlexiCoach/releases).

## [0.8.9](https://github.com/bibulle/FlexiCoach/compare/v0.8.8...v0.8.9) (2026-10-11)


### CI

* Release PR — tests unitaires seulement, sans E2E ni build Docker ([882eef8](https://github.com/bibulle/FlexiCoach/commit/882eef8eb9fdc8102fa9fcc8158807adf8edca55))
* Release PR — tests unitaires seulement, sans E2E ni build Docker ([e4ada5e](https://github.com/bibulle/FlexiCoach/commit/e4ada5e5c02b9c116d8cfbc6839e1ce4dbc97f7d))

## [0.8.8](https://github.com/bibulle/FlexiCoach/compare/v0.8.7...v0.8.8) (2026-10-11)


### CI

* versions automatiques (release-please) + ménage des anciennes pratiques ([#131](https://github.com/bibulle/FlexiCoach/issues/131)) ([5aff57e](https://github.com/bibulle/FlexiCoach/commit/5aff57e3a2e5fd8160dc1d1357b69e0ff31a23c4))
* versions automatiques avec release-please et images Docker par release ([#131](https://github.com/bibulle/FlexiCoach/issues/131)) ([77d2f80](https://github.com/bibulle/FlexiCoach/commit/77d2f80ab9f7ed3b205d8df5ebc2b07cf1036eba))

## 0.7.4 → 0.8.7 (2026-01-19 → 2026-10-11) — rattrapage

Versions montées à la main (`npm version patch`) pendant cette période, sans tag ni changelog :
résumé reconstitué depuis l'historique git.

### Fonctionnalités

* Nouvelle interface hi-fi : authentification, catalogue, lecteur, complétion, accueil, calendrier annuel, éditeur, paramètres
* Authentification Google OAuth2 (#39), menu utilisateur et en-tête de navigation (#37, #38)
* Mode administration (toggle dans le menu utilisateur) et gestion des utilisateurs
* Favoris de routines (#123), tags/catégories de routines (#90)
* Rappels par notifications navigateur (#99), sélecteur de voix TTS (#98)
* Paramètres synchronisés avec le backend (#5)
* Images optionnelles pour les étapes de routine (#127)
* Routines golf et squash

### Corrections

* Sécurité : mass assignment, IDOR sur les sessions, vérification du mot de passe, garde admin (#49–#55), redirection sur JWT expiré (#43)
* PWA / Android : wake lock, notifications via service worker, icônes, installation du service worker (#105, #106, #114–#116)
* Ressenti de fin de séance enfin sauvegardé (#66), `JSON.parse` sécurisé dans `AuthService` (#62)
* Tag d'une routine perdu à la création ; rechargement intempestif de la page à la première installation du service worker
* Warnings console en production (#72–#75), sauvegarde de l'éditeur débloquée (#70)

### Build, tests & dépendances

* Node.js 24 LTS, Nx 23, Angular 22, TypeScript 6, Vite 8 ; dépendances à jour (0 vulnérabilité critique/haute) (#130)
* Dependabot (npm, GitHub Actions, Docker)
* Tests E2E backend (73) et frontend Playwright (50) réparés et exécutés en CI (#132)

## 0.7.3 (2026-01-18)

### Fixed

* **modal scroll**: Fix modal scroll functionality in step editor when content exceeds viewport ([#33](https://github.com/bibulle/FlexiCoach/issues/33))
  - Added CSS properties (position: relative, touch-action, scroll-behavior) to enable proper scrolling
  - Buttons remain accessible even with 8+ cues
* **import/export**: Fix MongoDB _id field validation error after routine import/export cycle ([#34](https://github.com/bibulle/FlexiCoach/issues/34))
  - Strip MongoDB-generated _id fields during import before form loading
  - Preserves backend validation strictness while fixing import workflow
* **ui permissions**: Hide routine creation/edit UI for non-admin users ([#35](https://github.com/bibulle/FlexiCoach/issues/35))
  - Added admin check to "Nouvelle routine" button
  - Conditioned edit/delete buttons on authService.isAdmin()
  - Aligned frontend UI with backend authorization

### Tests

* Add comprehensive unit tests for modal scroll, import/export, and admin UI features
* Add E2E test coverage for all three issues (some skipped pending admin setup)

## 0.7.0 (2025-12-08)


### Features

* add calendar component with monthly view and adherence tracking 5e01214, closes #1
* Add completion screen with session recording fcc8d75
* add Docker support and GitHub Actions CI/CD pipeline c43f003
* add JWT authentication system with admin functionality f0c0b86
* add PWA icons and favicon generated from custom logo e4daf26
* add PWA support with service worker and manifest 88e50b7
* add stats component with streaks and adherence ([#2](undefined/undefined/undefined/issues/2)) 2010ed0
* Initial commit - FlexiCoach PWA with Angular/NestJS/MongoDB 1345977


### Bug Fixes

* align Angular dependencies versions to resolve peer dependency conflicts 54dc939
* move PWA files to public directory for proper serving e0a3119
* progress bar jerky animation during routine ab419ac, closes #11
