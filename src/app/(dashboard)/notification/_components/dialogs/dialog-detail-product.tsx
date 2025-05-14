"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import {
  X,
  Loader,
  XCircle,
  RefreshCw,
  ScanBarcode,
  CheckCircle2,
  ArrowRightCircle,
} from "lucide-react";
import { AxiosError } from "axios";
import React, { useEffect, useMemo } from "react";

import { useApproveEditProduct } from "../../_api/use-approve-edit-product";
import { useRejectEditProduct } from "../../_api/use-reject-edit-product";

interface DialogDetailProductProps {
  open: boolean;
  onCloseModal: () => void;
  baseData: any;
  saleId: string;
  openDialog: string;
  setSaleId: (value: string | null) => Promise<URLSearchParams>;
  setOpenDialog: (value: string | null) => Promise<URLSearchParams>;
}

const BarcodePartial = ({
  dataResNew,
  dataResOld,
}: {
  dataResNew: any;
  dataResOld: any;
}) => {
  if (dataResNew?.barcode === dataResOld?.new_barcode_product) {
    return <p className="font-bold text-xl">{dataResNew?.barcode}</p>;
  }
  return (
    <div className="flex items-center gap-2">
      <p className="font-bold text-xl">{dataResNew?.barcode}</p>
      <ArrowRightCircle />
      <p className="font-bold text-xl">{dataResNew?.new_barcode_product}</p>
    </div>
  );
};

const NodeForm = ({
  label,
  type,
  newData,
  oldData,
  value,
}: {
  label: string;
  oldData: string;
  newData: string;
  type: "old" | "new";
  value: string;
}) => {
  const colorMap = {
    old: "border-red-500 bg-red-50",
    new: "border-green-500 bg-green-50",
  };
  return (
    <div className="flex flex-col gap-1 w-full">
      <Label>{label}</Label>
      <Input
        className={cn(
          "disabled:opacity-100 disabled:cursor-default shadow-none",
          oldData === newData ? "border-sky-400/80" : colorMap[type]
        )}
        disabled
        value={value ?? ""}
      />
    </div>
  );
};

