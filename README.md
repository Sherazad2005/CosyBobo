# CosyBobo - Jeu de Création et gestion de Café ou tout coute trop chère 

Une application full-stack pour créer et expérimenter des recettes de café. Ce projet propose une API backend et une interface frontend interactive où les utilisateurs peuvent mélanger des ingrédients pour créer des boissons (matcha, chai, latte comme de vrais barista !).
Le joueur gère un coffee shop : il **s’inscrit / se connecte**, **achète des ingrédients**, **expérimente des recettes** au laboratoire, et **sert des commandes en temps réel** (WebSockets) pour éviter le game over.

---

## Sommaire
- [Stack & outils](#stack--outils)
- [Structure du projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [Installation complète](#installation-complète)
- [Lancer le projet](#lancer-le-projet)
- [Configuration (.env)](#configuration-env)
- [Tester l’API (Postman / Bruno)](#tester-lapi-postman--bruno)
  - [1) Auth](#1-auth)
  - [2) Ingrédients](#2-ingrédients)
  - [3) Market (achat)](#3-market-achat)
  - [4) Lab (expérimentation)](#4-lab-expérimentation)
  - [5) Recipes](#5-recipes)
  - [6) Orders (service + file)](#6-orders-service--file)
  - [7) Restaurant / State](#7-restaurant--state)
  - [8) Transactions](#8-transactions)
  - [9) WebSocket (temps réel)](#9-websocket-temps-réel)
- [Front-end](#front-end)
- [Notes / limites](#notes--limites)

---
## Stack & outils
### Backend
- Node.js + Express
- Prisma ORM
- MySQL (WAMP/phpMyAdmin)
- JWT (auth)
- Socket.io (commandes temps réel)

### Frontend
- React + Vite
- TailwindCSS
- (Intégration API + affichage jeu)

---
## Structure du Projet
CosyBobo/

├── bobos-back/ # API Backend (Express + Prisma + Socket.io)

│ ├── prisma/

│ │ └── schema.prisma

│ ├── src/

│ │ ├── app.js

│ │ ├── server.js

│ │ ├── middleware/

│ │ │ └── auth.js

│ │ ├── prisma/

│ │ │ ├── client.js

│ │ │ └── seed.js

│ │ ├── routes/

│ │ │ ├── auth.routes.js

│ │ │ ├── ingredients.routes.js

│ │ │ ├── market.routes.js

│ │ │ ├── lab.routes.js

│ │ │ ├── orders.routes.js

│ │ │ ├── restaurant.routes.js

│ │ │ └── transactions.routes.js

│ │ ├── services/

│ │ │ ├── orders.service.js

│ │ │ └── market.service.js

│ │ └── tools/

│ │ └── socketTestClient.js

│ └── package.json

│

└── bobos-front/ # Frontend (React + Vite + Tailwind)

├── public/

├── src/

│ ├── pages/

│ │ ├── Login.jsx

│ │ ├── Register.jsx

│ │ ├── LabPage.jsx

│ │ └── Market.jsx

│ ├── api.js

│ ├── App.jsx

│ ├── main.jsx

│ ├── index.css

│ └── App.css

└── package.json


## Fonctionnalités

### Authentification (JWT)
- Inscription d’un user (création restaurant)
- Connexion (renvoie un token)
- Route protégée `/auth/me`

### Labo 
- Récupération des ingrédients depuis la BDD
- Expérimentation via `/lab/experiment`
- Si combinaison valide → recette découverte stockée en base
- Si invalide → réponse `success: false`

### Service temps réel 
- Socket.io : création automatique de commandes `orders:new`
- File de commandes (plusieurs pending)
- Expiration automatique : `expired` + pénalité satisfaction
- Serve : event `orders:serve` → `orders:update`
- Game over si satisfaction < 0

### Niveau 16/20 
- Achat d’ingrédients (cash - coût)
- Stock par restaurant (inventory)
- Ventes (cash + sell_price)
- Transactions tracées : buy / sale / penalty
- State restaurant + résumé des transactions

---

## Installation complète

### 1) Prérequis
- Node.js 
- WAMP/XAMPP + MySQL + phpMyAdmin
- Git

### 2) Cloner le dépôt
```bash
git clone <url-du-repo>
cd CosyBobo
3) Installer & lancer la base (MySQL)
Créer une base cosy_bobo (via phpMyAdmin)
Importer le fichier cosy_bobo dans l'origine du project

Vérifier que MySQL tourne (port 3306)

Lancer le projet
Backend
cd bobos-back
npm install
Créer le .env, puis :

npx prisma migrate dev
# optionnel si vous avez un seed :
# node src/prisma/seed.js
npm run dev
Le backend tourne sur :

http://localhost:3001

Frontend
cd ../bobos-front
npm install
npm run dev
Le front tourne sur :

http://localhost:5173

Configuration (.env)
Dans bobos-back/.env :

PORT=3001
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/cosy_bobo"
JWT_SECRET="change_me_secret"
Dans bobos-front/.env (à la racine de bobos-front) :

VITE_API_URL=http://localhost:3001
Tester l’API (Postman / Bruno)
Important : Auth / Token
Après login, récupérer le token et le mettre en header :

Authorization: Bearer <token>

1) Auth
Register
POST http://localhost:3001/auth/register
Login
POST http://localhost:3001/auth/login

Me (protégé)
GET http://localhost:3001/auth/me

2) Ingrédients
Liste ingrédients
GET http://localhost:3001/ingredients

3) Market (achat)
Acheter un ingrédient (protégé)
POST http://localhost:3001/market/buy

Compte de test fourni (pour tester les achats) :

email : marc.best@gmail.com

password : marc123

4) Lab (expérimentation)
Tester une combinaison
POST http://localhost:3001/lab/experiment

5) Recipes
Liste recettes
GET http://localhost:3001/recipes

6) Orders (service + file)
Voir les commandes pending (protégé)
GET http://localhost:3001/orders/pending

7) Restaurant / State
État du restaurant (protégé)
GET http://localhost:3001/restaurant/state

8) Transactions
Liste transactions (protégé)
GET http://localhost:3001/transactions

Résumé transactions (protégé)
GET http://localhost:3001/transactions/summary

9) WebSocket (temps réel)
A) Lancer le back
cd bobos-back
npm run dev
B) Lancer un client socket de test
node src/tools/socketTestClient.js
Attendre un event :

orders:new

Puis envoyer :

socket.emit("orders:serve", { orderId: "ID_DE_LA_COMMANDE" })

Front-end
Le front propose :

Login/Register (JWT)

Lab (drag & drop / slots)

Market (achat ingrédients)

Partie à compléter par mon collègue :

intégration complète des pages de jeu (service / commandes temps réel)

dashboard financier (charts)

UX finale + responsive

