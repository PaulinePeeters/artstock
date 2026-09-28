import express from 'express';
import * as demandeController from '../controllers/demande.controller.js';

const router = express.Router();

router.get('/', demandeController.getAllDemandes);
router.post('/', demandeController.creerDemande);
router.patch('/:id', demandeController.patchStatutDemande);
router.get('/preparees', demandeController.getDemandesPreparees);

export default router;
