"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { X } from "lucide-react";
import React from "react";

const DialogPDF = ({
  open,
  onCloseModal,
  file,
}: {
  open: boolean;
  onCloseModal: () => void;
  file: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        className="max-w-xl p-4"
        onClose={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            PDF File
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onCloseModal()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
        </DialogHeader>
        <div className="rounded overflow-hidden w-full relative h-[70vh]">
          <iframe
            className="w-full h-full block"
            src={`https://docs.google.com/gview?embedded=true&url=${
              file ? encodeURIComponent(file) : ""
            }`}
            title="PDF"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPDF;
