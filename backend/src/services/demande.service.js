import prisma from '../lib/prisma.js';


export async function creerDemande(data) {
    const { nomProf, classe, dateUtilisation, commentaire, lignes } = data;

    const lignesAvecIdsNumeriques = lignes.map(ligne => ({
        materielId: parseInt(ligne.materielId, 10),
        quantite: ligne.quantite,
    }));

    const dateUtil = new Date(dateUtilisation);
    const dateDebut = new Date(dateUtil);
    dateDebut.setDate(dateDebut.getDate() - 1);

    try {
        for (const ligne of lignesAvecIdsNumeriques) {
            const materiel = await prisma.materiel.findUnique({
                where: { id: ligne.materielId },
            });

            if (!materiel || materiel.quantiteUnites < ligne.quantite) {
                throw new Error(`Stock insuffisant pour ${materiel?.nom || 'ID:' + ligne.materielId}`);
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            const demande = await tx.demande.create({
                data: {
                    nomProf,
                    classe,
                    dateUtilisation: dateUtil,
                    dateDebut,
                    dateFin: dateUtil,
                    commentaire,
                    statut: 'en_attente',
                    lignes: {
                        create: lignesAvecIdsNumeriques,
                    },
                },
                include: { lignes: true },
            });

            for (const ligne of lignesAvecIdsNumeriques) {

                await tx.materiel.update({
                    where: { id: ligne.materielId },
                    data: {
                        quantiteUnites: {
                            decrement: ligne.quantite,
                        },
                    },
                });

                await tx.historiqueStock.create({
                    data: {
                        materielId: ligne.materielId,
                        quantite: ligne.quantite,
                        type: 'sortie',
                        commentaire: `Sortie liée à la demande #${demande.id}`,
                    },
                });
            }

            return demande;
        });

        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la demande :', error);
        throw error;
    }
}

export async function getDemandesPreparees() {
    return prisma.demande.findMany({
        include: {
            lignes: {
                include: { materiel: true },
            },
        },
        orderBy: { dateUtilisation: 'asc' },
    });
}

export async function getDemandes() {
    return prisma.demande.findMany({
        include: {
            lignes: {
                include: { materiel: true },
            },
        },
        orderBy: { dateDemande: 'desc' },
    });
}

export async function updateStatutDemande(id, statut) {
    const demande = await prisma.demande.update({
        where: { id: Number(id) },
        data: { statut },
        include: { lignes: true }
    });
    if (statut === 'preparee'){
        await prisma.$transaction(async (tx) => {
            for (const ligne of demande.lignes) {
                await tx.materiel.update({
                    where: { id: ligne.materielId },
                    data: {
                        quantiteUnites: {
                            decrement: ligne.quantite
                        }
                    }
                });

                await tx.historiqueStock.create({
                    data: {
                        materielId: ligne.materielId,
                        quantite: ligne.quantite,
                        type: 'sortie',
                        commentaire: `Sortie liée à la demande #${demande.id}`
                    }
                });
            }
        });
    }

    return demande;
}