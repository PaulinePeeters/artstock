import prisma from '../lib/prisma.js';
import { ajouterHistoriqueStock } from './stock.service.js';

// Calcule le stock réel en tenant compte des unités multipliables (ex : boîtes de N pièces)
const avecStockReel = (m) => {
    const estMultipliable = m.unite?.multipliable;
    const stockReel = estMultipliable
        ? m.quantiteUnites * (m.quantiteParUnite || 1)
        : m.quantiteUnites;
    return { ...m, stockReel };
};

// Transforme le tableau [{ fournisseurId, codeArticle }] du front en opérations Prisma
const normaliserFournisseurs = (fournisseurs) =>
    (fournisseurs || [])
        .filter((f) => f && f.fournisseurId)
        .map((f) => ({
            fournisseurId: Number(f.fournisseurId),
            codeArticle: f.codeArticle?.trim() || null
        }));

export const MaterielService = {
    getAll: async ({ search } = {}) => {
        const where = search
            ? { nom: { contains: search, mode: 'insensitive' } }
            : undefined;

        const materiels = await prisma.materiel.findMany({
            where,
            include: {
                unite: true,
                fournisseurs: { include: { fournisseur: true } }
            },
            orderBy: { nom: 'asc' }
        });

        return materiels.map(avecStockReel);
    },

    create: async (data) => {
        const { fournisseurs, ...materielData } = data;
        return await prisma.materiel.create({
            data: {
                ...materielData,
                fournisseurs: { create: normaliserFournisseurs(fournisseurs) }
            },
            include: { fournisseurs: { include: { fournisseur: true } } }
        });
    },

    update: async (id, data) => {
        const {
            quantite, type, fournisseurId, prixUnitaire, commentaire,
            fournisseurs, ...updateData
        } = data;

        const materiel = await prisma.materiel.update({
            where: { id: Number(id) },
            data: {
                ...updateData,
                // Si le front envoie la liste des fournisseurs, on la remplace entièrement
                ...(fournisseurs !== undefined && {
                    fournisseurs: {
                        deleteMany: {},
                        create: normaliserFournisseurs(fournisseurs)
                    }
                })
            },
            include: { fournisseurs: { include: { fournisseur: true } } }
        });

        if (quantite != null && type) {
            await ajouterHistoriqueStock({
                materielId: Number(id),
                quantite,
                type,
                fournisseurId: fournisseurId || null,
                prixUnitaire: prixUnitaire || null,
                commentaire: commentaire || null
            });
        }
        return materiel;
    },

    setCodeFournisseur: async (materielId, fournisseurId, codeArticle) => {
        return await prisma.materielFournisseur.upsert({
            where: {
                materielId_fournisseurId: {
                    materielId: Number(materielId),
                    fournisseurId: Number(fournisseurId)
                }
            },
            update: { codeArticle: codeArticle?.trim() || null },
            create: {
                materielId: Number(materielId),
                fournisseurId: Number(fournisseurId),
                codeArticle: codeArticle?.trim() || null
            },
            include: { fournisseur: true }
        });
    },

    removeFournisseur: async (materielId, fournisseurId) => {
        return await prisma.materielFournisseur.deleteMany({
            where: {
                materielId: Number(materielId),
                fournisseurId: Number(fournisseurId)
            }
        });
    },

    delete: async (id) => {
        return await prisma.materiel.delete({
            where: { id: Number(id) }
        });
    },

    getById: async (id) => {
        return await prisma.materiel.findUnique({
            where: { id: Number(id) },
            include: {
                unite: true,
                fournisseurs: { include: { fournisseur: true } },
                historiqueStock: {
                    include: { fournisseur: true }
                }
            }
        });
    },

    getACommander: async () => {
        const materiels = await prisma.materiel.findMany({
            include: {
                unite: true,
                fournisseurs: { include: { fournisseur: true } }
            }
        });

        return materiels
            .map(avecStockReel)
            .filter((m) => m.stockReel < m.seuilAlerte);
    }
};
