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
import { AlertCircle, Loader } from "lucide-react";
import React from "react";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  transportationId,
  input,
  setInput,
  isLoading,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  transportationId: any;
  isLoading: boolean;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {transportationId ? "Edit Transportation" : "Create Transportation"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="w-full h-[210px] flex justify-center items-center">
            <Loader className="size-6 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={!transportationId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Transportation name..."
                  value={input.name}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="w-full flex items-center gap-2 rounded px-5 py-2.5 bg-sky-200/80 border border-sky-400 text-sm">
                <AlertCircle className="size-4" />
                <p>
                  The unit of measurement used is{" "}
                  <span className="font-semibold">meters</span>
                </p>
              </div>
              <div className="w-full grid-cols-3 gap-4 grid">
                <div className="flex flex-col gap-1 w-full">
                  <Label>Length</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="0"
                    value={input.length}
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        length: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Width</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="0"
                    value={input.width}
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        width: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Label>Height</Label>
                  <Input
                    className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                    placeholder="0"
                    value={input.height}
                    // disabled={loadingSubmit}
                    onChange={(e) =>
                      setInput((prev: any) => ({
                        ...prev,
                        height: e.target.value.startsWith("0")
                          ? e.target.value.replace(/^0+/, "")
                          : e.target.value,
                      }))
                    }
                  />
                </div>
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
                  transportationId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={
                  !input.name ||
                  parseFloat(input.length) < 1 ||
                  parseFloat(input.width) < 1 ||
                  parseFloat(input.height) < 1
                }
              >
                {transportationId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
