"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supplierControllers_1 = require("../controllers/supplierControllers");
const router = express_1.default.Router();
router.get('/', supplierControllers_1.getSuppliers); // GET request
router.post('/', supplierControllers_1.createSupplier); // POST request
router.delete("/:supplierId", supplierControllers_1.deleteSupplier); // Delete a block type by ID
router.put("/:supplierId", supplierControllers_1.updateSupplier); // Update a block type by ID
router.get("/:supplierId/blocks", supplierControllers_1.getBlocks); // Get a block type by supplier ID
exports.default = router;
