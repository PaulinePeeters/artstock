import * as fournisseurService from '../services/fournisseur.service.js';

export async function getAllFournisseurs(req, res) {
    try {
        const fournisseurs = await fournisseurService.getAllFournisseurs();
        res.json(fournisseurs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

export async function getFournisseurById(req, res) {
    try {
        const fournisseur = await fournisseurService.getFournisseurById(req.params.id);
        if (!fournisseur) return res.status(404).json({ error: 'Fournisseur non trouvé' });
        res.json(fournisseur);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}

export async function createFournisseur(req, res) {
    try {

        if (!req.body.nom || req.body.nom.trim() === '') {
            return res.status(400).json({ error: 'Le champ nom est obligatoire' });
        }

        const newFournisseur = await fournisseurService.createFournisseur(req.body);
        res.status(201).json(newFournisseur);
    } catch (error) {
        console.error('Erreur création fournisseur:', error);
        res.status(400).json({ error: error.message || 'Données invalides' });
    }
}

export async function updateFournisseur(req, res) {
    try {
        const updated = await fournisseurService.updateFournisseur(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: 'Erreur mise à jour' });
    }
}

export async function deleteFournisseur(req, res) {
    try {
        await fournisseurService.deleteFournisseur(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: 'Erreur suppression' });
    }
}

// Nouvelle route pour récupérer commandes par fournisseur
export async function getCommandesByFournisseur(req, res) {
    try {
        const commandes = await fournisseurService.getCommandesByFournisseurId(req.params.id);
        res.json(commandes);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
}
