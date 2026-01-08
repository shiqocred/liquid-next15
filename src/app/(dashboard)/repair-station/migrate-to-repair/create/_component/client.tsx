"use client";

import {
  ArrowRightFromLine,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  ScanBarcode,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useQueryState } from "nuqs";
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
import { useGetListProduct } from "../_api/use-get-list-product";
import { toast } from "sonner";
import { usePagination } from "@/lib/pagination";
import { useGetListFilterCreateMC } from "../_api/use-get-list-filter-create-mc";
import { useCreateMC } from "../_api/use-create-mc";
import { useRemoveFilterCreateMC } from "../_api/use-remove-filter-create-mc";
import { DialogDesc } from "./dialog-desc";

const DialogProduct = dynamic(() => import("./dialog-product"), {
  ssr: false,
});

export const Client = () => {
  const [isProduct, setIsProduct] = useState(false);
  const addRef = useRef<HTMLInputElement | null>(null);
  const [openDesc, setOpenDesc] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [description, setDescription] = useState("");

  // search, debounce, paginate strat ----------------------------------------------------------------

  const [addProductSearch, setAddProductSearch] = useState("");
  const searchAddProductValue = useDebounce(addProductSearch);
  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const [productSearch, setProductSearch] = useState("");
  const searchProductValue = useDebounce(productSearch);
  const { metaPage, page, setPage } = usePagination();
  const {
    metaPage: metaPageProduct,
    page: pageProduct,
    setPage: setPageProduct,
    setPagination: setPaginationProduct,
  } = usePagination();

  // search, debounce, paginate end ----------------------------------------------------------------

  // confirm strat ----------------------------------------------------------------

  const [DeleteProductDialog, confirmDeleteProduct] = useConfirm(
    "Remove product from Filter",
    "This action cannot be undone",
    "destructive"
  );

  const [CreateMigrateDialog, confirmCreateMigrate] = useConfirm(
    "Create Migrate to Repair",
    "This action cannot be undone",
    "liquid"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateAddProduct, isPending: isPendingAddProduct } =
    useAddProduct();
  const { mutate: mutateRemoveProduct, isPending: isPendingRemoveProduct } =
    useRemoveFilterCreateMC();
  const { mutate: mutateCreateMigrate, isPending: isPendingCreateMigrate } =
    useCreateMC();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError } =
    useGetListFilterCreateMC({
      p: page,
      q: search,
    });

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

  const dataDetail: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.migrate_bulky_products;
  }, [data]);

  console.log("dataList", dataList);

  const dataListProduct: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------
  // useEffect(() => {
  //   if (data && isSuccess) {
  //     setPagination(data?.data.data.resource.products);
  //   }
  // }, [data, isSuccess]);

  useEffect(() => {
    if (dataProduct && isSuccessProduct) {
      setPaginationProduct(dataProduct?.data.data.resource);
    }
  }, [dataProduct, isSuccessProduct]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  // const handleAddProduct = (barcode: string, description: string) => {
  //   const body = {
  //     product_id: rackId,
  //     barcode: barcode,
  //     description: description,
  //     source: "staging",
  //   };
  //   mutateAddProduct(
  //     { body },
  //     {
  //       onSuccess: () => {
  //         if (addRef.current) {
  //           addRef.current.focus();
  //         }
  //         setAddProductSearch("");
  //         handleCloseProduct();
  //       },
  //       onError: async (err: any) => {
  //         toast.error(
  //           `ERROR ${err?.status}: ${
  //             (err.response?.data as any).message || "Product failed to add"
  //           } `
  //         );
  //       },
  //     }
  //   );
  // };

  const handleAddProduct = (barcode: string) => {
    setSelectedBarcode(barcode);
    setDescription("");
    setOpenDesc(true);
  };

  const handleSubmitDesc = () => {
    const body = {
      description,
      barcode: selectedBarcode,
    };

    mutateAddProduct(
      { body },
      {
        onSuccess: () => {
          setOpenDesc(false);
          setSelectedBarcode("");
          setDescription("");
          refetch();
        },
        onError: (err: any) => {
          toast.error(
            `ERROR ${err?.status}: ${
              err.response?.data?.message || "Product failed to add"
            }`
          );
        },
      }
    );
  };

  const handleRemoveProduct = async (id: any) => {
    const ok = await confirmDeleteProduct();

    if (!ok) return;

    mutateRemoveProduct({ id });
  };

  const handleCreateMigrate = async () => {
    const ok = await confirmCreateMigrate();

    if (!ok) return;

    mutateCreateMigrate({});
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  const handleCloseProduct = () => {
    setIsProduct(false);
    setProductSearch("");
  };

  // handling close end ----------------------------------------------------------------

  // handle add by input
  // useEffect(() => {
  //   if (searchAddProductValue) {
  //     handleAddProduct(searchAddProductValue);
  //   }
  // }, [searchAddProductValue]);
  useEffect(() => {
    if (searchAddProductValue) {
      handleAddProduct(searchAddProductValue);
      setAddProductSearch("");
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

  const columnMigrateToRepair: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(row.index + 1).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "new_barcode_product",
      header: "Barcode",
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
      header: "Description",
      accessorKey: "new_quality",
      cell: ({ row }) => {
        let desc = "-";

        try {
          const quality = JSON.parse(row.original.new_quality);
          desc = quality?.migrate ?? "-";
        } catch {
          desc = "-";
        }

        return <div className="max-w-[300px] break-all capitalize">{desc}</div>;
      },
    },

    {
      accessorKey: "new_category_product",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_category_product}
        </div>
      ),
    },
    {
      accessorKey: "new_quantity_product",
      header: "Qty",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_quantity_product}
        </div>
      ),
    },
    {
      accessorKey: "new_price_product",
      header: "Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.new_price_product)}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"remove it"}>
            <Button
              className="items-center border-red-400 text-red-500 hover:bg-red-50 p-0 w-9 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
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
                <ArrowRightFromLine className="w-4 h-4 mr-1" />
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
      accessorKey: "new_barcode_product",
      header: "Barcode",
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
      accessorKey: "new_category_product",
      header: "Category",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">
          {row.original.new_category_product}
        </div>
      ),
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
                handleAddProduct(row.original.new_barcode_product);
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
      <CreateMigrateDialog />
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
      <DialogDesc
        isOpen={openDesc}
        handleClose={() => setOpenDesc(false)}
        barcode={selectedBarcode}
        description={description}
        setDescription={setDescription}
        isLoading={isPendingAddProduct}
        handleSubmit={handleSubmitDesc}
      />
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Repair Station</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/repair-station/migrate-to-repair">
                Migrate to Repair
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Create</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex w-full gap-4">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
            <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
              <div className="flex items-center gap-4">
                <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                  <ScanBarcode className="size-4" />
                </div>
                <h5 className="font-bold text-xl">
                  {dataDetail?.code_document}
                </h5>
              </div>
              <div className="flex gap-4 items-center">
                <TooltipProviderPage value={"Reload Data"}>
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
                </TooltipProviderPage>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black ml-auto disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    onClick={() => {
                      handleCreateMigrate();
                    }}
                    disabled={isPendingCreateMigrate}
                  >
                    {isPendingCreateMigrate ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Create Migrate
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-4">
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col">
                  <p className="text-sm">Name</p>
                  <p className="font-semibold">{dataDetail?.name_user}</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">Status</p>
                  <p className="font-semibold">{dataDetail?.status_bulky} </p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-500 w-full pt-3 mt-5">
              <div className="w-full flex justify-between items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 relative group w-full max-w-xl"
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

                  <TooltipProviderPage value={"add product by barcode input"}>
                    <Input
                      id="search"
                      ref={addRef}
                      className="rounded-r-none border-r-0 pl-28 focus-visible:ring-0 focus-visible:border focus-visible:border-sky-300 border-sky-300/80 disabled:opacity-100 w-full"
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
                    className={cn(
                      "w-4 h-4",
                      isRefetching ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <DataTable
            isLoading={isRefetching}
            columns={columnMigrateToRepair}
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
