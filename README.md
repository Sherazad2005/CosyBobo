# CosyBobo - Jeu de Création et gestion de Café ou tout coute trop chère 

Une application full-stack pour créer et expérimenter des recettes de café. Ce projet propose une API backend et une interface frontend interactive où les utilisateurs peuvent mélanger des ingrédients pour créer des boissons (matcha, chai, latte comme de vrais barista !).

## Structure du Projet
CosyBobo/
├── bobos-back/ # API Backend (Express.js + Prisma)
│ ├── src/
│ │ ├── app.js
│ │ ├── server.js
│ │ ├── recipeMatcher.js
│ │ ├── middleware/
│ │ │ └── auth.js
│ │ ├── prisma/
│ │ │ ├── client.js
│ │ │ └── seed.js
│ │ └── routes/
│ │ ├── auth.routes.js
│ │ ├── ingredients.routes.js
│ │ ├── lab.routes.js
│ │ └── recipes.routes.js
│ ├── prisma/
│ │ └── schema.prisma
│ └── package.json
│
└── bobos-front/ # Frontend (React + Vite)
├── src/
│ ├── App.jsx
│ ├── Lab.jsx # laboratoire de mélange de café
│ ├── Login.jsx #Connexion au labo
│ ├── main.jsx
│ ├── App.css
│ ├── index.css
│ └── assets/
├── public/
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js


## Fonctionnalités

composant Lab = interface de mélange de d'ingrédients avec 3 emplacements
Authentification = système de connexion user 
Système de recettes = Créer et stocker des recettes
Gestion des ingrédients = parcourir les ingrédients disponibles
Correspondances des recettes = Faire correspondre les créations utilisateurs avec les recettes 

### Config backend
'''bash
cd bobo-back
npm install

config de la base de donnée dans prisma/schema.prisma :
npx prisma migrate dev
npm start

### Config frontend
cd bobos-front
npm install
npm run dev

Le frontend s'execute sur http://localhost:5173

Routes Api
Authentification

POST /auth/login - connexion user
POST /auth/register - inscription

Ingredients

GET /ingredients - obtenir les ingredients disponibles
POST /ingredients -Ajouter un nouvel ingrédient

Lab (Expérimentation)
POST /lab/experiment -Soumettre une combinaison d'ingredients

Recettes
Get /recipes Obtenir les recettes
POST/recipes Créer une nouvelle recette
GET /recipes/:id Obtenir une recette spécifique

Techno utilisées 

Backend :
node.js + Express.js
Prisma ORM
Middleware d'authentification

Frontend : 

React
Vite
Tailwind CSS

Utilisation

Lancer le serveur backend --> Démarrer le serveur en frontend --> Accéder à la page Lab --> Séléctionner 3 Ingrédients dans le panneau de gauche --> cliquer sur brew pour soumettre la creation --> Le système fera la correspondance entre votre recette et celles stockés puis affichera les résultats 

Notes 
il faut tester les ventes avec postman pas fini en front :)

