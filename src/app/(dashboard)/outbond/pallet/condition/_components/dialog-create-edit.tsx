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
import { Loader2 } from "lucide-react";
import React from "react";
import slug from "slug";

const DialogCreateEdit = ({
  open,
  onCloseModal,
  conditionId,
  isLoading,
  input,
  setInput,
  handleClose,
  handleCreate,
  handleUpdate,
}: {
  open: boolean;
  onCloseModal: () => void;
  conditionId: any;
  isLoading: boolean;
  input: any;
  setInput: any;
  handleClose: () => void;
  handleCreate: any;
  handleUpdate: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {conditionId ? "Edit Condition" : "Create Condition"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="w-full h-[210px] flex justify-center items-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={!conditionId ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Name</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Condition name..."
                  value={input.name}
                  // disabled={loadingSubmit}
                  onChange={(e) =>
                    setInput((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                      slug: slug(e.target.value, "-"),
                    }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Label>Slug</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="condition-slug"
                  value={input.slug}
                  disabled
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
                  conditionId
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={!input.name || !input.slug}
              >
                {conditionId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateEdit;
