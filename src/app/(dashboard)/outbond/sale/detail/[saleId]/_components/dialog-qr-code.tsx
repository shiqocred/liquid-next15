"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";

const DialogQrCode = ({
  open,
  onCloseModal,
}: {
  open: boolean;
  onCloseModal: () => void;
}) => {
  const qrCodeValue = process.env.NEXT_PUBLIC_QR_BULKY_WAITING_PAYMENT!;

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Use this QR code to make a payment
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center">
          <QRCode
            value={qrCodeValue}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <div className="flex w-full gap-2 mt-4">
          <Button
            className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
            onClick={onCloseModal}
            type="button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogQrCode;
