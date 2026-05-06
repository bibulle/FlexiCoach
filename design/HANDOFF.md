# FlexiCoach — Hand-off design → Angular

> **Pour Claude Code.** Ce document fait le pont entre les maquettes hi-fi (`FlexiCoach Hi-Fi.html`) et le code Angular existant dans `apps/frontend/`. Démarre par la section *Quick start* puis traite les écrans dans l'ordre.

---

## 0) Quick start

1. Lis `apps/frontend/src/app/app.routes.ts` — la liste des routes existantes correspond 1-pour-1 aux écrans hi-fi.
2. Ouvre `FlexiCoach Hi-Fi.html` (à la racine du projet design) dans un navigateur — chaque section a un numéro (01 → 08) et le `data-screen-label` correspond.
3. Recopie d'abord les **tokens** (`hifi/design-system.css`) dans `src/styles.sass` ou un fichier `tokens.scss`. Ensuite traite les écrans dans cet ordre :
   - 08 Auth (le plus simple, sans dépendance)
   - 02 Routine list
   - 03 Lecteur
   - 04 Completion
   - 01 Accueil
   - 05 Calendrier
   - 06 Éditeur
   - 07 Stats + Settings (composant à créer)

4. Ne touche pas aux services (`AuthService`, `RoutineService`, `SessionService`) — uniquement aux templates et SCSS.

---

## 1) Design tokens à copier

Tout est dans `hifi/design-system.css`. Mappe-les sur SCSS :

```scss
:root {
  // Brand (bleu — chemin remplaçable plus tard)
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-50:  #eff6ff;
  --primary-100: #dbeafe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;

  // Mode colors (player + editor)
  --mode-resp: #0ea5e9;       // respiration
  --mode-mvt:  var(--primary-500); // mouvement
  --mode-stat: #a855f7;       // statique

  // Surfaces
  --surface:   #ffffff;
  --surface-2: #f8fafc;
  --surface-3: #e2e8f0;
  --line:      #e2e8f0;

  // Ink
  --ink:    #0f172a;  // titles
  --ink-2:  #1e293b;  // body
  --ink-3:  #475569;  // secondary
  --ink-4:  #64748b;  // muted
  --ink-5:  #94a3b8;  // faint

  // Status
  --success: #22c55e;
  --warning: #f59e0b;
  --danger:  #dc2626;

  // Effects
  --radius:    12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
  --shadow:    0 4px 12px -4px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 16px 40px -16px rgba(15, 23, 42, 0.18);

  // Type
  --font-sans:    'Inter', -apple-system, system-ui, sans-serif;
  --font-display: 'Inter', sans-serif; // mêmes glyphs, weights différents
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  // Spacing scale (multiples de 4)
  --s-1: 4px;  --s-2: 8px;   --s-3: 12px;
  --s-4: 16px; --s-5: 20px;  --s-6: 24px;
  --s-7: 32px; --s-8: 40px;  --s-9: 48px;
}
```

**Polices** : ajouter dans `index.html`
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

---

## 2) Mapping écran → composant Angular

| # | Écran hi-fi          | Composant Angular existant          | Route                       | Statut     |
|---|----------------------|-------------------------------------|-----------------------------|------------|
| 01 | Accueil             | `RoutineListComponent` (à étendre) | `/`                         | Refonte UI |
| 02 | Routines catalogue  | `RoutineListComponent`              | `/`                         | Refonte UI |
| 03 | Lecteur             | `RoutinePlayerComponent`            | `/routine/:slug`            | Refonte UI |
| 04 | Fin de séance       | `CompletionComponent`               | `/completion`               | Refonte UI |
| 05 | Calendrier          | `CalendarComponent`                 | `/calendar`                 | Refonte UI |
| 06 | Éditeur             | `RoutineEditorComponent`            | `/routines/new`, `:id/edit` | Refonte UI |
| 07 | Stats + Settings    | `StatsComponent` (+ nouveau)        | `/settings` (à créer)       | À créer    |
| 08 | Auth                | `LoginComponent` / `SignupComponent`| `/login`, `/signup`         | Refonte UI |

**Note 01 vs 02** : l'accueil hi-fi (triple anneau + grille routines) fusionne en pratique avec `RoutineListComponent`. Ajoute le bloc « anneaux » en haut conditionnellement quand l'utilisateur a au moins 1 séance.

