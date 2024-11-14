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
exports.getSuppliers = exports.createBlocks = exports.getBlocks = exports.processBlocks = exports.removeBlocks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const handleBigIntConversion = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) => typeof value === "bigint" ? value.toString() : value));
};
const removeBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blockIds } = req.body;
        if (!blockIds || !Array.isArray(blockIds)) {
            res.status(400).json({ message: "Invalid block IDs" });
            return;
        }
        // Convert string IDs back to BigInt for Prisma
        const bigIntIds = blockIds.map(id => BigInt(id));
        yield prisma.blocks.deleteMany({
            where: {
                blockId: {
                    in: bigIntIds,
                },
            },
        });
        res.status(200).json({ message: "Blocks removed successfully" });
    }
    catch (error) {
        console.error("Error removing blocks:", error);
        res.status(500).json({ message: "Error removing blocks" });
    }
});
exports.removeBlocks = removeBlocks;
const processBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blockIds, removalDate } = req.body;
        if (!blockIds || !Array.isArray(blockIds)) {
            res.status(400).json({ message: "Invalid block IDs" });
            return;
        }
        // Validate removalDate (if provided)
        console.log("Removal date:", removalDate);
        if (removalDate && isNaN(Date.parse(removalDate))) {
            res.status(400).json({ message: "Invalid removalDate format" });
            return;
        }
        // Convert string IDs back to BigInt for Prisma
        const bigIntIds = blockIds.map(id => BigInt(id));
        // Prepare the update data
        const updateData = {
            processed: true,
        };
        // If removalDate is provided, add it to the update data
        if (removalDate) {
            updateData.removalDate = removalDate;
        }
        console.log("Update data:", updateData);
        // Update the blocks in the database
        const result = yield prisma.blocks.updateMany({
            where: {
                blockId: {
                    in: bigIntIds,
                },
            },
            data: updateData, // Using the updated data
        });
        if (result.count === 0) {
            res.status(404).json({ message: "No blocks found to process" });
            return;
        }
        res.status(200).json({ message: "Blocks processed successfully" });
    }
    catch (error) {
        console.error("Error processing blocks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.processBlocks = processBlocks;
const getBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        const blocks = yield prisma.blocks.findMany({
            where: {
                blockType: {
                    blockName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
            include: {
                blockType: true,
                suppliers: true,
            }
        });
        // Check if blocks array is empty and return 404 if no blocks are found
        if (blocks.length === 0) {
            res.status(404).json({ message: "No blocks found for the given criteria" });
            return;
        }
        // Use handleBigIntConversion instead of manual conversion
        const convertedBlocks = handleBigIntConversion(blocks);
        res.json(convertedBlocks);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving blocks" });
    }
});
exports.getBlocks = getBlocks;
// // Needed for the ADD A NEW BLOCK FUNCTIONALITY IN THE INVENTORY
// export const getBlockTypes = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const blockTypes = await prisma.blockTypes.findMany({
//             select: {
//                 blockTypeId: true,
//                 blockName: true,
//                 density: true,
//             },
//         });
//         res.json(handleBigIntConversion(blockTypes));
//     } catch (error) {
//         console.error("Error fetching block types:", error);
//         res.status(500).json({ error: "Failed to fetch block types" });
//     }
// };
const createBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blocks = Array.isArray(req.body) ? req.body : [req.body];
        console.log("Blocks:", blocks);
        // Validate the blocks
        for (const block of blocks) {
            const { blockTypeId, height, width, length } = block;
            if (!blockTypeId || !height || !width || !length) {
                throw new Error("Missing required fields in one or more blocks");
            }
        }
        const blocksToCreate = blocks.map(block => (Object.assign(Object.assign({}, block), { blockTypeId: block.blockTypeId, arrivalDate: new Date(block.arrivalDate) })));
        const result = yield prisma.blocks.createMany({
            data: blocksToCreate,
        });
        res.status(201).json({ message: "Blocks created successfully", count: result.count });
    }
    catch (error) {
        console.error('Error creating blocks:', error);
        res.status(400).json({ message: "Missing required fields in one or more blocks" });
    }
});
exports.createBlocks = createBlocks;
const getSuppliers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const suppliers = yield prisma.suppliers.findMany({ select: {
                supplierId: true,
                supplierName: true,
            },
        });
        res.json(suppliers);
    }
    catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
});
exports.getSuppliers = getSuppliers;
