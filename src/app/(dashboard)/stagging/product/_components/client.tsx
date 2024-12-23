"use client";

import {
  ArrowRightCircle,
  Drill,
  FileDown,
  Loader2,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetListProductStaging } from "../_api/use-get-list-product-staging";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useLPRProductStaging } from "../_api/use-lpr-product-staging";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@/components/ui/label";
import { useGetListFilterProductStaging } from "../_api/use-get-list-filter-product-staging";
import { useAddFilterProductStaging } from "../_api/use-add-filter-product-staging";
import { useRemoveFilterProductStaging } from "../_api/use-remove-filter-product-staging";
import { useDoneCheckProductStaging } from "../_api/use-done-check-product-staging";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useExportStagingProduct } from "../_api/use-export-staging-product";

export const Client = () => {
  const [isOpenFiltered, setIsOpenFiltered] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  const [input, setInput] = useState({
    abnormal: "",
    damaged: "",
  });
  const [productId, setProductId] = useState("");
  const [isOpenLPR, setIsOpenLPR] = useState(false);

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

  const [DoneCheckAllDialog, confirmDoneCheckAll] = useConfirm(
    "Check All Product",
    "This action cannot be undone",
    "liquid"
  );

  const { mutate: mutateToLPR, isPending: isPendingToLPR } =
    useLPRProductStaging();
  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductStaging();
  const { mutate: mutateRemoveFilter, isPending: isPendingRemoveFilter } =
    useRemoveFilterProductStaging();
  const { mutate: mutateDoneCheckAll, isPending: isPendingDoneCheckAll } =
    useDoneCheckProductStaging();
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

  const {
    data: dataFiltered,
    refetch: refetchFiltered,
    error: errorFiltered,
    isError: isErrorFiltered,
    isSuccess: isSuccessFiltered,
  } = useGetListFilterProductStaging({
    p: pageFiltered,
  });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListFiltered: any[] = useMemo(() => {
    return dataFiltered?.data.data.resource.data.data;
  }, [dataFiltered]);

  const dataPriceTotal: any = useMemo(() => {
    return dataFiltered?.data.data.resource.total_new_price;
  }, [dataFiltered]);

  const loading = isLoading || isRefetching || isPending;

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
    setPaginate({
      isSuccess: isSuccessFiltered,
      data: dataFiltered,
      dataPaginate: dataFiltered?.data.data.resource.data,
      setPage: setPageFiltered,
      setMetaPage: setMetaPageFiltered,
    });
  }, [dataFiltered]);

  useEffect(() => {
    alertError({
      isError: isErrorFiltered,
      error: errorFiltered as AxiosError,
      data: "Data Filter",
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

  const handleMoveToLPR = (type: string) => {
    mutateToLPR(
      {
        id: productId,
        status: type,
        description: type === "abnormal" ? input.abnormal : input.damaged,
      },
      {
        onSuccess: () => {
          setInput({
            abnormal: "",
            damaged: "",
          });
          setProductId("");
          setIsOpenLPR(false);
        },
      }
    );
  };

  const handleDoneCheckAll = async () => {
    const ok = await confirmDoneCheckAll();

    if (!ok) return;

    mutateDoneCheckAll({});
  };

  const columnProductStaging: ColumnDef<any>[] = [
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
          <TooltipProviderPage value={<p>To LPR</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-orange-400 text-orange-700 hover:text-orange-700 hover:bg-orange-50 disabled:opacity-100 disabled:hover:bg-orange-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingToLPR || isPendingDoneCheckAll}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setIsOpenLPR(true);
              }}
            >
              {isPendingToLPR ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Drill className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];
  const columnFilteredProductStaging: ColumnDef<any>[] = [
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
      <DoneCheckAllDialog />
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
              <Sheet open={isOpenFiltered} onOpenChange={setIsOpenFiltered}>
                <SheetTrigger asChild>
                  <Button className="bg-sky-400 hover:bg-sky-400/80 text-black">
                    Filtered Products
                    <ArrowRightCircle className="w-4 h-4 ml-2" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="min-w-[75vw]">
                  <SheetHeader>
                    <SheetTitle>List Product Stagging (Filtered)</SheetTitle>
                  </SheetHeader>
                  <div className="w-full flex flex-col gap-5 mt-5 text-sm">
                    <div className="flex gap-4 items-center w-full">
                      <div className="h-9 px-4 flex items-center rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                        Total Filtered:
                        <span className="font-semibold">
                          {metaPageFiltered.total} Products
                        </span>
                      </div>
                      <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                        Total Price:
                        <span className="font-semibold">
                          {formatRupiah(dataPriceTotal)}
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
                          handleDoneCheckAll();
                        }}
                        type="button"
                        className="bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                        disabled={isPendingDoneCheckAll}
                      >
                        {isPendingDoneCheckAll ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 mr-2" />
                        )}
                        Done Check All
                      </Button>
                    </div>
                    <DataTable
                      isSticky
                      columns={columnFilteredProductStaging}
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
          <DataTable columns={columnProductStaging} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog
        open={isOpenLPR}
        onOpenChange={() => {
          setIsOpenLPR(false);
          setInput({
            abnormal: "",
            damaged: "",
          });
          setProductId("");
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Move Product to LPR</DialogTitle>
          </DialogHeader>
          <Tabs className="flex flex-col gap-4" defaultValue="abnormal">
            <TabsList className="bg-transparent flex justify-start gap-2">
              <TabsTrigger asChild value="abnormal">
                <Button className="data-[state=active]:bg-sky-400/80 data-[state=active]:hover:bg-sky-400 font-medium bg-transparent shadow-none text-black hover:bg-sky-100">
                  Abnormal
                </Button>
              </TabsTrigger>
              <TabsTrigger asChild value="damaged">
                <Button className="data-[state=active]:bg-sky-400/80 data-[state=active]:hover:bg-sky-400 font-medium bg-transparent shadow-none text-black hover:bg-sky-100">
                  Damaged
                </Button>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="abnormal">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMoveToLPR("abnormal");
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col w-full gap-1">
                  <Label>Description</Label>
                  <Textarea
                    rows={6}
                    className="resize-none border border-sky-400/80 focus-visible:ring-transparent focus-visible:outline-none"
                    value={input.abnormal}
                    onChange={(e) =>
                      setInput((prev) => ({
                        ...prev,
                        abnormal: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  className="bg-orange-400/80 hover:bg-orange-400 text-black"
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="damaged">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleMoveToLPR("damaged");
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col w-full gap-1">
                  <Label>Description</Label>
                  <Textarea
                    rows={6}
                    className="resize-none border border-sky-400/80 focus-visible:ring-transparent focus-visible:outline-none"
                    value={input.damaged}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, damaged: e.target.value }))
                    }
                  />
                </div>
                <Button
                  className="bg-orange-400/80 hover:bg-orange-400 text-black"
                  type="submit"
                >
                  Submit
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};
