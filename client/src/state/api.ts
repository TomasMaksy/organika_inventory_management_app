import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { get } from "http";

export interface User {
    userId: number;
    name: string;
    email: string;
    password: string;
}
export interface BlockType {
    blockTypeId: number;  // Integer field in Prisma, so use `number` in TypeScript
    blockName: string;    // String field in Prisma
    density: number;      // Integer field in Prisma, so use `number` in TypeScript
  }

export interface Block {
    blockId: string; // !!! Use string to match the Prisma model's BigInt field
    blockTypeId: number;  // Use number to represent the blockTypeId as an Int
    blockType: BlockType;  // Related BlockType 
    height: number;
    width: number;
    length: number;
    arrivalDate: Date;  // Date to match Prisma's DateTime field
    removalDate?: Date;  // Date to match Prisma's DateTime field
    processed: boolean;
    suppliers: Supplier;
    supplierId: number;
    supplierName: string;

}

export interface NewBlocks {
    blockTypeId: number;  // Use number to represent the blockTypeId as an Int
    height: number;
    width: number;
    length: number;
    arrivalDate: Date;  // Date to match Prisma's DateTime field
    removalDate?: Date;  // Date to match Prisma's DateTime field
    processed: boolean;
    supplierId: number;
}

export interface BlockTypes {
    blockTypeId: number;
    blockName: string;
    density: number;
    totalBlocks: number;
    blocksBySupplier: []
}

export interface NewBlockType {
    blockName: string;
    density: number;
}




export interface Product {
    productId: string;
    name: string;
    price: number;
    rating?: number,
    stockQuantity: number;
}

export interface NewProduct {
    name: string;
    price: number;
    rating?: number,
    stockQuantity: number;

}

export interface SalesSummary {
    salesSummaryId: string;
    totalValue: number;
    changePercentage?: number;
    date: string;
}

export interface PurchaseSummary {
    purchaseSummaryId: string;
    totalPurchased: number;
    changePercentage?: number;
    date: string;
  }

export interface ExpenseSummary {
    expenseSummaryId: string;
    totalExpenses: number;
    date: string;
}

export interface ExpenseByCategorySummary {
    expenseByCategorySummaryId: string;
    category: string;
    amount: string;
    date: string;
}

export interface DashboardMetrics {
    latestBlocksAdded: Block[];
    blocksAddedEver: Block[];
    popularProducts: Product[];
    salesSummary: SalesSummary[];
    purchaseSummary: PurchaseSummary[];
    expenseSummary: ExpenseSummary[];
    expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface BlockIdsPayload {
    blockIds: string[];  // Use string[] instead of bigint[]
    removalDate?: string;
}

export interface Supplier {
    supplierId: number;
    supplierName: string;
}

export interface SupplierPlus {
    supplierId: number;
    supplierName: string;
    totalBlocks: number;
    blocksByBlockType: Block[];
}
export interface NewSupplier {
    supplierName: string;
}   

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
    
