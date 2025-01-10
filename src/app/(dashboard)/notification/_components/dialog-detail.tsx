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
import { cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  CheckCircle2,
  Loader,
  RefreshCw,
  ScanBarcode,
  X,
  XCircle,
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
  handleApprove,
  handleReject,
  isPendingApprove,
  isPendingReject,
}: {
  open: boolean;
  onCloseModal: () => void;
  data: any;
  isLoading: boolean;
  refetch: any;
  isRefetching: any;
  columns: any;
  dataTable: any;
  handleApprove: any;
  handleReject: any;
  isPendingApprove: any;
  isPendingReject: any;
}) => {
  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Notification
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
          <div className="w-full flex flex-col gap-5">
            <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-3 flex-col">
              <div className="flex items-center justify-between border-b border-sky-400/80 pb-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 flex items-center justify-center rounded-full bg-sky-200">
                    <ScanBarcode className="size-4" />
                  </div>
                  <p className="font-bold text-xl">
                    {data?.code_document_sale}
                  </p>
                </div>
                <div className="flex gap-4">
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetch()}
                      className="items-center size-8 px-0 flex-none border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                      disabled={
                        isPendingApprove || isPendingReject || isRefetching
                      }
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
                    className="bg-sky-400/80 hover:bg-sky-400 text-black"
                    size={"sm"}
                    type="button"
                    disabled={
                      isPendingApprove || isPendingReject || isRefetching
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleApprove(data?.id);
                    }}
                  >
                    <CheckCircle2 className="size-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    className="bg-red-400/80 hover:bg-red-400 text-black"
                    size={"sm"}
                    type="button"
                    disabled={
                      isPendingApprove || isPendingReject || isRefetching
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      handleReject(data?.id);
                    }}
                  >
                    <XCircle className="size-4 mr-1" />
                    Reject All
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 text-sm my-4 items-center">
                <div className="flex flex-col w-full">
                  <p className="text-xs">Total Product</p>
                  <p className="font-semibold">
                    {data?.total_product_document_sale?.toLocaleString()}{" "}
                    Products
                  </p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 bg-sky-400/80"
                />
                <div className="flex flex-col w-full">
                  <p className="text-xs">Discount</p>
                  <p className="font-semibold">{data?.new_discount_sale}%</p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 bg-sky-400/80"
                />
                <div className="flex flex-col w-full">
                  <p className="text-xs">Voucher</p>
                  <p className="font-semibold">{formatRupiah(data?.voucher)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t pt-3 border-sky-400/80">
                <div className="flex flex-col w-full p-2 bg-gradient-to-l from-sky-200 to-white rounded-l">
                  <p className="text-xs">Total Price</p>
                  <p className="font-semibold">
                    {formatRupiah(data?.total_price_document_sale)}
                  </p>
                </div>
                <div className="flex flex-col w-full p-2 text-end bg-sky-200 rounded-r">
                  <p className="text-xs">Grand Total</p>
                  <p className="font-semibold">
                    {formatRupiah(data?.grand_total)}
                  </p>
                </div>
              </div>
            </div>
            <DataTable
              maxHeight="h-[40vh]"
              isSticky
              isLoading={isRefetching}
              columns={columns}
              data={dataTable}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetail;
