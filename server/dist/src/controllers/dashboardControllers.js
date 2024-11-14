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
exports.getDashboardMetrics = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Helper function to handle BigInt conversion to string for JSON serialization
const handleBigIntConversion = (data) => {
    return JSON.parse(JSON.stringify(data, (key, value) => typeof value === "bigint" ? value.toString() : value));
};
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // LATEST BLOCKS ADDED - CALCULATING THE TOTAL VOLUME OF UNPROCESSED BLOCKS
        let latestBlocksAdded = [];
        try {
            latestBlocksAdded = yield prisma.blocks.findMany({
                take: 10,
                orderBy: {
                    arrivalDate: "desc",
                },
                include: {
                    blockType: true,
                },
            });
            console.log("Blocks fetched successfully:", latestBlocksAdded.length);
        }
        catch (blockError) {
            console.error("Error fetching blocks:", blockError);
            latestBlocksAdded = [];
        }
        // STORAGE SPACE - FETCHING BLOCKS ADDED EVER, AND REMOVED (PROCESSED) IN THE LAST 7 DAYS
        let blocksAddedEver = [];
        const currentDate = new Date();
        // Calculate the date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(currentDate.getDate() - 7);
        try {
            blocksAddedEver = yield prisma.blocks.findMany({
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
        }
        catch (blockError) {
            console.error("Error fetching blocks:", blockError);
            blocksAddedEver = [];
        }
        // ________________________________________________________________//
        // Old ones
        let popularProducts = [];
        try {
            popularProducts = yield prisma.products.findMany({
                take: 15,
                orderBy: {
                    stockQuantity: "desc",
                },
            });
        }
        catch (productsError) {
            console.error("Error fetching products:", productsError);
            popularProducts = [];
        }
        let salesSummary = [];
        try {
            salesSummary = yield prisma.salesSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        }
        catch (salesError) {
            console.error("Error fetching sales summary:", salesError);
            salesSummary = [];
        }
        let purchaseSummary = [];
        try {
            purchaseSummary = yield prisma.purchaseSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        }
        catch (purchaseError) {
            console.error("Error fetching purchase summary:", purchaseError);
            purchaseSummary = [];
        }
        let expenseSummary = [];
        try {
            expenseSummary = yield prisma.expenseSummary.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
        }
        catch (expenseError) {
            console.error("Error fetching expense summary:", expenseError);
            expenseSummary = [];
        }
        let expenseByCategorySummary = [];
        try {
            const expenseByCategorySummaryRaw = yield prisma.expenseByCategory.findMany({
                take: 5,
                orderBy: {
                    date: "desc",
                },
            });
            expenseByCategorySummary = expenseByCategorySummaryRaw.map((item) => (Object.assign(Object.assign({}, item), { amount: item.amount.toString() })));
        }
        catch (categoryError) {
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
    }
    catch (error) {
        console.error("General error in getDashboardMetrics:", error);
        res.status(500).json({
            message: "Error retrieving dashboard metrics",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
