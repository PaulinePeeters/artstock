import prisma from '../lib/prisma.js';

export async function getAllFournisseurs() {
    return prisma.fournisseur.findMany({
        orderBy: { nom: 'asc' },
    });
}

export async function getFournisseurById(id) {
    return prisma.fournisseur.findUnique({
        where: { id: Number(id) },
    });
}
export async function getCommandesByFournisseurId(fournisseurId) {
    return prisma.commande.findMany({
        where: { fournisseurId: Number(fournisseurId) },
        include: { lignesCommande: true },
        orderBy: { dateCommande: 'desc' }
    });
}

export async function createFournisseur(data) {
    return prisma.fournisseur.create({
        data,
    });
}

export async function updateFournisseur(id, data) {
    return prisma.fournisseur.update({
        where: { id: Number(id) },
        data,
    });
}

export async function deleteFournisseur(id) {
    return prisma.fournisseur.delete({
        where: { id: Number(id) },
    });
}
export async function getHistoriqueStockByFournisseurId(fournisseurId) {
    return prisma.historiqueStock.findMany({
        where: { fournisseurId: Number(fournisseurId) },
        include: {
            materiel: true
        },
        orderBy: { date: 'desc' }
    });
}
