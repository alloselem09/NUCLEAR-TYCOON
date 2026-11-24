# NUCLEAR TYCOON

Prototype de jeu de gestion et d'exploration 3D, lancé directement depuis `index.html`.

## Lancer le jeu

1. Ouvre le dossier du projet.
2. Double-clique sur `index.html` (ou clic droit → Ouvrir avec → navigateur).
3. Le jeu démarre dans Chrome, sans Vite, terminal, serveur local ni extension.

Une connexion Internet est nécessaire au premier chargement pour récupérer React, Three.js et Babel depuis leurs CDN. Aucun logiciel ni paquet n'est à installer sur l'ordinateur.

## Architecture navigateur

- `index.html` : point d'entrée autonome et lancement de l'application.
- `src/Game.tsx` : interface, logique et scène 3D du jeu.
- `src/styles.css` : styles de l'interface.
- Les bibliothèques sont chargées comme scripts navigateur ; Babel transforme le TSX au chargement. Il n'y a plus d'import de modules ni de commande Vite dans le chemin de lancement.

## Commandes

- **ZQSD** ou **flèches** : déplacer le personnage en mode Exploration.
- **E** : interagir avec les éléments proches.
- **V** : basculer entre caméra Gestion et caméra Exploration.
- **Mode Gestion** : glisser pour tourner la caméra, molette pour zoomer, cliquer sur un bâtiment pour le sélectionner.

## Note de conception

Les éléments industriels et les ressources sont fictifs et abstraits. Le prototype se concentre sur la construction, l'économie, l'exploration et la production d'électricité.
