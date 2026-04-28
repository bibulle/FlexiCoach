# FlexiCoach — Brief Design

> Document destiné à un redesign complet de l'interface utilisateur.  
> À fournir à Claude Design (ou tout designer / outil de design IA).

---

## 1. Présentation du projet

**FlexiCoach** est une Progressive Web App (PWA) de coaching personnel axée sur les routines d'exercices guidées. L'utilisateur suit des routines étape par étape, avec minuterie, guidage vocal et suivi de progression.

**Audience cible :** Adultes actifs ou sédentaires souhaitant intégrer des séances courtes (5–30 min) dans leur quotidien, depuis un ordinateur (bureau) ou un mobile.

**Ton attendu :** Motivant, épuré, moderne. Entre l'appli de sport (énergie, dynamisme) et l'appli de bien-être (clarté, respiration, sérénité).

---

## 2. Stack technique & contraintes

- **Frontend :** Angular 20 + SASS/SCSS
- **Layout max-width :** 820 px (lecture optimale)
- **Mobile-first**, responsive
- **PWA** : l'app doit fonctionner hors ligne et s'installer sur mobile
- **Thèmes prévus :** clair (actuel) + sombre (à prévoir)
- **Accessibilité :** contrastes suffisants, tailles de texte lisibles, zones cliquables ≥ 44 px

---

## 3. Pages & écrans existants

### 3.1 Page de connexion — `/login`

**Objectif :** Authentifier l'utilisateur.

**Contenu :**
- Champ email + champ mot de passe
- Bouton « Se connecter »
- Lien vers la page d'inscription
- Bouton « Continuer avec Google » (OAuth2)
- Affichage des erreurs en temps réel

**Problèmes actuels :**
- Design générique, pas d'identité visuelle forte
- Le formulaire occupe toute la largeur même sur desktop

**Attentes design :**
- Écran splitté ou centré avec illustration/branding à gauche
- Logo FlexiCoach visible et mémorable
- Champs avec états : neutre, focus, erreur, succès

---

### 3.2 Page d'inscription — `/signup`

**Objectif :** Créer un compte.

**Contenu :**
- Champ prénom/pseudo (optionnel)
- Champ email
- Champ mot de passe + confirmation
- Indicateur de robustesse du mot de passe (min 8 cars, maj, min, chiffre)
- Bouton « Créer mon compte »
- Bouton Google
- Lien retour vers connexion

**Attentes design :**
- Cohérente avec le login
- Feedback progressif sur la validation du mot de passe (indicateur visuel)

---

### 3.3 Page d'accueil — `/`

**Objectif :** Vue centrale de l'app. Consulter ses stats et choisir une routine.

**Contenu :**

**Section statistiques rapides (StatsComponent)**
- 6 métriques affichées en cartes/tuiles :
  - 🔥 Série actuelle (jours consécutifs)
  - 🏆 Meilleure série
  - ✅ Sessions totales
  - ⏱️ Minutes d'entraînement total
  - 📈 Taux d'adhérence (30 derniers jours, en %)
  - ⭐ Routine favorite

**Section liste des routines (RoutineListComponent)**
- Grille de cartes, chaque carte affiche :
  - Icône / emoji de la routine
  - Nom de la routine
  - Durée (ex : « 10 min »)
  - Niveau de difficulté (badge coloré : débutant / intermédiaire / avancé)
  - Nombre d'exercices
  - Badge « Ma routine » si créée par l'utilisateur
- Bouton « Créer une routine »
- Bouton « Importer une routine » (JSON)

**Attentes design :**
- Les stats doivent être visuellement engageantes (pas un tableau)
- Les cartes de routines doivent donner envie de cliquer
- Hiérarchie visuelle claire : stats en haut, routines en dessous
- Pagination ou scroll infini si nombreuses routines

---

### 3.4 Lecteur de routine — `/routine/:slug`

**Objectif :** Écran principal d'exécution de la routine. L'utilisateur suit les étapes en temps réel.

**Contenu :**
- Nom de la routine (en-tête)
- **Minuterie centrale** (compte à rebours en secondes)
- Étape en cours :
  - Nom de l'étape
  - Description textuelle
  - Mode : `mouvement` / `statique` / `respiration`
- Barre de progression globale (% de la routine terminée)
- Étape suivante (aperçu)
- Contrôles : ▶ Play / ⏸ Pause / ⏹ Stop
- Indicateur « Repos 10s » entre les étapes
- Guidage vocal activé/désactivé

