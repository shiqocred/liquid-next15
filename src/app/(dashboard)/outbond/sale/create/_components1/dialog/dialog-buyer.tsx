"use client";

import { AxiosError } from "axios";

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

import { RefreshCw, X } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useMemo } from "react";

import { useGetListBuyer } from "../../_api/use-get-list-buyer";

import { columnBuyer } from "../columns";
import { alertError, cn } from "@/lib/utils";
import { usePagination, useSearchQuery } from "@/lib/utils-client";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

const DialogBuyer = ({
  open,
  onCloseModal,
  setInput,
  disabled,
}: {
  open: boolean;
  onCloseModal: () => void;
  setInput: Dispatch<SetStateAction<any>>;
  disabled: boolean;
}) => {
  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery("searchBuyer");
  const { page, metaPage, setPage, setPagination } = usePagination("pageBuyer");

  // getching data
  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListBuyer({ p: page, q: searchValue });

  // memo data
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // handle error
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Data",
      method: "GET",
    });
  }, [isError, error]);

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);

  return (
    <div>
      <Dialog open={open} onOpenChange={onCloseModal}>
        <DialogContent
          onClose={false}
          className="min-w-[75vw]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="justify-between flex items-center">
              Select Buyer
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
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
            <DataTable
              isSticky
              maxHeight="h-[60vh]"
              isLoading={isRefetching}
              columns={columnBuyer({
                metaPage,
                handleClose: onCloseModal,
                setInput,
                disabled,
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
    </div>
  );
};

export default DialogBuyer;
