import { Router, Request, Response } from "express";
import { getBlocks, removeBlocks, processBlocks, createBlocks, getSuppliers } from "../controllers/blocksController";
import { create } from "domain";

const router = Router();

router.get("/", getBlocks);
router.post("/", createBlocks);
router.delete("/remove", removeBlocks);
router.post('/process', processBlocks);
// router.get('/blocks', getBlockTypes);
router.get('/suppliers', getSuppliers);

export default router;