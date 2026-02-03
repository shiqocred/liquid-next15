"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useGetListDocumentsSku } from "../_api/use-get-list-document-sku";
import Loading from "@/app/(dashboard)/loading";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { Button } from "@/components/ui/button";
import { Loader2, ReceiptText, RefreshCw } from "lucide-react";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const Client = () => {
  const { search, searchValue, setSearch } = useSearchQuery();
  const { metaPage, page, setPage, setPagination } = usePagination("p");

  const { data, refetch, isLoading, isRefetching, isSuccess, isPending, error, isError } =
    useGetListDocumentsSku({ q: searchValue, p: page });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const columnApprovementDisplay: ColumnDef<any>[] = [
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
      accessorKey: "code_document",
      header: "Code Document",
    },
    {
      accessorKey: "base_document",
      header: () => <div className="text-center">Document Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.base_document}
        </div>
      ),
    },
    // {
    //   accessorKey: "new_date_in_product",
    //   header: "Date",
    //   cell: ({ row }) => (
    //     <div className="">
    //       {format(
    //         new Date(row.original.new_date_in_product),
    //         "iii, dd MMM yyyy",
    //       )}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "status_document",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status_document;
        const color = {
          done: "bg-green-400/80 hover:bg-green-400/80",
          pending: "bg-rose-400/80 hover:bg-rose-400/80",
        };
        return (
          <Badge
            className={cn(
              "font-normal rounded-full text-black capitalize",
              color[
                status.replace(/\s+/g, "").toLowerCase() as "done" | "pending"
              ],
            )}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value="Detail">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:hover:bg-sky-50"
              variant={"outline"}
            >
              <Link
                href={`/inventory/product/sku/${row.original.code_document}/detail`}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ReceiptText className="size-4" />
                )}
              </Link>
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource.data);
    }
  }, [data, isSuccess]);

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
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Sku</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Document SKU</h2>
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
          </div>
          <DataTable
            columns={columnApprovementDisplay}
            data={dataList ?? []}
            isLoading={isLoading || isRefetching}
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
