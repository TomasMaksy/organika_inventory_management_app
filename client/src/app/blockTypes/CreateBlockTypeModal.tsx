import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import { BlockTypeFormData } from "./types";

type CreateBlockTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: BlockTypeFormData) => void;
  onUpdate: (blockTypeId: number, formData: BlockTypeFormData) => void;
  blockTypeId?: number; // This is optional; undefined means create
  initialFormData?: BlockTypeFormData;
};

const CreateBlockTypeModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  blockTypeId,
  initialFormData,
}: CreateBlockTypeModalProps) => {
  // Initialize form data to empty fields if creating, or with initial data if editing
  const [formData, setFormData] = useState<BlockTypeFormData>({
    blockName: "",
    density: 0,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData); // Pre-fill form with existing data if editing
    } else {
      setFormData({
        blockName: "",
        density: 0,
      });
    }
  }, [initialFormData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "density" ? value : value });
    setErrorMessage(null); // Reset error message on change
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const densityValue = formData.density;
    if (!densityValue || densityValue <= 0) {
      setErrorMessage("Please enter a positive value for density.");
      return;
    }

    if (densityValue > 10000) {
      setErrorMessage("Density cannot be greater than 10000.");
      return;
    }

    if (!formData.blockName) {
      setErrorMessage("Please enter a block name.");
      return;
    }

    if (blockTypeId !== undefined) {
      // If blockTypeId exists, it's an update
      await onUpdate(blockTypeId, { ...formData, density: densityValue });
    } else {
      // If blockTypeId is undefined, it's a creation
      await onCreate({ ...formData, density: densityValue });
    }

    setFormData({ blockName: "", density: 0 }); // Reset form data
    onClose(); // Close modal after operation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name={blockTypeId ? "Edit Block Type" : "Create Block Type"} />
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="blockName"
            className="block text-sm font-medium text-gray-700"
          >
            Block Type Name
          </label>
          <input
            type="text"
            name="blockName"
            value={formData.blockName}
            onChange={handleChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            placeholder="Block Type Name"
          />
          <label
            htmlFor="density"
            className="block text-sm font-medium text-gray-700"
          >
            Density
          </label>
          <input
            type="number"
            name="density"
            value={formData.density || undefined} // Use undefined if density is null
            placeholder="Density"
            onChange={handleChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
          />
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {blockTypeId ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 bg-white text-blue-500 py-2 px-4 rounded hover:bg-blue-100 ml-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlockTypeModal;