    reducerPath: "api",
    tagTypes: ["DashboardMetrics", "Blocks", "Products", "Users", "Suppliers", "BlockTypes"],
    endpoints: (build) => ({
        getDashboardMetrics: build.query<DashboardMetrics, void>({
            query: () => "/dashboard",
            providesTags: ["DashboardMetrics"]

        }),
        getBlocks: build.query<Block[], string | void>({
            query: (search) => ({
                url: "/inventory",
                params: search? { search } : {}
            }), 
            providesTags: ["Blocks"],
        }),  
        // Mutation to process blocks
        processBlocks: build.mutation<void, BlockIdsPayload>({
            query: ({ blockIds, removalDate }) => ({
                url: "/inventory/process",
                method: "POST",
                body: { 
                    blockIds,
                    removalDate: removalDate ? new Date(removalDate).toISOString() : undefined
                }
            }),
            invalidatesTags: ["Blocks", "DashboardMetrics"]
        }),

        // Mutation to remove blocks
        removeBlocks: build.mutation<void, BlockIdsPayload>({
            query: ({ blockIds }) => ({
                url: "/inventory/remove",
                method: "DELETE",
                body: { blockIds }
            }),
            invalidatesTags: ["Blocks"]
        }),
        createBlocks: build.mutation<Block, NewBlocks[]>({
            query: (NewBlocksArray) => ({
                url: "/inventory",
                method: "POST",
                body: NewBlocksArray
            }),
            invalidatesTags: ["Blocks"]
        }),
        getBlockTypes: build.query<BlockTypes[], string | void>({
            query: (search) => ({
                url: "/blockTypes",
                params: search? { search } : {}
            }), 
            providesTags: ["BlockTypes"],
        }),  
        getSuppliers: build.query<Supplier[], string | void>({
            query: (search) => ({
                url: "/blocks/suppliers",
                params: search? { search } : {}
            }),
            providesTags: ["Suppliers"],
        }),
        createBlockType: build.mutation<BlockType, NewBlockType>({
            query: (newBlockType) => ({
              url: '/blockTypes',
              method: 'POST',
              body: newBlockType,
            }),
            invalidatesTags: ['BlockTypes'], // This will automatically refresh the list
        }),
        // Mutation to update a product
        updateBlockType: build.mutation<BlockType, { blockTypeId: number; updatedData: NewBlockType }>({
            query: ({ blockTypeId, updatedData }) => ({
                url: `/blockTypes/${blockTypeId}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["BlockTypes"],
        }),
        // Mutation to delete a product
        deleteBlockType: build.mutation<void, { blockTypeId: number }>({
            query: ({ blockTypeId }) => ({
                url: `/blockTypes/${blockTypeId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["BlockTypes"],
        }),

        // Mutation to update a product
        createSupplier: build.mutation<Supplier, NewSupplier>({
            query: (NewSupplier) => ({
              url: '/suppliers',
              method: 'POST',
              body: NewSupplier,
            }),
            invalidatesTags: ['BlockTypes'], // This will automatically refresh the list
        }),
        // Mutation to update a product
        updateSupplier: build.mutation<Supplier, { supplierId: number; updatedData: NewSupplier }>({
            query: ({ supplierId, updatedData }) => ({
                url: `/suppliers/${supplierId}`,
                method: "PUT",
                body: updatedData,
            }),
            invalidatesTags: ["Suppliers"],
        }),
        getSuppliersPlus: build.query<SupplierPlus[], string | void>({
            query: (search) => ({
                url: "/suppliers",
                params: search? { search } : {}
            }), 
            providesTags: ["Suppliers"],
        }),

        // Mutation to delete a product
        deleteSupplier: build.mutation<void, { supplierId: number }>({
            query: ({ supplierId }) => ({
                url: `/suppliers/${supplierId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Suppliers"],
        }),

        // New endpoint to get blocks related to specific suppliers
        getBlocksSuppliers: build.query<Block[], { supplierId: number; search?: string }>({
            query: ({ supplierId, search }) => ({
                url: `/suppliers/${supplierId}/blocks`,
                params: search ? { search } : {}
            }),
            providesTags: ["Blocks"]
        }),
        



        getProducts: build.query<Product[], string | void>({
            query: (search) => ({
                url: "/products",
                params: search? { search } : {}
            }), 
            providesTags: ["Products"],
        }),  
        createProduct: build.mutation<Product, NewProduct>({
            query: (NewProduct) => ({
                url: "/products",
                method: "POST",
                body: NewProduct
            }),
            invalidatesTags: ["Products"]
        }),
        getUsers: build.query<User[], void>({
            query: () => "/users",
            providesTags: ["Users"]
        }),
    }),
});

export const {
    useGetDashboardMetricsQuery, 
    useGetBlocksQuery,
    useProcessBlocksMutation,  // Hook for processing blocks
    useRemoveBlocksMutation,    // Hook for removing blocks
    useGetBlockTypesQuery,
    useGetSuppliersQuery,
    useCreateBlocksMutation,
    useCreateBlockTypeMutation,
    useUpdateBlockTypeMutation,
    useDeleteBlockTypeMutation,

    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
    useGetSuppliersPlusQuery,

    useGetBlocksSuppliersQuery,


    useGetProductsQuery, 
    useCreateProductMutation,
    useGetUsersQuery,
    
} = api;