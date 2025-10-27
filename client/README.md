📰 MyBlog

MyBlog est une application de blog moderne construite avec Next.js, React, TypeScript et Tailwind CSS.
Elle inclut une navigation fluide, une barre de recherche interactive, et des pages simples pour les articles, le contact et la découverte de contenu.

🚀 Fonctionnalités

Interface moderne et responsive avec Tailwind CSS

Navigation dynamique grâce au composant Header

Barre de recherche animée

Liste d’articles avec extraits et liens individuels

Pages de contact et d’informations

Composants réutilisables (Header, Footer, etc.)

🧩 Structure du projet
myblog/
├── app/
│   ├── page.tsx              # Page principale "Discover"
│   ├── posts/page.tsx        # Page listant les articles
│   ├── contact/page.tsx      # Page de contact
│   ├── about/page.tsx        # (optionnelle) Page à propos
│   ├── components/
│   │   ├── Header.tsx        # Barre de navigation
│   │   └── Footer.tsx        # Pied de page
│   └── globals.css           # Styles globaux (inclut Tailwind)
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md

Aperçu des composants
Header

Composant de navigation comprenant :

un logo,

un menu de liens (Discover, Posts, Contact, About),

une barre de recherche dynamique avec animation lors du focus,

un bouton Sign up.


🛠️ Installation et exécution
1. Cloner le dépôt
git clone https://github.com/ton-utilisateur/myblog.git
cd myblog

2. Installer les dépendances
npm install


3. Lancer le serveur de développement
npm run dev


Ouvre http://localhost:3000
 pour voir ton site.

🎨 Technologies utilisées
Technologie	Description
Next.js	Framework React pour les applications modernes et rapides
TypeScript	Typage statique pour un code plus robuste
Tailwind CSS	Framework CSS utilitaire pour un design moderne et responsive
React Hooks	Gestion simple de l’état et des effets
🧰 Scripts disponibles
Commande	Description
npm run dev	Lance le serveur de développement
npm run build	Crée une version de production
npm run start	Démarre le serveur de production
npm run lint	Vérifie le code avec ESLint
📜 Licence

Ce projet est sous licence MIT.
Tu es libre de l’utiliser, le modifier et le distribuer comme bon te semble.

👨‍💻 Auteur

MyBlog — un projet Next.js minimaliste pour apprendre et expérimenter.
💡 Inspiré par les blogs modernes, construit avec passion.