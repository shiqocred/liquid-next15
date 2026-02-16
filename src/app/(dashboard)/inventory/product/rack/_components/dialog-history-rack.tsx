import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { InputSearch } from "@/components/input-search";
import { AxiosError } from "axios";
import React, { useEffect, useMemo } from "react";
import { alertError } from "@/lib/utils";
import { Loader2, FileDown } from "lucide-react";
import { usePagination } from "@/lib/pagination";
import { useSearch } from "@/lib/search";
import { columnHistoryRackDisplay } from "./columns";
import { useExportHistoryRackDisplay } from "../_api/use-export-rack-history-display";
import { useGetListHistoryRackDisplay } from "../_api/use-get-list-history-rack-display";
import Pagination from "@/components/pagination";

export const DialogHistoryRack = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportHistoryRackDisplay();
  const { page, metaPage, setPage, setPagination } = usePagination("pFilter");
  const { search, searchValue, setSearch } = useSearch();

  const { data, refetch, error, isSuccess, isError, isRefetching, isPending } =
    useGetListHistoryRackDisplay({
      p: page,
      q: searchValue,
    });

  const isLoading =
    isPendingExport || isRefetching || isPending;

  const dataListHistoryRack: any[] = useMemo(() => {
    return data?.data.data.details.data;
  }, [data]);
  const totalInputAllUsers = useMemo(() => {
    return data?.data.data.total_all_users;
  }, [data]);

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.details);
    }
  }, [data, isSuccess]);

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource.download_url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="min-w-[75vw]">
        <SheetHeader>
          <SheetTitle>List History Rack</SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="w-full flex flex-col gap-5 mt-5 text-sm">
          <InputSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari history rack..."
            onClick={() => refetch()}
            loading={isRefetching}
            disabled={isPending}
          />
          <div className="flex gap-4 items-center w-full">
            <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
              Total input all users:{" "}
              <span className="font-semibold">{totalInputAllUsers}</span>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleExport();
              }}
              type="button"
              className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingExport}
            >
              {isPendingExport ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>
          </div>
          <DataTable
            isSticky
            columns={columnHistoryRackDisplay({
              metaPage,
              isLoading,
            })}
            data={dataListHistoryRack ?? []}
          />
          <Pagination
            pagination={{
              ...metaPage,
              current: page,
            }}
            setPagination={setPage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
