"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowRightCircle,
  FileDown,
  Loader,
  Loader2,
  Minus,
  Palette,
  Plus,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  ScanBarcode,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGetListProductInput } from "../_api/use-get-list-product-input";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useDeleteProductInput } from "../_api/use-delete-product-input";
import { useConfirm } from "@/hooks/use-confirm";
import { Label } from "@/components/ui/label";
import BarcodePrinted from "@/components/barcode";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "motion/react";
import { useGetListFilterProductInput } from "../_api/use-get-list-filter-product-input";
import { useAddFilterProductInput } from "../_api/use-add-filter-product-input";
import { useRemoveFilterProductInput } from "../_api/use-remove-filter-product-input";
import { useDoneCheckProductInput } from "../_api/use-done-check-product-input";
import { useUpdateProductPII } from "../_api/use-update-product-pi-i";
import { useGetProductDetailPII } from "../_api/use-get-product-detail-pi-i";
import { useGetPriceProductPII } from "../_api/use-get-price-product-pi-i";
import { useExportProductInput } from "../_api/use-export-product-input";

const categoryVariant = {
  isClose: { width: "0px", padding: "0px", marginLeft: "0px" },
  isOpen: { width: "300px", padding: "20px", marginLeft: "8px" },
};

interface QualityData {
  lolos: string | null;
  damaged: string | null;
  abnormal: string | null;
}

