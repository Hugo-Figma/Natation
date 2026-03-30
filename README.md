
# Fiche d'entraînement natation

This is a code bundle for Fiche d'entraînement natation. The original project is available at https://www.figma.com/design/3ZbhOH3eytN8Fk1V2pObQA/Fiche-d-entra%C3%AEnement-natation.

## Prérequis

- Node.js 22 (utilisé par la CI) et npm.
- Un navigateur moderne pour tester le rendu.

## Démarrer en local

1. Installer les dépendances : `npm install`
2. Lancer le serveur Vite : `npm run dev -- --host`
3. Ouvrir le navigateur sur l'URL indiquée en sortie (par défaut http://localhost:5173/).  
   Les données de démonstration sont déjà présentes ; ouvrez une séance depuis l'accueil pour afficher la fiche.

## Prévisualiser le PDF Typst

Pour vérifier le rendu du template Typst directement depuis l'interface :

1. Aller sur une fiche d'entraînement.
2. Ouvrir le menu `…` en haut à droite.
3. Choisir « Exporter PDF ». La compilation Typst se fait dans le navigateur et télécharge le PDF.

Si vous préférez un test rapide en ligne de commande (sans navigateur), lancez `node tmp-typst.mjs`. Le script compile un exemple minimal et affiche `ok` si la compilation Typst passe.

## Plan de validation pour la PR

- [ ] Lancer `npm install` puis `npm run dev`.
- [ ] Ouvrir une séance exemple et exporter le PDF via le menu `…` pour vérifier le nouveau template Typst.
- [ ] (Optionnel) Exécuter `node tmp-typst.mjs` pour s’assurer que la compilation Typst fonctionne côté CLI.

## Deployment

Commits pushed to `main` automatically trigger a GitHub Pages deployment (via `.github/workflows/deploy.yml`). The site is built with `npm run build` and served from the `gh-pages` branch at the `/Natation/` base path.
  
