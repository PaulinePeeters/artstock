import prisma from '../lib/prisma.js';

export async function getNotifications() {

    const today = new Date();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    firstDayOfWeek.setHours(0,0,0,0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23,59,59,999);

    // Matériel
    const materiels = await prisma.materiel.findMany();
    const materielsFaibleStock = materiels.filter(m => m.quantiteUnites <= m.seuilAlerte);

    // Commandes semaine
    const commandesCetteSemaine = await prisma.commande.findMany({
        where: {
            statut: 'en_attente',
            dateCommande: {
                gte: firstDayOfWeek,
                lte: lastDayOfWeek,
            },
        },
    });

    // Demandes semaine
    const demandesCetteSemaine = await prisma.demande.findMany({
        where: {
            dateUtilisation: {
                gte: firstDayOfWeek,
                lte: lastDayOfWeek,
            },
            statut: 'en_attente',
        },
    });

    const notifications = [];
    materielsFaibleStock.forEach(m => {
        notifications.push({
            id: `materiel-${m.id}`,
            type: 'alerte',
            date: new Date().toISOString(),
            message: `Stock faible : ${m.quantiteUnites} ${m.nom} restants (seuil: ${m.seuilAlerte})`,
        });
    });

    commandesCetteSemaine.forEach(c => {
        if (!c.dateReception) {
            notifications.push({
                id: `commande-${c.id}`,
                type: 'commande',
                date: new Date(c.dateCommande).toISOString(), // utile pour le tri
                message: `Commande #${c.id} en attente de réception`,
            });
        }
    });

    demandesCetteSemaine.forEach(d => {
        const dateUtilisation = new Date(d.dateUtilisation);
        notifications.push({
            id: `demande-${d.id}`,
            type: 'demande',
            date: dateUtilisation.toISOString(),
            message: `Demande de ${d.nomProf} (classe ${d.classe}) à utiliser le ${dateUtilisation.toLocaleDateString('fr-FR')}`,
        });
    });

    return notifications;
}
