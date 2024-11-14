"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blockTypeControllers_1 = require("../controllers/blockTypeControllers");
const router = express_1.default.Router();
router.get('/', blockTypeControllers_1.getBlockTypes); // GET request
router.post('/', blockTypeControllers_1.createBlockType); // POST request
router.delete("/:blockTypeId", blockTypeControllers_1.deleteBlockType); // Delete a block type by ID
router.put("/:blockTypeId", blockTypeControllers_1.updateBlockType); // Update a block type by ID
exports.default = router;
