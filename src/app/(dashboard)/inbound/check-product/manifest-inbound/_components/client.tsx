"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { ReceiptText, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { parseAsInteger, useQueryState } from "nuqs";
import { useGetManifestInbound } from "../_api/use-get-manifest-inbound";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteHistory } from "../_api/use-delete-history";
import Pagination from "@/components/pagination";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/(dashboard)/loading";

export const Client = () => {
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const queryClient = useQueryClient();
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Data",
    "This action cannot be undone",
    "destructive"
  );
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const { mutate } = useDeleteHistory();
  const {
    data,
    isError,
    error,
    refetch,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetManifestInbound({
    p: page,
    q: searchValue,
  });

  const loading = isPending || isRefetching || isLoading;

  const dataMI: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  useEffect(() => {
    if (isSuccess && data) {
      setPage(data?.data.data.resource.current_page);
      setMetaPage({
        last: data?.data.data.resource.last_page ?? 1,
        from: data?.data.data.resource.from ?? 0,
        total: data?.data.data.resource.total ?? 0,
        perPage: data?.data.data.resource.per_page ?? 0,
      });
    }
  }, [data]);

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutate(id);
  };

  const columnManifestInbound: ColumnDef<any>[] = [
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
      accessorKey: "base_document",
      header: "Document Name",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.base_document}</div>
      ),
    },
    {
      accessorKey: "date_document",
      header: "Date",
      cell: ({ row }) => {
        const formated = format(
          new Date(row.original.date_document),
          "iiii, dd MMMM yyyy"
        );
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "total_column_in_document",
      header: () => <div className="text-center">Total Items</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {row.original.total_column_in_document.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status_document",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_document === "pending" &&
                "bg-gray-200 hover:bg-gray-200",
              row.original.status_document === "in progress" &&
                "bg-yellow-400 hover:bg-yellow-400",
              row.original.status_document === "done" &&
                "bg-green-400 hover:bg-green-400"
            )}
          >
            {row.original.status_document}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value="Check">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none border-green-400 text-green-700 hover:text-green-700 hover:bg-green-50"
              variant={"outline"}
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: [
                    "check-manifest-inbound",
                    row.original.code_document,
                  ],
                });
                queryClient.invalidateQueries({
                  queryKey: ["check-categories-manifest-inbound"],
                });
              }}
            >
              <Link
                href={`/inbound/check-product/manifest-inbound/${row.original.code_document}/check`}
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Detail">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: [
                    "detail-manifest-inbound",
                    row.original.code_document,
                  ],
                });
              }}
            >
              <Link
                href={`/inbound/check-product/manifest-inbound/${row.original.code_document}/detail`}
              >
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Delete">
            <Button
              className="items-center px-0  border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 w-9"
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
      <DeleteDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Manifest Inbound</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List of Document Data</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={dataSearch}
              onChange={(e) => setDataSearch(e.target.value)}
              placeholder="Search..."
            />
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
          <DataTable columns={columnManifestInbound} data={dataMI ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
