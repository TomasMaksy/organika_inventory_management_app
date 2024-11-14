"use client";

import {
  useGetSuppliersPlusQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from "@/state/api";
import {
  Cuboid,
  EllipsisVertical,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import debounce from "lodash.debounce";
import CreateSupplierModal from "./CreateSuppliersModal";
import { SupplierFormData } from "./types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

function Supplier() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<SupplierFormData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [supplierIdToDelete, setSupplierIdToDelete] = useState<number | null>(
    null
  );

  const handleSearchTermChange = debounce((value: string) => {
    setDebouncedSearchTerm(value);
  }, 300);

  const {
    data: suppliers,
    isLoading,
    isError,
  } = useGetSuppliersPlusQuery(debouncedSearchTerm);

  const [createSupplier] = useCreateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();

  useEffect(() => {
    handleSearchTermChange(searchTerm);
  }, [searchTerm, handleSearchTermChange]);

  const handleCreateSupplier = async (formData: SupplierFormData) => {
    try {
      await createSupplier({
        supplierName: formData.supplierName,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create block type:", error);
    }
  };

  const handleEditSupplier = (supplierId: number) => {
    if (suppliers) {
      // Check if suppliers is defined
      const supplier = suppliers.find((s) => s.supplierId === supplierId); // Use s.supplierId instead of searchTerm.supplierId
      if (supplier) {
        setInitialFormData({
          supplierName: supplier.supplierName,
        });
        setSelectedSupplier(supplierId);
        setIsEditing(true);
        setIsModalOpen(true);
      }
    } else {
      console.error("suppliers is undefined");
    }
  };

  const handleUpdateSupplier = async (
    supplierId: number,
    formData: SupplierFormData
  ) => {
    try {
      const updatedData = {
        supplierName: formData.supplierName,
      };
      console.log(formData);
      await updateSupplier({ supplierId, updatedData }).unwrap();
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update block type:", error);
    }
  };

  const handleDeleteSupplier = async () => {
    if (supplierIdToDelete === null) return;

    try {
      await deleteSupplier({ supplierId: supplierIdToDelete }).unwrap();
      setIsDialogOpen(false);
      setSupplierIdToDelete(null);
    } catch (error) {
      console.error("Failed to delete block type:", error);
    }
  };

  const toggleDropdown = (supplierId: number) => {
    setIsDropdownOpen(isDropdownOpen === supplierId ? null : supplierId);
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !suppliers) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch block types
      </div>
    );
  }

  return (
    <div className="mx-auto pb w-full">
      <div className="flex justify-between items-center mb-6">
        <Header name="Block Types" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded-xl"
          onClick={() => {
            setSelectedSupplier(null); // Clear any selected block ID
            setIsEditing(false); // Ensure it’s in creation mode
            setIsModalOpen(true); // Open the modal
          }}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create a
          Block Type
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search block types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {suppliers.length === 0 ? (
          <div className="text-center py-4">No block types found</div>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.supplierId}
              className="border shadow rounded-md max-w-full w-full mx-auto transform transition-transform duration-300 hover:scale-105"
            >
              <div className="flex flex-row justify-between p-6 items-center">
                <div className="flex flex-row items-center p-4">
                  <Cuboid className="mr-4" />
                  <div className="flex flex-col">
                    <h3 className="text-2xl text-gray-900 font-semibold">
                      {supplier.supplierName}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-start mr-2">
                  {/* <div className="flex flex-col justify-between items-end mr-2">
                    <p className="font-bold text-blue-300 text-sm">
                      Density: {supplier.density} kg/m³
                    </p>
                    <p className="font-bold text-blue-300 text-sm">Color:</p>
                  </div> */}
                  <div className="mt-2 ml-2 align-top">
                    <EllipsisVertical
                      className="w-6 h-6 cursor-pointer"
                      onClick={() => toggleDropdown(supplier.supplierId)}
                    />
                  </div>
                </div>
                {isDropdownOpen === supplier.supplierId && (
                  <div className="absolute right-0 mt-2 mr-16 bg-white shadow-lg rounded-lg w-48">
                    <button
                      className="w-full text-left px-4 py-2 text-blue-500 font-semibold hover:bg-blue-100"
                      onClick={() => {
                        handleEditSupplier(supplier.supplierId);
                        setIsDropdownOpen(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 font-semibold ${
                        supplier.totalBlocks > 0
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-red-500 hover:bg-red-100"
                      }`}
                      onClick={() => {
                        if (supplier.totalBlocks > 0) return;
                        setSupplierIdToDelete(supplier.supplierId);
                        setIsDialogOpen(true);
                        setIsDropdownOpen(null);
                      }}
                      disabled={supplier.totalBlocks > 0}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <hr />
              <div className="flex overflow-x-auto p-4 ml-2 mr-2 gap-2">
                <button className="border border-blue-500 hover:bg-blue-100 text-blue-500 text-md font-semibold py-1 px-3 rounded-2xl whitespace-nowrap">
                  Total blocks: {supplier.totalBlocks}
                </button>
                {Object.entries(supplier.blocksByBlockType).map(
                  ([supplier, count]) => (
                    <button
                      key={supplier}
                      className="bg-blue-500 hover:bg-blue-700 text-white text-md font-semibold py-1 px-3 rounded-2xl whitespace-nowrap"
                    >
                      {supplier}: {Number(count)}
                    </button>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CreateSupplierModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setInitialFormData(null);
        }}
        onCreate={handleCreateSupplier}
        onUpdate={handleUpdateSupplier}
        supplierId={selectedSupplier ?? undefined}
        initialFormData={initialFormData ?? undefined}
      />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Delete Block Type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this block type? This action cannot
            be undone.
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
            onClick={handleDeleteSupplier}
            color="primary"
            variant="contained"
            sx={{
              color: "white",
              backgroundColor: "#ef4444",
              "&:hover": {
                opacity: 1,
                backgroundColor: "#dc2626",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Supplier;