const FormPartial = ({
  type,
  dataResOld,
  dataResNew,
}: {
  type: "old" | "new";
  dataResOld: any;
  dataResNew: any;
}) => {
  if (type === "old") {
    return (
      <div className="mx-2 flex flex-col gap-4">
        <NodeForm
          label={"Name Product"}
          type={"old"}
          newData={dataResNew.new_name_product}
          oldData={dataResOld.new_name_product}
          value={dataResOld.new_name_product}
        />
        <NodeForm
          label={"Old Price"}
          type={"old"}
          newData={dataResNew.old_price_product}
          oldData={dataResOld.old_price_product}
          value={formatRupiah(dataResOld.old_price_product)}
        />
        <NodeForm
          label={"New Price"}
          type={"old"}
          newData={dataResNew.new_price_product}
          oldData={dataResOld.new_price_product}
          value={formatRupiah(dataResOld.new_price_product)}
        />
        <NodeForm
          label={"Category"}
          type={"old"}
          newData={dataResNew.new_category_product}
          oldData={dataResOld.new_category_product}
          value={dataResOld.new_category_product}
        />
        <div className="flex gap-4 w-full">
          <NodeForm
            label={"Qty"}
            type={"old"}
            newData={dataResNew.new_quantity_product}
            oldData={dataResOld.new_quantity_product}
            value={dataResOld.new_quantity_product}
          />
          <NodeForm
            label={"Discount"}
            type={"old"}
            newData={parseFloat(dataResNew.new_discount).toString()}
            oldData={parseFloat(dataResOld.new_discount).toString()}
            value={parseFloat(dataResOld.new_discount).toString() + " %"}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-2 flex flex-col gap-4">
      <NodeForm
        label={"Name Product"}
        type={"new"}
        newData={dataResNew.new_name_product}
        oldData={dataResOld.new_name_product}
        value={dataResNew.new_name_product}
      />
      <NodeForm
        label={"Old Price"}
        type={"new"}
        newData={dataResNew.old_price_product}
        oldData={dataResOld.old_price_product}
        value={formatRupiah(dataResNew.old_price_product)}
      />
      <NodeForm
        label={"New Price"}
        type={"new"}
        newData={dataResNew.new_price_product}
        oldData={dataResOld.new_price_product}
        value={formatRupiah(dataResNew.new_price_product)}
      />
      <NodeForm
        label={"Category"}
        type={"new"}
        newData={dataResNew.new_category_product}
        oldData={dataResOld.new_category_product}
        value={dataResNew.new_category_product}
      />
      <div className="flex gap-4 w-full">
        <NodeForm
          label={"Qty"}
          type={"new"}
          newData={dataResNew.new_quantity_product}
          oldData={dataResOld.new_quantity_product}
          value={dataResNew.new_quantity_product}
        />
        <NodeForm
          label={"Discount"}
          type={"new"}
          newData={parseFloat(dataResNew.new_discount).toString()}
          oldData={parseFloat(dataResOld.new_discount).toString()}
          value={parseFloat(dataResNew.new_discount).toString() + " %"}
        />
      </div>
    </div>
  );
};

export const DialogDetailProduct = ({
  open,
  onCloseModal,
  baseData,
  saleId,
  openDialog,
  setSaleId,
  setOpenDialog,
}: DialogDetailProductProps) => {
  const queryClient = useQueryClient();
  const [ApproveDialog, confirmApprove] = useConfirm(
    "Approve Edit Product",
    "This action cannot be undone",
    "liquid"
  );
  const [RejectDialog, confirmReject] = useConfirm(
    "Reject Edit Product",
    "This action cannot be undone",
    "destructive"
  );

  const { mutate: mutateApprove, isPending: isPendingApprove } =
    useApproveEditProduct();
  const { mutate: mutateReject, isPending: isPendingReject } =
    useRejectEditProduct();

  // get data detail
  const { data, refetch, isLoading, isRefetching, error, isError } = baseData;

  const isLoadingButton = isPendingApprove || isPendingReject || isRefetching;

  // memo data red detail
  const dataRes: any = useMemo(() => {
    return open ? data?.data.data.resource : {};
  }, [data, open]);
  const dataResNew: any = useMemo(() => {
    return open ? data?.data.data.resource.dataNew : {};
  }, [data, open]);
  const dataResOld: any = useMemo(() => {
    return open ? data?.data.data.resource.dataOld : {};
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

  const handleApprove = async (id: any) => {
    const ok = await confirmApprove();

    if (!ok) return;

    mutateApprove(
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
  const handleReject = async (id: any) => {
    const ok = await confirmReject();

    if (!ok) return;

    mutateReject(
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

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <ApproveDialog />
      <RejectDialog />
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
                  <BarcodePartial
                    dataResNew={dataResNew}
                    dataResOld={dataResOld}
                  />
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
                      handleApprove(dataRes?.id);
                    }}
                  >
                    <CheckCircle2 className="size-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    className="bg-red-400/80 hover:bg-red-400 text-black"
                    size={"sm"}
                    type="button"
                    disabled={isLoadingButton}
                    onClick={(e) => {
                      e.preventDefault();
                      handleReject(dataRes?.id);
                    }}
                  >
                    <XCircle className="size-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    Old Data
                  </h3>
                  <FormPartial
                    type="old"
                    dataResNew={dataResNew}
                    dataResOld={dataResOld}
                  />
                </div>
                <Separator orientation="vertical" className="bg-sky-400/80" />
                <div className="flex flex-col gap-4 w-full">
                  <h3 className="w-full text-center font-semibold text-lg py-2 bg-sky-100 border-b border-sky-300">
                    New Data
                  </h3>
                  <FormPartial
                    type="new"
                    dataResNew={dataResNew}
                    dataResOld={dataResOld}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
