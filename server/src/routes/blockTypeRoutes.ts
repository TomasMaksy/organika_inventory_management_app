import express from 'express';
import { getBlockTypes, createBlockType, deleteBlockType, updateBlockType } from '../controllers/blockTypeControllers';

const router = express.Router();

router.get('/', getBlockTypes);         // GET request
router.post('/', createBlockType);      // POST request
router.delete("/:blockTypeId", deleteBlockType); // Delete a block type by ID
router.put("/:blockTypeId", updateBlockType); // Update a block type by ID

export default router;