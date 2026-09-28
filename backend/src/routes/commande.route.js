// routes/commandeRoutes.js
import express from 'express';
import * as commandeController from '../controllers/commande.controller.js';

const router = express.Router();

router.post('/', commandeController.creerCommande);
router.get('/', commandeController.listerCommandes);
router.get('/:id', commandeController.getCommande);
router.post('/:id/reception', commandeController.receptionnerCommande);
router.delete('/:id', commandeController.supprimerCommande);

export default router;
