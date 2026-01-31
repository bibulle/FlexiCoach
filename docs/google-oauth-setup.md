# Configuration Google OAuth pour FlexiCoach

Ce guide vous explique comment configurer l'authentification Google OAuth2 pour FlexiCoach.

## Prérequis

- Un compte Google
- Accès à [Google Cloud Console](https://console.cloud.google.com)

## Étape 1 : Créer un projet Google Cloud

1. Connectez-vous à [Google Cloud Console](https://console.cloud.google.com)
2. Cliquez sur le sélecteur de projet en haut de la page
3. Cliquez sur **Nouveau projet**
4. Donnez un nom à votre projet (ex: "FlexiCoach")
5. Cliquez sur **Créer**

## Étape 2 : Activer l'API Google+

1. Dans le menu de navigation, allez dans **APIs & Services** > **Library**
2. Recherchez "Google+ API"
3. Cliquez sur **Google+ API**
4. Cliquez sur **Activer**

## Étape 3 : Créer des identifiants OAuth 2.0

1. Dans le menu, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Si demandé, configurez d'abord l'écran de consentement OAuth (voir Étape 4)
4. Sélectionnez **Web application** comme type d'application
5. Donnez un nom à votre client OAuth (ex: "FlexiCoach Web Client")
6. Dans **Authorized JavaScript origins**, ajoutez :
   - `http://localhost:4200` (développement)
   - `https://coach.bibulle.fr` (production)
7. Dans **Authorized redirect URIs**, ajoutez :
   - `http://localhost:3000/api/auth/google/callback` (développement)
   - `https://coach.bibulle.fr/api/auth/google/callback` (production)
8. Cliquez sur **Create**
9. **Copiez le Client ID et le Client Secret** (vous en aurez besoin pour la configuration)

## Étape 4 : Configurer l'écran de consentement OAuth

1. Dans le menu, allez dans **APIs & Services** > **OAuth consent screen**
2. Choisissez **External** (sauf si vous avez un workspace Google)
3. Cliquez sur **Create**
4. Remplissez les informations obligatoires :
   - **App name** : FlexiCoach
   - **User support email** : Votre email
   - **Developer contact information** : Votre email
5. Cliquez sur **Save and Continue**
6. Dans **Scopes**, ajoutez les scopes suivants :
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
7. Cliquez sur **Save and Continue**
8. Dans **Test users** (si mode test), ajoutez vos emails de test
9. Cliquez sur **Save and Continue**
10. Vérifiez le résumé et cliquez sur **Back to Dashboard**

## Étape 5 : Configuration des variables d'environnement

### Développement

Créez ou modifiez le fichier `.env` à la racine du projet :

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Production

Configurez les mêmes variables d'environnement sur votre serveur de production :

```bash
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_CALLBACK_URL=https://coach.bibulle.fr/api/auth/google/callback
```

**Important** : Ne commitez JAMAIS vos secrets dans Git. Le fichier `.env` doit être dans `.gitignore`.

## Étape 6 : Test de la configuration

1. Démarrez le backend : `npm start`
2. Démarrez le frontend : `nx serve frontend`
3. Allez sur `http://localhost:4200/login`
4. Cliquez sur **Se connecter avec Google**
5. Vous devriez être redirigé vers Google pour autoriser l'application
6. Après autorisation, vous devriez être redirigé vers l'application avec votre session active

## Domaines autorisés

Assurez-vous que les domaines suivants sont autorisés dans Google Cloud Console :

**Développement** :
- JavaScript origins : `http://localhost:4200`
- Redirect URIs : `http://localhost:3000/api/auth/google/callback`

**Production** :
- JavaScript origins : `https://coach.bibulle.fr`
- Redirect URIs : `https://coach.bibulle.fr/api/auth/google/callback`

## Troubleshooting

### Erreur "redirect_uri_mismatch"

- Vérifiez que l'URL de callback dans Google Cloud Console correspond exactement à celle configurée
- Vérifiez que vous avez bien ajouté l'URL complète avec le protocole (http/https)

### Erreur "access_denied"

- Vérifiez que l'écran de consentement OAuth est bien configuré
- En mode test, vérifiez que l'utilisateur est bien ajouté dans les Test users

### L'avatar ne s'affiche pas

- Vérifiez que le scope `userinfo.profile` est bien configuré
- Vérifiez que l'utilisateur a une photo de profil Google

## Authentification hybride

FlexiCoach supporte deux méthodes d'authentification :

1. **Email/Password** : Méthode classique avec inscription manuelle
2. **Google OAuth** : Connexion rapide avec compte Google

### Liaison automatique des comptes

Si un utilisateur a déjà un compte email/password et se connecte avec Google (même email), le compte Google sera automatiquement lié. L'utilisateur pourra ensuite se connecter des deux façons.

## Sécurité

- Les utilisateurs OAuth n'ont pas de mot de passe stocké en base de données
- L'email Google doit être vérifié (`email_verified: true`)
- Le `providerId` Google est unique et permet d'identifier l'utilisateur
- Les tokens JWT sont générés de la même manière pour les deux méthodes d'authentification

## Ressources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [Passport.js Google OAuth20 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