---

## 3) Composants partagés à extraire

Crée un dossier `apps/frontend/src/app/components/shared/` avec :

### `IconComponent` (`<app-icon name="play" [size]="20">`)
Toutes les icônes utilisées sont listées dans `hifi/primitives.jsx` (chercher `const Icon`). Recopie le SVG inline dans une map. **Pas de librairie externe** (lucide-angular pèse 200 ko, on a 30 icônes).

### `RingComponent` (`<app-ring [pct]="0.7" [size]="240" color="#3b82f6">`)
Anneau SVG circulaire. Voir `hifi/primitives.jsx` → `const Ring`. Utilisé dans Accueil + Lecteur (mobile).

### `TripleRingComponent`
Trois anneaux concentriques (Apple Watch). Voir `const TripleRing`. Utilisé seulement sur Accueil. Inputs : `rings: { color, pct, label }[]`, `size`, `center` (un texte ou un slot).

### `BadgeComponent` (`<app-badge variant="debutant|intermediaire|avance|mine">`)
Pastille de niveau / tag. Voir classes `.badge-*` dans `hifi/design-system.css`.

### `ToggleComponent` (`<app-toggle [(value)]="enabled">`)
Switch iOS-like. Voir `Toggle` dans `hifi/screen-settings.jsx`.

### `HeaderComponent` (déjà existant)
À aligner sur `HEADER_HIFI` de `hifi/screen-home.jsx` :
- Logo dégradé 28×28 + texte « FlexiCoach » bold 18
- Onglets (Accueil / Calendrier / Routines) — pilule active sur fond `--primary-50`
- À droite : icône cloche + avatar circulaire 36×36
- Sticky en haut, `border-bottom: 1px solid var(--line)`
- Mobile : pas d'onglets

---

## 4) Composants par écran

### 03 — Lecteur (le plus important, c'est le cœur du produit)

**Fichier** : `routine-player.component.html`

Layout (haut → bas) :
1. **Top-bar** : retour ← + nom routine + menu ⋯ — 56 px, fond `--surface`, border-bot
2. **Timeline horizontale** : `<div>` flex, chaque étape = un segment dont `flex` = `step.seconds`. Couleur = mode (resp/mvt/stat). État : done (rempli + check), current (haut +120 %, `linear-gradient(180deg, rgba(255,255,255,0.18), transparent)` overlay + barre de progression `rgba(255,255,255,0.35)`), todo (bordure dashed, opacité 0.45). Padding 32 px haut/bas, fond `--surface`.
3. **Chrono géant** : centre, fond `--surface-2`, flex 1.
   - Badge mode (couleur + texte uppercase, letter-spacing 0.12em)
   - Titre étape `font-display 38px bold`
   - Chrono **JetBrains Mono 168px desktop / 110px mobile**, `font-variant-numeric: tabular-nums`, `letter-spacing: -0.05em`, `line-height: 0.9`
   - Description sous le chrono, max 480 px, color `--ink-3`
4. **Footer** : carte « À suivre » (couleur du mode à gauche, nom + durée à droite) + 3 boutons ronds (prev 60 px / play-pause 88 px primary / next 60 px). Fond `--surface`, border-top.

**Comportements à conserver** (déjà dans `routine-player.component.ts`) :
- `CoachEngineService` pour le tick / les cues vocaux
- Web Speech API
- Wake lock pour ne pas éteindre l'écran

**À ajouter** : la timeline est nouvelle. Donne-lui sa propre méthode `getTimelineSegments()` qui retourne `[{ flex, color, status, progress }]` calculée depuis `currentStepIndex` + `elapsedInStep`.

### 04 — Fin de séance

**Fichier** : `completion.component.html`

- Hero check vert dans cercle dégradé (84/110 px), shadow colorée
- Titre « Bravo, *prénom* ! » + sous-titre routine + durée
- 3 stat-blocks : Durée (mono), Étapes (mono), Série (carte orange dégradée 🔥)
- Sélecteur d'humeur 4 options (selected = `border: 2px solid --primary-500`, fond `--primary-50`, lift -2 px)
- `<textarea>` note libre
- 2 boutons CTA (Voir calendrier primary / Refaire secondary)
- Footer : « Prochain rappel à 19:00 »