export const Client = () => {
  const queryClient = useQueryClient();

  // bool filter
  const [isOpenFiltered, setIsOpenFiltered] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // bool detail category
  const [isOpenCategory, setIsOpenCategory] = useQueryState(
    "categories",
    parseAsBoolean.withDefault(false)
  );

  // bool detail
  const [isOpenDetailProduct, setIsOpenDetailProduct] = useQueryState(
    "dialog2",
    parseAsBoolean.withDefault(false)
  );

  // product id to get detail
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });

  // input detail
  const [input, setInput] = useState({
    name: "",
    price: "0",
    qty: "1",
    category: "",
  });

  // search + pageination
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // pagination filter
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

  // delete product confirm
  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  // done check all confirm
  const [DoneCheckAllDialog, confirmDoneCheckAll] = useConfirm(
    "Check All Product",
    "This action cannot be undone",
    "liquid"
  );

  // mutate delete product, add filter, remove filter, done check all, update product
  const { mutate: mutateDeleteProduct, isPending: isPendingDeleteProduct } =
    useDeleteProductInput();
  const { mutate: mutateAddFilter, isPending: isPendingAddFilter } =
    useAddFilterProductInput();
  const { mutate: mutateRemoveFilter, isPending: isPendingRemoveFilter } =
    useRemoveFilterProductInput();
  const { mutate: mutateDoneCheckAll, isPending: isPendingDoneCheckAll } =
    useDoneCheckProductInput();
  const { mutate: updateProduct, isSuccess: isSuccessUpdate } =
    useUpdateProductPII();
  const { mutate: mutateExportPI, isPending: isPendingExportPI } =
    useExportProductInput();

  // get data, data filtered, data detail
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListProductInput({ p: page, q: searchValue });
  const {
    data: dataFiltered,
    refetch: refetchFiltered,
    error: errorFiltered,
    isError: isErrorFiltered,
    isSuccess: isSuccessFiltered,
  } = useGetListFilterProductInput({
    p: pageFiltered,
  });
  const {
    data: dataProduct,
    isSuccess: isSuccessProduct,
    isLoading: isLoadingDetailProduct,
    isError: isErrorDetailProduct,
    error: errorDetailProduct,
  } = useGetProductDetailPII({ id: productId });

  // memo detail product
  const dataDetailProduct: any = useMemo(() => {
    return dataProduct?.data.data.resource;
  }, [dataProduct]);

  // get old product detail
  const { data: dataPrice } = useGetPriceProductPII({
    price: dataDetailProduct?.old_price_product,
  });

  const dataPriceTotal: any = useMemo(() => {
    return data?.data.data.resource.tota_price;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.products.data;
  }, [data]);

  const dataListFiltered: any[] = useMemo(() => {
    return dataFiltered?.data.data.resource.data;
  }, [dataFiltered]);

  const categories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

  const loading = isLoading || isRefetching || isPending;

  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource.products,
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
    if (isSuccessProduct && dataProduct) {
      setInput({
        name: dataProduct?.data.data.resource.new_name_product ?? "",
        price: dataProduct?.data.data.resource.new_price_product ?? "0",
        qty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        category: dataProduct?.data.data.resource.new_category_product ?? "",
      });
    }
    if (dataProduct?.data.data.resource.new_category_product) {
      setIsOpenCategory(true);
    } else {
      setIsOpenCategory(false);
    }
  }, [dataProduct]);

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
      isError: isErrorDetailProduct,
      error: errorDetailProduct as AxiosError,
      data: "Detail product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetailProduct, errorDetailProduct]);
  useEffect(() => {
    alertError({
      isError: isErrorFiltered,
      error: errorFiltered as AxiosError,
      data: "Product filtered",
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

  const handleDeleteProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateDeleteProduct({ id });
  };

  const handleDoneCheckAll = async () => {
    const ok = await confirmDoneCheckAll();

    if (!ok) return;

    mutateDoneCheckAll({});
  };

  const handleExport = async (e: MouseEvent) => {
    e.preventDefault();
    mutateExportPI("", {
      onSuccess: (res) => {
        const link = document.createElement("a");
        link.href = res.data.data.resource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    });
  };

  // ---------------- Start Detail Fn -------------------- //

  const findNotNull = (v: any) => {
    if (v) {
      const qualityObject = JSON.parse(v);

      const filteredEntries = Object.entries(qualityObject).find(
        ([, value]) => value !== null
      );

      return filteredEntries?.[0] ?? "";
    }
  };

  const handleUpdate = () => {
    const body = {
      code_document: dataDetailProduct?.code_document,
      old_barcode_product: dataDetailProduct?.old_barcode_product,
      new_barcode_product: dataDetailProduct?.new_barcode_product,
      new_name_product: input.name,
      old_name_product: dataDetailProduct?.new_name_product,
      new_quantity_product: input.qty,
      new_price_product: input.price,
      old_price_product: dataDetailProduct?.old_price_product,
      new_date_in_product: dataDetailProduct?.new_date_in_product,
      new_status_product: dataDetailProduct?.new_status_product,
      condition: Object.keys(JSON.parse(dataDetailProduct?.new_quality)).find(
        (key) =>
          JSON.parse(dataDetailProduct?.new_quality)[
            key as keyof QualityData
          ] !== null
      ),
      new_category_product:
        input.category ?? dataDetailProduct?.new_category_product,
      new_tag_product: dataDetailProduct?.new_tag_product,
      display_price: dataDetailProduct?.display_price,
    };
    updateProduct(
      { id: dataDetailProduct.id, body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["product-detail-product-input", dataDetailProduct.id],
          });
        },
      }
    );
  };

  const handleClose = () => {
    setIsOpenDetailProduct(false);
    setProductId("");
    if (isSuccessUpdate) {
      queryClient.invalidateQueries({
        queryKey: ["list-product-input"],
      });
    }
  };

  useEffect(() => {
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
  }, [input]);

  // ---------------- End Detail Fn ---------------------//

  const columnProductInput: ColumnDef<any>[] = [
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
        <div className="break-all max-w-[300px]">
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
              disabled={isPendingAddFilter || isPendingDoneCheckAll}
              variant={"outline"}
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
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isLoadingDetailProduct || isPendingDoneCheckAll}
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setProductId(row.original.id);
                setIsOpenDetailProduct(true);
              }}
            >
              {isLoadingDetailProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingDeleteProduct || isPendingDoneCheckAll}
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteProduct(row.original.id);
              }}
            >
              {isPendingDeleteProduct ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  const columnFilteredProductInput: ColumnDef<any>[] = [
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
        <div className="break-all max-w-[500px]">
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
              variant={"outline"}
              type="button"
              disabled={isPendingRemoveFilter || isPendingDoneCheckAll}
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

   useEffect(() => {
      if (isNaN(parseFloat(input.price))) {
        setInput((prev) => ({ ...prev, price: "0" }));
      }
    }, [input]);

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
      <DeleteProductDialog />
      <DoneCheckAllDialog />
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
          <BreadcrumbItem>Product Input</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Product Input</h2>
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
              <div className="h-9 px-4 flex-none flex items-center text-sm rounded-md justify-center border gap-1 border-sky-500 bg-sky-100">
                Total Price:
                <span className="font-semibold">
                  {formatRupiah(dataPriceTotal)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                disabled={isPendingExportPI}
                size={"icon"}
                variant={"liquid"}
              >
                {isPendingExportPI ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FileDown />
                )}
              </Button>
              <Sheet open={isOpenFiltered} onOpenChange={setIsOpenFiltered}>
                <SheetTrigger asChild>
                  <Button className="bg-sky-400 hover:bg-sky-400/80 text-black">
                    Filtered Products
                    <ArrowRightCircle className="w-4 h-4 ml-2" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="min-w-[75vw]">
                  <SheetHeader>
                    <SheetTitle>List Product Input (Filtered)</SheetTitle>
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
                          handleDoneCheckAll();
                        }}
                        disabled={isPendingDoneCheckAll}
                        type="button"
                        className="bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
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
                      columns={columnFilteredProductInput}
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
          <DataTable columns={columnProductInput} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog open={isOpenDetailProduct} onOpenChange={handleClose}>
        <DialogContent
          className={cn(
            "bg-transparent border-none shadow-none rounded-none p-0 flex gap-0",
            dataDetailProduct?.new_tag_product ||
              findNotNull(dataDetailProduct?.new_quality) !== "damaged" ||
              findNotNull(dataDetailProduct?.new_quality) !== "abnormal"
              ? "max-w-5xl"
              : "max-w-6xl"
          )}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {isLoadingDetailProduct ? (
            <div className="h-[50vh] w-full flex items-center justify-center bg-white rounded-md">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="w-full flex gap-4 bg-white rounded-md p-5 flex-col">
              <h3 className="font-bold text-xl">Detail & Edit Product</h3>
              <div className="w-full relative overflow-hidden flex flex-col gap-4">
                <div className="w-full flex flex-col gap-3">
                  <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                    <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                      <ScanBarcode className="w-4 h-4 mr-2" />
                      <div className="flex w-full items-center justify-between">
                        <p>Old Data</p>
                        <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                          {dataDetailProduct?.old_barcode_product}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col pl-6 w-full overflow-hidden gap-1">
                        <p className="text-xs font-medium">Name Product</p>
                        <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {dataDetailProduct?.new_name_product}
                        </p>
                      </div>
                      <div className="w-1/3 flex-none pl-6 flex gap-2 ">
                        <div className="flex flex-col w-2/3 overflow-hidden gap-1">
                          <p className="text-xs font-medium">Price</p>
                          <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {formatRupiah(
                              parseFloat(
                                dataDetailProduct?.old_price_product ?? "0"
                              )
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col w-1/3 overflow-hidden gap-1">
                          <p className="text-xs font-medium">Qty</p>
                          <p className="text-sm text-gray-500 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                            {parseFloat(
                              dataDetailProduct?.new_quantity_product ?? "0"
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full gap-3 items-center bg-gray-300 rounded-md px-5 py-2">
                    <AlertCircle className="text-black h-4 w-4" />
                    <p className="text-sm font-medium">
                      To change the new price on the barcode, please update the
                      product first.
                    </p>
                  </div>
                  <div className="w-full flex gap-3">
                    <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
                      <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                        <ScanBarcode className="w-4 h-4 mr-2" />
                        <div className="flex w-full items-center justify-between">
                          <p>New Data</p>
                          <div className="flex gap-4">
                            <Badge
                              className={cn(
                                "border rounded-full",
                                findNotNull(dataDetailProduct?.new_quality) ===
                                  "lolos" &&
                                  "bg-green-200 hover:bg-green-200 border-green-700 text-green-700",
                                findNotNull(dataDetailProduct?.new_quality) ===
                                  "damaged" &&
                                  "bg-red-200 hover:bg-red-200 border-red-700 text-red-700",
                                findNotNull(dataDetailProduct?.new_quality) ===
                                  "abnormal" &&
                                  "bg-orange-200 hover:bg-orange-200 border-orange-700 text-orange-700"
                              )}
                            >
                              {findNotNull(dataDetailProduct?.new_quality)}
                            </Badge>
                            <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                              {dataDetailProduct?.new_barcode_product}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdate();
                        }}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex flex-col pl-6 w-full  gap-1">
                          <Label
                            htmlFor="nameNew"
                            className="text-xs font-medium"
                          >
                            Name Product
                          </Label>
                          <Input
                            id="nameNew"
                            className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                            value={input.name}
                            onChange={(e) =>
                              setInput((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Custom Barcode..."
                          />
                        </div>
                        <div className="w-full flex-none pl-6 flex gap-2 ">
                          <div className="flex flex-col w-full  gap-1">
                            <Label
                              htmlFor="priceNew"
                              className="text-xs font-medium"
                            >
                              Price
                            </Label>
                            <Input
                              id="priceNew"
                              className="w-full border-sky-400/80 focus-visible:ring-sky-400"
                              value={Math.round(parseFloat(input.price))}
                              onChange={(e) =>
                                setInput((prev) => ({
                                  ...prev,
                                  price: e.target.value,
                                }))
                              }
                              placeholder="Custom Barcode..."
                            />
                          </div>
                          <div className="flex flex-col w-full gap-1">
                            <Label>Qty</Label>
                            <div className="relative flex items-center">
                              <Input
                                value={input.qty}
                                onChange={(e) =>
                                  setInput((prev) => ({
                                    ...prev,
                                    qty:
                                      e.target.value.length > 1 &&
                                      e.target.value.startsWith("0")
                                        ? e.target.value.replace(/^0+/, "")
                                        : e.target.value,
                                  }))
                                }
                                className="w-full border-sky-400/80 focus-visible:ring-sky-400 disabled:opacity-100 disabled:cursor-default"
                              />
                              <div className="flex absolute right-2 gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInput((prev) => ({
                                      ...prev,
                                      qty: (
                                        parseFloat(prev.qty) - 1
                                      ).toString(),
                                    }))
                                  }
                                  disabled={parseFloat(input.qty) === 0}
                                  className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200 disabled:hover:bg-sky-100 disabled:opacity-50"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setInput((prev) => ({
                                      ...prev,
                                      qty: (
                                        parseFloat(prev.qty) + 1
                                      ).toString(),
                                    }))
                                  }
                                  className="w-6 h-6 flex items-center justify-center rounded bg-sky-100 hover:bg-sky-200"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {!dataDetailProduct?.new_tag_product &&
                          (findNotNull(dataDetailProduct?.new_quality) !==
                            "damaged" ||
                            findNotNull(dataDetailProduct?.new_quality) !==
                              "abnormal") && (
                            <div className="flex flex-col gap-1 pl-6">
                              <Label className="text-xs font-medium">
                                Category
                              </Label>
                              <Button
                                type="button"
                                onClick={() =>
                                  setIsOpenCategory(!isOpenCategory)
                                }
                                className="justify-between border-sky-400/80 focus:ring-sky-400 focus:ring-1 hover:bg-sky-50 focus:bg-sky-50"
                                variant={"outline"}
                              >
                                <p>
                                  {input.category ??
                                    dataDetailProduct?.new_category_product ?? (
                                      <span className="italic underline">
                                        No Category yet.
                                      </span>
                                    )}
                                </p>
                                <p className="text-xs italic font-light underline text-gray-600">
                                  change &gt;&gt;
                                </p>
                              </Button>
                            </div>
                          )}
                        <Button
                          disabled={
                            !input.name ||
                            parseFloat(input.qty) === 0 ||
                            (dataDetailProduct?.old_price_product >= 100000 &&
                              !input.category &&
                              findNotNull(dataDetailProduct?.new_quality) ===
                                "lolos")
                          }
                          className="ml-6 mt-2 bg-sky-400/80 hover:bg-sky-400 text-black"
                          type="submit"
                        >
                          Update
                        </Button>
                      </form>
                    </div>
                    <div className="w-fit flex flex-none">
                      {dataDetailProduct?.new_category_product ? (
                        <BarcodePrinted
                          barcode={dataDetailProduct?.new_barcode_product}
                          newPrice={dataDetailProduct?.new_price_product}
                          oldPrice={dataDetailProduct?.old_price_product}
                          category={dataDetailProduct?.new_category_product}
                        />
                      ) : (
                        <div className="w-auto">
                          <div className="w-[282px] p-3 flex flex-col gap-3 border border-gray-500 rounded text-sm">
                            <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-2">
                              <Palette className="w-4 h-4 mr-2" />
                              <p>Color</p>
                            </div>
                            <p className="pl-6">
                              {dataDetailProduct?.new_tag_product}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="">
                  <Button
                    className=" bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
                    onClick={handleClose}
                    type="button"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          <motion.div
            initial="isClose"
            animate={isOpenCategory ? "isOpen" : "isClose"}
            variants={categoryVariant}
            className=" bg-white rounded-md flex flex-col gap-4 flex-none"
          >
            <h3
              className={cn(
                "font-bold text-xl",
                isOpenCategory ? "flex" : "hidden"
              )}
            >
              Select Category
            </h3>
            <ScrollArea
              className={cn(
                "h-[500px] w-full border border-sky-500 p-2 rounded-md",
                isOpenCategory ? "flex" : "hidden"
              )}
            >
              <RadioGroup
                onValueChange={(e) => {
                  const selectedCategory = categories.find(
                    (item) => item.name_category === e
                  );
                  setInput((prev) => ({
                    ...prev,
                    category: selectedCategory?.name_category ?? "",
                    price: (
                      dataDetailProduct?.old_price_product -
                      (dataDetailProduct?.old_price_product / 100) *
                        parseFloat(selectedCategory?.discount_category ?? "0")
                    ).toString(),
                  }));
                }}
                className="flex flex-col w-[calc(100%-8px)] gap-4"
              >
                {categories?.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 w-full border px-4 py-2.5 rounded-md",
                      input.category === item.name_category
                        ? "border-gray-500 bg-sky-100"
                        : "border-gray-300"
                    )}
                  >
                    <RadioGroupItem
                      value={item.name_category}
                      checked={item.name_category === input.category}
                      id={item.id}
                      className="flex-none"
                    />
                    <Label
                      htmlFor={item.id}
                      className="flex flex-col gap-1.5 w-full"
                    >
                      <p
                        className={cn(
                          "font-bold border-b pb-1.5 whitespace-nowrap text-ellipsis overflow-hidden w-full",
                          input.category === item.name_category
                            ? "border-gray-500"
                            : "border-gray-300"
                        )}
                      >
                        {item.name_category}
                      </p>
                      <p className="text-xs font-light flex items-center gap-1">
                        <span>{item.discount_category}%</span>
                        <span>-</span>
                        <span>
                          Max.{" "}
                          {formatRupiah(parseFloat(item.max_price_category))}
                        </span>
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
