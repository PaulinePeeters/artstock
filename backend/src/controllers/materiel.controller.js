import { MaterielService } from '../services/materiel.service.js';

export const MaterielController = {
    getAll: async (req, res) => {
        try {
            const materiels = await MaterielService.getAll({ search: req.query.search });
            res.json(materiels);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const materiel = await MaterielService.getById(req.params.id);
            if (!materiel) return res.status(404).json({ error: 'Non trouvé' });
            res.json(materiel);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const nouveau = await MaterielService.create(req.body);
            res.status(201).json(nouveau);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const modifie = await MaterielService.update(req.params.id, req.body);
            res.json(modifie);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    updateStock: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const delta = Number(req.body.delta);

            if (isNaN(delta)) return res.status(400).json({ error: 'Delta invalide' });

            const materiel = await MaterielService.getById(id);
            if (!materiel) return res.status(404).json({ error: 'Matériel non trouvé' });

            const nouvelleQuantite = (materiel.quantiteUnites || 0) + delta;
            if (nouvelleQuantite < 0) return res.status(400).json({ error: 'Stock négatif non autorisé' });

            const updated = await MaterielService.update(id, {
                quantiteUnites: nouvelleQuantite,
                quantite: delta,
                type: delta > 0 ? 'entrée' : 'sortie',
                commentaire: req.body.commentaire || null
            });

            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
        }
    },

    setCodeFournisseur: async (req, res) => {
        try {
            const lien = await MaterielService.setCodeFournisseur(
                req.params.id,
                req.params.fournisseurId,
                req.body.codeArticle
            );
            res.json(lien);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    removeFournisseur: async (req, res) => {
        try {
            await MaterielService.removeFournisseur(req.params.id, req.params.fournisseurId);
            res.json({ message: 'Fournisseur retiré du matériel' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await MaterielService.delete(req.params.id);
            res.json({ message: 'Supprimé' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    getACommander: async (req, res) => {
        try {
            const alertes = await MaterielService.getACommander();
            res.json(alertes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
