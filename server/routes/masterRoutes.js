import express from 'express';
import { masterController } from '../controllers/masterController.js';

const router = express.Router();

// Kategori
router.get('/categories', masterController.getCategories);

// Gudang
router.get('/warehouses', masterController.getWarehouses);
router.post('/warehouses', masterController.createWarehouse);
router.put('/warehouses/:id', masterController.updateWarehouse);
router.delete('/warehouses/:id', masterController.deleteWarehouse);

// Supplier
router.get('/suppliers', masterController.getSuppliers);
router.post('/suppliers', masterController.createSupplier);
router.put('/suppliers/:id', masterController.updateSupplier);
router.delete('/suppliers/:id', masterController.deleteSupplier);

export default router;
