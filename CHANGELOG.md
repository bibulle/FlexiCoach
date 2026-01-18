# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
