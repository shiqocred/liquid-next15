"use client";

import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { alertError, cn } from "@/lib/utils";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { PlayIcon, RefreshCw} from "lucide-react";
import React, { MouseEvent, useEffect, useMemo } from "react";
import { usePagination, useSearchQuery } from "@/lib/utils-client";
import { columnsSOCategory } from "./columns";
import { useGetListSOCategory } from "../_api/use-get-list-so-category";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { useStartSOCategory } from "../_api/use-start-so-category";
import { useRouter } from "next/navigation";
// import { useStopSOCategory } from "../_api/use-stop-so-category";

export const Client = () => {
  const router = useRouter();
  const { mutate: startSO, isPending: isPendingSO } = useStartSOCategory();
  // const { mutate: stopSO, isPending: isPendingStopSO } = useStopSOCategory();

  const { metaPage, page, setPage, setPagination } = usePagination();
  const { search, searchValue, setSearch } = useSearchQuery();

  const { data, isPending, refetch, isRefetching, error, isError, isSuccess } =
    useGetListSOCategory({ p: page, q: searchValue });

  const loading = isPending || isRefetching || isPendingSO;

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data ?? [];
  }, [data]);

  const handleStart = (e: MouseEvent) => {
    e.preventDefault();
    startSO(
      {},
      {
        onSuccess: () => {
          router.push("/inventory/stop-opname/category/create");
        },
      }
    );
  };

  // const handleStopSO = (e: MouseEvent) => {
  //   e.preventDefault();
  //   stopSO(
  //     {},
  //     {
  //       onSuccess: () => {
  //         router.push("/inventory/stop-opname/category");
  //       },
  //     }
  //   );
  // };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data.data.data.resource);
    }
  }, [data, isSuccess]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Stop Opname Category</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
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
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="ml-auto flex gap-2 items-center">
                {/* <Button
                  className="items-center flex-none h-9 bg-red-400/80 hover:bg-red-400 text-black"
                  variant={"outline"}
                  onClick={handleStopSO}
                  disabled={isPendingStopSO}
                >
                  <SquareIcon className={"w-4 h-4 mr-1"} />
                  Stop
                </Button> */}
                <Button
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                  onClick={handleStart}
                >
                  <PlayIcon className={"w-4 h-4 mr-1"} />
                  Start
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnsSOCategory({ metaPage })}
            data={dataList ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
