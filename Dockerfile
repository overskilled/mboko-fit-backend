# --- ÉTAPE 1: CONSTRUCTION (BUILD STAGE) ---
# Utiliser une image Node.js récente pour la compilation
FROM node:22-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de définition de dépendances pour profiter du cache Docker
COPY package*.json ./
COPY yarn.lock ./

# Installer les dépendances
# Utilisez yarn si votre projet utilise yarn, sinon npm
RUN yarn install --production=false

# Copier le reste du code source
COPY . .

# Exécuter la commande de compilation de NestJS
RUN npm run build


# --- ÉTAPE 2: PRODUCTION (RUNNING STAGE) ---
# Utiliser une image plus petite pour l'exécution (sans les outils de dev)
FROM node:22-alpine AS production

# Définir le répertoire de travail
WORKDIR /app

# Exposer le port que Koyeb attend (8000)
# Cela correspond à votre app.listen(process.env.PORT ?? 8000)
EXPOSE 8000

# Copier UNIQUEMENT les dépendances de production
COPY package*.json ./
COPY yarn.lock ./

# Installer SEULEMENT les dépendances de production (plus rapide et plus petit)
# 'npm ci' est souvent plus sûr pour les images Docker que 'npm install'
RUN yarn install --production=true

# Copier le code compilé depuis l'étape 'builder'
# C'est la ligne CRUCIALE qui garantit que /dist est présent
COPY --from=builder /app/dist ./dist

# Commande de démarrage (le point d'entrée de l'application)
# Utiliser la commande de production pure : node dist/main
CMD [ "node", "dist/main" ]