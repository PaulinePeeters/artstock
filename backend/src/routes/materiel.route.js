import express from 'express';
import { MaterielController } from '../controllers/materiel.controller.js';

const router = express.Router();

router.get('/a/commander/seuil', MaterielController.getACommander); // mettre avant la route paramétrée
router.get('/', MaterielController.getAll);
router.get('/:id', MaterielController.getById);
router.post('/', MaterielController.create);
router.put('/:id', MaterielController.update);
router.post('/:id/stock', MaterielController.updateStock);
router.put('/:id/fournisseurs/:fournisseurId', MaterielController.setCodeFournisseur);
router.delete('/:id/fournisseurs/:fournisseurId', MaterielController.removeFournisseur);
router.delete('/:id', MaterielController.delete);

export default router;
