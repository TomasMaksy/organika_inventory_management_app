export type BlockFormData = {
    blockTypeId: number;
    height: number;
    width: number;
    length: number;
    arrivalDate: Date; // Use Date type consistently
    removalDate?: Date;
    processed: boolean;
    quantity: number;
    supplierId: number;
  };