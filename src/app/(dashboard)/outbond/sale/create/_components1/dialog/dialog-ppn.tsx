"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah, numericString } from "@/lib/utils";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

export const DialogPPN = ({
  open,
  onCloseModal,
  setInputData,
  inputData,
  isDirty,
  setIsDirty,
}: {
  open: boolean;
  onCloseModal: () => void;
  setInputData: Dispatch<SetStateAction<any>>;
  inputData: any;
  isDirty: boolean;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
}) => {
  const [input, setInput] = useState("0");

  useEffect(() => {
    if (isNaN(parseFloat(input))) {
      setInput("0");
    }
  }, [input]);

  useEffect(() => {
    if (!open) {
      setInput("0");
    }
    if (open && inputData.voucher) {
      setInput(inputData.voucher);
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configuration PPN</DialogTitle>
            <DialogDescription>
              Configuration PPN to sale price
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setInputData((prev: any) => ({ ...prev, voucher: input }));
              onCloseModal();
              if (!isDirty) {
                setIsDirty(true);
              }
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Voucher</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input}
                type="number"
                onChange={(e) => setInput(numericString(e.target.value))}
              />
              <p className="absolute right-3 bottom-2 text-xs text-gray-500">
                {formatRupiah(parseFloat(input))}
              </p>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <Label>Price After Voucher</Label>
              <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
                {formatRupiah(parseFloat(inputData.price) - parseFloat(input))}
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
                className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
                type="submit"
              >
                Apply
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
