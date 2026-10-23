import express from 'express';
import { itemController } from '../controllers/itemController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', itemController.getAll);
router.get('/search-code', itemController.searchByCode);
router.get('/:id', itemController.getById);
router.post('/', upload.single('foto'), itemController.create);
router.put('/:id', upload.single('foto'), itemController.update);
router.delete('/:id', itemController.delete);

export default router;
