import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { columnProducts } from "../columns";
import { alertError, cn } from "@/lib/utils";
import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { AxiosError } from "axios";
import { useEffect, useMemo } from "react";
import { RefreshCw, X } from "lucide-react";

import { useGetListProducts } from "../../_api";

export const DialogProduct = ({
  open,
  onOpenChange,
  handleAddProduct,
  isPendingAddProduct,
}: {
  open: boolean;
  onOpenChange: () => void;
  handleAddProduct: any;
  isPendingAddProduct: any;
}) => {
  const { search, searchValue, setSearch } = useSearchQuery("searchProduct");
  const { metaPage, page, setPage, setPagination } =
    usePagination("pageProduct");

  const { data, isPending, refetch, isRefetching, error, isError, isSuccess } =
    useGetListProducts({
      p: page,
      q: searchValue,
    });

  const listData = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const isLoading = isPending || isRefetching;

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource);
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
    if (!open) {
      setPage(0);
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        onClose={false}
        className="max-w-6xl"
      >
        <DialogHeader>
          <DialogTitle className="justify-between flex items-center">
            Select Product
            <TooltipProviderPage value="close" side="left">
              <button
                onClick={() => onOpenChange()}
                className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </TooltipProviderPage>
          </DialogTitle>
          <DialogDescription />
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
                disabled={isLoading}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
          <DataTable
            isSticky
            maxHeight="h-[60vh]"
            isLoading={isLoading}
            columns={columnProducts({
              metaPage,
              handleAddProduct,
              isLoading: isPendingAddProduct,
            })}
            data={listData ?? []}
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
