# NUCLEAR TYCOON

Prototype d'un jeu de gestion industrielle et d'exploration en 3D, jouable dans un navigateur.

## Technologies

- React + TypeScript
- Vite
- Three.js

## Lancer le projet en local

~~~bash
npm install
npm run dev
~~~

Pour générer la version de production :

~~~bash
npm run build
npm run preview
~~~

## Prototype actuel

- Monde 3D généré avec Three.js
- Personnage 3D low-poly contrôlable
- Caméra Gestion (isométrique) et caméra Exploration
- Bâtiments de départ : mine, centre industriel, centrale et ville
- Sélection et amélioration des bâtiments
- Menu de construction
- Ressources et revenus de démonstration

## Commandes

- **ZQSD** ou **flèches** : déplacer le personnage en mode Exploration
- **V** : basculer entre les deux caméras
- **Mode Gestion** : glisser pour tourner la caméra, molette pour zoomer, cliquer sur un bâtiment pour le sélectionner

## Note de conception

Les systèmes nucléaires sont représentés par des mécaniques de gestion fictives et abstraites. Le prototype se concentre sur la construction, l'économie, l'exploration et la production d'électricité.
