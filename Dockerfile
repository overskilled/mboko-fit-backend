# --- ÉTAPE 1: CONSTRUCTION (BUILD STAGE) ---
FROM node:22-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de définition de dépendances
COPY package*.json ./
COPY yarn.lock ./

# Installer les dépendances (y compris devDependencies pour la compilation et Prisma)
RUN yarn install --production=false

# Copier le fichier schema.prisma (crucial pour la génération)
# Assurez-vous que votre schéma est à la racine, sinon ajustez le chemin
COPY prisma/schema.prisma ./prisma/

# Générer les types TypeScript de Prisma
RUN npx prisma generate

# Copier le reste du code source
COPY . .

# Exécuter la commande de compilation de NestJS
RUN npm run build

# --- ÉTAPE 2: PRODUCTION (RUNNING STAGE) ---
FROM node:22-alpine AS production

# Définir le répertoire de travail
WORKDIR /usr/src/app 
# Utiliser un répertoire standard pour éviter les conflits. L'instance va chercher dans ce WORKDIR.

EXPOSE 8000

# Copie UNIQUEMENT les dépendances de production
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production=true

# LIGNE CRUCIALE : Copie le dossier 'dist' compilé DEPUIS l'étape 'builder'
# Copie le CONTENU de /app/dist vers /usr/src/app/dist
COPY --from=builder /app/dist ./dist

# Commande de démarrage pure
# Le WORKDIR est maintenant /usr/src/app, donc on démarre depuis ./dist/main
CMD [ "node", "dist/main" ]