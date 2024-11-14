"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlocks = exports.updateSupplier = exports.deleteSupplier = exports.createSupplier = exports.getSuppliers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getSuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        console.log("Search term:", search);
        // Query for suppliers with blocks and associated block types
        const suppliers = yield prisma.suppliers.findMany({
            where: {
                supplierName: {
                    contains: search, // Use `contains` to search with the provided term
                    mode: "insensitive", // Case insensitive search
                },
            },
            include: {
                Blocks: {
                    include: {
                        blockType: true,
                    },
                },
            },
        });
        // Format the data for each supplier
        const result = suppliers.map((supplier) => {
            const totalBlocks = supplier.Blocks.length;
            // Calculate the number of blocks for each block type
            const blocksByBlockType = supplier.Blocks.reduce((acc, block) => {
                const blockTypeName = block.blockType.blockName;
                acc[blockTypeName] = (acc[blockTypeName] || 0) + 1;
                return acc;
            }, {});
            return {
                supplierId: supplier.supplierId,
                supplierName: supplier.supplierName,
                totalBlocks,
                blocksByBlockType,
                canDelete: totalBlocks === 0,
            };
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch suppliers", error });
    }
});
exports.getSuppliers = getSuppliers;
const createSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierName } = req.body;
        //Validate input
        if (!supplierName) {
            res.status(400).json({ message: "Supplier Name is required" });
            return;
        }
        // Check if a BlockType with the same blockName already exists
        const existingSupplier = yield prisma.suppliers.findUnique({
            where: { supplierName },
        });
        if (existingSupplier) {
            res.status(400).json({ message: `Supplier with the name "${supplierName}" already exists` });
            return;
        }
        const newSupplier = yield prisma.suppliers.create({
            data: {
                supplierName,
                // Add more data here
            },
        });
        res.json(newSupplier);
    }
    catch (error) {
        console.error("Error creating the new supplier:", error);
        res.status(500).json({ message: "Failed to create new supplier", error });
    }
});
exports.createSupplier = createSupplier;
const deleteSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId } = req.params;
        // Validate if the block type exists
        const supplier = yield prisma.suppliers.findUnique({
            where: { supplierId: Number(supplierId) },
        });
        if (isNaN(Number(supplierId))) {
            res.status(400).json({ message: "Invalid supplier ID" });
            return;
        }
        if (!supplier) {
            res.status(404).json({ message: "Supplier not found" });
            return;
        }
        // Delete the block type
        yield prisma.suppliers.delete({
            where: { supplierId: Number(supplierId) },
        });
        res.json({ message: "Supplier deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to remove the supplier", error });
    }
});
exports.deleteSupplier = deleteSupplier;
const updateSupplier = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { supplierId } = req.params;
        const { supplierName } = req.body;
        // Validate input
        if (!supplierName) {
            res.status(400).json({ message: "supplier name is required" });
            return;
        }
        // Find the existing block type
        const existingSupplier = yield prisma.suppliers.findUnique({
            where: { supplierId: Number(supplierId) },
        });
        if (!existingSupplier) {
            res.status(404).json({ message: "Supplier not found" });
            return;
        }
        // Update block type
        const updatedSupplier = yield prisma.suppliers.update({
            where: { supplierId: Number(supplierId) },
            data: {
                supplierName,
            },
        });
        res.json(updatedSupplier);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update the supplier entry", error });
    }
});
exports.updateSupplier = updateSupplier;
const getBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { supplierId } = req.params; // Get supplierId from the URL parameter
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || ''; // Default search to empty string if not provided
        console.log(`Fetching blocks for supplierId: ${supplierId} with search: ${search}`);
        // Query the database for blocks related to the supplier and blockType.blockName search
        const blocks = yield prisma.blocks.findMany({
            where: {
                supplierId: parseInt(supplierId), // Filter by supplierId
                blockType: {
                    blockName: {
                        contains: search, // Filters blocks based on blockType.blockName
                        mode: 'insensitive', // Case insensitive search
                    },
                },
            },
            include: {
                blockType: true, // Include related blockType details
                suppliers: true, // Include related suppliers details
            },
        });
        // If no blocks are found, return a 404 response
        if (blocks.length === 0) {
            console.log('No blocks found');
            res.status(404).json({ message: 'No blocks found for the given criteria' });
            return;
        }
        // Convert BigInt fields to strings for serialization
        const serializedBlocks = blocks.map(block => (Object.assign(Object.assign({}, block), { blockId: block.blockId.toString(), blockTypeId: block.blockTypeId.toString() })));
        console.log(`Found ${blocks.length} blocks`);
        res.json(serializedBlocks); // Return the serialized blocks
    }
    catch (error) {
        console.error('Error retrieving blocks:', error);
        res.status(500).json({ message: 'Error retrieving blocks' });
    }
});
exports.getBlocks = getBlocks;
