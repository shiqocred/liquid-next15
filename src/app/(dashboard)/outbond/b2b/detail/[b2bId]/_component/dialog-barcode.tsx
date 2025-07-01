"use client";

import OnlyBarcodePrinted from "@/components/barcode-print";
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
  barcode,
  handleCancel,
}: {
  open: boolean;
  onCloseModal: () => void;
  barcode: any;
  handleCancel: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle>Barcode Printered</DialogTitle>
        </DialogHeader>
        <OnlyBarcodePrinted
          barcode={barcode ?? ""}
          cancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogBarcode;
