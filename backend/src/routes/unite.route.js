import express from 'express';
import { UniteController } from '../controllers/unite.controller.js';

const router = express.Router();

router.get('/', UniteController.getAll);
router.post('/', UniteController.create);
router.put('/:id', UniteController.update);
router.delete('/:id', UniteController.delete);

export default router;
