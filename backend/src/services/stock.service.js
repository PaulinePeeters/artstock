import prisma from '../lib/prisma.js';

/**
 * Ajoute une entrée dans l’historique de stock.
 * @param {Object} data - Données de l’historique à ajouter
 * @param {number} data.materielId - ID du matériel
 * @param {number} data.quantite - Quantité ajoutée ou retirée
 * @param {string} data.type - 'entrée' ou 'sortie'
 * @param {string} [data.fournisseur] - Fournisseur (optionnel)
 * @param {number} [data.prixUnitaire] - Prix unitaire (optionnel)
 * @param {string} [data.commentaire] - Commentaire (optionnel)
 * @returns {Promise<HistoriqueStock>}
 */
export async function ajouterHistoriqueStock({
                                                 materielId,
                                                 quantite,
                                                 type,
                                                 fournisseurId,
                                                 prixUnitaire,
                                                 commentaire,
                                             }) {
    return await prisma.historiqueStock.create({
        data: {
            materielId,
            quantite,
            type,
            fournisseurId,
            prixUnitaire,
            commentaire,
        },
    });
}
