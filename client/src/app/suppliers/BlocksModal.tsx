"use client";

import React, { useState } from "react";
import { useGetBlocksQuery } from "@/state/api";
import {
  DataGrid,
  GridCheckIcon,
  GridCloseIcon,
  GridColDef,
  GridFilterModel,
  GridToolbar,
} from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";

interface InventoryModalProps {
  supplierId: number;
  blockName?: string; // blockName is now optional
  onClose: () => void;
  isOpen: boolean;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
  supplierId,
  blockName = "",
  onClose,
  isOpen,
}) => {
  const { data: blocks } = useGetBlocksQuery();

  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [
      {
        field: "processed",
        operator: "is",
        value: "false",
      },
    ],
  });

  const columns: GridColDef[] = [
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
        <div style={{ opacity: 0.7 }}>{params.value}</div>
      ),
    },
    {
      field: "height",
      headerName: "Height",
      width: 60,
      type: "number",
      renderCell: (params) => (
        <div style={{ opacity: 0.7 }}>{params.value}</div>
      ),
    },
    {
      field: "width",
      headerName: "Width",
      width: 60,
      type: "number",
    },
    // {
    //   field: "processed",
    //   headerName: "In Storage",
    //   width: 100,
    //   type: "boolean",
    //   headerAlign: "center",
    //   renderCell: (params) => {
    //     return params.value ? (
    //       <GridCloseIcon color="error" />
    //     ) : (
    //       <GridCheckIcon color="success" />
    //     );
    //   },
    // },
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
  ];

  const relevantBlocks = Array.isArray(blocks)
    ? blocks.filter(
        (block) =>
          block.supplierId === supplierId &&
          block.processed === false &&
          (blockName === "" || block.blockType.blockName === blockName)
      )
    : [];

  if (!isOpen) {
    return null; // Don't render anything if the modal is closed
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-[90%] max-w-4xl p-5 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
        <h2 className="text-xl font-semibold mb-4">Inventory Blocks</h2>
        <div className="h-[calc(100vh-250px)]">
          <DataGrid
            rows={relevantBlocks}
            columns={columns}
            getRowId={(row) => row.blockId}
            checkboxSelection
            disableRowSelectionOnClick
            filterModel={filterModel}
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
      </div>
    </div>
  );
};

export default InventoryModal;
