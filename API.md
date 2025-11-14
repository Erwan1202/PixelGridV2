# API — PixelGrid V2

Ce document décrit les endpoints REST, les événements Socket.io et le schéma GraphQL exposés par le serveur.

Base URL (développement)
- REST : http://localhost:3001/api
- GraphQL : http://localhost:3001/graphql
- Socket.io : ws://localhost:3001

## Auth (REST)

### POST /api/auth/register
- Description : Crée un nouvel utilisateur.
- Body (application/json) :
  - `username` (string, requis)
  - `email` (string, requis)
  - `password` (string, requis)
- Réponse 201 : { user }

### POST /api/auth/login
- Description : Authenticate un utilisateur et retourne les tokens.
- Body :
  - `email` (string, requis)
  - `password` (string, requis)
- Réponse 200 : { accessToken, refreshToken, user }

### POST /api/auth/refresh
- Description : Renouvelle un access token via le refresh token.
- Body : { token } (refresh token)
- Réponse 200 : { accessToken }

### POST /api/auth/logout
- Description : Déconnecte l'utilisateur en invalidant son refresh token.
- Header : `Authorization: Bearer <accessToken>`
- Réponse 200 : { message: "Successfully logged out" }

### GET /api/auth/me
- Description : Retourne l'utilisateur courant (nécessite Authorization header)
- Header : `Authorization: Bearer <accessToken>`
- Réponse 200 : user object

## Grid (REST)

### GET /api/grid
- Description : Récupère l'état actuel de la grille (liste de pixels).
- Réponse 200 : Array of Pixel

Pixel object fields (exemples)
- `id` (int)
- `x_coord` (int)
- `y_coord` (int)
- `color` (string, e.g. "#FF00AA")
- `user_id` (int | null)

### POST /api/grid/pixel
- Description : Place un pixel (opération protégée + rate limiter).
- Header : `Authorization: Bearer <accessToken>`
- Body :
  - `x` (int)
  - `y` (int)
  - `color` (string, e.g. "#FFFFFF")
- Réponse 201 : placed pixel object

- Note : Le serveur applique un rate limiter (voir `server/src/middlewares/rateLimiter.middleware.js`). Si l'utilisateur dépasse la limite, la requête renverra une erreur 429.

## WebSocket / Socket.io

- Événement émis par le serveur : `pixel_updated`
  - Payload : { x_coord, y_coord, color, user_id }
  - Usage : les clients doivent écouter `pixel_updated` pour mettre à jour l'affichage en temps réel.

## GraphQL

- Endpoint : POST http://localhost:3001/graphql (Apollo Server)
- Schemas exposés (extraits)
  - Query `hello: String`
  - Query `users: [User]` — récupère les utilisateurs
  - Query `grid: [Pixel]` — récupère l'état de la grille

Types principaux
- User { id, username, email, role }
- Pixel { id, x_coord, y_coord, color, user_id }

Exemple de requête GraphQL :

```
query {
  grid {
    id
    x_coord
    y_coord
    color
  }
}
```

## Erreurs communes
- 400 : Requête mal formée (paramètres manquants)
- 401 : Non authentifié (token manquant ou invalide)
- 429 : Trop de requêtes (rate limiter quand placement de pixels trop rapide)
- 500 : Erreur serveur

## Notes complémentaires
- Les tests d'intégration utilisent les endpoints REST (voir `server/tests/`).
- Les contrôleurs émettent des événements Socket.io via `req.app.get('io')` après placement d'un pixel.