**Persistance** : à la sélection d'humeur, persiste sur `Session.feeling` côté backend (à ajouter au schema). La note libre va dans `Session.note`.

### 02 — Routines catalogue

**Fichier** : `routine-list.component.html`

- Header standard
- Hero : « Catalogue » label + h1 « Routines. » + sous-titre + bouton « Nouvelle routine » (admin uniquement)
- Filtres en pills : `[Tout] [Quotidien] [Bureau] [Sport] [Mes routines]` — actif = fond `--ink` blanc.
- Grid auto-fill `minmax(280px, 1fr)`, gap 14
- Card : barre couleur top (3 px, du tag), label tag + badge "Ma routine" si perso, h3 nom, description (min-height 36 pour aligner), méta (durée + étapes + niveau), boutons (Démarrer + ⋯ pour persos)

**Filtres** : ajoute un signal `activeFilter` et filtre `routines()`. Tags par défaut : tout / quotidien / bureau / sport / perso (où `perso` = `routine.visibility === 'user'`).

### 01 — Accueil (anneaux)

**Fichier** : à insérer en haut de `routine-list.component.html` ou dans un nouveau `home.component.ts`

- Header standard
- Bloc « Bonjour, *prénom*. » + sous-titre contextualisé
- Grid 2 colonnes (desktop) / 1 (mobile) :
  - **Gauche** : `<app-triple-ring>` 240 px avec 3 anneaux (temps 0–10 min, série 0–7 j, routine 0–100 %), centre = bouton « Reprendre » + temps restant
  - **Droite** : 3 stats (séries, total, sessions) + CTA « Voir mon calendrier »
- Sous le bloc : titre « Pour aujourd'hui » + 2-3 routines en cartes horizontales (image, nom, durée, bouton play)

### 05 — Calendrier

**Fichier** : `calendar.component.html`

- Header standard
- Hero : sélecteur année + bouton « cette semaine »
- Bloc tendance : courbe SVG mensuelle (12 points, gradient sous la courbe). KPI à droite : moy/mois.
- Heatmap GitHub-like : 53 colonnes × 7 lignes. Chaque case 12 px, gap 3, radius 3.
  - Pas de séance : `--surface-3`
  - 1+ séances : `--primary-300` à `--primary-700` selon densité
  - Hover : tooltip avec date + détails
- Légende en bas

**Données** : utilise `Session[]` du `SessionService.list()`. Groupe par `format(date, 'yyyy-MM-dd')`.

### 06 — Éditeur

**Fichier** : `routine-editor.component.html`

Layout 2 colonnes (desktop) / 1 (mobile) :
- **Toolbar sticky** top : retour + titre + Annuler + Enregistrer (primary)
- **Gauche** :
  - Card méta : nom (input grand 22 px), description (textarea), pills (niveau / tag / visibilité)
  - 3 mini-stats (durée totale mono / étapes / modes)
  - Liste étapes : drag handle ⋮⋮ + numéro mono + barre couleur du mode + nom + sous-titre mode + durée mono à droite + ⋯
  - Étape sélectionnée : `border: 2px solid <mode-color>`, fond couleur 10 %
- **Droite (desktop seulement)** : panneau d'édition d'étape, sticky
  - Champs : nom, durée (mono), mode (select), consigne (textarea)
  - Liste des cues (`{ at: number, say: string }`) avec bouton +
  - Bouton Supprimer rouge

**Mobile** : panneau de droite devient un bottom-sheet/modal qui s'ouvre au tap sur l'étape.

**DnD** : utilise `@angular/cdk/drag-drop` avec `cdkDropList`.

### 07 — Stats + Paramètres

**Fichier nouveau** : créer `settings.component.ts` + route `/settings`.

Layout 2 colonnes (desktop) :
- **Gauche** (Stats — réutilise `StatsComponent` existant)
  - 4 BigStats : Série actuelle (carte orange), Temps cumulé (mono), Séances (X/30), Régularité %
  - Card « Activité par jour de la semaine » : 7 barres horizontales
  - Card « Top routines » : nom + barre + nombre de fois
