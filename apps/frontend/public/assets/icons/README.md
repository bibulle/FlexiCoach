# Icônes PWA

Ce dossier doit contenir les icônes de l'application dans les formats suivants :

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Génération des icônes

Vous pouvez utiliser un outil en ligne comme [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) ou [RealFaviconGenerator](https://realfavicongenerator.net/) pour générer toutes les tailles à partir d'une image source.

### Exemple avec pwa-asset-generator :

```bash
npx pwa-asset-generator logo.png ./apps/frontend/src/assets/icons
```

## Logo temporaire

En attendant la création d'un vrai logo, vous pouvez créer un logo simple avec :
- Fond bleu (#3b82f6)
- Texte blanc "FC" ou icône d'haltère/exercice
- Format carré avec coins arrondis
