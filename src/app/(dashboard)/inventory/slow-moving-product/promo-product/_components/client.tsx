"use client";

import { Loader2, PlusCircle, ReceiptText, RefreshCw } from "lucide-react";
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
import { useGetListPromo } from "../_api/use-get-list-promo";
import { useGetDetailPromo } from "../_api/use-get-detail-promo";
import { toast } from "sonner";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useGetListProduct } from "../_api/use-get-list-product";
import { useCreatePromo } from "../_api/use-create-promo";
import { useUpdatePromo } from "../_api/use-update-promo";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});
const DialogCreatePromo = dynamic(() => import("./dialog-create-promo"), {
  ssr: false,
});
const DialogDetailPromo = dynamic(() => import("./dialog-detail-promo"), {
  ssr: false,
});

export const Client = () => {
  // const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [promoId, setPromoId] = useQueryState("promoId", {
    defaultValue: "",
  });

  const [isProduct, setIsProduct] = useState(false);
  const [openPromo, setOpenPromo] = useState(false);

  const [input, setInput] = useState({
    id: "",
    name: "",
    discount: "0",
    price: 0,
  });

  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const [pageProduct, setPageProduct] = useState(1);
  const [metaPageProduct, setMetaPageProduct] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
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

  const { mutate: mutateCreate } = useCreatePromo();
  const { mutate: mutateUpdate } = useUpdatePromo();

  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListPromo({ p: page, q: searchValue });

  const {
    data: dataDetail,
    isSuccess: isSuccessDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
  } = useGetDetailPromo({ id: promoId });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

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
    if (isSuccessDetail && dataDetail) {
      setInput((prev) => ({
        ...prev,
        name: dataDetail?.data.data.resource?.name_promo ?? "",
        discount:
          Math.round(
            dataDetail?.data.data.resource?.discount_promo
          ).toString() ?? "0",
        price:
          Math.round(
            dataDetail?.data.data.resource?.new_product?.new_price_product
          ) ?? "0",
      }));
    }
  }, [dataDetail]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  const handleCreate = () => {
    const body = {
      discount_promo: input.discount,
      name_promo: input.name,
      new_product_id: input.id,
      price_promo:
        input.price - (input.price / 100) * parseFloat(input.discount),
    };

    mutateCreate(
      { body },
      {
        onSuccess: () => {
          setOpenPromo(false);
          setInput({ id: "", name: "", discount: "0", price: 0 });
        },
      }
    );
  };
  const handleUpdate = () => {
    const body = {
      discount_promo: input.discount,
      name_promo: input.name,
      price_promo:
        input.price - (input.price / 100) * parseFloat(input.discount),
    };

    mutateUpdate(
      { id: promoId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
    setPageProduct(1);
    setMetaPageProduct({
      from: 0,
      last: 0,
      perPage: 0,
      total: 0,
    });
  };

  const handleClose = () => {
    setOpenDialog(false);
    setPromoId("");
    setInput({ id: "", name: "", discount: "0", price: 0 });
  };

  useEffect(() => {
    if (isErrorDetail && (errorDetail as AxiosError).status === 403) {
      toast.error(`Error 403: Restricted Access`);
    }
    if (isErrorDetail && (errorDetail as AxiosError).status !== 403) {
      toast.error(
        `ERROR ${
          (errorDetail as AxiosError).status
        }: Product failed to get Data`
      );
      console.log("ERROR_GET_Product:", errorDetail);
    }
  }, [isErrorDetail, errorDetail]);

  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
    }
  }, [input]);

  const columnListPromo: ColumnDef<any>[] = [
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
      accessorKey: "name_promo",
      header: () => <div className="whitespace-nowrap">Promo Name</div>,
      cell: ({ row }) => row.original.name_promo,
    },
    {
      accessorKey:
        "new_product.new_barcode_product||new_product.old_barcode_product",
      header: () => <div className="whitespace-nowrap">Barcode Product</div>,
      cell: ({ row }) =>
        row.original.new_product.new_barcode_product ||
        row.original.new_product.old_barcode_product,
    },
    {
      accessorKey: "new_product.new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[400px]">
          {row.original.new_product.new_name_product}
        </div>
      ),
    },
    {
      accessorKey:
        "new_product.new_category_product||new_product.new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_product.new_category_product ||
        row.original.new_product.new_tag_product,
    },
    {
      accessorKey: "new_product.new_quantity_product",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {row.original.new_product.new_quantity_product.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_product.new_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums whitespace-nowrap">
          {formatRupiah(row.original.new_product.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "discount_promo",
      header: () => <div className="text-center">Discount</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {Math.round(row.original.discount_promo)}%
        </div>
      ),
    },
    {
      accessorKey: "price_promo",
      header: () => <div className="whitespace-nowrap">Promo Price</div>,
      cell: ({ row }) => (
        <div className="tabular-nums whitespace-nowrap">
          {formatRupiah(row.original.price_promo)}
        </div>
      ),
    },
    {
      accessorKey: "new_product.new_status_product",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="rounded justify-center whitespace-nowrap text-black font-normal capitalize bg-sky-300/80 hover:bg-sky-300/80">
            {row.original.new_product.new_status_product}
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
              disabled={isLoadingDetail}
              onClick={(e) => {
                e.preventDefault();
                setPromoId(row.original.id);
                setOpenDialog(true);
              }}
            >
              {isLoadingDetail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];
  const columnProduct: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPageProduct.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product??old_barcode_product",
      header: "Barcode",
      cell: ({ row }) =>
        row.original.new_barcode_product ?? row.original.old_barcode_product,
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.new_name_product}</div>
      ),
    },
    {
      accessorKey: "new_category_product??new_tag_product",
      header: "Category",
      cell: ({ row }) =>
        row.original.new_category_product ??
        row.original.new_tag_product ??
        "-",
    },
    {
      accessorKey: "old_price_product",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.old_price_product),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Add Product"}>
            <Button
              className="items-center border-sky-400 text-black hover:bg-sky-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              onClick={(e) => {
                e.preventDefault();
                setInput((prev) => ({
                  ...prev,
                  id: row.original.id,
                  price: row.original.new_price_product,
                }));
                setOpenPromo(true);
                setIsProduct(false);
              }}
              type="button"
            >
              <PlusCircle className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

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
      <DialogDetailPromo
        open={openDialog}
        onCloseModal={() => {
          if (openDialog) {
            handleClose();
          }
        }}
        data={dataDetail?.data.data.resource.new_product}
        input={input}
        setInput={setInput}
        handleSubmit={handleUpdate}
      />
      <DialogCreatePromo
        open={openPromo}
        onCloseModal={() => {
          if (openPromo) {
            setOpenPromo(false);
            setInput({ id: "", name: "", discount: "0", price: 0 });
          }
        }}
        input={input}
        setInput={setInput}
        handleSubmit={handleCreate}
      />
      <DialogProduct
        open={isProduct}
        onCloseModal={() => {
          if (isProduct) {
            handleCloseProduct();
          }
        }}
        search={productSearch}
        setSearch={setProductSearch}
        refetch={refetchProduct}
        isRefetching={isRefetchingProduct}
        columns={columnProduct}
        dataTable={dataListProduct}
        page={pageProduct}
        metaPage={metaPageProduct}
        setPage={setPageProduct}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Slow Moving Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>List Promo Products</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Promo Products</h2>
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
                  onClick={(e) => {
                    e.preventDefault();
                    setIsProduct(true);
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <PlusCircle className={"w-4 h-4 mr-1"} />
                  Add Promo
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnListPromo} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
