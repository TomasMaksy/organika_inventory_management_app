import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import { SupplierFormData } from "./types";

type CreateBlockTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: SupplierFormData) => void;
  onUpdate: (supplierId: number, formData: SupplierFormData) => void;
  supplierId?: number; // This is optional; undefined means create
  initialFormData?: SupplierFormData;
};

const CreateSupplierModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  supplierId,
  initialFormData,
}: CreateBlockTypeModalProps) => {
  // Initialize form data to empty fields if creating, or with initial data if editing
  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData); // Pre-fill form with existing data if editing
    } else {
      setFormData({
        supplierName: "",
      });
    }
  }, [initialFormData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update specific field in formData
    setErrorMessage(null); // Reset error message on change
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.supplierName) {
      setErrorMessage("Please enter the suppliers name.");
      return;
    }

    if (supplierId !== undefined) {
      // If blockTypeId exists, it's an update
      await onUpdate(supplierId, { ...formData });
    } else {
      // If blockTypeId is undefined, it's a creation
      await onCreate({ ...formData });
    }

    setFormData({ supplierName: "" }); // Reset form data
    onClose(); // Close modal after operation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header
          name={supplierId ? "Edit a Supplier" : "Create a new Supplier"}
        />
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="supplierName"
            className="block text-sm font-medium text-gray-700"
          >
            Suppliers Name
          </label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            placeholder="Suppliers Name"
          />
          {/* <label
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
          /> */}
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {supplierId ? "Update" : "Create"}
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

export default CreateSupplierModal;
