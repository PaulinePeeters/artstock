import { UniteService } from '../services/unite.service.js';

export const UniteController = {
    getAll: async (req, res) => {
        try {
            const unites = await UniteService.getAll();
            res.json(unites);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const nouvelle = await UniteService.create(req.body);
            res.status(201).json(nouvelle);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const modifie = await UniteService.update(req.params.id, req.body);
            res.json(modifie);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    delete: async (req, res) => {
        try {
            await UniteService.delete(req.params.id);
            res.json({ message: 'Supprimé' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
};
