// services/CommandeService.js
import prisma from '../lib/prisma.js';
import { ajouterHistoriqueStock } from './stock.service.js';

export async function creerCommande({ fournisseur, dateCommande, lignes }) {

    if (!fournisseur) {
        throw new Error("Le fournisseur doit être spécifié");
    }
    const fournisseurId = parseInt(fournisseur, 10);
    if (isNaN(fournisseurId)) {
        throw new Error("L'id du fournisseur est invalide");
    }
    // dateCommande doit venir du frontend, ou on utilise la date actuelle par défaut
    const dateCmd = dateCommande ? new Date(dateCommande) : new Date();

    const commande = await prisma.commande.create({
        data: {
            fournisseurId,
            dateCommande: dateCmd,
            lignesCommande: {
                create: lignes.map((ligne) => ({
                    materiel: {
                        connect: {
                            id: parseInt(ligne.materielId), // attention au nom exact : 'materielId' ici
                        },
                    },
                    quantite: ligne.quantite,
                    prixUnitaire: ligne.prixUnitaire,
                })),
            },
        },
        include: {
            lignesCommande: true,
        },
    });

    return commande;
}

export async function getCommandes() {
    return await prisma.commande.findMany({
        orderBy: { dateCommande: 'desc' },
        include: {
            lignesCommande: { include: { materiel: true } },
            fournisseur: true,        // <-- ajouter la relation fournisseur
        }
    });
}

export async function getCommandeById(id) {
    return await prisma.commande.findUnique({
        where: { id: parseInt(id) },
        include: {
            lignesCommande: {
                include: {
                    materiel: {
                        include: {
                            unite: true
                        }
                    }
                }
            },
            fournisseur: true,  // <-- ajouter ici pour avoir le fournisseur
        }
    });
}


export async function receptionnerCommande(id, receptionData) {
    const dateReception = new Date();

    // Mettre à jour dateReception et statut de la commande
    await prisma.commande.update({
        where: { id: parseInt(id) },
        data: {
            dateReception,
            statut: 'receptionnee',  // <-- ajout ici
        }
    });

    // Pour chaque ligne, mettre à jour ligneCommande + stock + historique
    for (const ligne of receptionData) {
        await prisma.ligneCommande.update({
            where: { id: ligne.ligneCommandeId },
            data: {
                quantite: ligne.quantiteRecue,
                prixUnitaire: ligne.prixUnitaire
            }
        });

        const lc = await prisma.ligneCommande.findUnique({
            where: { id: ligne.ligneCommandeId }
        });


        await prisma.materiel.update({
            where: { id: lc.materielId },
            data: {
                quantiteUnites: {
                    increment: ligne.quantiteRecue
                },
                derniereCommandeId: parseInt(id)
                }
        });


        try {
            const commande = await prisma.commande.findUnique({
                where: { id: parseInt(id) },
                include: { fournisseur: true }
            });

            const hist = await ajouterHistoriqueStock({

                materielId: lc.materielId,
                quantite: Number(ligne.quantiteRecue),
                type: 'entrée',
                prixUnitaire: Number(ligne.prixUnitaire),
                fournisseurId: commande?.fournisseur?.id,
                commentaire: `Réception commande #${id}`
            });

        } catch (error) {
            console.error('Erreur ajout historique stock:', error);
        }
    }

    // Retourne la commande mise à jour
    const updatedCommande = await prisma.commande.findUnique({
        where: { id: parseInt(id) },
        include: { lignesCommande: true,
            fournisseur: true }
    });

    return updatedCommande;
}

export async function deleteCommande(id) {
    const commande = await prisma.commande.findUnique({
        where: { id: parseInt(id, 10) },
    });

    if (!commande) {
        const error = new Error("Commande introuvable");
        error.code = 'COMMANDE_INTROUVABLE';
        throw error;
    }

    if (commande.dateReception) {
        const error = new Error("Impossible de supprimer une commande déjà réceptionnée");
        error.code = 'COMMANDE_RECEPTIONNEE';
        throw error;
    }

    return prisma.commande.delete({
        where: { id: parseInt(id, 10) },
    });
}