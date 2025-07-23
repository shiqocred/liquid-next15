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
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  CheckCircle2,
  Loader,
  RefreshCw,
  ScanBarcode,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { columnSales } from "../columns";
import { useConfirm } from "@/hooks/use-confirm";
import { useApproveProduct } from "../../_api/use-approve-product";
import { useRejectProduct } from "../../_api/use-reject-product";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRejectDocument } from "../../_api/use-reject-document";
import { useApproveDocument } from "../../_api/use-approve-document";

interface DialogDetailSaleProps {
  open: boolean;
  onCloseModal: () => void;
  baseData: any;
  saleId: string;
  openDialog: string;
  setSaleId: (value: string | null) => Promise<URLSearchParams>;
  setOpenDialog: (value: string | null) => Promise<URLSearchParams>;
}

export const DialogDetailSale = ({
  open,
  onCloseModal,
  baseData,
  saleId,
  openDialog,
  setSaleId,
  setOpenDialog,
}: DialogDetailSaleProps) => {
  const queryClient = useQueryClient();
  const [AprvDocumentDialog, confirmAprvDocument] = useConfirm(
    "Approve Document",
    "This action cannot be undone",
    "liquid"
  );
  const [AprvProductDialog, confirmAprvProduct] = useConfirm(
    "Approve Product",
    "This action cannot be undone",
    "liquid"
  );
  const [RjctDocumentDialog, confirmRjctDocument] = useConfirm(
    "Reject Document",
    "This action cannot be undone",
    "destructive"
  );
  const [RjctProductDialog, confirmRjctProduct] = useConfirm(
    "Reject Product",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: mutateAprvDocument, isPending: isPendingAprvDocument } =
    useApproveDocument();
  const { mutate: mutateAprvProduct, isPending: isPendingAprvProduct } =
    useApproveProduct();
  const { mutate: mutateRjctDocument, isPending: isPendingRjctDocument } =
    useRejectDocument();
  const { mutate: mutateRjctProduct, isPending: isPendingRjctProduct } =
    useRejectProduct();

  // get data detail
  const { data, refetch, isLoading, isRefetching, error, isError } = baseData;

  const isLoadingButton =
    isPendingAprvDocument ||
    isPendingAprvProduct ||
    isPendingRjctDocument ||
    isPendingRjctProduct ||
    isRefetching;

  // memo data detail
  const dataListDetail: any[] = useMemo(() => {
    return open ? data?.data.data.resource.sales : [];
  }, [data, open]);

  // memo data red detail
  const dataResDetail: any = useMemo(() => {
    return open ? data?.data.data.resource : {};
  }, [data, open]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleApproveDocument = async (id: any) => {
    const ok = await confirmAprvDocument();

    if (!ok) return;

    mutateAprvDocument(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", { saleId, openDialog }],
          });
          setSaleId("");
          setOpenDialog("");
        },
      }
    );
  };
  const handleApproveProduct = async (id: any) => {
    const ok = await confirmAprvProduct();

    if (!ok) return;

    mutateAprvProduct(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", { saleId, openDialog }],
          });
        },
      }
    );
  };
  const handleRejectDocument = async (id: any) => {
    const ok = await confirmRjctDocument();

    if (!ok) return;

    mutateRjctDocument(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", { saleId, openDialog }],
          });
          setSaleId("");
          setOpenDialog("");
        },
      }
    );
  };
  const handleRejectProduct = async (id: any) => {
    const ok = await confirmRjctProduct();

    if (!ok) return;

    mutateRjctProduct(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", { saleId, openDialog }],
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <AprvDocumentDialog />
      <AprvProductDialog />
      <RjctDocumentDialog />
      <RjctProductDialog />
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
                    {dataResDetail?.code_document_sale}
                  </p>
                </div>
                <div className="flex gap-4">
                  <TooltipProviderPage value={"Reload Data"}>
                    <Button
                      onClick={() => refetch()}
                      className="items-center size-8 px-0 flex-none border-sky-400 text-black hover:bg-sky-50"
                      variant={"outline"}
                      disabled={isLoadingButton}
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
                    disabled={isLoadingButton}
                    onClick={(e) => {
                      e.preventDefault();
                      handleApproveDocument(dataResDetail?.id);
                    }}
                  >
                    <CheckCircle2 className="size-4 mr-1" />
                    Approve All
                  </Button>
                  <Button
                    className="bg-red-400/80 hover:bg-red-400 text-black"
                    size={"sm"}
                    type="button"
                    disabled={isLoadingButton}
                    onClick={(e) => {
                      e.preventDefault();
                      handleRejectDocument(dataResDetail?.id);
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
                    {dataResDetail?.total_product_document_sale?.toLocaleString()}{" "}
                    Products
                  </p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-12 bg-sky-400/80"
                />
                <div className="flex flex-col w-full">
                  <p className="text-xs">Discount</p>
                  <p className="font-semibold">
                    {dataResDetail?.new_discount_sale}%
                  </p>
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
              columns={columnSales({
                isPending: isLoadingButton,
                handleApproveProduct,
                handleRejectProduct,
              })}
              data={dataListDetail ?? []}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
