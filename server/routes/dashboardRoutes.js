import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', dashboardController.getSummary);

export default router;
