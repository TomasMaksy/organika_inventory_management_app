"use client";

import { useState } from "react";
import {
  useCreateBlocksMutation,
  useGetBlocksQuery,
  useProcessBlocksMutation,
  useRemoveBlocksMutation,
} from "@/state/api";
import Header from "@/app/(components)/Header";
import {
  DataGrid,
  GridActionsCellItem,
  GridCheckIcon,
  GridCloseIcon,
  GridColDef,
  GridFilterModel,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

//Icon Imports
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ClearIcon from "@mui/icons-material/Clear";
import CreateBlockModal from "./CreateBlockModal";
import { BlockFormData } from "./types";
import { NewBlocks } from "@/state/api";
import { PlusCircleIcon } from "lucide-react";

const Inventory = () => {
  const { data: blocks } = useGetBlocksQuery();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [processBlocks] = useProcessBlocksMutation();
  const [removeBlocks] = useRemoveBlocksMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createBlock] = useCreateBlocksMutation();

  // State for confirmation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [blockIdsToDelete, setBlockIdsToDelete] = useState<string[]>([]);

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [
      {
        field: "processed",
        operator: "is",
        value: "false",
      },
    ],
  });

  const handleCreateBlock = (formData: BlockFormData) => {
    // Create an array of NewBlocks based on formData.quantity
    const blocksToCreate: NewBlocks[] = [];
    for (let i = 0; i < formData.quantity; i++) {
      blocksToCreate.push({
        blockTypeId: formData.blockTypeId,
        height: formData.height,
        width: formData.width,
        length: formData.length,
        arrivalDate: formData.arrivalDate,
        processed: formData.processed,
        supplierId: formData.supplierId,
      });
    }

    // Call the createBlock mutation with the array
    createBlock(blocksToCreate);
  };

  const openDeleteConfirmation = async (blockIds?: string[]) => {
    setBlockIdsToDelete(
      blockIds || selectedRows.map((id: any) => id.toString())
    );
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeBlocks({ blockIds: blockIdsToDelete });
      console.log("Blocks deleted successfully");
    } catch (error) {
      console.error("Error deleting blocks:", error);
    }
    setIsDialogOpen(false);
    setBlockIdsToDelete([]);
  };

  const handleSelectionChange = (newSelectionModel: any) => {
    setSelectedRows(newSelectionModel);
  };

  const handleProcessBlocks = async (blockIds?: string[]) => {
    try {
      const idsToProcess =
        blockIds || selectedRows.map((id: any) => id.toString());
      const currentDateTime = new Date().toISOString();
      const payload = {
        blockIds: idsToProcess,
        removalDate: currentDateTime,
      };
      console.log("Payload:", { payload });
      await processBlocks(payload);
      console.log("Blocks processed successfully");
    } catch (error) {
      console.error("Error processing blocks:", error);
    }
  };

  const columns: GridColDef[] = [
    // { field: "blockId", headerName: "ID", width: 50 },
    {
      field: "blockType",
      headerName: "Block Name",
      width: 90,
      type: "string",
      valueGetter: (value, row) => row.blockType.blockName,
      renderCell: (params) => (
        <div style={{ fontWeight: "bold", textDecorationThickness: 100 }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "suppliers",
      headerName: "Supplier",
      width: 100,
      type: "string",
      valueGetter: (value, row) => row.suppliers.supplierName,
    },
    {
      field: "length",
      headerName: "Length",
      width: 65,
      type: "number",
      renderCell: (params) => (
        <div style={{ opacity: 0.7 }}>{params.value}</div> // Reduce opacity here
      ),
    },
    {
      field: "height",
      headerName: "Height",
      width: 60,
      type: "number",
      renderCell: (params) => (
        <div style={{ opacity: 0.7 }}>{params.value}</div> // Reduce opacity here
      ),
    },
    {
      field: "width",
      headerName: "Width",
      width: 60,
      type: "number",
    },
    {
      field: "processed",
      headerName: "In Storage",
      width: 100,
      type: "boolean",
      headerAlign: "center",
      renderCell: (params) => {
        return params.value ? (
          <GridCloseIcon color="error" />
        ) : (
          <GridCheckIcon color="success" />
        );
      },
    },
    {
      field: "arrivalDate",
      headerName: "Arrived on",
      width: 150,
      type: "string",
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => {
        if (!params) return "";
        const date = new Date(params);
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
      },
    },
    {
      field: "removalDate",
      headerName: "Processed on",
      width: 150,
      type: "string",
      headerAlign: "center",
      valueGetter: (params) => {
        if (!params) return "";
        const date = new Date(params);
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(date);
      },
    },

    {
      field: "action",
      type: "actions",
      width: 10,
      getActions: (params) => [
        <GridActionsCellItem
          key={0}
          icon={<KeyboardReturnIcon />}
          label="Set to In Storage (dummy)"
          // onClick={""}
          showInMenu
        />,
        <GridActionsCellItem
          key={1}
          icon={<ClearIcon />}
          label="Remove from Storage"
          onClick={() => handleProcessBlocks([params.id.toString()])}
          showInMenu
        />,
        <GridActionsCellItem
          key={3}
          icon={<DeleteIcon />}
          label="Delete Block"
          onClick={() => openDeleteConfirmation([params.id.toString()])}
          showInMenu
        />,
      ],
    },
  ];

  const unprocessedBlocks = Array.isArray(blocks)
    ? blocks.filter((block) => block.processed !== true)
    : [];

  return (
    <div className="flex flex-col">
      <div className="flex justify-content align-items">
        <div className="flex justify-content align-items mb-2">
          <Header name="Inventory" />{" "}
        </div>
        <div className="flex flex-row ml-6 items-start">
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add New
            Block
          </button>
          {selectedRows.length > 0 && (
            <>
              <button
                onClick={() => handleProcessBlocks()}
                className="bg-gray-500 text-white px-4 py-2 rounded-md text-xs ml-4"
              >
                Mark as Processed
              </button>
              <button
                onClick={() => openDeleteConfirmation()}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-xs ml-4"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-150px)]">
        <DataGrid
          rows={unprocessedBlocks}
          columns={columns}
          getRowId={(row) => row.blockId}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={handleSelectionChange}
          filterModel={filterModel} // Pass filterModel to DataGrid
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
            },
          }}
          onFilterModelChange={(newFilterModel) =>
            setFilterModel(newFilterModel)
          }
          className="bg-white shadow rounded-lg border border-gray-200 mt-5 !text-gray-700"
          initialState={{
            sorting: {
              sortModel: [{ field: "arrivalDate", sort: "desc" }],
            },
          }}
          disableColumnMenu
          autoPageSize
        />
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this block? It will be permanently
            removed from the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            color="primary"
            sx={{
              color: "white",
              backgroundColor: "#3b82f6",
              "&:hover": {
                opacity: 1,
                backgroundColor: "#1d4ed8",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="primary"
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#6b7280",
              "&:hover": {
                opacity: 1,
                backgroundColor: "#374151",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* MODAL */}
      <CreateBlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateBlock}
      />
    </div>
  );
};

export default Inventory;