**Particularités fonctionnelles :**
- La minuterie est l'élément clé : elle doit être **très lisible**
- Les transitions entre étapes (dont le repos de 10 s) doivent être fluides
- L'utilisateur peut être debout, loin de l'écran : la lisibilité à distance est critique

**Attentes design :**
- Layout plein écran, sombre ou concentré (mode immersif)
- La minuterie doit occuper une place dominante (grande, contrastée)
- Le nom de l'étape doit être lisible sans lunettes à 1 m
- Couleurs différentes par mode (mouvement = bleu ? / statique = vert ? / respiration = violet ?)
- Animations douces sur la progression et les transitions

---

### 3.5 Page de fin de séance — `/completion`

**Objectif :** Féliciter l'utilisateur et recueillir son ressenti.

**Contenu :**
- Message de félicitations
- Nom de la routine terminée + durée
- **Évaluation du ressenti** : échelle 1–5 avec emojis (😫 😕 😐 🙂 😊)
- Bouton « Terminer »

**Attentes design :**
- Écran court, positif, célébratoire
- Animation d'entrée (confettis ? cercle de succès ?)
- Les emojis de ressenti doivent être grands et interactifs (sélection claire)

---

### 3.6 Éditeur de routine — `/routines/new` et `/routines/:id/edit`

**Objectif :** Créer ou modifier une routine personnalisée.

**Contenu :**
- Champ : Nom de la routine
- Champ : Description
- Sélecteur : Niveau de difficulté
- Sélecteur : Icône/emoji
- Liste des étapes (ordonnée, réordonnée par glisser-déposer)
  - Chaque étape : nom, durée, mode, indicateur cues audio
  - Actions : éditer, supprimer, réordonner (drag & drop CDK Angular)
- Bouton « Ajouter une étape »
- Durée totale calculée automatiquement (affichée en temps réel)
- Bouton « Enregistrer »
- Bouton « Télécharger en JSON »

**Modal d'édition d'étape (StepEditorModal) :**
- Nom de l'étape (requis)
- Durée en secondes (min : 5 s)
- Mode : mouvement / statique / respiration (sélecteur visuel)
- Texte descriptif
- Cues audio : liste de { à Xs, dire "..." } (ajout/suppression)

**Attentes design :**
- Interface en deux colonnes sur desktop (formulaire gauche / aperçu droite) ou en étapes sur mobile
- Les étapes dans la liste doivent être compactes mais lisibles
- Le drag & drop doit avoir un retour visuel clair (poignée, ombre portée pendant le déplacement)
- La durée totale doit être mise en avant (badge ou bannière en haut)
- La modale doit être claire et non surchargée

---

### 3.7 Calendrier — `/calendar`

**Objectif :** Visualiser l'assiduité mensuelle.

**Contenu :**
- Vue mensuelle (grille 7 × 5/6)
- Chaque jour coloré selon le taux de complétion :
  - ✅ Vert : jour complet
  - 🟡 Jaune/orange : jour partiel
  - ⬜ Gris : jour manqué
  - Blanc/clair : jour futur
- Navigation mois précédent / suivant
- Indicateur du mois affiché (ex : « Avril 2026 »)

**Attentes design :**
- Calendrier compact et lisible
- Les couleurs de statut doivent être accessibles (non uniquement basées sur la couleur)
- Possibilité d'afficher une légende
- Sur mobile : vue compacte (taille des cases réduite)

---

### 3.8 Administration — `/admin`

**Objectif :** Gestion des utilisateurs (accès réservé aux admins).

**Contenu :**
- Tableau ou liste des utilisateurs :
  - Email, prénom, date d'inscription, provider (local/Google)
- Action « Réinitialiser le mot de passe » → ouvre une modale
  - Champ nouveau mot de passe
  - Validation + confirmation

**Attentes design :**
- Interface sobre, utilitaire
- Cohérente avec le reste de l'app (même design system)
- Tableau responsive (cards sur mobile)

---

## 4. Composants globaux

### Header
- Logo FlexiCoach (cliquable → retour accueil)
- Menu utilisateur (dropdown) :
  - Nom/email de l'utilisateur
  - Lien Calendrier
  - Lien Admin (si admin)
  - Bouton Déconnexion

**Attentes design :**
- Header discret sur les écrans d'entraînement (mode immersif)
- Avatar ou initiales de l'utilisateur dans le menu

### Notification de mise à jour (PWA)
- Bandeau ou toast discret proposant de recharger l'app
- Bouton « Mettre à jour » + bouton fermer

---

## 5. Design system attendu

### Couleurs

