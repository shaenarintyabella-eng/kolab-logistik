import express from 'express';
import { menuController } from '../controllers/menuController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', menuController.getAll);
router.get('/:id', menuController.getById);
router.post('/', upload.single('foto'), menuController.create);
router.put('/:id', upload.single('foto'), menuController.update);
router.patch('/:id/toggle-status', menuController.toggleStatus);
router.delete('/:id', menuController.delete);

export default router;