- **Droite** (Settings)
  - Card Rappels : chaque rappel = heure mono 22 px + 7 ronds jours (L M M J V S D) + toggle. Bouton + ajouter en haut.
  - Card Coach vocal : voix (select), vitesse (slider 0.5–2), volume (slider 0–1), bips (toggle)
  - Card Apparence : 3 vignettes thème (clair / sombre / auto) — sélectionnée = border `--primary-500`
  - Bouton « Se déconnecter » (variant danger)

**Backend** : modèle `User.settings` existe déjà dans la spec. Endpoint `PUT /settings` à exposer.

### 08 — Auth (Login + Signup)

**Fichiers** : `login.component.html`, `signup.component.html`

Desktop : grid 2 colonnes 50/50.
- **Gauche** : panneau dégradé `linear-gradient(160deg, var(--primary-700) 0%, var(--primary-500) 60%, #0e7490 100%)`, padding 60×56. Logo blanc en haut. Hero text au milieu. Stats en bas (3 chiffres).
- **Droite** : formulaire centré max-width 380.

Mobile : pas de split, formulaire pleine largeur avec hero text au-dessus.

Formulaire :
1. Bouton « Continuer avec Google » (secondary, icône Google 4 couleurs SVG)
2. Séparateur « OU »
3. Champs : (Prénom si signup), Email, Mot de passe (avec lien « Oublié ? » si login)
4. Checkbox CGU si signup
5. Bouton CTA primary large
6. Lien bascule login ↔ signup

**OAuth Google** : flow déjà câblé dans `AuthService`. Le bouton appelle `authService.loginWithGoogle()`.

---

## 5) Stratégie d'implémentation

1. **Ne refais pas tout d'un coup.** Une PR = un écran. Ordre suggéré dans le Quick start.
2. **Garde la logique existante.** Ne touche aux `*.component.ts` que pour ajouter des accesseurs (signals dérivés). Le travail est 90 % template + SCSS.
3. **Tests** : les `*.spec.ts` existants doivent continuer à passer. Ajoute des tests visuels (snapshot) plus tard.
4. **Mobile-first** : écris d'abord le SCSS mobile, puis ajoute `@media (min-width: 768px)` pour desktop.
5. **Direct port from JSX** : les fichiers `hifi/screen-*.jsx` sont en React mais la structure DOM est portable telle quelle. Lis-les comme des spécifications HTML.

---

## 6) Checklist par écran

Pour chaque écran à porter :

- [ ] Tokens CSS appliqués via variables (pas de couleurs hardcodées)
- [ ] Inter + JetBrains Mono chargées
- [ ] Mobile testé < 400 px de large
- [ ] Desktop testé à 1024 + 1440
- [ ] États : empty, loading, error
- [ ] Accessibilité : focus visible, aria-label sur les boutons-icônes, contraste AA
- [ ] Espacements alignés sur la scale 4-px (`--s-*`)
- [ ] Typo cohérente : `.type-display` / `.type-h1` / `.type-h2` / `.type-h3` / `.type-body` / `.type-caption` / `.type-label` / `.type-mono`
- [ ] Boutons : `.btn-primary` / `.btn-secondary` / `.btn-ghost`, taille `.btn-lg` ou `.btn-icon`

---

## 7) Choses qui ne sont *pas* dans les maquettes

- Modale de confirmation suppression
- Toasts d'erreur/succès
- Loading skeleton (utilise un shimmer sur les cartes)
- Page 404
- Modale partage de routine (V2)

À designer au fur et à mesure, en réutilisant les tokens.

---

## 8) Questions ouvertes à confirmer avec le PO

- Le triple anneau (Accueil) : on garde 3 anneaux ou on simplifie à 1 ?
- Le bloc humeur en fin de séance : opt-in ou obligatoire ?
- Mode sombre : on l'expose en V1 ou plus tard ?
- Pour la voix : on permet de choisir parmi les voix du navigateur ou on en force une ?

---

**Fichiers à lire dans cet ordre pour comprendre le système :**
1. `hifi/design-system.css` — tokens
2. `hifi/primitives.jsx` — Icon, Ring, TripleRing
3. `hifi/screen-player.jsx` — l'écran le plus complexe, modèle de référence
4. Les autres `screen-*.jsx`
