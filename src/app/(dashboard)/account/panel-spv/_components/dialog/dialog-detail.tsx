"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  X,
  Users2,
  Loader,
  Barcode,
  RefreshCw,
  ScanBarcodeIcon,
} from "lucide-react";
import React, { useMemo } from "react";
import { columnListDetail } from "../columns";

export const DialogDetail = ({
  open,
  onCloseModal,
  dataFormat,
}: {
  open: boolean;
  onCloseModal: () => void;
  dataFormat: any;
}) => {
  const { data, refetch, isLoading, isRefetching } = dataFormat;

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Format Barcode
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onCloseModal()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        {isLoading ? (
          <div className="w-full h-[78vh] flex justify-center items-center">
            <Loader className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-5 mt-5">
            <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
              <div className="flex w-full border-sky-400/80 rounded-md overflow-hidden border p-4 flex-col">
                <div className="w-full flex items-center">
                  <div className="flex items-center w-full">
                    <div className="flex w-full items-end gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100">
                        <Barcode className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs">Format</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataDetail?.format}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-12"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100">
                        <Users2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs">Total User</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataDetail?.total_user.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-12"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100">
                        <ScanBarcodeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs">Total Scan</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataDetail?.total_scan.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-12"
                  />
                  <div className="flex items-center gap-4 ml-4">
                    <TooltipProviderPage value={"Reload Data"}>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          refetch();
                        }}
                        className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                        variant={"outline"}
                      >
                        <RefreshCw
                          className={cn(
                            "w-4 h-4",
                            isRefetching ? "animate-spin" : ""
                          )}
                        />
                      </Button>
                    </TooltipProviderPage>
                  </div>
                </div>
              </div>
            </div>
            <DataTable
              maxHeight="h-[60vh]"
              isSticky
              isLoading={isRefetching}
              columns={columnListDetail}
              data={dataDetail?.users ?? []}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
