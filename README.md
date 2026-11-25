# NUCLEAR TYCOON

Jeu de gestion et d'exploration 3D en HTML, CSS et JavaScript natifs.

## Lancer le jeu dans VS Code

1. Ouvre le dossier du dépôt dans VS Code.
2. Ouvre `index.html`.
3. Lance-le avec **Live Server** (clic droit → Open with Live Server).
4. Le navigateur s'ouvre sur `http://127.0.0.1:5500` (ou un port similaire).

**Aucun Vite, npm, Node.js, terminal ou compilation.** Live Server sert simplement les fichiers au navigateur. Three.js est importé directement depuis un CDN en tant que module navigateur ; une connexion Internet est donc nécessaire.

## Fichiers utilisés au lancement

- `index.html` : page du jeu.
- `styles.css` : interface.
- `game.js` : scène 3D, personnage, commandes et progression.

Les anciens fichiers TypeScript de `src/` ne sont plus utilisés par cette version HTML autonome.

## Commandes

- **ZQSD** ou **flèches** : déplacer le personnage.
- **E** : interagir avec une caisse, le dépôt ou un bâtiment.
- **Échap** ou bouton pause : mettre en pause.

## Premier objectif

Récupère trois caisses de matériaux fictifs, livre-les au dépôt, puis alimente la boulangerie et le village de Valmont. Le jeu utilise des ressources et installations fictives, avec des mécaniques de gestion abstraites.
