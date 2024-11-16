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
exports.updateBlockType = exports.deleteBlockType = exports.createBlockType = exports.getBlockTypes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getBlockTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        console.log("Search term:", search);
        const blockTypes = yield prisma.blockTypes.findMany({
            where: {
                blockName: {
                    contains: search, // Use `contains` to search with the provided term
                    mode: "insensitive", // Case insensitive search
                },
            },
            include: {
                blocks: {
                    where: {
                        processed: false, // Exclude processed blocks
                    },
                    include: {
                        suppliers: true,
                    },
                },
            },
        });
        const result = blockTypes.map((blockType) => {
            const totalBlocks = blockType.blocks.length;
            const blocksBySupplier = blockType.blocks.reduce((acc, block) => {
                const supplierName = block.suppliers.supplierName;
                acc[supplierName] = (acc[supplierName] || 0) + 1;
                return acc;
            }, {});
            return {
                blockTypeId: blockType.blockTypeId,
                blockName: blockType.blockName,
                density: blockType.density,
                totalBlocks,
                blocksBySupplier,
                canDelete: totalBlocks === 0,
            };
        });
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch block types", error });
    }
});
exports.getBlockTypes = getBlockTypes;
const createBlockType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { blockName, density } = req.body;
        //Validate input
        if (!blockName || !density) {
            res.status(400).json({ message: "Block name and density are required" });
            return;
        }
        // Check if a BlockType with the same blockName already exists
        const existingBlockType = yield prisma.blockTypes.findUnique({
            where: { blockName },
        });
        if (existingBlockType) {
            res.status(400).json({ message: `Block type with name "${blockName}" already exists` });
            return;
        }
        const newBlockType = yield prisma.blockTypes.create({
            data: {
                blockName,
                density,
            },
        });
        res.json(newBlockType);
    }
    catch (error) {
        console.error("Error creating block type:", error);
        res.status(500).json({ message: "Failed to create block type", error });
    }
});
exports.createBlockType = createBlockType;
const deleteBlockType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blockTypeId } = req.params;
        // Validate if the block type exists
        const blockType = yield prisma.blockTypes.findUnique({
            where: { blockTypeId: Number(blockTypeId) },
        });
        if (isNaN(Number(blockTypeId))) {
            res.status(400).json({ message: "Invalid block type ID" });
            return;
        }
        if (!blockType) {
            res.status(404).json({ message: "Block type not found" });
            return;
        }
        // Delete the block type
        yield prisma.blockTypes.delete({
            where: { blockTypeId: Number(blockTypeId) },
        });
        res.json({ message: "Block type deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete block type", error });
    }
});
exports.deleteBlockType = deleteBlockType;
const updateBlockType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blockTypeId } = req.params;
        const { blockName, density } = req.body;
        // Validate input
        if (!blockName || !density) {
            res.status(400).json({ message: "Block name and density are required" });
            return;
        }
        // Find the existing block type
        const existingBlockType = yield prisma.blockTypes.findUnique({
            where: { blockTypeId: Number(blockTypeId) },
        });
        if (!existingBlockType) {
            res.status(404).json({ message: "Block type not found" });
            return;
        }
        // Update block type
        const updatedBlockType = yield prisma.blockTypes.update({
            where: { blockTypeId: Number(blockTypeId) },
            data: {
                blockName,
                density,
            },
        });
        res.json(updatedBlockType);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update block type", error });
    }
});
exports.updateBlockType = updateBlockType;
