# WebSocket

## Vue d'ensemble

Le serveur WS tourne séparément de Next.js (`server/`). Les deux partagent la même base de données et le même `WS_SECRET`.

```
Client ──── HTTP ──── Next.js (3000)
       ──── WS   ──── WS Server (8080)
                           │
                      PostgreSQL
```

---

## Connexion et authentification

Le cookie de session NextAuth est `httpOnly` — le client ne peut pas le lire directement. L'authentification WS se fait via un token JWT dédié.

**Étape 1 — Récupérer un token WS**

```
GET /api/ws-token
```

Retourne un JWT signé avec `WS_SECRET`, valable 5 minutes :

```json
{ "token": "eyJ..." }
```

**Étape 2 — Ouvrir la connexion**

```ts
const ws = new WebSocket('ws://localhost:8080')
```

**Étape 3 — S'authentifier**

Dès que la connexion est ouverte, envoyer :

```json
{ "type": "auth", "token": "eyJ..." }
```

Le serveur vérifie le token, charge l'utilisateur depuis la DB, et broadcaste la `userlist` à tous les clients connectés.

> Si aucun message `auth` n'est reçu dans les **10 secondes**, la connexion est fermée automatiquement.

---

## Messages

### Client → Serveur

**Authentification**
```json
{ "type": "auth", "token": "eyJ..." }
```

**Envoyer un message**
```json
{ "type": "message", "content": "Hello !" }
```

> Tout message autre que `auth` est ignoré tant que la connexion n'est pas authentifiée.

---

### Serveur → Client

**Nouveau message** — broadcasté à tous
```json
{
  "type": "message",
  "content": "Hello !",
  "user": { "id": "uuid", "username": "alice" },
  "timestamp": "2026-06-10T10:30:00.000Z"
}
```

**Liste des connectés** — broadcastée à chaque connexion/déconnexion
```json
{
  "type": "userlist",
  "users": [
    { "id": "uuid-1", "username": "alice" },
    { "id": "uuid-2", "username": "bob" }
  ]
}
```

---

## Historique

L'historique des messages est fourni par Next.js, pas par le WS :

```
GET /api/history?limit=50
```

À appeler une fois à l'ouverture du chat, avant de connecter le WS.

---

## Variables d'environnement

| Variable | Où | Description |
|---|---|---|
| `WS_SECRET` | Next.js + WS Server | Doit être **identique** dans les deux `.env` |
| `DATABASE_URL` | WS Server | Connexion PostgreSQL |
| `PORT` | WS Server | Port du serveur (défaut : `8080`) |
