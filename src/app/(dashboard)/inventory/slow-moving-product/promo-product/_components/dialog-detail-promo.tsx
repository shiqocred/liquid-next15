"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Percent, ScanBarcode, X } from "lucide-react";
import React from "react";

const DialogDetailPromo = ({
  open,
  onCloseModal,
  data,
  input,
  setInput,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  input: any;
  setInput: any;
  handleSubmit: any;
}) => {
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          onClose={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="justify-between flex items-center">
              Detail Promo
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
          <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
            <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-3">
              <ScanBarcode className="w-5 h-5 mr-2" />
              <div className="w-full flex justify-between items-center">
                Product Barcode:
                <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                  {data?.new_barcode_product}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3 flex-col my-4">
              <div className="flex flex-col w-full overflow-hidden gap-0.5">
                <p className="text-sm font-medium">Name Product</p>
                <p className="text-sm w-full whitespace-pre-wrap min-h-9 py-2 leading-relaxed flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                  {data?.new_name_product}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col w-1/3 overflow-hidden gap-0.5">
                  <p className="text-sm font-medium">Qty</p>
                  <p className="text-sm w-full whitespace-pre-wrap min-h-9 flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                    {parseFloat(
                      data?.new_quantity_product ?? "0"
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col w-2/3 overflow-hidden gap-0.5">
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm w-full whitespace-pre-wrap min-h-9 flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                    {formatRupiah(parseFloat(data?.old_price_product ?? "0"))}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex w-full flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Promo Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Promo name..."
                  value={input.name}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Discount</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  value={input.discount}
                  type="number"
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      discount: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
                <Percent className="size-4 absolute bottom-2 right-3" />
              </div>
              <div className="flex flex-col gap-1 w-full relative">
                <Label>Price After Promo</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  value={formatRupiah(
                    input.price -
                      (input.price / 100) * parseFloat(input.discount)
                  )}
                  disabled
                />
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={onCloseModal}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="text-black w-full bg-sky-400 hover:bg-sky-400/80"
                type="submit"
                disabled={!input.name}
              >
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogDetailPromo;
