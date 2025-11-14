# Déploiement sur Render

Ce guide explique comment déployer l'application fullstack (back-end, front-end, et base de données) sur la plateforme [Render](https://render.com/). C'est une solution moderne qui gère automatiquement le SSL, les variables d'environnement et les redéploiements à chaque `git push`.

## Prérequis

- Un compte [GitHub](https://github.com/) où votre code est hébergé.
- Un compte [Render](https://dashboard.render.com/) (l'offre gratuite est suffisante pour ce projet).

## Étape 1 : Déployer la base de données PostgreSQL

1.  Depuis votre tableau de bord Render, cliquez sur **New +** > **PostgreSQL**.
2.  Donnez un nom à votre base de données (ex: `pixelgrid-db`).
3.  Choisissez une région proche de vous pour minimiser la latence.
4.  Cliquez sur **Create Database**.
5.  Une fois la base de données créée, allez dans l'onglet **Info**. Vous y trouverez les informations de connexion. Gardez précieusement l'**Internal Database URL**. Vous en aurez besoin pour le back-end.

## Étape 2 : Déployer le Back-End (Serveur Node.js)

1.  Cliquez sur **New +** > **Web Service**.
2.  Connectez votre dépôt GitHub et sélectionnez le projet `PixelGridV2`.
3.  Configurez le service :
    -   **Name** : `pixelgrid-server` (ou un nom de votre choix).
    -   **Root Directory** : `server` (très important, pour que Render sache où se trouve le `package.json` du back-end).
    -   **Build Command** : `npm install`
    -   **Start Command** : `npm start`

4.  Allez dans l'onglet **Environment** et cliquez sur **Add Environment Group**. Créez un groupe (ex: `pixelgrid-secrets`) pour y stocker vos secrets.
5.  Ajoutez les variables d'environnement suivantes dans ce groupe :
    -   **`DB_HOST`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_DATABASE`**, **`DB_PORT`** : Render fournit ces variables séparément. Copiez-les depuis la page de votre base de données PostgreSQL.
    -   **`MONGO_URI`** : L'URI de votre base de données MongoDB Atlas (si vous en utilisez une en production).
    -   **`JWT_ACCESS_SECRET`** : Générez une chaîne de caractères longue et aléatoire.
    -   **`JWT_REFRESH_SECRET`** : Générez une autre chaîne de caractères longue et aléatoire.
    -   **`FRONTEND_URL`** : Laissez cette variable vide pour le moment. Nous la remplirons une fois le front-end déployé.
    -   **`NODE_ENV`** : `production`

6.  Cliquez sur **Create Web Service**. Render va builder et déployer votre serveur. Une fois terminé, vous obtiendrez une URL pour votre API (ex: `https://pixelgrid-server.onrender.com`).

## Étape 3 : Déployer le Front-End (Client React)

1.  Cliquez sur **New +** > **Static Site**.
2.  Sélectionnez à nouveau votre dépôt `PixelGridV2`.
3.  Configurez le site statique :
    -   **Name** : `pixelgrid-client`
    -   **Root Directory** : `client`
    -   **Build Command** : `npm run build`
    -   **Publish Directory** : `dist` (c'est le dossier de build par défaut de Vite).

4.  Allez dans l'onglet **Environment** et ajoutez les variables d'environnement suivantes :
    -   **`VITE_API_BASE_URL`** : L'URL de votre back-end déployé (ex: `https://pixelgrid-server.onrender.com`).
    -   **`VITE_SOCKET_URL`** : La même URL que ci-dessus.

5.  Cliquez sur **Create Static Site**.

## Étape 4 : Finaliser la configuration

1.  Retournez dans la configuration de votre back-end (`pixelgrid-server`).
2.  Allez dans l'onglet **Environment**.
3.  Modifiez la variable **`FRONTEND_URL`** et mettez-y l'URL de votre front-end fraîchement déployé (ex: `https://pixelgrid-client.onrender.com`).
4.  Sauvegardez les changements. Render va redéployer votre serveur avec la bonne configuration CORS pour autoriser les requêtes et les connexions WebSocket depuis votre front-end.

Votre application est maintenant entièrement déployée ! Vous devriez pouvoir accéder à l'URL de votre client et utiliser l'application.
