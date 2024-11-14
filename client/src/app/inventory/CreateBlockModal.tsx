import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import HeightIcon from "@mui/icons-material/Height";
import {
  useGetBlockTypesQuery,
  useCreateBlocksMutation,
  useGetSuppliersQuery,
} from "@/state/api";
import { BlockFormData } from "./types";

type CreateBlockModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: BlockFormData) => void;
};

const CreateBlockModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateBlockModalProps) => {
  const [formData, setFormData] = useState<BlockFormData>({
    blockTypeId: 0,
    height: 1600,
    width: 0,
    length: 2000,
    arrivalDate: new Date(),
    removalDate: undefined,
    processed: false,
    quantity: 1,
    supplierId: 0, // Ensure this starts at 0 or null
  });

  useEffect(() => {
    // Reset supplierId to null when modal opens
    if (isOpen) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        supplierId: 0, // Reset supplierId to 'none' on modal open
      }));
    }
  }, [isOpen]); // Only reset when modal visibility changes

  const [createBlocks, { isLoading: isCreating }] = useCreateBlocksMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "height" ||
        name === "width" ||
        name === "length" ||
        name === "quantity"
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate dimensions
    if (formData.height <= 0 || formData.width <= 0 || formData.length <= 0) {
      alert("Dimensions must be greater than 0");
      return; // Prevent form submission
    }
    // Validate blockTypeId (must be a positive integer)
    if (!Number.isInteger(formData.blockTypeId) || formData.blockTypeId <= 0) {
      alert("Please select a valid Block Type");
      return; // Prevent form submission
    }

    // Get current date as arrivalDate
    const currentDate = new Date();

    // Create the BlockFormData object
    const blockData: BlockFormData = {
      blockTypeId: formData.blockTypeId,
      height: formData.height,
      width: formData.width,
      length: formData.length,
      arrivalDate: currentDate,
      processed: false,
      quantity: formData.quantity,
      supplierId: formData.supplierId,
    };

    // Call onCreate with the BlockFormData object
    try {
      await onCreate(blockData); // Pass the created object
      onClose();
    } catch (error) {
      alert("Error creating blocks. Please try again.");
      console.error("Error creating blocks:", error); // Log the error for debugging
    }
  };

  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Toggle for dropdown visibility
  const { data: blockTypes, error, isLoading } = useGetBlockTypesQuery();
  const {
    data: suppliers,
    error: suppliersError,
    isLoading: suppliersLoading,
  } = useGetSuppliersQuery();

  // Filter options based on search query
  const filteredBlockTypes = blockTypes?.filter((blockType) =>
    blockType.blockName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Updates form data and closes the dropdown when an option is selected
  const handleSelectBlockType = (blockTypeId: number, blockName: string) => {
    setFormData({ ...formData, blockTypeId });
    setSearchQuery(blockName); // Set input to selected block name
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true); // Show dropdown when user types
  };

  const handleSupplierChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, supplierId: parseInt(e.target.value) });
  };

  if (!isOpen) return null;

  const selectCssStyles =
    "block w-full mb-4 p-2 border-gray-500 border-2 rounded-md";
  const labelCssStyles =
    "block text-sm font-medium text-gray-700 rounded-md mb-1 mt-3";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Add a New Block" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* SUPPLIERS DROPDOWN */}
          <label htmlFor="suppliers">Supplier</label>
          {suppliersLoading ? (
            <div>Loading suppliers...</div>
          ) : suppliersError ? (
            <div>Error loading suppliers. Please try again.</div>
          ) : (
            <select
              id="suppliers"
              value={formData.supplierId || ""} // Ensures the dropdown starts with no selection
              onChange={handleSupplierChange}
              className={selectCssStyles}
              name="supplierId" // Use supplierId for form submission name
            >
              <option value="" disabled>
                Select a supplier
              </option>
              {suppliers?.map((supplier) => (
                <option key={supplier.supplierId} value={supplier.supplierId}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          )}

          {/* Block Type Search and Dropdown */}
          <label htmlFor="blockTypeSearch">Block Type</label>
          <input
            id="blockTypeSearch"
            type="text"
            placeholder="Type to search..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsDropdownOpen(true)}
            className={inputCssStyles}
          />

          {/* Autocomplete Dropdown */}
          {isDropdownOpen &&
            filteredBlockTypes &&
            filteredBlockTypes.length > 0 && (
              <div className="border border-gray-500 rounded-md shadow-md max-h-40 overflow-y-auto">
                {filteredBlockTypes.map((blockType) => (
                  <div
                    key={blockType.blockTypeId}
                    onClick={() =>
                      handleSelectBlockType(
                        blockType.blockTypeId,
                        blockType.blockName
                      )
                    }
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {blockType.blockName}
                  </div>
                ))}
              </div>
            )}

          {/* BLOCK DIMENSIONS */}
          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-col justify-start">
              <label htmlFor="blockWidth" className={labelCssStyles}>
                Width{" "}
                <HeightIcon
                  fontSize="small"
                  style={{ transform: "rotate(90deg)" }}
                />
              </label>
              <div className="flex flex-row items-end">
                <input
                  type="number"
                  name="width"
                  placeholder="Width"
                  onChange={handleChange}
                  value={formData.width ?? ""}
                  className={inputCssStyles}
                  required
                />
                <label className="mb-4 ml-0.5">mm</label>
              </div>
            </div>

            <div className="flex flex-col justify-start">
              <label htmlFor="blockHeight" className={labelCssStyles}>
                Height <HeightIcon fontSize="small" />
              </label>
              <div className="flex flex-row items-end">
                <input
                  type="number"
                  name="height"
                  onChange={handleChange}
                  value={formData.height ?? ""}
                  placeholder="Height"
                  className={inputCssStyles}
                  required
                />
                <label className="mb-4 ml-0.5">mm</label>
              </div>
            </div>

            <div className="flex flex-col justify-start">
              <label htmlFor="blockLength" className={labelCssStyles}>
                Length
              </label>
              <div className="flex flex-row items-end">
                <input
                  type="number"
                  name="length"
                  placeholder="Length"
                  onChange={handleChange}
                  value={formData.length ?? ""}
                  className={inputCssStyles}
                  required
                />
                <label className="mb-4 ml-0.5">mm</label>
              </div>
            </div>
          </div>

          <button
            className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-md"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Block"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlockModal;
