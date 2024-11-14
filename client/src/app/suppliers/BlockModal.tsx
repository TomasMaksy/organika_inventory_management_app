import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Block } from "@/state/api"; // Ensure that you have the correct type definition for Block

type BlockModalProps = {
  open: boolean;
  onClose: () => void;
  blocks: Block[]; // Ensure blocks prop is coming correctly
  supplierName: string;
  blockType: string;
};

const BlockModal = ({
  open,
  onClose,
  blocks,
  supplierName,
  blockType,
}: BlockModalProps) => {
  const [rows, setRows] = useState<Block[]>(blocks);

  const columns: GridColDef[] = [
    { field: "blockType", headerName: "Block Name", width: 200 },
    { field: "width", headerName: "Width", width: 150 },
    { field: "height", headerName: "Height", width: 150 },
    { field: "length", headerName: "Length", width: 150 },
    { field: "arrivalDate", headerName: "Arrival Date", width: 180 },
    {
      field: "processed",
      headerName: "Processed",
      width: 150,
      type: "boolean",
    },
  ];

  useEffect(() => {
    if (open) {
      // Log to check blocks data
      console.log("Blocks data in BlockModal: ", blocks);
      setRows(blocks); // Set the fetched blocks to the rows
    }
  }, [open, blocks]); // Update rows whenever the modal is opened or blocks data changes

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Blocks for {supplierName} ({blockType})
      </DialogTitle>
      <DialogContent>
        {/* DataGrid component to display blocks */}
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockModal;
