"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blocksController_1 = require("../controllers/blocksController");
const router = (0, express_1.Router)();
router.get("/", blocksController_1.getBlocks);
router.post("/", blocksController_1.createBlocks);
router.delete("/remove", blocksController_1.removeBlocks);
router.post('/process', blocksController_1.processBlocks);
// router.get('/blocks', getBlockTypes);
router.get('/suppliers', blocksController_1.getSuppliers);
exports.default = router;
