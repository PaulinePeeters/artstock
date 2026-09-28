import express from 'express';
import * as fournisseurController from '../controllers/fournisseur.controller.js';

const router = express.Router();

router.get('/', fournisseurController.getAllFournisseurs);
router.get('/:id', fournisseurController.getFournisseurById);
router.post('/', fournisseurController.createFournisseur);
router.put('/:id', fournisseurController.updateFournisseur);
router.delete('/:id', fournisseurController.deleteFournisseur);
router.get('/commandes/fournisseur/:id', fournisseurController.getCommandesByFournisseur);

export default router;