| Rôle | Suggestion |
|------|-----------|
| Primaire (action, CTA) | Bleu énergique (#3b82f6 ou équivalent) |
| Secondaire (accents) | Orange ou Teal selon ambiance choisie |
| Succès / Complet | Vert (#22c55e) |
| Avertissement / Partiel | Orange (#f59e0b) |
| Erreur | Rouge (#ef4444) |
| Neutre fond | Gris très clair (#f8fafc) |
| Texte principal | Gris foncé (#1e293b) |
| Texte secondaire | Gris moyen (#64748b) |

### Typographie
- **Titres :** Police sans-serif moderne, bold, lisible
- **Corps :** Lisible à petite taille, bon line-height
- **Minuterie :** Police monospace ou display pour les chiffres (très lisible)

### Espacements
- Grille de base : 8 px
- Composants : padding interne 16–24 px
- Cards : border-radius 12–16 px, ombre légère

### Iconographie
- Icônes cohérentes (Lucide Icons ou Material Symbols recommandés)
- Emojis uniquement pour les contenus utilisateur (routine icons, feelings)

### Niveaux de difficulté (badges)
| Niveau | Couleur suggérée |
|--------|-----------------|
| Débutant | Vert doux |
| Intermédiaire | Bleu |
| Avancé | Orange/Rouge |

### Modes d'exercice (couleurs dans le player)
| Mode | Couleur suggérée |
|------|-----------------|
| Mouvement | Bleu (#3b82f6) |
| Statique | Vert (#22c55e) |
| Respiration | Violet (#8b5cf6) |

---

## 6. Flux utilisateurs clés

### Flux 1 — Première utilisation
```
Page connexion → Inscription → Accueil (liste vide) → Découverte des routines built-in → Lancer une routine
```

### Flux 2 — Utilisation quotidienne
```
Accueil → Stats du jour → Choisir une routine → Lecteur → Fin de séance (ressenti) → Retour accueil
```

### Flux 3 — Création de routine
```
Accueil → « Créer une routine » → Éditeur → Ajouter étapes → Enregistrer → Lecteur de test
```

### Flux 4 — Suivi progression
```
Accueil (stats rapides) → Calendrier (vue mensuelle) → Retour accueil
```

---

## 7. Points d'attention spécifiques

1. **Lisibilité pendant l'exercice** : L'utilisateur est debout, en mouvement, parfois à 1–2 m de l'écran. Les textes et la minuterie du lecteur doivent être lisibles à distance.

2. **One-hand use** : Sur mobile, les actions principales (play/pause, valider le ressenti) doivent être accessibles du pouce, en bas d'écran.

3. **Mode sombre prévu** : Le design system doit anticiper un thème sombre (variables CSS / tokens). Particulièrement important pour le lecteur (mode immersif).

4. **PWA / Installable** : L'app peut être installée sur mobile comme une app native. Le design doit respecter les conventions d'interface mobile (zones de navigation en bas sur iOS/Android).

5. **Offline** : Certains écrans (lecteur de routine déjà chargée) doivent fonctionner sans connexion.

6. **Animations légères** : Transitions entre étapes dans le lecteur, animation de la barre de progression, feedback des boutons. Pas d'animations lourdes qui ralentissent.

7. **Internationalisation** : L'app est actuellement en français. Prévoir que les labels peuvent être plus longs dans d'autres langues.

---

## 8. Ce que le design NE doit PAS faire

- Surcharger les écrans d'information (sobriété)
- Utiliser des couleurs trop proches pour les statuts (accessibilité daltonisme)
- Placer les CTA principaux hors de portée du pouce sur mobile
- Créer un lecteur de routine difficile à lire debout
- Utiliser des animations qui retardent l'interaction (spinner bloquant, transition > 300 ms)

---

## 9. Livrables attendus du designer

1. **Design system** : tokens de couleur, typographie, spacings, composants de base (boutons, champs, badges, cards, modales)
2. **Maquettes desktop + mobile** pour chaque page listée (section 3)
3. **États interactifs** : hover, focus, erreur, chargement, vide (empty state)
4. **Prototype cliquable** (optionnel mais apprécié) pour les flux principaux
5. **Dark mode** : variantes sombres des maquettes

---

## 10. Références visuelles (inspiration)

- **Calm / Headspace** : clarté, espacement généreux, ton apaisant
- **Freeletics / Nike Training Club** : énergie, typographie bold, progression visuelle forte
- **Duolingo** : gamification légère, streaks, emojis motivants
- **Linear / Raycast** : design system épuré, dark mode excellent

---

*Document généré le 2026-04-28 — FlexiCoach v0.7.x*
