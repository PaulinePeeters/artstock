# Déploiement d'ArtStock sur le VPS (artstock.be — 51.210.8.227)

Architecture, adaptée à ce qui est déjà installé sur le VPS (Debian, Docker, **Nginx Proxy Manager**) :

- **`db`** (PostgreSQL 17), **`backend`** (Express/Prisma) et **`frontend`** (build React servi par un nginx interne) tournent tous les trois dans Docker Compose, sous les noms `artstock_db`, `artstock_backend`, `artstock_frontend`.
- Aucun port n'est publié sur l'hôte : les conteneurs sont connectés au réseau Docker `proxy_network`, déjà utilisé par Nginx Proxy Manager (NPM) pour joindre les autres apps du VPS (ex. `restos_frontend`).
- **NPM** est le seul point d'entrée public : il reçoit le trafic 80/443, gère le HTTPS (Let's Encrypt intégré), et proxy directement vers `artstock_frontend:80` et `artstock_backend:4000` par leur nom de conteneur — pas de fichier nginx à éditer à la main, tout se fait dans son interface web.

## 1. Préparer le VPS

```bash
sudo mkdir -p /srv/artstock && sudo chown $USER /srv/artstock
git clone https://gitlab.com/PPeeters05/artstock.git /srv/artstock
cd /srv/artstock

# Secrets Docker
cp .env.example .env
nano .env    # POSTGRES_PASSWORD, JWT_SECRET (openssl rand -hex 32)
```

Vérifier avant tout que le DNS de `artstock.be` (et `www.artstock.be` si utilisé) pointe bien vers `51.210.8.227` (enregistrement **A**).

## 2. Démarrer la base et migrer les données

```bash
cd /srv/artstock
docker compose up -d db
```

Depuis ta machine, envoyer le backup le plus récent (voir `~/artstock-db-backups/`) :

```bash
scp ~/artstock-db-backups/artstock_db_YYYYMMDD_HHMMSS.dump USER@51.210.8.227:/tmp/
```

> Refaire un dump **frais** juste avant la bascule finale (`pg_dump "<DATABASE_URL Render>" -Fc -f nouveau.dump`) pour ne perdre aucune donnée saisie entre-temps sur Render.

Puis sur le VPS :

```bash
cd /srv/artstock
docker compose cp /tmp/artstock_db_*.dump db:/tmp/backup.dump
docker compose exec db pg_restore -U artstock -d artstock_db --no-owner --no-privileges /tmp/backup.dump
docker compose exec db rm /tmp/backup.dump
docker compose exec db psql -U artstock -d artstock_db -c '\dt'   # vérifier
```

## 3. Lancer backend + frontend

```bash
docker compose up -d --build
```

Vérifier que les conteneurs sont bien sur `proxy_network` :

```bash
docker network inspect proxy_network --format '{{range .Containers}}{{.Name}} {{end}}'
```

Le compte admin existe déjà dans les données restaurées. Pour en (re)créer un :

```bash
docker compose exec backend node scripts/create-admin.js email@exemple.be nouveau-mot-de-passe
```

## 4. Configurer le Proxy Host dans Nginx Proxy Manager

Dans l'interface NPM (`http://51.210.8.227:81`) :

1. **Hosts → Proxy Hosts → Add Proxy Host**
2. Onglet **Details** :
   - Domain Names : `artstock.be` et `www.artstock.be`
   - Scheme : `http`
   - Forward Hostname / IP : `artstock_frontend`
   - Forward Port : `80`
   - Activer *Block Common Exploits*
3. Onglet **Custom Locations** → **Add location** :
   - Location : `/api`
   - Scheme : `http`
   - Forward Hostname / IP : `artstock_backend`
   - Forward Port : `4000`
4. Onglet **SSL** :
   - SSL Certificate → *Request a new SSL Certificate*
   - Activer *Force SSL* et *HTTP/2 Support*
   - Accepter les conditions Let's Encrypt, **Save**

NPM gère lui-même le renouvellement du certificat, aucune commande `certbot` à lancer. Le site est ensuite disponible sur `https://artstock.be`.

## 5. Pipeline CI/CD GitLab

`.gitlab-ci.yml` fait, sur chaque push :
- **build** : build du frontend + validation du backend (sur toutes les branches, sert de garde-fou) ;
- **deploy** (branche `main` uniquement) : connexion SSH au VPS, `git pull`, puis `docker compose up -d --build` qui reconstruit les images backend/frontend qui ont changé et relance les conteneurs.

Variables à définir dans GitLab (**Settings → CI/CD → Variables**, cocher *Masked* / *Protected*) :

| Variable | Valeur |
|---|---|
| `SSH_PRIVATE_KEY` | clé privée dédiée au déploiement (voir ci-dessous) |
| `VPS_HOST` | `51.210.8.227` |
| `VPS_USER` | l'utilisateur SSH utilisé sur le VPS |
| `VPS_APP_DIR` | `/srv/artstock` |

Générer une paire de clés dédiée au déploiement (à ne jamais utiliser pour autre chose) :

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
ssh-copy-id -i deploy_key.pub USER@51.210.8.227
# contenu de deploy_key (clé PRIVÉE) → variable SSH_PRIVATE_KEY dans GitLab
```

## 6. Sauvegardes régulières de la base

Sur le VPS, ajouter une tâche cron (`crontab -e`) :

```
0 3 * * * cd /srv/artstock && docker compose exec -T db pg_dump -U artstock -Fc artstock_db > /srv/artstock-backups/artstock_$(date +\%Y\%m\%d).dump
```

(créer d'abord `mkdir -p /srv/artstock-backups`, et rapatrier ces fichiers hors du VPS de temps en temps, par ex. via un `scp` planifié sur ta machine ou un petit script rsync vers un autre stockage.)

## Développement en local

```bash
# Backend (utilise backend/.env : DATABASE_URL + JWT_SECRET)
cd backend && npm install && npm run dev

# Frontend (utilise frontend/.env : VITE_API_URL=http://localhost:4000)
cd frontend && npm install && npm run dev
```
