# Étape 1 : build de l'application React
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : nginx sert le build statique sur un port interne
# (le nginx déjà installé sur le VPS fait le proxy public + HTTPS vers ce port)
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
