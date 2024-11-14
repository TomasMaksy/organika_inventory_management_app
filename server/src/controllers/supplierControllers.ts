import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search?.toString() || '';
    console.log("Search term:", search);

    // Query for suppliers with blocks and associated block types
    const suppliers = await prisma.suppliers.findMany({
      where: {
          supplierName: {
              contains: search,  // Use `contains` to search with the provided term
              mode: "insensitive",  // Case insensitive search
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
      }, {} as Record<string, number>);

      return {
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        totalBlocks,
        blocksByBlockType,
        canDelete: totalBlocks === 0,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch suppliers", error });
  }
};

  

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const {supplierName} = req.body;

    //Validate input
    if(!supplierName){
      res.status(400).json({message: "Supplier Name is required"});
      return;
    }

    // Check if a BlockType with the same blockName already exists
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { supplierName },
    });

    if (existingSupplier) {
      res.status(400).json({ message: `Supplier with the name "${supplierName}" already exists` });
      return;
    }

    const newSupplier = await prisma.suppliers.create({
      data: {
        supplierName,
        // Add more data here
      },  
    });
    res.json(newSupplier);
  } catch (error) {
    console.error("Error creating the new supplier:", error);
    res.status(500).json({message: "Failed to create new supplier", error});
  }
}

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;

    // Validate if the block type exists
    const supplier = await prisma.suppliers.findUnique({
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
    await prisma.suppliers.delete({
      where: { supplierId: Number(supplierId) },
    });

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove the supplier", error });
  }
};


export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params;
    const { supplierName } = req.body;

    // Validate input
    if (!supplierName) {
      res.status(400).json({ message: "supplier name is required" });
      return;
    }

    // Find the existing block type
    const existingSupplier = await prisma.suppliers.findUnique({
      where: { supplierId: Number(supplierId) },
    });

    if (!existingSupplier) {
      res.status(404).json({ message: "Supplier not found" });
      return;
    }

    // Update block type
    const updatedSupplier = await prisma.suppliers.update({
      where: { supplierId: Number(supplierId) },
      data: {
        supplierName,
      },
    });

    res.json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: "Failed to update the supplier entry", error });
  }
};

export const getBlocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { supplierId } = req.params; // Get supplierId from the URL parameter
    const search = req.query.search?.toString() || ''; // Default search to empty string if not provided

    console.log(`Fetching blocks for supplierId: ${supplierId} with search: ${search}`);

    // Query the database for blocks related to the supplier and blockType.blockName search
    const blocks = await prisma.blocks.findMany({
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
    const serializedBlocks = blocks.map(block => ({
      ...block,
      blockId: block.blockId.toString(),  // Convert blockId from BigInt to string
      blockTypeId: block.blockTypeId.toString(),  // Convert blockTypeId from BigInt to string
    }));

    console.log(`Found ${blocks.length} blocks`);
    res.json(serializedBlocks); // Return the serialized blocks
  } catch (error) {
    console.error('Error retrieving blocks:', error);
    res.status(500).json({ message: 'Error retrieving blocks' });
  }
};
