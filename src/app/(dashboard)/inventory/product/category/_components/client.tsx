"use client";

import {
  AlertCircle,
  ChevronDown,
  Circle,
  FileDown,
  Loader,
  Loader2,
  Minus,
  Palette,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  X,
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
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListProductCategory } from "../_api/use-get-list-product-category";
import { useDeleteProductCategory } from "../_api/use-delete-product-category";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useExportProductCategory } from "../_api/use-export-product-category";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProductCategory } from "../_api/use-update-product-category";
import { useGetProductCategoryDetail } from "../_api/use-get-product-category-detail";
import { useGetPriceProductCategory } from "../_api/use-get-price-product-category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import BarcodePrinted from "@/components/barcode";
import {
  PopoverPortal,
  PopoverPortalContent,
  PopoverPortalTrigger,
} from "@/components/ui/popover-portal";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface QualityData {
  lolos: string | null;
  damaged: string | null;
  abnormal: string | null;
}

export const Client = () => {
  const queryClient = useQueryClient();

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "liquid"
  );

  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteProductCategory();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportProductCategory();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListProductCategory({ p: page, q: searchValue });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

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
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

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

  // ---------------- Start Detail Fn -------------------- //

  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [isOpenDetailProduct, setIsOpenDetailProduct] = useQueryState(
    "dialog2",
    parseAsBoolean.withDefault(false)
  );
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
  });
  const [input, setInput] = useState({
    barcode: "",
    oldBarcode: "",
    name: "",
    oldName: "",
    price: "0",
    oldPrice: "0",
    qty: "1",
    oldQty: "1",
    category: "",
    discount: "0",
    displayPrice: "0",
  });

  const {
    mutate: updateProduct,
    isSuccess: isSuccessUpdate,
    isPending: isPendingUpdate,
  } = useUpdateProductCategory();

  const {
    data: dataProduct,
    isSuccess: isSuccessProduct,
    isError: isErrorProduct,
    error: errorProduct,
    isLoading: isLoadingDetailProduct,
  } = useGetProductCategoryDetail({ id: productId });

  const dataDetailProduct: any = useMemo(() => {
    return dataProduct?.data.data.resource;
  }, [dataProduct]);

  const { data: dataPrice } = useGetPriceProductCategory({
    price: dataDetailProduct?.old_price_product,
  });

  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Data Detail",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  useEffect(() => {
    if (isSuccessProduct && dataProduct) {
      setInput({
        barcode: dataProduct?.data.data.resource.new_barcode_product ?? "",
        name: dataProduct?.data.data.resource.new_name_product ?? "",
        price: dataProduct?.data.data.resource.new_price_product ?? "0",
        qty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        oldBarcode: dataProduct?.data.data.resource.old_barcode_product ?? "",
        oldName: dataProduct?.data.data.resource.new_name_product ?? "",
        oldPrice: dataProduct?.data.data.resource.old_price_product ?? "0",
        oldQty: dataProduct?.data.data.resource.new_quantity_product ?? "1",
        category: dataProduct?.data.data.resource.new_category_product ?? "",
        discount: dataProduct?.data.data.resource.new_discount ?? "0",
        displayPrice: dataProduct?.data.data.resource.display_price ?? "0",
      });
    }
  }, [dataProduct]);

  const categories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

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
      old_barcode_product: input.oldBarcode,
      new_barcode_product: input.barcode,
      new_name_product: input.name,
      new_quantity_product: input.qty,
      new_price_product: input.price,
      old_price_product: input.oldPrice,
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
      display_price: input.displayPrice,
      new_discount: input.discount,
    };
    updateProduct(
      { id: dataDetailProduct.id, body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["product-detail-product-detail", dataDetailProduct.id],
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
        queryKey: ["list-product-by-category"],
      });
    }
  };

  useEffect(() => {
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
    }
    if (isNaN(parseFloat(input.displayPrice))) {
      setInput((prev) => ({ ...prev, displayPrice: "0" }));
    }
    if (isNaN(parseFloat(input.price))) {
      setInput((prev) => ({ ...prev, price: "0" }));
    }
  }, [input]);

  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      displayPrice: Math.round(
        parseFloat(input.price ?? "0") -
          (parseFloat(input.price ?? "0") / 100) *
            parseFloat(input.discount ?? "0")
      ).toString(),
    }));
  }, [input.discount, input.price]);

  // ---------------- End Detail Fn ---------------------//

  const columnApprovementStaging: ColumnDef<any>[] = [
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
        <div className="max-w-[400px] break-all">
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
      accessorKey: "new_date_in_product",
      header: "Date",
      cell: ({ row }) => (
        <div className="">
          {format(
            new Date(row.original.new_date_in_product),
            "iii, dd MMM yyyy"
          )}
        </div>
      ),
    },
    {
      accessorKey: "new_status_product",
      header: "Status",
      cell: ({ row }) => (
        <Badge className="bg-green-400/80 hover:bg-green-400/80 font-normal rounded-full text-black capitalize">
          {row.original.new_status_product}
        </Badge>
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
              disabled={isLoadingDetailProduct}
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
              variant={"outline"}
              disabled={isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
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
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Category</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Product by Category</h2>
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
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleExport();
                }}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                disabled={isPendingExport}
                variant={"outline"}
              >
                {isPendingExport ? (
                  <Loader2 className={"w-4 h-4 mr-1 animate-spin"} />
                ) : (
                  <FileDown className={"w-4 h-4 mr-1"} />
                )}
                Export Data
              </Button>
            </div>
          </div>
          <DataTable columns={columnApprovementStaging} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog open={isOpenDetailProduct} onOpenChange={handleClose}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="max-w-6xl"
          onClose={false}
        >
          <DialogHeader>
            <DialogTitle className="justify-between flex items-center">
              Detail Product
              <TooltipProviderPage value="close" side="left">
                <button
                  onClick={() => handleClose()}
                  className="w-6 h-6 flex items-center justify-center border border-black hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </TooltipProviderPage>
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetailProduct || isPendingUpdate ? (
            <div className="w-full h-[408px] flex items-center justify-center flex-col gap-3">
              <Loader className="size-6 animate-spin" />
              <p className="text-sm ml-1">
                {isLoadingDetailProduct ? "Getting Data..." : "Updating..."}
              </p>
            </div>
          ) : (
            <div className="flex gap-3 w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
                className="flex flex-col gap-3 w-full"
              >
                <div className="flex gap-3">
                  <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                    <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                      Old Data
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col  w-full  gap-1">
                        <Label
                          htmlFor="barcodeOld"
                          className="text-xs font-semibold"
                        >
                          Barcode
                        </Label>
                        <Input
                          id="barcodeOld"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                          value={input.oldBarcode}
                          disabled
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="flex flex-col  w-full  gap-1">
                        <Label
                          htmlFor="nameOld"
                          className="text-xs font-semibold"
                        >
                          Name Product
                        </Label>
                        <Input
                          id="nameOld"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                          value={input.oldName}
                          disabled
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="flex flex-col w-full gap-1">
                        <Label className="text-xs font-semibold">Qty</Label>
                        <div className="relative flex items-center">
                          <Input
                            value={input.oldQty}
                            disabled
                            className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-full  gap-1">
                        <Label
                          htmlFor="priceOld"
                          className="text-xs font-semibold"
                        >
                          Price
                        </Label>
                        <div className="w-full relative flex items-center">
                          <Input
                            id="priceOld"
                            className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                            value={Math.round(parseFloat(input.oldPrice))}
                            onChange={(e) =>
                              setInput((prev) => ({
                                ...prev,
                                oldPrice: e.target.value.startsWith("0")
                                  ? e.target.value.replace(/^0+/, "")
                                  : e.target.value,
                              }))
                            }
                            placeholder="Custom Barcode..."
                          />
                          <p className="absolute right-3 text-xs text-gray-500">
                            {formatRupiah(parseFloat(input.oldPrice))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-full p-3 gap-3 rounded-md border border-sky-400 flex flex-col">
                    <div className="items-center flex justify-center h-9 rounded w-full bg-sky-100 font-semibold">
                      New Data
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col  w-full  gap-1">
                        <Label
                          htmlFor="barcodeOld"
                          className="text-xs font-semibold"
                        >
                          Barcode
                        </Label>
                        <Input
                          id="barcodeOld"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent disabled:opacity-100 disabled:cursor-default"
                          value={input.barcode}
                          disabled
                          placeholder="Custom Barcode..."
                        />
                      </div>
                      <div className="flex flex-col  w-full  gap-1">
                        <Label
                          htmlFor="nameNew"
                          className="text-xs font-semibold"
                        >
                          Name Product
                        </Label>
                        <Input
                          id="nameNew"
                          className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
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
                      <div className="w-full flex-none  flex gap-2 ">
                        <div className="flex flex-col w-full  gap-1">
                          <Label
                            htmlFor="priceNew"
                            className="text-xs font-semibold"
                          >
                            Price
                          </Label>
                          <Input
                            id="priceNew"
                            className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                            value={Math.round(parseFloat(input.price))}
                            onChange={(e) =>
                              setInput((prev) => ({
                                ...prev,
                                price: e.target.value.startsWith("0")
                                  ? e.target.value.replace(/^0+/, "")
                                  : e.target.value,
                              }))
                            }
                            placeholder="Custom Barcode..."
                          />
                        </div>
                        <div className="flex flex-col w-full gap-1">
                          <Label className="text-xs font-semibold">Qty</Label>
                          <div className="relative flex items-center">
                            <Input
                              value={input.qty}
                              onChange={(e) =>
                                setInput((prev) => ({
                                  ...prev,
                                  qty: e.target.value.startsWith("0")
                                    ? e.target.value.replace(/^0+/, "")
                                    : e.target.value,
                                }))
                              }
                              className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100 disabled:cursor-default"
                            />
                            <div className="flex absolute right-2 gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setInput((prev) => ({
                                    ...prev,
                                    qty: (parseFloat(prev.qty) - 1).toString(),
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
                                    qty: (parseFloat(prev.qty) + 1).toString(),
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
                      {!dataDetailProduct?.new_tag_product && (
                        <div className="flex flex-col gap-1 ">
                          <Label className="text-xs font-semibold">
                            Category
                          </Label>
                          <PopoverPortal
                            open={isOpenCategory}
                            onOpenChange={setIsOpenCategory}
                          >
                            <PopoverPortalTrigger asChild>
                              <Button
                                type="button"
                                className="border-0 border-b  rounded-none justify-between border-sky-400/80 focus:border-sky-400 focus-visible:ring-transparent focus:ring-1 hover:bg-sky-50 focus:bg-sky-50 shadow-none"
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
                                <ChevronDown />
                              </Button>
                            </PopoverPortalTrigger>
                            <PopoverPortalContent
                              className="p-0"
                              style={{
                                width: "var(--radix-popover-trigger-width)",
                              }}
                            >
                              <Command>
                                <CommandInput />
                                <CommandList className="p-1">
                                  <CommandGroup>
                                    <CommandEmpty>No Data Found.</CommandEmpty>
                                    {categories.map((item) => (
                                      <CommandItem
                                        key={item.id}
                                        className={cn(
                                          "my-2 first:mt-0 last:mb-0 flex gap-2 items-center border",
                                          input.category === item.name_category
                                            ? "border-gray-500"
                                            : "border-gray-300"
                                        )}
                                        onSelect={() => {
                                          setInput((prev) => ({
                                            ...prev,
                                            category: item?.name_category ?? "",
                                            price: (
                                              dataDetailProduct?.old_price_product -
                                              (dataDetailProduct?.old_price_product /
                                                100) *
                                                parseFloat(
                                                  item?.discount_category ?? "0"
                                                )
                                            ).toString(),
                                          }));
                                          setIsOpenCategory(false);
                                        }}
                                      >
                                        <div className="size-4 rounded-full border border-gray-500 flex-none flex items-center justify-center">
                                          {input.category ===
                                            item.name_category && (
                                            <Circle className="fill-black !size-2.5" />
                                          )}
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                          <p
                                            className={cn(
                                              "font-bold border-b pb-1.5 whitespace-nowrap text-ellipsis overflow-hidden w-full",
                                              input.category ===
                                                item.name_category
                                                ? "border-gray-500"
                                                : "border-gray-300"
                                            )}
                                          >
                                            {item.name_category}
                                          </p>
                                          <p className="text-xs font-light flex items-center gap-1">
                                            <span>
                                              {item.discount_category}%
                                            </span>
                                            <span>-</span>
                                            <span>
                                              Max.{" "}
                                              {formatRupiah(
                                                parseFloat(
                                                  item.max_price_category
                                                )
                                              )}
                                            </span>
                                          </p>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverPortalContent>
                          </PopoverPortal>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full flex-none  flex gap-2 border border-sky-400 p-3 rounded-md">
                  <div className="flex flex-col w-full  gap-1">
                    <Label htmlFor="priceNew" className="text-xs font-semibold">
                      Discount
                    </Label>
                    <Input
                      id="priceNew"
                      className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent "
                      value={Math.round(parseFloat(input.discount))}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          discount: e.target.value.startsWith("0")
                            ? e.target.value.replace(/^0+/, "")
                            : e.target.value,
                        }))
                      }
                      placeholder="Custom Barcode..."
                    />
                  </div>
                  <div className="flex flex-col w-full  gap-1">
                    <Label htmlFor="priceNew" className="text-xs font-semibold">
                      Display Price
                    </Label>
                    <Input
                      id="priceNew"
                      className="border-0 border-b rounded-none shadow-none w-full border-sky-400/80 focus-visible:border-sky-400 focus-visible:ring-transparent  disabled:opacity-100"
                      value={formatRupiah(parseFloat(input.displayPrice))}
                      disabled
                    />
                  </div>
                </div>
                <Button
                  disabled={
                    !input.name ||
                    parseFloat(input.qty) === 0 ||
                    (dataDetailProduct?.old_price_product >= 100000 &&
                      !input.category &&
                      findNotNull(dataDetailProduct?.new_quality) === "lolos")
                  }
                  className="bg-sky-400/80 hover:bg-sky-400 text-black"
                  type="submit"
                >
                  Update
                </Button>
              </form>
              <div className="w-fit flex flex-none flex-col gap-4">
                {dataDetailProduct?.new_category_product ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center p-2 rounded border bg-gray-100 gap-2 text-sm">
                      <AlertCircle className="size-4" />
                      <div className="flex flex-col">
                        <p>Update Data terlebih dahulu</p>
                        <p>untuk Barcode terbaru!</p>
                      </div>
                    </div>
                    <BarcodePrinted
                      barcode={dataDetailProduct?.new_barcode_product}
                      newPrice={dataDetailProduct?.new_price_product}
                      oldPrice={dataDetailProduct?.old_price_product}
                      category={dataDetailProduct?.new_category_product}
                    />
                  </div>
                ) : (
                  <div className="w-auto">
                    <div className="w-[282px] p-3 flex flex-col gap-3 border border-gray-300 rounded text-sm">
                      <div className="flex items-center text-sm font-semibold border-b border-gray-300 pb-2">
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
