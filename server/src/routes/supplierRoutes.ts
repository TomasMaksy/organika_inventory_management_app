import express from 'express';
import { getSuppliers, createSupplier, deleteSupplier, updateSupplier, getBlocks } from '../controllers/supplierControllers';

const router = express.Router();

router.get('/', getSuppliers);         // GET request
router.post('/', createSupplier);      // POST request
router.delete("/:supplierId", deleteSupplier); // Delete a block type by ID
router.put("/:supplierId", updateSupplier); // Update a block type by ID
router.get("/:supplierId/blocks", getBlocks); // Get a block type by supplier ID

export default router;