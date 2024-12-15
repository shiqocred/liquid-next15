"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  Barcode,
  FileDown,
  Loader,
  Loader2,
  MapPinned,
  RefreshCw,
  X,
} from "lucide-react";
import React from "react";

const DialogDetail = ({
  open,
  onCloseModal,
  data,
  isLoading,
  refetch,
  isRefetching,
  columns,
  dataTable,
  isPendingExport,
  handleExport,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  isLoading: boolean;
  refetch: any;
  isRefetching: any;
  columns: any;
  dataTable: any;
  isPendingExport: any;
  handleExport: any;
}) => {
  return (
    <>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          onClose={false}
          className="min-w-[75vw]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="justify-between flex items-center">
              Detail Migrate Color
              <TooltipProviderPage value="close" side="left">
                <button
                  onClick={() => onCloseModal()}
                  className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </TooltipProviderPage>
            </DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="w-full h-[78vh] flex justify-center items-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-5 mt-5 text-sm">
              <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
                <div className="flex w-full border-sky-400/80 rounded-md overflow-hidden border p-4 flex-col">
                  <div className="w-full flex items-center">
                    <div className="flex items-center w-full">
                      <div className="flex w-72 items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100">
                          <Barcode className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold capitalize">
                          {data?.code_document_migrate}
                        </h3>
                      </div>
                      <Separator
                        orientation="vertical"
                        className="bg-gray-500 h-12"
                      />
                      <div className="flex w-full pl-5 items-center gap-2">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-sky-100">
                          <MapPinned className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold capitalize">
                          {data?.destiny_document_migrate}
                        </h3>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-12"
                    />
                    <div className="flex flex-col w-72 pl-5">
                      <p className="text-xs">Total Qty</p>
                      <p className="font-medium text-sm">
                        {data?.total_product_document_migrate.toLocaleString()}
                      </p>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-12"
                    />
                    <div className="flex items-center gap-4 ml-3">
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
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          handleExport();
                        }}
                        className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                        disabled={isPendingExport}
                        variant={"outline"}
                      >
                        {isPendingExport ? (
                          <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                        ) : (
                          <FileDown className={"w-4 h-4 mr-1"} />
                        )}
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DataTable
                maxHeight="h-[60vh]"
                isSticky
                columns={columns}
                data={dataTable}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DialogDetail;
