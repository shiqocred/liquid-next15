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

import { cn } from "@/lib/utils";

import { Loader } from "lucide-react";
import React, { FormEvent, useEffect, useMemo, useState } from "react";

import { useUpdateFormatBarcode } from "../../_api/mutation/use-update-format-barcode";
import { useCreateFormatBarcode } from "../../_api/mutation/use-create-format-barcode";

export const DialogCreateEdit = ({
  open,
  onCloseModal,
  dataFormat,
}: {
  open: boolean;
  onCloseModal: () => void;
  dataFormat: any;
}) => {
  const initialValue = {
    format: "",
    totalScan: "",
    totalUser: "",
  };
  // data form create edit
  const [input, setInput] = useState(initialValue);

  const dataDetail: any = useMemo(() => {
    return dataFormat.data?.data.data.resource;
  }, [dataFormat]);

  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateFormatBarcode();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateFormatBarcode();

  const isLoading = isPendingUpdate || isPendingCreate;

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();

    const body = {
      format: input.format,
    };

    mutateCreate(
      { body },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();

    const body = {
      format: input.format,
      total_scan: dataDetail.totalScan,
      total_user: dataDetail.totalUser,
    };

    mutateUpdate(
      { body, params: { id: dataDetail.id } },
      {
        onSuccess: () => {
          onCloseModal();
        },
      }
    );
  };

  useEffect(() => {
    if (open) {
      setInput((prev) => ({ ...prev, format: dataDetail?.format ?? "" }));
    } else {
      setInput(initialValue);
    }
  }, [open, dataFormat]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {dataDetail ? "Edit Barcode" : "Create Barcode"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {isLoading ? (
          <div className="h-[140px] flex items-center justify-center">
            <Loader className="size-5 animate-spin" />
          </div>
        ) : (
          <form
            onSubmit={!dataDetail ? handleCreate : handleUpdate}
            className="w-full flex flex-col gap-4"
          >
            <div className="border p-4 rounded border-sky-500 gap-4 flex flex-col">
              <div className="flex flex-col gap-1 w-full">
                <Label>Format Barcode</Label>
                <Input
                  className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                  placeholder="Format..."
                  value={input.format}
                  disabled={isLoading}
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
                onClick={onCloseModal}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className={cn(
                  "text-black w-full",
                  dataDetail
                    ? "bg-yellow-400 hover:bg-yellow-400/80"
                    : "bg-sky-400 hover:bg-sky-400/80"
                )}
                type="submit"
                disabled={!input.format}
              >
                {dataDetail ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
