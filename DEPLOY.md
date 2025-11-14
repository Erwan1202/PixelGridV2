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

2) Server (Heroku / VPS)
- Heroku : push le dossier `server/` (ou créer un pipeline qui déploie `server/`).
- Configurer les variables d'environnement (Postgres, MONGO_URI, JWT secrets, FRONTEND_URL, PORT).
- Si Heroku, ajouter un addon PostgreSQL et renseigner la variable `DATABASE_URL` dans le code si besoin (ici on utilise variables DB_*). Pour Heroku il est souvent plus simple d'utiliser `DATABASE_URL` et d'adapter `server/src/config/db.js`.

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
