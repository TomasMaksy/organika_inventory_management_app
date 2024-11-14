import { Request, Response } from "express";
import { PrismaClient, Blocks, Products, SalesSummary, PurchaseSummary, ExpenseSummary, ExpenseByCategory, BlockTypes } from "@prisma/client";

const prisma = new PrismaClient();

// Define interface for blocks with their type information
interface BlockWithType extends Blocks {
    blockType: BlockTypes;
}

// Helper function to handle BigInt conversion to string for JSON serialization
const handleBigIntConversion = (data: any) => {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
};


export const getDashboardMetrics = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // LATEST BLOCKS ADDED - CALCULATING THE TOTAL VOLUME OF UNPROCESSED BLOCKS
        let latestBlocksAdded: BlockWithType[] = [];
        try {
            latestBlocksAdded = await prisma.blocks.findMany({
                take: 10,
                orderBy: {
                    arrivalDate: "desc",
                },
                include: {
                    blockType: true,
                },
            });
            console.log("Blocks fetched successfully:", latestBlocksAdded.length);
        } catch (blockError) {
            console.error("Error fetching blocks:", blockError);
            latestBlocksAdded = [];
        }


        // STORAGE SPACE - FETCHING BLOCKS ADDED EVER, AND REMOVED (PROCESSED) IN THE LAST 7 DAYS
        let blocksAddedEver: Blocks[] = [];
        const currentDate = new Date();

        // Calculate the date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);

        try {
            blocksAddedEver = await prisma.blocks.findMany({
                where: {
                    AND: [
                        {
                            processed: false, // Only unprocessed blocks that were added ever
                        },
                        {
                            OR: [
                                {
                                    removalDate: {
                                        gte: sevenDaysAgo, // Blocks removed in the last 7 days
                                    },
                                },
                                {
                                    arrivalDate: {
                                        lte: currentDate, // Blocks added at any time before today
                                    },
                                },
                            ],
                        },
                    ],
                },
                include: {
                    blockType: true,
                },
            });

            console.log("Blocks added ever and removed in the last 7 days fetched successfully:", blocksAddedEver.length);
        } catch (blockError) {
            console.error("Error fetching blocks:", blockError);
            blocksAddedEver = [];
        }

        






        // ________________________________________________________________//

        // Old ones
        let popularProducts: Products[] = [];
        try {
            popularProducts = await prisma.products.findMany({
                take: 15,
                orderBy: {
                    stockQuantity: "desc",
                },
            });
        } catch (productsError) {
            console.error("Error fetching products:", productsError);
            popularProducts = [];
        }

        let salesSummary: SalesSummary[] = [];
        try {
            salesSummary = await prisma.salesSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        } catch (salesError) {
            console.error("Error fetching sales summary:", salesError);
            salesSummary = [];
        }

        let purchaseSummary: PurchaseSummary[] = [];
        try {
            purchaseSummary = await prisma.purchaseSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        } catch (purchaseError) {
            console.error("Error fetching purchase summary:", purchaseError);
            purchaseSummary = [];
        }

        let expenseSummary: ExpenseSummary[] = [];
        try {
            expenseSummary = await prisma.expenseSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        } catch (expenseError) {
            console.error("Error fetching expense summary:", expenseError);
            expenseSummary = [];
        }

        let expenseByCategorySummary: (Omit<ExpenseByCategory, 'amount'> & { amount: string })[] = [];
        try {
            const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
            expenseByCategorySummary = expenseByCategorySummaryRaw.map((item) => ({
                ...item,
                amount: item.amount.toString(),
            }));
        } catch (categoryError) {
            console.error("Error fetching expense categories:", categoryError);
            expenseByCategorySummary = [];
        }

        // Use helper function to convert BigInts
        const response = handleBigIntConversion({
            latestBlocksAdded,
            blocksAddedEver,
            popularProducts,
            salesSummary,
            purchaseSummary,
            expenseSummary,
            expenseByCategorySummary,
        });

        // Send the response with all data
        res.json(response);
        
    } catch (error) {
        console.error("General error in getDashboardMetrics:", error);
        res.status(500).json({ 
            message: "Error retrieving dashboard metrics",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};