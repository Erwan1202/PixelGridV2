# Déploiement — PixelGrid V2

Ce guide fournit des options simples pour déployer l'application (server + client). Il ne couvre pas tous les cas, mais donne des étapes éprouvées.

Pré-requis
- Avoir une instance PostgreSQL accessible (ex : service managé, conteneur ou instance cloud)
- (Optionnel) MongoDB si vous utilisez la partie Mongo (logs, analytics)
- Variables d'environnement correctement définies (voir `server/.env.example`)

Option A — Déployer le client sur Vercel et le server sur un VPS / Heroku

1) Client (Vercel)
- Créer un projet Vercel à partir du repo `client/`.
- Définir les variables d'environnement dans l'interface Vercel (VITE_API_BASE_URL et VITE_SOCKET_URL pointant vers l'API déployée).
- Build command : `npm run build` ; Output directory : `dist`.

2) Server (Render)
- Create a Render "Web Service" from the `server/` folder (not a static site).
- Set the following environment variables in the Render service settings:
	- `FRONTEND_URL` = https://<your-frontend-domain> (example: https://pixel-grid-v2-y3pl.vercel.app)
	- Database variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) or the appropriate `DATABASE_URL` if you adapt `server/src/config/db.js`.
	- `MONGO_URI` (optional)
	- `JWT_SECRET` and any other secrets required by the app
	- `REDIS_URL` (optional) — if you plan to scale Socket.io across instances
- Render will provide a `$PORT` env automatically; the server uses `process.env.PORT` so no extra change is required.
- Make sure the Render service is a web service so it supports persistent WebSocket connections.

Render specifics for Socket.io and Vercel client
- On the Vercel (client) project, set the environment variable `VITE_SOCKET_URL` to the Render service URL (example: `https://your-render-app.onrender.com`). Use `https://` because Socket.io client will use `wss://` automatically in secure contexts.
- Ensure the server `FRONTEND_URL` matches your frontend origin exactly (including `https://`) so Socket.io CORS allows the connection.
- If you add Redis on Render, set `REDIS_URL` to the Redis instance URL and the server will try to enable the Redis adapter automatically (the code has a safe, optional scaffold — install `@socket.io/redis-adapter` and `redis` to enable it).

Troubleshooting on Render
- Check Render service logs to see the startup output — the server now logs `FRONTEND_URL` and the active Socket.io CORS origin at startup.
- If the client still tries to connect to the frontend origin (Vercel), verify `VITE_SOCKET_URL` is set in Vercel and that you redeployed the client after setting the env variable.
- If you see upgrade/connection failures in logs, confirm Render service is a Web Service and not set to a plan or configuration that drops upgrade requests.


Option B — Docker + Docker Compose (recommandé pour infra reproductible)

Exemple d'architecture :
- service `server` (Node.js)
- service `client` (serveur statique ou build puis nginx)
- service `postgres` (image officielle)
- service `mongo` (si nécessaire)

Points clés
- Monter les variables d'environnement dans les services (`.env` ou secrets de l'orchestrateur).
- Exposer le port 3001 pour le serveur et 5173 (ou build static) pour le client.

Option C — Tout déployer sur un VPS (NGINX reverse proxy)

- Builder le client (`npm run build`) et servir le dossier `dist` via Nginx.
- Lancer le serveur Node (PM2 / systemd) et configurer Nginx en reverse-proxy vers `localhost:3001`.

Sécurité & bonnes pratiques
- Ne commitez jamais les vrais secrets : utilisez les variables d'environnement ou un gestionnaire de secrets.
- Pour JWT secrets, utilisez des valeurs longues et générées aléatoirement.
- Protégez l'accès à PostgreSQL (IP whitelisting, utilisateurs dédiés).
- Activez HTTPS (Let’s Encrypt) pour la production.

Surveillance & sauvegardes
- Configurez des backups pour PostgreSQL.
- Configurez la journalisation et l'alerte d'erreurs (ex. Sentry) pour le serveur.

Si tu veux, je peux :
- générer un `docker-compose.yml` minimal pour lancer server+postgres+mongo en local,
- ou fournir un `Dockerfile` pour le `server/` et un pour le `client/`.
