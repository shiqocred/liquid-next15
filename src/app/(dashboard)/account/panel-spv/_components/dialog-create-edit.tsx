"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import React from "react";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  formatId,
  input,
  setInput,
  isLoading,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  formatId: any;
  input: any;
  setInput: any;
  isLoading: boolean;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {formatId ? "Edit Barcode" : "Create Barcode"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="h-[140px] flex items-center justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={!formatId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Format Barcode</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Format..."
                  value={input.format}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      format: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full gap-2">
              <Button
                className="w-full bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  formatId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={!input.format}
              >
                {formatId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
