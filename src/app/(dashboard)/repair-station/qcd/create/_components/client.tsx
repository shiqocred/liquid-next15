"use client";

import {
  ArrowLeft,
  ArrowUpRightFromSquare,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useGetListProductCreateQCD } from "../_api/use-get-list-product-create-qcd";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { Label } from "@/components/ui/label";
import { useGetListFilterQCD } from "../_api/use-get-list-filter-create-qcd";
import { useAddFilterCreateQCD } from "../_api/use-add-filter-create-qcd";
import { useRemoveFilterCreateQCD } from "../_api/use-remove-filter-create-qcd";
import { useSubmitQCD } from "../_api/use-submit-qcd";
import Link from "next/link";

export const Client = () => {
  const [isOpenProductList, setIsOpenProductList] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  const [input, setInput] = useState({
    name: "",
    total: "0",
    custom: "0",
  });

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

  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterCreateQCD();
  const { mutate: mutateRemoveFilter, isPending: isPendingRemoveFilter } =
    useRemoveFilterCreateQCD();
  const { mutate: mutateSubmit, isPending: isPendingDoneCheckAll } =
    useSubmitQCD();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListProductCreateQCD({ p: page, q: searchValue });

  const {
    data: dataFiltered,
    refetch: refetchFiltered,
    isSuccess: isSuccessFiltered,
  } = useGetListFilterQCD({
    p: pageFiltered,
  });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListFiltered: any[] = useMemo(() => {
    return dataFiltered?.data.data.resource.data.data;
  }, [dataFiltered]);

  const loading = isLoading || isRefetching || isPending;

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

  useEffect(() => {
    if (isSuccessFiltered && dataFiltered) {
      setPageFiltered(dataFiltered?.data.data.resource.data.current_page);
      setMetaPageFiltered({
        last: dataFiltered?.data.data.resource.data.last_page ?? 1,
        from: dataFiltered?.data.data.resource.data.from ?? 0,
        total: dataFiltered?.data.data.resource.data.total ?? 0,
        perPage: dataFiltered?.data.data.resource.data.per_page ?? 0,
      });
    }
  }, [dataFiltered]);

  const handleAddFilter = (id: any) => {
    mutateAddFilter({ id });
  };
  const handleRemoveFilter = (id: any) => {
    mutateRemoveFilter({ id });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_bundle: input.name,
      total_price_custom_bundle: input.custom,
      total_price_bundle: input.total,
      total_product_bundle: dataListFiltered.length,
    };
    mutateSubmit({ body });
  };

  // autoFill 0
  useEffect(() => {
    if (isNaN(parseFloat(input.custom))) {
      setInput((prev) => ({ ...prev, custom: "0" }));
    }
  }, [input]);

  useEffect(() => {
    if (isSuccess && dataFiltered) {
      setInput((prev) => ({
        ...prev,
        total: dataFiltered?.data.data.resource.total_new_price,
        custom: dataFiltered?.data.data.resource.total_new_price,
      }));
    }
  }, [dataFiltered]);

  const columnProductQCD: ColumnDef<any>[] = [
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
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px]">{row.original.new_name_product}</div>
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
              disabled={isPendingAddFilter || isPendingDoneCheckAll}
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
  const columnFilteredProductQCD: ColumnDef<any>[] = [
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
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.new_name_product}</div>
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
              disabled={isPendingRemoveFilter || isPendingDoneCheckAll}
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Repair Station</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/repair-station/qcd">QCD</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Create</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Link href="/repair-station/qcd">
          <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create QCD List</h1>
      </div>
      <div className="w-full flex flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full gap-4 bg-white p-5 rounded-md shadow"
        >
          <div className="w-full pb-1 mb-2 border-b border-gray-500 text-xl font-semibold">
            <h3>Data QCD</h3>
          </div>
          <div className="flex w-full gap-4">
            <div className="flex flex-col gap-1 w-1/2">
              <Label>QCD Name</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                placeholder="QCD name..."
                value={input.name}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-1 w-1/4">
              <Label>Total Price</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                value={
                  formatRupiah(Math.round(parseFloat(input.total))) ?? "Rp 0"
                }
                disabled
              />
            </div>
            <div className="flex flex-col gap-1 w-1/4">
              <Label>Custom Price</Label>
              <Input
                className="border-sky-400/80 focus-visible:ring-0 border-0 border-b rounded-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-100"
                value={input.custom}
                onChange={(e) =>
                  setInput((prev) => ({
                    ...prev,
                    custom: e.target.value.startsWith("0")
                      ? e.target.value.replace(/^0+/, "")
                      : e.target.value,
                  }))
                }
                type="number"
              />
            </div>
            <Button
              type="submit"
              disabled={!input.name}
              className="bg-sky-400/80 hover:bg-sky-400 text-black mt-auto"
            >
              <Send className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
        </form>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <h3 className="border-b border-gray-500 pr-10 pb-1 w-fit font-semibold">
              List Products Filtered
            </h3>
            <div className="flex gap-3">
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetchFiltered()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
              <Dialog
                open={isOpenProductList}
                onOpenChange={setIsOpenProductList}
              >
                <DialogTrigger asChild>
                  <Button className="bg-sky-400 hover:bg-sky-400/80 text-black">
                    Add Product
                    <ArrowUpRightFromSquare className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent onClose={false} className="min-w-[75vw]">
                  <DialogHeader>
                    <DialogTitle className="justify-between flex items-center">
                      List Product
                      <TooltipProviderPage value="close" side="left">
                        <button
                          onClick={() => setIsOpenProductList(false)}
                          className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </TooltipProviderPage>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="w-full flex flex-col gap-5 mt-5 text-sm">
                    <div className="flex gap-4 items-center w-full">
                      <div className="relative flex w-1/3 items-center">
                        <Input
                          className="border-sky-400/80 focus-visible:ring-sky-400 w-full pl-10"
                          placeholder="Search product..."
                          id="searchProduct"
                          value={dataSearch}
                          onChange={(e) => setDataSearch(e.target.value)}
                          autoFocus
                        />
                        <Label
                          htmlFor="searchProduct"
                          className="absolute left-3 cursor-text"
                        >
                          <Search className="w-5 h-5" />
                        </Label>
                      </div>
                      <TooltipProviderPage value={"Reload Data"}>
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            refetch();
                          }}
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
                    </div>
                    <DataTable
                      isSticky
                      maxHeight="h-[60vh]"
                      columns={columnProductQCD}
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
          </div>
          <DataTable
            columns={columnFilteredProductQCD}
            data={dataListFiltered ?? []}
          />
          <Pagination
            pagination={{ ...metaPageFiltered, current: pageFiltered }}
            setPagination={setPageFiltered}
          />
        </div>
      </div>
    </div>
  );
};
