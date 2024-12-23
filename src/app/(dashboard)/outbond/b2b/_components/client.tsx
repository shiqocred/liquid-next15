"use client";

import { ArrowUpRight, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListB2B } from "../_api/use-get-list-b2b";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { id } from "date-fns/locale";
import { formatDistanceToNowStrict } from "date-fns";

export const Client = () => {
  // data search, page
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListB2B({ p: page, q: "" });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // column data
  const columnNotification: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center my-1.5">
          <Badge
            className={cn(
              "font-normal capitalize text-black shadow-none",
              row.original.status.toLowerCase() === "pending" &&
                "bg-yellow-300 hover:bg-yellow-300",
              row.original.status.toLowerCase() === "display" &&
                "bg-sky-400 hover:bg-sky-400",
              row.original.status.toLowerCase() === "done" &&
                "bg-green-400 hover:bg-green-400",
              row.original.status.toLowerCase() === "sale" &&
                "bg-indigo-400 hover:bg-indigo-400"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "notification_name",
      header: "Notification",
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }) =>
        formatDistanceToNowStrict(new Date(row.original.created_at), {
          locale: id,
          addSuffix: true,
        }),
    },
    {
      accessorKey: "external_id",
      header: () => <div className="text-center">Approve</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.external_id ? (
            <Button className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1">
              <p className="text-xs">Detail</p>
              <ArrowUpRight />
            </Button>
          ) : (
            "-"
          )}
        </div>
      ),
    },
  ];

  // loading
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>B2B</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List B2B</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <DataTable columns={columnNotification} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
