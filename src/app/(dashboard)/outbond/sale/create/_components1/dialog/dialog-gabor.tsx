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

import { formatRupiah, numericString } from "@/lib/utils";

import { Percent } from "lucide-react";
import React, {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useGaborProduct } from "../../_api/use-gabor-product";

interface DialogGaborProps {
  open: boolean;
  onCloseModal: () => void;
  productDetail: any;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export const DialogGabor = ({
  open,
  onCloseModal,
  productDetail,
  setLoading,
}: DialogGaborProps) => {
  const [input, setInput] = useState("0");

  const { mutate, isPending } = useGaborProduct();

  const handleGabor = (e: FormEvent) => {
    e.preventDefault();
    mutate(
      { id: productDetail.id, body: { product_price_sale: input } },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };

  useEffect(() => {
    if (isNaN(parseFloat(input)) || !open) {
      setInput("0");
    }
    setLoading(isPending);
  }, [input, open, isPending]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent onClose={false} className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gabor Price Product Sale</DialogTitle>
          <DialogDescription>
            Apply discount to product sale price
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleGabor} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1 w-full relative">
            <Label>Gabor Price</Label>
            <Input
              className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
              placeholder="0"
              value={input}
              disabled={isPending}
              onChange={(e) => setInput(numericString(e.target.value))}
            />
            <Percent className="w-4 h-4 absolute right-3 bottom-2" />
          </div>
          <div className="flex flex-col gap-1 w-full">
            <Label>Price After Gabor</Label>
            <div className="text-sm font-bold border border-sky-500 rounded-md flex px-5 items-center justify-center h-9">
              {formatRupiah(
                parseFloat(productDetail.price) -
                  parseFloat(input) * (parseFloat(productDetail.price) / 100)
              )}
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
              disabled={isPending}
            >
              Apply
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
