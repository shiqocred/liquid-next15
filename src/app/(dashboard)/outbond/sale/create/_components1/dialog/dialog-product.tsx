"use client";

import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { RefreshCw, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";

import { columnProduct } from "../columns";
import { alertError, cn } from "@/lib/utils";
import { usePagination, useSearchQuery } from "@/lib/utils-client";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { useAddProduct } from "../../_api/use-add-product";
import { useGetListProduct } from "../../_api/use-get-list-product";

export const DialogProduct = ({
  open,
  onCloseModal,
  setLoading,
  inputData,
  addRef,
  addProductValue,
  setAddProductValue,
}: {
  open: boolean;
  onCloseModal: () => void;
  inputData: any;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setAddProductValue: Dispatch<SetStateAction<string>>;
  addRef: RefObject<HTMLInputElement>;
  addProductValue: string;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchProduct");
  const { page, metaPage, setPage, setPagination } =
    usePagination("pageProduct");

  const { mutate, isPending } = useAddProduct();

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListProduct({ p: page, q: searchValue });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const handleAdd = (barcode: string) => {
    const body = {
      buyer_id: inputData.buyerId,
      new_discount_sale: inputData.discount,
      type_discount: inputData.discountFor,
      sale_barcode: barcode,
    };
    mutate(
      { body },
      {
        onSuccess: () => {
          if (addRef.current) {
            addRef.current.focus();
          }
          setSearch("");
          setAddProductValue("");
          onCloseModal();
        },
      }
    );
  };

  // handle add by input
  useEffect(() => {
    if (addProductValue) {
      handleAdd(addProductValue);
    }
  }, [addProductValue]);

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [error, isError]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
    setLoading(isPending);
  }, [open, isPending]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Select Product
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
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
            />
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable
            isSticky
            maxHeight="h-[60vh]"
            isLoading={isRefetching}
            columns={columnProduct({
              metaPage,
              isLoading: isPending,
              handleAdd,
            })}
            data={dataList ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
