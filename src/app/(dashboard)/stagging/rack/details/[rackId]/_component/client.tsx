"use client";

import {
  Loader2,
  Monitor,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useAddProduct } from "../_api/use-add-product";
import { useRemoveProduct } from "../_api/use-remove-product";
import { useGetListChasier } from "../_api/use-get-list-cashier";
import { useGetListProduct } from "../_api/use-get-list-product";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const [isProduct, setIsProduct] = useState(false);
  const [dynamicMessage, setDynamicMessage] = useState(
    "This action cannot be undone"
  );
  const addRef = useRef<HTMLInputElement | null>(null);

  const [input, setInput] = useState({
    discount: "0",
    buyer: "",
    buyerPhone: "",
    buyerAddress: "",
    buyerId: "",
    price: "0",
    cartonQty: "0",
    cartonUnit: "0",
    voucher: "0",
    ppnActive: 0,
    discountFor: "",
    buyerRank: "",
    nextBuyerRank: "",
    nextTransactionBuyerRank: "",
    currentTransactionBuyerRank: "",
    percentage_discount: "0",
  });
  const [inputEdit, setInputEdit] = useState({
    id: "",
    price: "0",
  });

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
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

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );

  const [AddProductDialog, confirmAddProduct] = useConfirm(
    "Confirm Add Product",
    dynamicMessage,
    "liquid"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();

  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveProduct();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListChasier({ p: page, q: search });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProduct({ p: pageProduct, q: searchProductValue });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
    setInput((prev) => ({
      ...prev,
      buyerAddress: data?.data.data.resource.buyer_address,
      buyerPhone: data?.data.data.resource.buyer_phone,
      buyer: data?.data.data.resource.sale_buyer_name,
      buyerId: data?.data.data.resource.sale_buyer_id,
      discount: Math.round(
        data?.data.data.resource.data?.[0]?.new_discount_sale ?? "0"
      ).toString(),
      discountFor: data?.data.data.resource.data?.[0]?.type_discount ?? "",
      price: Math.round(data?.data.data.resource.total_sale ?? "0").toString(),
      buyerRank: data?.data.data.resource.rank,
      nextBuyerRank: data?.data.data.resource.next_rank,
      nextTransactionBuyerRank: data?.data.data.resource.transaction_next,
      currentTransactionBuyerRank: data?.data.data.resource.current_transaction,
      percentage_discount: Math.round(
        data?.data.data.resource.percentage_discount ?? "0"
      ).toString(),
    }));
  }, [data]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPageProduct,
      setMetaPage: setMetaPageProduct,
    });
  }, [dataProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleAddProduct = (barcode: string) => {
    const body = {
      buyer_id: input.buyerId,
      new_discount_sale: input.discount,
      type_discount: input.discountFor,
      sale_barcode: barcode,
    };
    mutateAddProduct(
      { body },
      {
        onSuccess: () => {
          if (addRef.current) {
            addRef.current.focus();
          }
          setAddProductSearch("");
          handleCloseProduct();
        },
        onError: async (err: any) => {
          if (err?.status === 404) {
            setDynamicMessage("Product tidak ada");
            await confirmAddProduct();
            return;
          }

          const resource = (err?.response?.data?.data as any)?.resource ?? {};
          const barcodeMsg = resource.barcode ?? "-";
          const systemPrice = resource.price_now
            ? `Rp ${formatRupiah(resource.price_now)}`
            : "-";
          const ExpectPrice = resource.expected_price
            ? `Rp ${formatRupiah(resource.expected_price)}`
            : "-";
          const message = `
          ⚠️ UNMATCHED PRICE\n
          Barcode : ${barcodeMsg}
          Harga sistem : ${systemPrice}
          Harga seharusnya : ${ExpectPrice}`;

          setDynamicMessage(message);
          const ok = await confirmAddProduct();
          const desc = document.querySelector("[data-confirm-message]");
          if (desc) desc.textContent = message;
          if (!ok) return;
          mutateAddProduct({ body });
        },
      }
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

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

  // handling close end ----------------------------------------------------------------

  useEffect(() => {
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev: any) => ({ ...prev, discount: "0", discountFor: "" }));
    }
    if (parseFloat(input.discount) === 0 && input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "" }));
    }
    if (parseFloat(input.discount) > 0 && !input.discountFor) {
      setInput((prev: any) => ({ ...prev, discountFor: "old" }));
    }
    if (isNaN(input.ppnActive)) {
      setInput((prev) => ({ ...prev, ppnActive: 0 }));
    }
    if (!input.buyerId && isProduct) {
      setIsProduct(false);
    }
  }, [input]);

  useEffect(() => {
    if (isNaN(parseFloat(inputEdit.price))) {
      setInputEdit((prev) => ({ ...prev, price: "0" }));
    }
  }, [inputEdit]);

  // handle add by input
  useEffect(() => {
    if (searchAddProductValue) {
      handleAddProduct(searchAddProductValue);
    }
  }, [searchAddProductValue]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle error product
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  const columnSales: ColumnDef<any>[] = [
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
      accessorKey: "product_barcode_sale",
      header: "Barcode",
    },
    {
      accessorKey: "product_name_sale",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_name_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_category_sale",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_category_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_qty_sale",
      header: "Qty",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.product_qty_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_price_sale",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.product_price_sale)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <Button
            className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
            variant={"outline"}
            type="button"
            disabled={isPendingRemoveProduct}
            onClick={() => {
              handleRemoveProduct(row.original.id);
            }}
          >
            {isPendingRemoveProduct ? (
              <Loader2 className="w-4 h-4 mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1" />
            )}
            <div>Delete</div>
          </Button>
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
      accessorKey: "barcode",
      header: "Barcode",
    },
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
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
                handleAddProduct(row.original.barcode);
              }}
              type="button"
              disabled={isPendingAddProduct}
            >
              {isPendingAddProduct ? (
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
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <DeleteProductDialog />
      <AddProductDialog />
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
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Stagging</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/stagging/rack">Rack</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Detail Rack</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5">
            <div className="w-full flex justify-between items-center">
              <div
                className={cn(
                  "flex items-center gap-2 relative group w-full max-w-xl"
                  // !input.buyer && "cursor-not-allowed"
                )}
              >
                <Label
                  htmlFor="search"
                  className="flex gap-2 absolute left-2 items-center"
                >
                  <Badge className="bg-black text-xs hover:bg-black rounded-full text-white">
                    Add Product
                  </Badge>
                </Label>

                <TooltipProviderPage
                  className={cn(!input.buyer ? "opacity-100" : "opacity-0")}
                  value={<p>Select Buyer First.</p>}
                >
                  <Input
                    id="search"
                    ref={addRef}
                    className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100 w-full"
                    autoFocus
                    autoComplete="off"
                    // disabled={!input.buyer || isPendingSubmit}
                    value={addProductSearch}
                    onChange={(e) => setAddProductSearch(e.target.value)}
                  />
                </TooltipProviderPage>

                <Button
                  // disabled={!input.buyer || isPendingSubmit}
                  onClick={() => setIsProduct(true)}
                  className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => refetch()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                  disabled={isRefetching}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  // onClick={() => router.push("/stagging/display")}
                >
                  <Monitor className="size-4" />
                  To Display
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
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
                    className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <DataTable
            isLoading={isRefetching}
            columns={columnSales}
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
