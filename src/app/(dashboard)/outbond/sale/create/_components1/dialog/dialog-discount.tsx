"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { cn, numericString } from "@/lib/utils";

import React, { useEffect, useState } from "react";
import { AlertCircle, Check, Percent } from "lucide-react";

const DialogDiscount = ({
  open,
  onCloseModal,
  data,
  setData,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  setData: any;
}) => {
  const [input, setInput] = useState({
    discount: "",
    discountFor: "",
  });

  useEffect(() => {
    if (open) {
      setInput(data);
    } else {
      setInput({ discount: "", discountFor: "" });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent onClose={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>Apply discount to product price</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setData((prev: any) => ({
              ...prev,
              ...input,
            }));
            onCloseModal();
          }}
          className="w-full flex flex-col gap-4"
        >
          <div className="w-full flex gap-2 items-center bg-yellow-300 rounded border border-yellow-500 text-sm p-3">
            <AlertCircle className="size-4 flex-none" />
            <p>
              The discount is applied before any products are on sale. If you
              want to change the discount, please clear the sale products first.
            </p>
          </div>
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Discount</Label>
            <Input
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
              placeholder="0"
              value={input.discount}
              onChange={(e) =>
                setInput((prev: any) => ({
                  ...prev,
                  discount: numericString(e.target.value),
                }))
              }
            />
            <Percent className="w-4 h-4 absolute right-3 bottom-2" />
          </div>
          <div
            className={cn(
              "flex flex-col gap-1 w-full",
              !input.discountFor && "opacity-50"
            )}
          >
            <Label>Discount for</Label>
            <div className="flex gap-2 w-full border p-2 border-sky-400/80 rounded-lg">
              <Button
                type="button"
                disabled={!input.discountFor}
                className={cn(
                  "w-full pr-6",
                  input.discountFor !== "old" && "bg-sky-200 hover:bg-sky-300"
                )}
                variant={"liquid"}
                onClick={() =>
                  setInput((prev: any) => ({ ...prev, discountFor: "old" }))
                }
              >
                <Check
                  className={cn(
                    "opacity-0",
                    input.discountFor === "old" && "opacity-100"
                  )}
                />
                Old Price
              </Button>
              <Button
                type="button"
                disabled={!input.discountFor}
                className={cn(
                  "w-full pr-6",
                  input.discountFor !== "new" && "bg-sky-200 hover:bg-sky-300"
                )}
                variant={"liquid"}
                onClick={() =>
                  setInput((prev: any) => ({ ...prev, discountFor: "new" }))
                }
              >
                <Check
                  className={cn(
                    "opacity-0",
                    input.discountFor === "new" && "opacity-100"
                  )}
                />
                New Price
              </Button>
            </div>
          </div>
          <div className="flex w-full gap-2">
            <Button
              type="submit"
              className="bg-sky-400 hover:bg-sky-400/80 text-black w-full"
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDiscount;
