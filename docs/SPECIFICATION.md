# Spécification fonctionnelle & technique — « Coach Dos » (Web App)

## 1) Objectif
Application web (PWA) pour **suivre et coacher** des routines de dos : exécuter des séances guidées (chronos + annonces vocales), **enregistrer l’adhérence quotidienne**, visualiser un **planning** (streak, jours faits/manqués) et **ajouter d’autres exercices/routines** ultérieurement.

---

## 2) Utilisateurs & parcours
- **U1 — Utilisateur individuel**
  - S’inscrit / se connecte (ou anonyme + sauvegarde locale).
  - Lance une **routine** (ex. « Routine douce 10 min »). 
  - A la fin d’une séance, coche « fait » (auto si séance terminée).
  - Consulte le **calendrier** : jours complétés, temps cumulé, séries (streaks).
  - Reçoit des **rappels** (notifications web/app) aux heures choisies.
- **U2 — Coach/Kiné (option)**
  - Peut proposer/partager une routine préconfigurée.

---

## 3) Fonctionnalités (MVP → V1)
### MVP
1. **Lecture d’une routine** (notre fichier actuel) intégrée en composant.
2. **Enregistrement automatique** d’une séance terminée (date, durée réelle, routine, version, complétude).
3. **Calendrier** mensuel avec indicateurs : fait / partiel / manqué.
4. **Rappels** planifiables (une ou plusieurs heures par jour).
5. **PWA offline** : fonctionne sans réseau, synchro différée.

### V1 (rapide)
6. **Personnalisation** : heure(s) de rappel, jours de la semaine, volume voix.
7. **Statistiques** : streaks, temps total 7/30 jours, régularité.
8. **Multi‑routines** (ex. « Routine express », « Mobilité hanches »).

### V2 (plus tard)
9. **Créateur de routine** (éditeur visuel JSON).
10. **Partage/Import** de routines (URL/QR, code partage).
11. **Mode Kiné** : packs de routines, suivi patient (opt‑in, RGPD).

---

## 4) IA de l’app (navigation)
- **Accueil** : bouton « Démarrer », aperçu de la prochaine routine, streak.
- **Séance** : composant Coach (chrono, voix, bips, consignes, pauses), bouton Stop/Relancer.
- **Calendrier** : grille mensuelle + filtres (routine), stats rapides.
- **Rappels** : planification (ex. 8:00, 19:00) + toggles Jours.
- **Paramètres** : voix FR, volume, annonces, thème clair/sombre.

---

## 5) Modèle de données (MongoDB)
```ts
User {
  _id: ObjectId,
  email?: string, provider?: 'local'|'google'|..., 
  displayName?: string,
  tz: string, // ex. 'Europe/Paris'
  settings: {
    theme: 'light'|'dark',
    voiceRate: number, voicePitch: number, sound: boolean,
    reminders: [{ hh:mm, days: number[0..6], enabled: boolean }]
  },
  createdAt, updatedAt
}

Routine {
  _id: ObjectId,
  slug: string, name: string, description?: string,
  steps: Step[], // voir ci‑dessous
  totalSeconds: number,
  version: number,
  visibility: 'builtIn'|'user', ownerId?: ObjectId
}

Step {
  name: string, seconds: number,
  mode: 'mouvement'|'statique'|'respiration',
  text: string,
  cues?: { at: number, say: string }[]
}

Session {
  _id: ObjectId,
  userId: ObjectId,
  routineId: ObjectId,
  startAt: Date, endAt: Date,
  durationSec: number,
  completed: boolean, // terminé sans skip
  progress?: number,   // 0..1
  device?: { ua: string, platform: string }
}

DailySummary {
  _id: ObjectId,
  userId: ObjectId,
  date: string, // 'YYYY-MM-DD' (tz user)
  routines: [{ routineId, completed: boolean, durationSec }],
  totalSec: number,
  streakAfter: number
}
```

---

