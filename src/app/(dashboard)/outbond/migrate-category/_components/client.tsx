"use client";

import { PlusCircle, ReceiptText, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListMigrateCategory } from "../_api/use-get-list-migrate-category";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useGetDetailMigrateCategory } from "../_api/use-get-detail-migrate-category";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  // sheet detail
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // migrateCategoryId for detail
  const [migrateCategoryId, setMigrateCategoryId] = useQueryState(
    "migrateCategoryId",
    {
      defaultValue: "",
    }
  );

  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
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
  } = useGetListMigrateCategory({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataMigrateCategory,
    isLoading: isLoadingMigrateCategory,
    refetch: refetchMigrateCategory,
    isRefetching: isRefetchingMigrateCategory,
    isError: isErrorMigrateCategory,
    error: errorMigrateCategory,
  } = useGetDetailMigrateCategory({ id: migrateCategoryId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // memo product detail list
  const dataListDetail: any[] = useMemo(() => {
    return dataMigrateCategory?.data.data.resource.migrate_bulky_products;
  }, [dataMigrateCategory]);

  // memo product detail list
  const dataMetaDetail: any = useMemo(() => {
    return dataMigrateCategory?.data.data.resource;
  }, [dataMigrateCategory]);

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

  useEffect(() => {
    alertError({
      isError: isErrorMigrateCategory,
      error: errorMigrateCategory as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorMigrateCategory, errorMigrateCategory]);

  // handle close
  const handleClose = () => {
    setOpenDetail(false);
    setMigrateCategoryId("");
  };

  // column data
  const columnListMigrateCategory: ColumnDef<any>[] = [
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
      accessorKey: "name_user",
      header: "User",
    },
    {
      accessorKey: "code_document",
      header: "Code Document",
    },
    {
      accessorKey: "status_bulky",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="rounded bg-sky-400/80 hover:bg-sky-400/80 text-black font-medium capitalize">
            {row.original.status_bulky}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail(true);
                setMigrateCategoryId(row.original.id);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  // column data detail
  const columnMigrateCategoryDetail: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "code_document",
      header: "Document Code",
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[400px] hyphens-auto">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_category_product",
      header: "Category",
    },
    {
      accessorKey: "new_price_product",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.new_price_product),
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
      <DialogDetail
        open={openDetail}
        onCloseModal={() => {
          if (openDetail) {
            handleClose();
          }
        }}
        data={dataMetaDetail}
        isLoading={isLoadingMigrateCategory}
        refetch={refetchMigrateCategory}
        isRefetching={isRefetchingMigrateCategory}
        columns={columnMigrateCategoryDetail}
        dataTable={dataListDetail ?? []}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Migrate Category</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Migrate Category</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
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
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="flex gap-4 items-center ml-auto">
                <Button
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/outbond/migrate-category/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    New Migrate
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnListMigrateCategory}
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
