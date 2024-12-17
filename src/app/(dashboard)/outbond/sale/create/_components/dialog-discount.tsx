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
import { AlertCircle, Percent } from "lucide-react";
import React, { useEffect, useState } from "react";

const DialogDiscount = ({
  open,
  onCloseModal,
  discount,
  setDiscount,
}: {
  open: boolean;
  onCloseModal: () => void;
  discount: any;
  setDiscount: any;
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
    if (open && discount) {
      setInput(discount);
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Apply discount to product price
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDiscount((prev: any) => ({ ...prev, discount: input }));
              onCloseModal();
            }}
            className="w-full flex flex-col gap-4"
          >
            <div className="w-full flex gap-2 items-center bg-red-100 rounded border border-red-200 text-sm p-3">
              <AlertCircle className="size-4 flex-none" />
              <p>
                The discount is applied before any products are on sale. If you
                want to change the discount, please clear the sale products
                first.
              </p>
            </div>
            <div className="flex flex-col gap-1 w-full relative">
              <Label>Discount</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="0"
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value
                  )
                }
              />
              <Percent className="w-4 h-4 absolute right-3 bottom-2" />
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

export default DialogDiscount;
