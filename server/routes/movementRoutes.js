import express from 'express';
import { movementController } from '../controllers/movementController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', movementController.getAll);
router.get('/export-csv', movementController.exportCsv);
router.post('/', upload.single('lampiran_foto'), movementController.create);

export default router;
