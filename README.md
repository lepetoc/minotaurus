# README — Biscorb

## 1. Nom et description du projet

### **Biscorb**

Biscorb est un canal de discussion global permettant aux élèves de communiquer facilement entre eux en temps réel.
Le projet s’adresse principalement aux étudiants qui souhaitent échanger rapidement via des messages texte, images et GIF dans différents canaux de discussion.

---

## 2. Contraintes du projet

### ✅ Communication temps réel

Le projet utilise une API backend avec WebSocket permettant l’envoi et la réception instantanée des messages.

### ✅ Gestion des connexions utilisateurs

Le serveur détecte automatiquement les connexions et déconnexions des utilisateurs.

### ✅ Authentification utilisateur

Les utilisateurs peuvent créer un compte afin d’accéder aux fonctionnalités du chat.

### ✅ Gestion de contenu multimédia

Les utilisateurs peuvent envoyer :

* des messages texte,
* des images,
* des GIF via des liens Tenor.

### ✅ Architecture client / serveur

Le projet est séparé en :

* un frontend pour l’interface utilisateur,
* une API backend pour la logique métier et les WebSockets.

### ✅ Gestion de plusieurs canaux

Les utilisateurs peuvent accéder à plusieurs canaux de discussion différents.

---

## 3. MVP (Minimum Viable Product)

Les fonctionnalités incluses dans le MVP sont :

* Création de compte utilisateur
* Connexion utilisateur
* Envoi de messages texte
* Envoi d’images et GIF via Tenor
* Liste des canaux disponibles
* Détection des utilisateurs connectés / déconnectés
* Communication temps réel via WebSocket

---

## 4. Backlog initial

### Priorité haute

1. En tant qu’utilisateur, je veux créer un compte afin d’accéder au chat.
2. En tant qu’utilisateur, je veux me connecter avec mon compte.
3. En tant qu’utilisateur, je veux rejoindre un canal de discussion.
4. En tant qu’utilisateur, je veux envoyer un message texte dans un canal.
5. En tant qu’utilisateur, je veux voir les messages en temps réel.

### Priorité moyenne

6. En tant qu’utilisateur, je veux voir la liste des canaux disponibles.
7. En tant qu’utilisateur, je veux savoir quels utilisateurs sont connectés.
8. En tant qu’utilisateur, je veux envoyer une image dans un canal.
9. En tant qu’utilisateur, je veux envoyer un GIF via un lien Tenor.

### Priorité basse

10. En tant qu’utilisateur, je veux voir quand un utilisateur se connecte ou se déconnecte.
11. En tant qu’utilisateur, je veux avoir une interface simple et responsive.
12. En tant qu’utilisateur, je veux changer de canal rapidement.

---

## 5. Liste de tâches initiales

### Backend

* Mise en place du serveur WebSocket
* Gestion des connexions utilisateurs
* Gestion des déconnexions
* API d’authentification
* Gestion des canaux
* Stockage des messages
* Gestion des images et GIF Tenor

### Frontend

* Création de l’interface de connexion
* Création de la page principale du chat
* Affichage des canaux
* Affichage des messages en temps réel
* Système d’envoi de message
* Affichage des utilisateurs connectés
* Interface responsive

### Base de données

* Création de la table utilisateurs
* Création de la table messages
* Création de la table canaux

---

## 6. Stratégie de cache et revalidation (Next.js)

### Pages data-driven (RSC)

| Route | Source | Type de cache | Durée | Tags | Justification |
|---|---|---|---|---|---|
| `/blog` | JSONPlaceholder API | `fetch` + `next.revalidate` | 3 600 s (1 h) | `blog:list` | Les articles changent rarement ; 1 h est un bon compromis fraîcheur / perf |
| `/blog/[slug]` | JSONPlaceholder API | `fetch` + `next.revalidate` | 3 600 s (1 h) | `blog:post:<slug>` | Même logique que la liste ; tag individuel pour revalider à l'unité |
| `/dashboard` | Tenor API | `fetch` + `next.revalidate` | 60 s (recherche) / 300 s (featured) | `tenor:search:<q>` / `tenor:featured` | Les résultats de recherche évoluent vite ; la page featured est plus stable |
| `/dashboard/users` | PostgreSQL via `unstable_cache` | `unstable_cache` | 60 s | `users:list` | Données vivantes en base ; 60 s assure une vue quasi temps-réel sans surcharger la DB |
| `/dashboard/users/[id]` | PostgreSQL via `unstable_cache` | `unstable_cache` | 60 s | `users:<id>` | Tag individuel pour invalider précisément après une mutation |

### Revalidation après mutation

La Server Action `updateUsernameAction` (dans `dashboard/settings`) appelle `revalidateTag('users:list')` et `revalidateTag('users:<id>')` après une mise à jour réussie en base. Cela invalide immédiatement les entrées de cache correspondantes pour que les pages liste et détail reflètent les nouvelles données dès la prochaine requête.

---

## 7. Répartition du travail

* **Luca** : joue à Genshin
* **Pierre** : maintenance et développement de l’API backend
* **Moi** : développement du frontend et de l’interface utilisateur