## 6) API (NestJS, REST + JWT)
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`
- `GET /routines` (built‑in + user), `POST /routines`, `PUT /routines/:id`, `DELETE /routines/:id`
- `POST /sessions/start` → renvoie `sessionId`
- `POST /sessions/:id/tick` (optionnel si offline), `POST /sessions/:id/finish`
- `GET /calendar?from&to` → agrégé par jour
- `GET /stats/summary?range=30d`
- `PUT /settings` (rappels, voix, etc.)

**Offline‑first** : file d’events locale (IndexedDB). Endpoint `POST /sync` pour pousser `events[]` (start/finish) quand réseau OK.

---

## 7) Frontend (Angular)
- `CoachComponent` (réutilise le **coach HTML** actuel → refactor en **composant JSON‑driven**)
  - Props : `routine: Routine`; `autostart: boolean`.
  - Émet `events`: `start`, `cue`, `pause`, `resume`, `finish`.
- `CalendarComponent` (grille, lib date‑fns), 
- `StatsComponent` (streaks, temps cumulé),
- `RemindersComponent` (sélecteur d’heures + jours),
- `SettingsComponent` (voix, volume, thème).

**PWA** : Service Worker (workbox), cache statique, cache API, **Background Sync** pour `POST /sync`.

---

## 8) Notifications & rappels
- **Web Push** (VAPID) + Notifications API.
- Local **Notifications Scheduler** via Service Worker + Alarms (fallback en “reminder in‑app”).
- Message type : « Séance 10 min — prêt ? » → action « Démarrer » qui ouvre `/seance`.

---

## 9) Sécurité & vie privée
- Compte **local** ou **anonyme** (local‑first). 
- Données sensibles limitées : pas de santé médicale, seulement adhérence.
- RGPD : export/suppression du compte, rétention des `Session` configurable.

---

## 10) Extensibilité
- **Éditeur de routine** : formulaire pour créer/éditer `Routine.steps` (drag & drop, durée, cues).
- **Packs** (JSON) import/export.
- **Internationalisation** (i18n) : textes d’étapes + voix.

---

## 11) Wireframes (texte)
- **Accueil**: Titre, bouton "Démarrer la routine", carte Streak (🔥 6 jours), prochain rappel (19:00), bouton « Calendrier ».
- **Séance**: grand chrono, titre étape, sous‑titre (mode), barre de progression, boutons (Pause/Skip/Stop), indicateurs brefs.
- **Calendrier**: mois courant, ronds colorés (vert = fait, orange = partiel, gris = manqué), clic → détail du jour.
- **Rappels**: liste d’heures [+], cases à cocher L‑D, toggle actif.

---

## 12) Roadmap & livrables
**Sprint 1 (MVP, 1–2 sem)**
- Composant `CoachComponent` JSON‑driven (importe routine « Douce 10 min »)
- Enregistrement `Session.finish` + `DailySummary`
- Calendrier (lecture) + PWA offline

**Sprint 2 (V1)**
- Rappels (Notifications), Stats, Paramètres voix/son
- Multi‑routines (catalogue minimal)

**Sprint 3 (V2)**
- Éditeur de routine, Import/Export JSON, Partage

**Critères d’acceptation (MVP)**
- Lancement de séance → fin auto → case « faite » dans le calendrier du jour.
- Offline : si je coupe le réseau et termine, la séance se synchronise au retour réseau.
- Rappel : je reçois une notification à l’heure programmée qui ouvre directement la séance.

---

## 13) Technique — refactor du coach HTML
- Extraire le **plan** en JSON (schema Step ci‑dessus).
- Emballer la logique chrono/voix dans un service Angular (`CoachEngineService`).
- Garder la **Web Speech API** (fallback bip) côté client.
- Tests : simulation de séquence avec horloge virtuelle (Jest + fakeTimers).

---

## 14) Ouvertures
- Export ICS de l’adhérence (calendrier perso),
- Intégration Google Fit / Apple Health (durées, calorie approximative),
- Widgets Android/iOS (lancer la séance en 1 tap).
