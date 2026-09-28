FROM node:22-slim

# OpenSSL est requis par les moteurs Prisma
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY src ./src
COPY scripts ./scripts

EXPOSE 4000
CMD ["node", "src/server.js"]
