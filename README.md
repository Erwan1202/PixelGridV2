# PixelGrid V2

Une application fullstack inspirée du concept r/place : un canvas collaboratif où les utilisateurs peuvent placer des pixels en temps réel.

## Fonctionnalités

- **Authentification complète** : Inscription, connexion, et déconnexion avec gestion de tokens JWT (Access & Refresh).
- **Gestion de rôles** : Distinction entre utilisateurs (`user`) et administrateurs (`admin`).
- **Canvas collaboratif** : Les utilisateurs peuvent placer des pixels sur une grille partagée.
- **Mise à jour en temps réel** : Les changements sur la grille sont propagés à tous les clients connectés via WebSockets (Socket.io).
- **Sécurité** : Middlewares pour la protection CORS, limitation de requêtes (rate limiting), et validation des données.
- **Double base de données** :
  - **PostgreSQL** pour les données relationnelles (utilisateurs, état de la grille).
  - **MongoDB** pour l'historique des modifications (logs de pixels).
- **API double** : Exposition des données via une API RESTful et une API GraphQL.

## Tech Stack

**Back-end**
- **Framework** : Express.js
- **Bases de données** : PostgreSQL (avec `pg`), MongoDB (avec `mongoose`)
- **Authentification** : JSON Web Tokens (JWT)
- **Temps réel** : Socket.io
- **API** : REST & GraphQL (Apollo Server)
- **Tests** : Jest & Supertest

**Front-end**
- **Framework** : React (avec Vite)
- **Gestion d'état** : React Context
- **Communication** : Axios, Socket.io Client

## Prérequis
- Node.js (>= 18) et npm
- PostgreSQL (local ou conteneur)
- MongoDB (local ou Atlas)

## Démarrage rapide (développement)
1) Cloner le dépôt

```bash
git clone https://github.com/Erwan1202/PixelGridV2.git
cd PixelGridV2
```

2) Back-end

```bash
cd server
npm install
# créer un fichier .env (exemples ci‑dessous)
npm run dev    # démarre le serveur en dev (nodemon)
```

Variables d'environnement (exemple pour `server/.env`) — tu peux aussi utiliser `server/.env.example`

```
# PostgreSQL
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=pixelgrid

# MongoDB (local ou URI Atlas) — optionnel
MONGO_URI=mongodb://localhost:27017/pixelgrid

# JWT (noms utilisés par le serveur)
JWT_ACCESS_SECRET=une_chaine_longue_pour_access_token
JWT_REFRESH_SECRET=une_chaine_longue_pour_refresh_token

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# Serveur
PORT=3001
NODE_ENV=development

# Optionnel
SKIP_DB=false
```

Endpoints utiles (par défaut)
- REST : http://localhost:3001/api
- GraphQL : http://localhost:3001/graphql
- Socket.io : ws://localhost:3001

3) Front-end

```bash
cd client
npm install
# créer un fichier .env avec :
# VITE_API_BASE_URL=http://localhost:3001
# VITE_SOCKET_URL=http://localhost:3001
npm run dev   # lance Vite (par défaut http://localhost:5173)
```

## Scripts disponibles

- Server (`server/package.json`)
	- `npm run dev` — démarre le serveur en développement (nodemon)
	- `npm start` — démarre le serveur (node server.js)
	- `npm test` — lance les tests (Jest)

- Client (`client/package.json`)
	- `npm run dev` — démarre Vite en dev
	- `npm run build` — build de production
	- `npm run preview` — prévisualiser le build
	- `npm run lint` — lancer ESLint

## Tests
Les tests du back se trouvent dans `server/tests/`.

```bash
cd server
npm test
```

## Architecture & Organisation du Code

Le projet est divisé en deux dossiers principaux : `client/` (front-end) et `server/` (back-end).

### `server/`

Le back-end suit une architecture inspirée de **MVC (Modèle-Vue-Contrôleur)**, adaptée pour une API RESTful :

-   `src/routes/` : Définit les endpoints de l'API. Chaque route est associée à une fonction d'un contrôleur.
-   `src/controllers/` : Reçoit les requêtes, valide les entrées (via les middlewares) et orchestre les opérations en appelant les services appropriés.
-   `src/services/` : Contient la logique métier (business logic). C'est ici que les calculs et les interactions complexes avec les modèles ont lieu.
-   `src/models/` : Représente la structure des données. Interagit directement avec les bases de données (PostgreSQL et MongoDB).
-   `src/middlewares/` : Fonctions qui s'exécutent entre la requête et le contrôleur. Utilisés pour l'authentification (`checkJwt`), la gestion des rôles (`checkRole`), la limitation de requêtes (`rateLimiter`), etc.
-   `src/config/` : Gère la configuration, comme la connexion aux bases de données.
-   `src/graphql/` : Contient la définition du schéma, les résolveurs et les types pour l'API GraphQL.
-   `tests/` : Contient les tests d'intégration et unitaires pour assurer la fiabilité du back-end.

### `client/`

Le front-end est une **Single Page Application (SPA)** construite avec React et Vite.

-   `src/components/` : Composants React réutilisables.
-   `src/services/` : Fonctions pour communiquer avec l'API back-end (ex: `api.js` pour REST, `socket.js` pour WebSocket).
-   `context/` : Contient les contextes React (ex: `AuthContext` pour gérer l'état de l'authentification).

## Contribuer
- Forker le dépôt et ouvrir une PR. Créez des branches claires (`feat/`, `fix/`, `chore/`).
- Ajouter des tests pour les nouvelles fonctionnalités côté serveur.

## Documentation supplémentaire
- API détaillée : `API.md`
- Instructions de déploiement : `DEPLOY.md`
- Exemples d'environnement : `server/.env.example` et `client/.env.example`

