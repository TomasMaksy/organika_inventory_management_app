import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const getBlockTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString() || '';
    console.log("Search term:", search);
    const blockTypes = await prisma.blockTypes.findMany({
      where: {
          blockName: {
              contains: search,  // Use `contains` to search with the provided term
              mode: "insensitive",  // Case insensitive search
          },
      },
      include: {
          blocks: {
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
      }, {} as Record<string, number>);

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
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch block types", error });
  }
};
  

export const createBlockType = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body);
    const {blockName, density} = req.body;

    //Validate input
    if(!blockName || !density){
      res.status(400).json({message: "Block name and density are required"});
      return;
    }

    // Check if a BlockType with the same blockName already exists
    const existingBlockType = await prisma.blockTypes.findUnique({
      where: { blockName },
    });

    if (existingBlockType) {
      res.status(400).json({ message: `Block type with name "${blockName}" already exists` });
      return;
    }

    const newBlockType = await prisma.blockTypes.create({
      data: {
        blockName,
        density,
      },  
    });
    res.json(newBlockType);
  } catch (error) {
    console.error("Error creating block type:", error);
    res.status(500).json({message: "Failed to create block type", error});
  }
}

export const deleteBlockType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockTypeId } = req.params;

    // Validate if the block type exists
    const blockType = await prisma.blockTypes.findUnique({
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
    await prisma.blockTypes.delete({
      where: { blockTypeId: Number(blockTypeId) },
    });

    res.json({ message: "Block type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete block type", error });
  }
};


export const updateBlockType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockTypeId } = req.params;
    const { blockName, density } = req.body;

    // Validate input
    if (!blockName || !density) {
      res.status(400).json({ message: "Block name and density are required" });
      return;
    }

    // Find the existing block type
    const existingBlockType = await prisma.blockTypes.findUnique({
      where: { blockTypeId: Number(blockTypeId) },
    });

    if (!existingBlockType) {
      res.status(404).json({ message: "Block type not found" });
      return;
    }

    // Update block type
    const updatedBlockType = await prisma.blockTypes.update({
      where: { blockTypeId: Number(blockTypeId) },
      data: {
        blockName,
        density,
      },
    });

    res.json(updatedBlockType);
  } catch (error) {
    res.status(500).json({ message: "Failed to update block type", error });
  }
};
