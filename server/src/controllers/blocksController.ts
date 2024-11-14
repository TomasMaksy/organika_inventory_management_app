import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

const handleBigIntConversion = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
};

export const removeBlocks = async (req: Request, res: Response): Promise<void> => {
    try {
        const { blockIds } = req.body;
        if (!blockIds || !Array.isArray(blockIds)) {
            res.status(400).json({ message: "Invalid block IDs" });
            return;
        }

        // Convert string IDs back to BigInt for Prisma
        const bigIntIds = blockIds.map(id => BigInt(id));

        await prisma.blocks.deleteMany({
            where: {
                blockId: {
                    in: bigIntIds,
                },
            },
        });

        res.status(200).json({ message: "Blocks removed successfully" });
    } catch (error) {
        console.error("Error removing blocks:", error);
        res.status(500).json({ message: "Error removing blocks" });
    }
};

export const processBlocks = async (req: Request, res: Response): Promise<void> => {
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
        const updateData: any = {
            processed: true,
        };
        // If removalDate is provided, add it to the update data
        if (removalDate) {
            updateData.removalDate = removalDate;
        }
        console.log("Update data:", updateData);

        // Update the blocks in the database
        const result = await prisma.blocks.updateMany({
            where: {
            blockId: {
                in: bigIntIds,
            },
            },
            data: updateData,  // Using the updated data
            
        });
        
    
        if (result.count === 0) {
            res.status(404).json({ message: "No blocks found to process" });
            return;
        }
        res.status(200).json({ message: "Blocks processed successfully" });
    } catch (error) {
        console.error("Error processing blocks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getBlocks = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = req.query.search?.toString() || '';
        const blocks = await prisma.blocks.findMany({
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
    } catch (error) {
        res.status(500).json({ message: "Error retrieving blocks" });
    }
};

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

export const createBlocks = async (req: Request, res: Response): Promise<void> => {
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
  
      const blocksToCreate = blocks.map(block => ({
        ...block,
        blockTypeId: block.blockTypeId, 
        arrivalDate: new Date(block.arrivalDate),
      }));
  
      const result = await prisma.blocks.createMany({
        data: blocksToCreate,
      });
  
      res.status(201).json({ message: "Blocks created successfully", count: result.count });
    } catch (error) {
        console.error('Error creating blocks:', error);
        res.status(400).json({ message: "Missing required fields in one or more blocks" });
    }
};


export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
    try {
        const suppliers = await prisma.suppliers.findMany({select: {
        supplierId: true,
        supplierName: true,
      },
    });
        res.json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
};