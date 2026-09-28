import * as commandeService from '../services/commande.service.js';

export async function creerCommande(req, res) {
    try {
        const commande = await commandeService.creerCommande(req.body);
        res.status(201).json(commande);
    } catch (err) {
        console.error("Erreur création commande :", err);
        res.status(500).json({ message: "Erreur lors de la création de la commande" });
    }
}

export async function listerCommandes(req, res) {
    try {
        const commandes = await commandeService.getCommandes();
        res.json(commandes);
    } catch (err) {
        console.error("Erreur récupération commandes :", err);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
}

export async function getCommande(req, res) {
    try {
        const commande = await commandeService.getCommandeById(req.params.id);
        if (!commande) return res.status(404).json({ message: "Commande non trouvée" });
        res.json(commande);
    } catch (err) {
        console.error("Erreur récupération commande :", err);
        res.status(500).json({ message: "Erreur lors de la récupération de la commande" });
    }
}

export async function receptionnerCommande(req, res) {
    try {
        const updatedCommande = await commandeService.receptionnerCommande(req.params.id, req.body.reception);
        res.json(updatedCommande);
    } catch (err) {
        console.error("Erreur réception commande :", err);
        res.status(500).json({ message: "Erreur lors de la réception de la commande" });
    }
}

export async function supprimerCommande(req, res) {
    try {
        await commandeService.deleteCommande(req.params.id);
        res.status(204).send();
    } catch (err) {
        if (err.code === 'COMMANDE_RECEPTIONNEE') {
            return res.status(409).json({ message: err.message });
        }
        if (err.code === 'COMMANDE_INTROUVABLE') {
            return res.status(404).json({ message: err.message });
        }
        console.error("Erreur suppression commande :", err);
        res.status(500).json({ message: "Erreur lors de la suppression de la commande" });
    }
}
