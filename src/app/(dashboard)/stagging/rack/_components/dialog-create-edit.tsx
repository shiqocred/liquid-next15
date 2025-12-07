"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PopoverWithTrigger from "@/app/(dashboard)/inventory/pallet/list/create/_components/popover-with-trigger";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DialogCreateEdit = ({
  open,
  onOpenChange,
  rackId,
  input,
  setInput,
  handleCreate,
  handleUpdate,
  isPendingCreate,
  isPendingUpdate,
  categories,
}: {
  open: boolean;
  onOpenChange: () => void;
  rackId: any;
  input: any;
  setInput: any;
  handleCreate: any;
  handleUpdate: any;
  isPendingCreate: boolean;
  isPendingUpdate: boolean;
  categories?: any;
}) => {
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rackId ? "Edit Rack" : "Create Rack"}</DialogTitle>
        </DialogHeader>
        <div className="flex w-full gap-4">
          <form
            onSubmit={!rackId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Category</Label>
                <PopoverWithTrigger
                  open={isOpenCategory}
                  setIsOpen={setIsOpenCategory}
                  data={categories ?? []}
                  dataId={input?.category?.id ?? input?.categoryId}
                  // trigger={
                  //   input?.category?.name_category
                  //     ? input.category.name_category
                  //     : "Select Category..."
                  // }
                  trigger={
                    input && typeof input === "object"
                      ? input.name?.trim()
                        ? input.name
                        : input.category?.name_category?.trim()
                        ? input.category.name_category
                        : "Select Category..."
                      : "Select Category..."
                  }
                  onSelect={(item: any) => {
                    setInput({
                      categoryId: String(item.id ?? ""),
                      name: item.name_category ?? "",
                      source: input.source ?? "staging",
                      category: {
                        id: item.id ?? "",
                        name_category: item.name_category ?? "",
                      },
                    });
                    setIsOpenCategory(false);
                  }}
                  itemSelect={(item: any) => (
                    <div className="w-full font-medium">
                      {item.name_category}
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={() => onOpenChange()}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  rackId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  isPendingCreate || isPendingUpdate || !input?.categoryId
                }
              >
                {rackId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
