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
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  FileDown,
  Loader,
  Loader2,
  PackageOpen,
  RefreshCw,
  ScanBarcode,
  Trash2,
  X,
} from "lucide-react";
import React from "react";

const SheetDetail = ({
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
  setOpenBarcode,
  setMetaBarcode,
  handleScrap,
  handleUnbundle,
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
  setOpenBarcode: any;
  setMetaBarcode: any;
  handleScrap: any;
  handleUnbundle: any;
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
              Detail QCD
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
            <div className="w-full h-full flex justify-center items-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="w-full flex flex-col gap-5 mt-5 text-sm">
              <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
                <div className="w-full flex items-center">
                  {isRefetching ? (
                    <div className="flex flex-col w-full gap-2">
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-52 h-7" />
                    </div>
                  ) : (
                    <div className="flex flex-col w-full">
                      <h5 className="font-medium">{data?.barcode_bundle}</h5>
                      <h3 className="text-xl font-semibold capitalize">
                        {data?.name_bundle}
                      </h3>
                    </div>
                  )}
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-12"
                  />
                  <div className="flex flex-col w-72 pl-5">
                    <p className="text-xs">Total Price</p>
                    {isRefetching ? (
                      <Skeleton className="w-32 h-4 mt-1" />
                    ) : (
                      <p className="font-medium text-sm">
                        {formatRupiah(data?.total_price_bundle ?? 0)}
                      </p>
                    )}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-12"
                  />
                  <div className="flex flex-col w-72 pl-5">
                    <p className="text-xs">Custom Display</p>
                    {isRefetching ? (
                      <Skeleton className="w-32 h-4 mt-1" />
                    ) : (
                      <p className="font-medium text-sm">
                        {formatRupiah(data?.total_price_custom_bundle ?? 0) ??
                          "Rp 0"}
                      </p>
                    )}
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-12"
                  />
                  <div className="flex items-center gap-4 ml-3 ">
                    <TooltipProviderPage value="Barcode">
                      <Button
                        type="button"
                        onClick={() => {
                          setOpenBarcode(true);
                          setMetaBarcode({
                            oldPrice: data?.total_price_bundle,
                            barcode: data?.barcode_bundle,
                            category: data?.name_bundle,
                            newPrice: data?.total_price_custom_bundle,
                          });
                        }}
                        className="w-9 px-0 bg-transparent border border-sky-500 text-sky-500 hover:bg-sky-50 hover:border-sky-700 hover:text-sky-700"
                      >
                        <ScanBarcode className="w-4 h-4" />
                      </Button>
                    </TooltipProviderPage>
                    <TooltipProviderPage value="Unbundle">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUnbundle();
                        }}
                        className="w-9 px-0 bg-transparent border border-red-500 text-red-500 hover:bg-red-50 hover:border-red-700 hover:text-red-700"
                      >
                        <PackageOpen className="w-4 h-4 " />
                      </Button>
                    </TooltipProviderPage>
                    <TooltipProviderPage value="Delete" align="end">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleScrap();
                        }}
                        className="w-9 px-0 bg-transparent border border-red-500 text-red-500 hover:bg-red-50 hover:border-red-700 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 " />
                      </Button>
                    </TooltipProviderPage>
                  </div>
                </div>
              </div>
              <div className="w-full flex justify-between pt-3 items-center">
                <h2 className="text-xl font-semibold border-b border-gray-500 pr-10">
                  List Products in QCD
                </h2>
                <div className="flex gap-4">
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

export default SheetDetail;
