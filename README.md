# PixelGrid V2

Une application fullstack inspirée du concept r/place : un canvas collaboratif où les utilisateurs peuvent placer des pixels en temps réel.

Tech stack
- Back-end : Node.js, Express, PostgreSQL, MongoDB, JWT, Socket.io
- Front-end : React + Vite
- Tests : Jest + Supertest (back)

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

## Architecture & organisation
- `server/` : logiques Express, GraphQL, modèles Mongoose/Postgres, services et contrôleurs
- `client/` : application React (Vite), composants dans `src/components`
- Temps réel : communication via Socket.io (client ↔ server)

## Contribuer
- Forker le dépôt et ouvrir une PR. Créez des branches claires (`feat/`, `fix/`, `chore/`).
- Ajouter des tests pour les nouvelles fonctionnalités côté serveur.

## Licence
Ajoutez un fichier `LICENSE` si vous souhaitez préciser la licence (ex : MIT).

## Documentation supplémentaire
- API détaillée : `API.md`
- Instructions de déploiement : `DEPLOY.md`
- Exemples d'environnement : `server/.env.example` et `client/.env.example`

