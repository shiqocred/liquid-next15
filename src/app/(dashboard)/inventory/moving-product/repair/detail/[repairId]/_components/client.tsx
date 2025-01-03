"use client";

import {
  ArrowLeft,
  Edit,
  FileDown,
  Loader2,
  Printer,
  Recycle,
  RefreshCw,
  ScanBarcode,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { useGetDetailRepair } from "../_api/use-get-detail-repair";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useToDisplay } from "../_api/use-to-display";
import { useUpdateeProduct } from "../_api/use-update-product";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound, useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGetDetailProductRepair } from "../_api/use-get-detail-product-repair";
import { useQueryClient } from "@tanstack/react-query";
import { useToQCD } from "../_api/use-to-qcd";
import { Badge } from "@/components/ui/badge";
import { useGetPriceProductRepair } from "../_api/use-get-price-product-repair";

const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});

const DialogEditProduct = dynamic(() => import("./dialog-edit-product"), {
  ssr: false,
});

export const Client = () => {
  const { repairId } = useParams();

  const queryClient = useQueryClient();

  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [productId, setProductId] = useState("");
  const [input, setInput] = useState({
    barcode: "",
    name: "",
    category: "",
    color: "",
    qty: "",
    total: "0",
    custom: "0",
  });

  // confirm strat ----------------------------------------------------------------

  const [ToDisplayDialog, confirmToDisplay] = useConfirm(
    "To Display Product",
    "This action cannot be undone",
    "liquid"
  );

  const [ToQCDDialog, confirmToQCD] = useConfirm(
    "To QCD Product",
    "This action cannot be undone",
    "destructive"
  );

  // confirm end ----------------------------------------------------------------

  // mutate strat ----------------------------------------------------------------

  const { mutate: mutateToDisplay, isPending: isPendingToDisplay } =
    useToDisplay();

  const { mutate: mutateUpdateProduct, isPending: isPendingUpdateProduct } =
    useUpdateeProduct();

  const { mutate: mutateToQCD, isPending: isPendingToQCD } = useToQCD();

  // mutate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, refetch, isRefetching, error, isError, isLoading } =
    useGetDetailRepair({
      id: repairId,
    });

  const {
    data: dataProduct,
    error: errorProduct,
    isError: isErrorProduct,
    isSuccess: isSuccessProduct,
    isLoading: isLoadingProduct,
  } = useGetDetailProductRepair({ id: productId });

  const priceDebounce = useDebounce(input.total);

  const {
    data: dataPrice,
    error: errorPrice,
    isError: isErrorPrice,
    isSuccess: isSuccessPrice,
  } = useGetPriceProductRepair({ price: priceDebounce });

  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataRes: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.repair_products;
  }, [data]);

  const dataListCategories: any[] = useMemo(() => {
    return dataPrice?.data.data.resource.category ?? [];
  }, [dataPrice]);

  // memo end ----------------------------------------------------------------

  // paginate strat ----------------------------------------------------------------

  useEffect(() => {
    const dataResource = dataProduct?.data.data.resource;
    if (isSuccessProduct && dataProduct) {
      setInput({
        barcode: dataResource?.new_barcode_product ?? "",
        name: dataResource?.new_name_product ?? "",
        category: dataResource?.new_category_product ?? "",
        color: dataResource?.new_tag_product ?? "",
        qty: dataResource?.new_quantity_product ?? "",
        total: Math.round(dataResource?.old_price_product).toString() ?? "0",
        custom: Math.round(dataResource?.new_price_product).toString() ?? "0",
      });
    }
  }, [dataProduct]);

  useEffect(() => {
    const dataResource = dataPrice?.data.data.resource.warna;
    if (isSuccessPrice && dataPrice) {
      setInput((prev) => ({
        ...prev,
        color: dataResource?.name_color ?? "",
        custom: dataResource?.fixed_price_color ?? "0",
      }));
    }
  }, [dataPrice]);

  // paginate end ----------------------------------------------------------------

  // handling action strat ----------------------------------------------------------------

  const handleToDisplay = async (id: string) => {
    const ok = await confirmToDisplay();

    if (!ok) return;

    mutateToDisplay(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-repair", repairId],
          });
        },
      }
    );
  };

  const handleUpdateProduct = async () => {
    const body = {
      new_barcode_product: input.barcode,
      new_category_product:
        parseFloat(input.total) >= 100000 ? input.category : "",
      new_name_product: input.name,
      new_quantity_product: input.qty,
      new_tag_product: parseFloat(input.total) < 100000 ? input.color : "",
      old_price_product: input.total,
    };
    mutateUpdateProduct(
      { id: productId, body },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-repair", repairId],
          });
        },
      }
    );
  };

  const handleToQCD = async (id: any) => {
    const ok = await confirmToQCD();

    if (!ok) return;
    mutateToQCD(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["list-detail-repair", repairId],
          });
        },
      }
    );
  };

  // handling action end ----------------------------------------------------------------

  // handling close strat ----------------------------------------------------------------

  // handling close end ----------------------------------------------------------------

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
      data: "Detail Product",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  // handle error price
  useEffect(() => {
    alertError({
      isError: isErrorPrice,
      error: errorPrice as AxiosError,
      data: "Price",
      action: "get data",
      method: "GET",
    });
  }, [isErrorPrice, errorPrice]);

  useEffect(() => {
    if (isNaN(parseFloat(input.total))) {
      setInput((prev) => ({ ...prev, total: "0" }));
    }
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
  }, [input]);

  const columnRepair: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
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
        <div className="max-w-[500px] hyphens-auto">
          {row.original.new_name_product}
        </div>
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
      accessorKey: "new_price_product",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.new_price_product),
    },
    {
      accessorKey: "new_status_product",
      header: () => <div className="text-center">Price</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="bg-sky-400/80 hover:bg-sky-400/80 text-black rounded font-normal capitalize">
            {row.original.new_status_product.split("_").join(" ")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={"Edit"}>
            <Button
              className="w-9 px-0 items-center border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
              variant={"outline"}
              type="button"
              disabled={
                isPendingUpdateProduct || isPendingToDisplay || isPendingToQCD
              }
              onClick={() => {
                setProductId(row.original.id);
                setIsOpen(true);
              }}
            >
              {isPendingUpdateProduct ||
              isPendingToDisplay ||
              isPendingToQCD ? (
                <Loader2 className="w-4 h-4" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={"To Display"}>
            <Button
              className="w-9 px-0 items-center border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50"
              variant={"outline"}
              type="button"
              disabled={
                isPendingUpdateProduct || isPendingToDisplay || isPendingToQCD
              }
              onClick={() => {
                handleToDisplay(row.original.id);
              }}
            >
              {isPendingUpdateProduct ||
              isPendingToDisplay ||
              isPendingToQCD ? (
                <Loader2 className="w-4 h-4" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={"QCD"}>
            <Button
              className="w-9 px-0 items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
              variant={"outline"}
              type="button"
              disabled={
                isPendingUpdateProduct || isPendingToDisplay || isPendingToQCD
              }
              onClick={() => {
                handleToQCD(row.original.id);
              }}
            >
              {isPendingUpdateProduct ||
              isPendingToDisplay ||
              isPendingToQCD ? (
                <Loader2 className="w-4 h-4" />
              ) : (
                <Recycle className="w-4 h-4" />
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

  if (!isMounted || isLoading) {
    return <Loading />;
  }

  if (isError && (error as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }
  if (isError && (error as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 py-4">
      <ToDisplayDialog />
      <ToQCDDialog />
      <DialogEditProduct
        open={isOpen}
        onCloseModal={() => {
          if (isOpen) {
            setIsOpen(false);
            setProductId("");
            setInput({
              barcode: "",
              name: "",
              category: "",
              color: "",
              qty: "",
              total: "0",
              custom: "0",
            });
          }
        }}
        input={input}
        setInput={setInput}
        handleSubmit={handleUpdateProduct}
        categories={dataListCategories}
        isLoading={isLoadingProduct}
      />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
          }
        }}
        open={barcodeOpen}
        oldPrice={input.total ?? "0"}
        barcode={data?.data.data.resource.barcode ?? ""}
        category={input.name ?? ""}
        newPrice={input.custom ?? "0"}
        handleCancel={() => {
          setBarcodeOpen(false);
        }}
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
            <BreadcrumbItem>Moving Product</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/inventory/moving-product/repair">
                Repair
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Detail</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/inventory/moving-product/repair">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Detail Repair</h1>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
            <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
              <div className="flex items-center gap-4">
                <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                  <ScanBarcode className="size-4" />
                </div>
                <h5 className="font-bold text-xl">
                  {data?.data.data.resource.barcode}
                </h5>
              </div>
              <div className="flex gap-4">
                <TooltipProviderPage value={"Reload Data"}>
                  <Button
                    onClick={() => refetch()}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                    // disabled={isPendingSubmit || isRefetching}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4",
                        isRefetching ? "animate-spin" : ""
                      )}
                    />
                  </Button>
                </TooltipProviderPage>
                <TooltipProviderPage value={"Export Data"}>
                  <Button
                    onClick={() => refetch()}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                    variant={"outline"}
                    // disabled={isPendingSubmit || isRefetching}
                  >
                    <FileDown className="w-4 h-4" />
                  </Button>
                </TooltipProviderPage>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBarcodeOpen(true);
                  }}
                  variant={"outline"}
                  className="border-sky-400/80 hover:border-sky-400 hover:bg-sky-50 text-black"
                >
                  <Printer className="size-4 mr-1" />
                  Barcode
                </Button>
              </div>
            </div>
            <div className="flex w-full gap-4">
              <div className="flex flex-col gap-1 w-full">
                <Label>Repair Name</Label>
                <Input
                  className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                  placeholder="Repair Name..."
                  value={dataRes?.repair_name}
                  disabled
                />
              </div>
              <div className="w-full flex gap-4">
                <div className="w-full flex flex-col gap-1">
                  <Label>Total Price</Label>
                  <Input
                    className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                    value={formatRupiah(parseFloat(dataRes?.total_price))}
                    disabled
                  />
                </div>
                <div className="w-full flex flex-col gap-1">
                  <Label>Custom Price</Label>
                  <Input
                    className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline disabled:opacity-100 disabled:cursor-default"
                    value={formatRupiah(
                      parseFloat(dataRes?.total_custom_price)
                    )}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
            <div className="flex w-full gap-4 items-center">
              <h5 className="pr-5 border-b border-gray-500 text-lg h-fit font-bold">
                List Product Filtered
              </h5>
            </div>
            <DataTable
              isLoading={isRefetching}
              columns={columnRepair}
              data={dataList ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
