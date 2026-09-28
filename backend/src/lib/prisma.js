import { PrismaClient } from '@prisma/client';

// Instance unique partagée par toute l'application (évite d'ouvrir un pool de connexions par service)
const prisma = new PrismaClient();

export default prisma;
