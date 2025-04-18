"use client";

import {
  ArrowLeft,
  ArrowRightCircle,
  Loader2,
  PlusCircle,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetListProductBKL } from "../_api/use-get-list-product-bkl";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListFilterProductBKL } from "../_api/use-get-list-filter-product-bkl";
import { useAddFilterProductBKL } from "../_api/use-add-filter-product-bkl";
import { useRemoveFilterProductBKL } from "../_api/use-remove-filter-product-bkl";
import { useCreateBKL } from "../_api/use-create-bkl";
import Link from "next/link";

export const Client = () => {
  const [isOpenFiltered, setIsOpenFiltered] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [pageFiltered, setPageFiltered] = useQueryState(
    "p2",
    parseAsInteger.withDefault(1)
  );
  const [metaPageFiltered, setMetaPageFiltered] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [CreateBKLDialog, confirmCreateBKL] = useConfirm(
    "Create BKL",
    "This action cannot be undone",
    "liquid"
  );

  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductBKL();
  const { mutate: mutateRemoveFilter, isPending: isPendingRemoveFilter } =
    useRemoveFilterProductBKL();
  const { mutate: mutateCreateBKL, isPending: isPendingCreateBKL } =
    useCreateBKL();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListProductBKL({ p: page, q: searchValue });

  const {
    data: dataFiltered,
    refetch: refetchFiltered,
    isSuccess: isSuccessFiltered,
    isError: isErrorFiltered,
    error: errorFiltered,
  } = useGetListFilterProductBKL({
    p: pageFiltered,
  });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListFiltered: any[] = useMemo(() => {
    return dataFiltered?.data.data.resource.data;
  }, [dataFiltered]);

  const loading = isLoading || isRefetching || isPending;

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
    setPaginate({
      isSuccess: isSuccessFiltered,
      data: dataFiltered,
      dataPaginate: dataFiltered?.data.data.resource,
      setPage: setPageFiltered,
      setMetaPage: setMetaPageFiltered,
    });
  }, [dataFiltered]);

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
      isError: isErrorFiltered,
      error: errorFiltered as AxiosError,
      data: "Filtered Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorFiltered, errorFiltered]);

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };
  const handleRemoveFilter = (id: any) => {
    mutateRemoveFilter({ id });
  };

  const handleCreateBKL = async () => {
    const ok = await confirmCreateBKL();

    if (!ok) return;

    mutateCreateBKL({});
  };

  const columnProductBKL: ColumnDef<any>[] = [
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
      accessorKey: "new_barcode_product||old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ??
        row.original.old_barcode_product ??
        "-",
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[300px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_category_product||new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ??
        row.original.new_tag_product ??
        "-",
    },
    {
      accessorKey: "new_price_product||old_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(
            row.original.new_price_product ?? row.original.old_price_product
          )}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Add to Filter</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingAddFilter || isPendingCreateBKL}
              onClick={(e) => {
                e.preventDefault();
                handleAddFilter(row.original.id);
              }}
            >
              {isPendingAddFilter ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];
  const columnFilteredProductBKL: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageFiltered.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product||old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ??
        row.original.old_barcode_product ??
        "-",
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Delete"}>
            <Button
              className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingRemoveFilter || isPendingCreateBKL}
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleRemoveFilter(row.original.id);
              }}
            >
              {isPendingRemoveFilter ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
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
      <CreateBKLDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Slow Moving Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/slow-moving-product/bkl/create">
              BKL
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Button
          asChild
          className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none"
        >
          <Link href="/inventory/slow-moving-product/bkl">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Add BKL</h1>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
              <Input
                className="w-[250px] border-sky-400/80 focus-visible:ring-sky-400"
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
              <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                Total:
                <span className="font-semibold">{metaPage.total} Products</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Sheet open={isOpenFiltered} onOpenChange={setIsOpenFiltered}>
                <SheetTrigger asChild>
                  <Button className="bg-sky-400 hover:bg-sky-400/80 text-black">
                    Filtered Products
                    <ArrowRightCircle className="w-4 h-4 ml-2" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="min-w-[75vw]">
                  <SheetHeader>
                    <SheetTitle>List Product Filtered</SheetTitle>
                  </SheetHeader>
                  <div className="w-full flex flex-col gap-5 mt-5 text-sm">
                    <div className="flex gap-4 items-center w-full">
                      <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                        Total Filtered:
                        <span className="font-semibold">
                          {metaPageFiltered.total} Products
                        </span>
                      </div>
                      <TooltipProviderPage value={"Reload Data"}>
                        <Button
                          onClick={() => refetchFiltered()}
                          className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                          variant={"outline"}
                        >
                          <RefreshCw
                            className={cn(
                              "w-4 h-4",
                              loading ? "animate-spin" : ""
                            )}
                          />
                        </Button>
                      </TooltipProviderPage>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          handleCreateBKL();
                        }}
                        type="button"
                        className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                        disabled={isPendingCreateBKL}
                      >
                        {isPendingCreateBKL ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Create
                      </Button>
                    </div>
                    <DataTable
                      isSticky
                      columns={columnFilteredProductBKL}
                      data={dataListFiltered ?? []}
                    />
                    <Pagination
                      pagination={{
                        ...metaPageFiltered,
                        current: pageFiltered,
                      }}
                      setPagination={setPageFiltered}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <DataTable columns={columnProductBKL} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
