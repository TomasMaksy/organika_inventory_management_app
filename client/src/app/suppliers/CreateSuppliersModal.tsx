import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import { SupplierFormData } from "./types";

type CreateSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: SupplierFormData) => void;
  onUpdate: (supplierId: number, formData: SupplierFormData) => void;
  supplierId?: number; // Optional for update scenario
  initialFormData?: SupplierFormData;
  isEditing: boolean; // Determines if we are editing or creating
};

const CreateSupplierModal = ({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  supplierId,
  initialFormData,
  isEditing,
}: CreateSupplierModalProps) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialFormData) {
        setFormData(initialFormData); // Set initial data if editing
      } else {
        setFormData({ supplierName: "" }); // Clear form data if creating
      }
    }
  }, [isOpen, isEditing, initialFormData]); // Add isOpen to trigger reset on modal open

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage(null); // Reset error message on input change
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.supplierName) {
      setErrorMessage("Please enter the supplier's name.");
      return;
    }

    if (supplierId !== undefined) {
      await onUpdate(supplierId, { ...formData });
    } else {
      await onCreate({ ...formData });
    }

    setFormData({ supplierName: "" }); // Reset after submission
    onClose(); // Close modal after operation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header
          name={isEditing ? "Edit a Supplier" : "Create a new Supplier"}
        />
        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="supplierName"
            className="block text-sm font-medium text-gray-700"
          >
            Supplier's Name
          </label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName}
            onChange={handleChange}
            className="block w-full mb-2 p-2 border-gray-500 border-2 rounded-md"
            placeholder="Supplier's Name"
          />
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {isEditing ? "Update" : "Create"}
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
