import * as demandeService from '../services/demande.service.js';

export async function creerDemande(req, res) {
    try {
        const demande = await demandeService.creerDemande(req.body);
        res.status(201).json(demande);
    } catch (error) {
        console.error('Erreur création demande:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la demande' });
    }
}

export async function getAllDemandes(req, res) {
    try {
        const demandes = await demandeService.getDemandes();
        res.json(demandes);
    } catch (error) {
        console.error('Erreur récupération demandes:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des demandes' });
    }
}

export async function patchStatutDemande(req, res) {
    const { id } = req.params;
    const { statut } = req.body;

    const statutsValides = ['en_attente', 'préparée', 'annulée'];
    if (!statutsValides.includes(statut)) {
        return res.status(400).json({ message: 'Statut invalide' });
    }

    try {
        const demande = await demandeService.updateStatutDemande(id, statut);
        res.json(demande);
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
}

export async function getDemandesPreparees(req, res) {
    try {
        const demandes = await demandeService.getDemandesPreparees();
        res.json(demandes);
    } catch (err) {
        console.error('Erreur récupération demandes préparées:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
