# decode-work Chrome extension

Extension Chrome (Manifest V3) pour [decode-work.fr](https://decode-work.fr) :

1. **Clipper** : envoyer l’onglet courant vers decode-work
2. **Pastille Meet** : sur Google Meet, proposer d’armer le transcript → Yamada

Source de vérité : monorepo decode-work (`extensions/clipper/`). Ne pas éditer ce dépôt à la main : republier via le script monorepo.

## Prérequis

1. Compte membre sur [decode-work.fr](https://decode-work.fr) (ou instance locale)
2. Google Chrome (desktop)
3. Session decode-work ouverte dans **le même profil** Chrome que l’extension

## Install (dev / collab)

```bash
git clone https://github.com/D-Code-Mrc/decode-work-extension.git
```

Puis dans Chrome :

1. Ouvrir `chrome://extensions`
2. Activer **Mode développeur**
3. **Charger l’extension non empaquetée**
4. Choisir le dossier cloné (`decode-work-extension`)

Tuto in-app : [Extension Chrome](https://decode-work.fr/settings/chrome-extension)

## Configurer l’URL Work

Ouvrir le popup de l’extension, renseigner l’URL de base (ex. `https://decode-work.fr` ou `http://127.0.0.1:3100`), puis capturer une page une fois pour enregistrer l’URL dans `chrome.storage`.

## Pastille Meet

Sur une conférence active (`meet.google.com/xxx-xxxx-xxx` ou `/lookup/…`) :

- **Commencer la transcription** : lie / crée un call Work et arme le pipeline transcript
- **×** : ne plus proposer ce Meet aujourd’hui
- **Fermer** : cache la pastille pour la session

Pas besoin des 5 $ Chrome Web Store pour un chargement non empaqueté.

## Licence

MIT. Voir `LICENSE`.
