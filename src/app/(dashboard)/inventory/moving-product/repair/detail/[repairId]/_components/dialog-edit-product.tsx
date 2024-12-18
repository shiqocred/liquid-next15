"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/lib/utils";
import { ChevronDown, Circle, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";

const DialogEditProduct = ({
  open,
  onCloseModal,
  input,
  setInput,
  isLoading,
  categories,
  handleSubmit,
}: {
  open: boolean;
  onCloseModal: () => void;
  input: any;
  setInput: any;
  isLoading: boolean;
  categories: any[];
  handleSubmit: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsOpen(false);
    }
  }, [open]);
  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent onClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex w-full h-[456px] items-center justify-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="w-full flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1 w-full">
                <Label>Barcode</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  disabled
                  value={input.barcode}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  value={input.name}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Qty</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  type="number"
                  value={input.qty}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      qty: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Price</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="0"
                  type="number"
                  value={input.total}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      total: e.target.value.startsWith("0")
                        ? e.target.value.replace(/^0+/, "")
                        : e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>{input.total < 100000 ? "Color" : "Category"}</Label>
                {input.total < 100000 ? (
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    disabled
                    value={input.color}
                  />
                ) : (
                  <PopoverPortal open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverPortalTrigger asChild>
                      <Button className="justify-between bg-transparent hover:bg-transparent border-0 border-b border-sky-400/80 text-black shadow-none rounded-none">
                        {input.category ? input.category : "Select Category"}
                        <ChevronDown className="size-4" />
                      </Button>
                    </PopoverPortalTrigger>
                    <PopoverPortalContent
                      style={{ width: "var(--radix-popover-trigger-width)" }}
                    >
                      <Command>
                        <CommandInput />
                        <CommandList className="p-1">
                          <CommandGroup heading="List Categories">
                            <CommandEmpty>No Data Found.</CommandEmpty>
                            {categories.map((item) => (
                              <CommandItem
                                key={item.id}
                                className="border border-gray-500 my-2 first:mt-0 last:mb-0 flex gap-2 items-center"
                                onSelect={() => {
                                  setInput((prev: any) => ({
                                    ...prev,
                                    category: item.name_category,
                                    custom: (
                                      parseFloat(prev.total) -
                                      (parseFloat(prev.total) / 100) *
                                        item.discount_category
                                    ).toString(),
                                  }));
                                  setIsOpen(false);
                                }}
                              >
                                <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                  {input.category === item.name_category && (
                                    <Circle className="fill-black size-2.5" />
                                  )}
                                </div>
                                <div className="w-full flex flex-col gap-1">
                                  <div className="w-full font-medium">
                                    {item.name_category}
                                  </div>
                                  <Separator className="bg-gray-500" />
                                  <p className="text-xs text-start w-full text-gray-500">
                                    {item.discount_category +
                                      "% - Max. " +
                                      (formatRupiah(
                                        Math.round(item.max_price_category)
                                      ) ?? "Rp 0")}
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverPortalContent>
                  </PopoverPortal>
                )}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>New Price</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  disabled
                  value={formatRupiah(input.custom)}
                />
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
                  className="bg-yellow-400 hover:bg-yellow-400/80 text-black w-full"
                  type="submit"
                >
                  Update
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DialogEditProduct;
