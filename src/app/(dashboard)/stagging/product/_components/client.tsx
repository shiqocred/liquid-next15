"use client";

import { AxiosError } from "axios";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightCircle, FileDown, Loader2, RefreshCw } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useExportStagingProduct } from "../_api/use-export-staging-product";
import { useGetListProductStaging } from "../_api/use-get-list-product-staging";
import { useAddFilterProductStaging } from "../_api/use-add-filter-product-staging";

import Forbidden from "@/components/403";
import { alertError, cn } from "@/lib/utils";
import Loading from "@/app/(dashboard)/loading";
import Pagination from "@/components/pagination";
import { columnProductStaging } from "./columns";
import { DataTable } from "@/components/data-table";
import { usePagination, useSearchQuery } from "@/lib/utils-client";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";

import { DialogToLPR } from "./dialog-to-lpr";
import { DialogDetail } from "./dialog-detail";
import { DialogFiltered } from "./dialog-filtered";

export const Client = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );
  const [productId, setProductId] = useQueryState(
    "id",
    parseAsString.withDefault("")
  );

  // search & page product stagging
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, setPage, setPagination } = usePagination();

  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductStaging();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportStagingProduct();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListProductStaging({ p: page, q: searchValue });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const loading = isLoading || isRefetching || isPending || isPendingAddFilter;

  const handleExport = async () => {
    mutateExport("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource);
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

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };

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
      <DialogDetail
        open={isOpen === "detail"}
        onOpenChange={() => {
          if (isOpen === "detail") {
            setIsOpen("");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogToLPR
        open={isOpen === "lpr"}
        onOpenChange={() => {
          if (isOpen === "lpr") {
            setIsOpen("");
            setProductId("");
          }
        }}
        productId={productId}
      />
      <DialogFiltered
        open={isOpen === "filtered"}
        onOpenChange={() => {
          if (isOpen === "filtered") {
            setIsOpen("");
          }
        }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Stagging</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Product Stagging</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-[250px] border-sky-400/80 focus-visible:ring-sky-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                Total:
                <span className="font-semibold">{metaPage.total} Products</span>
              </div>
            </div>
            <div className="flex gap-3">
              <TooltipProviderPage value={"Export Data"} side="left">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleExport();
                  }}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black bg-sky-100 hover:bg-sky-200 disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExport}
                  variant={"outline"}
                >
                  {isPendingExport ? (
                    <Loader2 className={cn("w-4 h-4 animate-spin")} />
                  ) : (
                    <FileDown className={cn("w-4 h-4")} />
                  )}
                </Button>
              </TooltipProviderPage>
              <Button
                onClick={() => setIsOpen("filtered")}
                className="bg-sky-400 hover:bg-sky-400/80 text-black"
              >
                Filtered Products
                <ArrowRightCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          <DataTable
            columns={columnProductStaging({
              metaPage,
              isLoading,
              handleAddFilter,
              setProductId,
              setIsOpen,
            })}
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
