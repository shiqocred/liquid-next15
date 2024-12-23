"use client";

import {
  ArrowUpRight,
  CircleFadingPlus,
  RefreshCw,
  XCircle,
} from "lucide-react";
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
import { useGetListNotification } from "../_api/use-get-list-notification";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { id } from "date-fns/locale";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

export const Client = () => {
  const [isStatus, setIsStatus] = useState(false);
  // data search, page
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "",
  });
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
  } = useGetListNotification({ p: page, q: status });

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
          <BreadcrumbItem>Notification</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Notification</h2>
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
              <div className="flex items-center gap-3">
                <Popover open={isStatus} onOpenChange={setIsStatus}>
                  <PopoverTrigger asChild>
                    <Button className="border-sky-400/80 border text-black bg-transparent border-dashed hover:bg-transparent flex px-3 hover:border-sky-400">
                      <CircleFadingPlus className="h-4 w-4 mr-2" />
                      Status
                      {status && (
                        <Separator
                          orientation="vertical"
                          className="mx-2 bg-gray-500 w-[1.5px]"
                        />
                      )}
                      {status && (
                        <Badge
                          className={cn(
                            "rounded w-20 px-0 justify-center text-black font-normal capitalize",
                            status === "pending" &&
                              "bg-yellow-300 hover:bg-yellow-300",
                            status === "display" &&
                              "bg-sky-400 hover:bg-sky-400",
                            status === "done" &&
                              "bg-green-400 hover:bg-green-400",
                            status === "sale" &&
                              "bg-indigo-400 hover:bg-indigo-400"
                          )}
                        >
                          {status}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-52" align="start">
                    <Command>
                      <CommandGroup>
                        <CommandList>
                          <CommandItem
                            onSelect={() => {
                              setStatus("pending");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "pending"}
                              onCheckedChange={() => {
                                setStatus("pending");
                                setIsStatus(false);
                              }}
                            />
                            Pending
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("display");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "display"}
                              onCheckedChange={() => {
                                setStatus("display");
                                setIsStatus(false);
                              }}
                            />
                            Display
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("done");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "done"}
                              onCheckedChange={() => {
                                setStatus("done");
                                setIsStatus(false);
                              }}
                            />
                            Done
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("sale");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "sale"}
                              onCheckedChange={() => {
                                setStatus("sale");
                                setIsStatus(false);
                              }}
                            />
                            Sale
                          </CommandItem>
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {status && (
                  <Button
                    variant={"ghost"}
                    className="flex px-3"
                    onClick={() => setStatus("")}
                  >
                    Reset
                    <XCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
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
