"use client";

import {
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, setPaginate } from "@/lib/utils";
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
import { useGetListSOCategory } from "../_api/use-get-list-so-category";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Pagination from "@/components/pagination";
import { useAddProductSOCategory } from "../_api/use-add-product-so-category";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useGetListProductSOCategory } from "../_api/use-get-list-product-so-category";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const router = useRouter();
  const [isProduct, setIsProduct] = useState(false);
  const addRef = useRef<HTMLInputElement | null>(null);
  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);

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

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProductSOCategory();


  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isSuccess } =
    useGetListSOCategory({ p: page });

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isRefetching: isRefetchingProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
  } = useGetListProductSOCategory({ p: pageProduct, q: searchProductValue });

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

  const handleAddProduct = (barcode: string, type: string) => {
    const body = {
      type,
      barcode,
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

  // handling close end ----------------------------------------------------------------

  // handle add by input
  useEffect(() => {
    if (searchAddProductValue) {
      const foundProduct = dataListProduct?.find(
        (item) => item.barcode === searchAddProductValue
      );
      const type = foundProduct?.type || "manual";
      handleAddProduct(searchAddProductValue, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      accessorKey: "barcode",
      header: "Barcode",
    },
    {
      accessorKey: "name",
      header: "Product Name",
    },
    {
      accessorKey: "type",
      header: "Type",
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
      accessorKey: "type",
      header: "Type",
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
                handleAddProduct(row.original.barcode, row.original.type);
              }}
              type="button"
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
            <BreadcrumbItem>Inventory</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/stop-opname/category">
                Category
              </BreadcrumbLink>{" "}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Create</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-2 items-center w-full justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="ml-auto flex gap-2 items-center">
              <Button
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
                onClick={() =>
                  router.push("/inventory/stop-opname/category/create/add-product-manual")
                }
              >
                Add Product Manual
              </Button>
            </div>
          </div>
        </div>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5">
            <div
              className={cn(
                "w-full flex justify-between items-center relative group",
                "cursor-not-allowed"
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
                className={"opacity-0"}
                value={<p>Select Buyer First.</p>}
              >
                <Input
                  id="search"
                  ref={addRef}
                  className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100"
                  autoFocus
                  autoComplete="off"
                  value={addProductSearch}
                  onChange={(e) => setAddProductSearch(e.target.value)}
                />
              </TooltipProviderPage>
              <Button
                onClick={() => setIsProduct(true)}
                className="bg-sky-300/80 w-10 p-0 hover:bg-sky-300 text-black rounded-l-none border border-sky-300/80 hover:border-sky-300 focus-visible:ring-0 disabled:opacity-100"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-none bg-white rounded-md overflow-hidden shadow p-5">
            <TooltipProviderPage value={"Reload Data"}>
              <Button
                onClick={() => refetch()}
                className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                variant={"outline"}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn("w-4 h-4", isRefetching ? "animate-spin" : "")}
                />
              </Button>
            </TooltipProviderPage>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
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
