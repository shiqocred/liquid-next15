"use client";

import BarcodePrinted from "@/components/barcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

const DialogBarcode = ({
  open,
  onCloseModal,
  oldPrice,
  newName,
  barcode,
  category,
  newPrice,
  handleCancel,
}: {
  open: boolean;
  onCloseModal: () => void;
  oldPrice: any;
  newName: any;
  barcode: any;
  category: any;
  newPrice: any;
  handleCancel: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Barcode Printered</DialogTitle>
        </DialogHeader>
        <BarcodePrinted
          oldPrice={oldPrice ?? "0"}
          description={newName ?? ""}
          barcode={barcode ?? ""}
          category={category ?? ""}
          newPrice={newPrice ?? "0"}
          cancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogBarcode;
