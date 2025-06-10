"use client";

import {
  FileDown,
  Loader2,
  ReceiptText,
  RefreshCw,
  Trash2,
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
import { DialogDetail } from "./dialog-detail";

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

    mutateDelete({ params: { id } });
  };

  const handleExport = async () => {
    mutateExport(
      {},
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
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
      { body, params: { id: dataDetailProduct.id } },
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
    if (isNaN(parseFloat(input.oldPrice))) {
      setInput((prev) => ({ ...prev, oldPrice: "0" }));
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
      cell: ({ row }) => {
        const status = row.original.new_status_product;
        const color = {
          display: "bg-green-400/80 hover:bg-green-400/80",
          expired: "bg-rose-400/80 hover:bg-rose-400/80",
          slowmoving: "bg-yellow-400/80 hover:bg-yellow-400/80",
        };
        return (
          <Badge
            className={cn(
              "font-normal rounded-full text-black capitalize",
              color[
                status.replace(/\s+/g, "").toLowerCase() as
                  | "display"
                  | "expired"
                  | "slowmoving"
              ]
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
      <DialogDetail
        isOpen={isOpenDetailProduct}
        handleClose={handleClose}
        isLoadingProduct={isLoadingDetailProduct}
        isLoadingUpdate={isPendingUpdate}
        handleUpdate={handleUpdate}
        input={input}
        setInput={setInput}
        data={dataDetailProduct}
        isOpenCategory={isOpenCategory}
        setIsOpenCategory={setIsOpenCategory}
        categories={categories}
      />
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
    </div>
  );
};
