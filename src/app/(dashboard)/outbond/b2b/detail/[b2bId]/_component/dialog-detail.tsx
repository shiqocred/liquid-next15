"use client";

import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { usePagination } from "@/lib/pagination";
import { useSearchQuery } from "@/lib/search";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Loader, RefreshCw, X } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { useGetDetailBagB2B } from "../_api";
import { AxiosError } from "axios";
import { ColumnDef } from "@tanstack/react-table";

export const columnsCategory: ColumnDef<any>[] = [
  {
    header: () => <div className="text-center">No</div>,
    id: "id",
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(row.index + 1).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Name Category",
    cell: ({ row }) => (
      <div className="break-all max-w-[500px]">{row.original.category}</div>
    ),
  },
  {
    accessorKey: "count",
    header: "Total",
  },
];

const DialogDetail = ({
  open,
  onCloseModal,
  columns,
  idBagB2B,
}: {
  open: boolean;
  onCloseModal: () => void;
  columns: any;
  idBagB2B: any;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchProduct");
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageProduct");

  const { data, isPending, refetch, isRefetching, error, isError, isSuccess } =
    useGetDetailBagB2B({
      id: idBagB2B,
      p: page,
      q: searchValue,
    });

  const dataListDetailBag: any = useMemo(() => {
    return data?.data?.data?.resource?.bag_product ?? {};
  }, [data]);

  const dataListDetailCategory: any = useMemo(() => {
    return data?.data?.data?.resource?.category_counts ?? [];
  }, [data]);

  const dataListDetailBagProduct: any[] = useMemo(() => {
    return data?.data?.data?.resource?.bulky_sales?.data ?? [];
  }, [data]);

  const isLoading = isPending || isRefetching;

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data?.data?.resource?.bulky_sales ?? {});
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data Products",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [searchValue, page, open]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent
        onClose={false}
        className="min-w-[75vw] max-h-[90vh] overflow-auto" // tambahkan max-h dan overflow
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Detail Bag B2B
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
          <div className="w-full flex flex-col gap-5 mt-5 overflow-y-auto">
            <div className="flex w-full rounded-md overflow-hidden border border-sky-400/80 p-5 flex-col">
              <div className="flex w-full border-sky-400/80 rounded-md overflow-hidden border p-4 flex-col">
                <div className="w-full flex items-center">
                  <div className="flex items-center w-full">
                    <div className="flex w-full items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Barcode Bag</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataListDetailBag?.barcode_bag}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Name Bag</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataListDetailBag?.name_bag}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="bg-gray-500 h-20"
                  />
                </div>
                <Separator className="bg-gray-500" />
                <div className="w-full flex items-center">
                  <div className="flex items-center w-full">
                    <div className="flex w-full items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Status Bag</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataListDetailBag?.status}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Total Product</p>
                        <p className="font-semibold capitalize text-lg">
                          {dataListDetailBag?.total_product}
                        </p>
                      </div>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="bg-gray-500 h-20"
                    />
                    <div className="flex w-full pl-5 items-end gap-4">
                      <div className="flex flex-col">
                        <p className="text-xs">Price</p>
                        <p className="font-semibold capitalize text-lg">
                          {formatRupiah(dataListDetailBag?.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold pb-4">Category</h2>
              <DataTable
                columns={columnsCategory}
                data={dataListDetailCategory ?? []}
              />
            </div>
            <div className="flex items-center gap-3 w-full">
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
                    className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
            <DataTable
              isSticky
              isLoading={isLoading}
              columns={columns}
              data={dataListDetailBagProduct ?? []}
            />
            <Pagination
              pagination={{ ...metaPage, current: page }}
              setPagination={setPage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetail;
