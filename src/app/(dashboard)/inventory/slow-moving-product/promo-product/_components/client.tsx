"use client";

import {
  AlertCircle,
  CalendarX,
  Loader,
  Loader2,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  ScanBarcode,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn, formatRupiah } from "@/lib/utils";
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
// import { useConfirm } from "@/hooks/use-confirm";
import { useGetListPromo } from "../_api/use-get-list-promo";
// import { useDeleteProductSlow } from "../_api/use-delete-product-slow";
import { useExportSlow } from "../_api/use-export-product-slow";
// import { useQueryClient } from "@tanstack/react-query";
import { useGetDetailPeoductSlow } from "../_api/use-get-detail-product-slow";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";

export const Client = () => {
  // const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [productId, setProductId] = useQueryState("productId", {
    defaultValue: "",
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

  // const [DeleteDialog, confirmDelete] = useConfirm(
  //   "Delete Product",
  //   "This action cannot be undone",
  //   "liquid"
  // );

  // const { mutate: mutateDelete } = useDeleteProductSlow();
  const { mutate: mutateExport, isPending: isPendingExport } = useExportSlow();

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
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
  } = useGetDetailPeoductSlow({ id: productId });

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const detailData: any = useMemo(() => {
    return dataDetail?.data.data.resource;
  }, [dataDetail]);

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

  // const handleDelete = async (id: any) => {
  //   const ok = await confirmDelete();

  //   if (!ok) return;

  //   mutateDelete(
  //     { id },
  //     {
  //       onSuccess: () => {
  //         queryClient.invalidateQueries({
  //           queryKey: ["detail-product-slow", id],
  //         });
  //         queryClient.invalidateQueries({ queryKey: ["list-product-slow"] });
  //       },
  //     }
  //   );
  // };

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

  const handleClose = () => {
    setOpenDialog(false);
    setProductId("");
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
        <div className="tabular-nums">
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
      header: "Promo Price",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.price_promo)}
        </div>
      ),
    },
    {
      accessorKey: "new_product.new_status_product",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge className="rounded justify-center text-black font-normal capitalize bg-sky-300/80 hover:bg-sky-300/80">
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
                setProductId(row.original.id);
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
          {/* <TooltipProviderPage value={<p>Delete</p>}>
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
          </TooltipProviderPage> */}
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
      {/* <DeleteDialog /> */}
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
      <div className="w-full p-4 rounded flex items-center bg-red-300">
        <AlertCircle className="size-4 mr-2" />
        <p>Baru tampilan utama</p>
      </div>
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
                    handleExport();
                  }}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  disabled={isPendingExport}
                  variant={"outline"}
                >
                  {isPendingExport ? (
                    <Loader2 className={"w-4 h-4 animate-spin mr-1"} />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
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
      <Dialog
        open={openDialog}
        onOpenChange={() => {
          handleClose();
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Product</DialogTitle>
          </DialogHeader>
          {isLoadingDetail ? (
            <div className="w-full h-[275px] flex items-center justify-center">
              <Loader className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="w-full flex flex-col border rounded border-gray-500 p-3 gap-2">
              <div className="flex items-center text-sm font-semibold border-b border-gray-500 pb-3">
                <ScanBarcode className="w-5 h-5 mr-2" />
                <div className="w-full flex justify-between items-center">
                  Barcode:
                  <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                    {detailData?.old_barcode_product}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3 flex-col my-4">
                <div className="flex flex-col w-full overflow-hidden gap-0.5">
                  <p className="text-sm font-medium">Name Product</p>
                  <p className="text-sm w-full whitespace-pre-wrap min-h-9 py-2 leading-relaxed flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                    {detailData?.new_name_product}
                  </p>
                </div>
                <div className="w-full flex gap-4">
                  <div className="flex flex-col w-1/3 overflow-hidden gap-0.5">
                    <p className="text-sm font-medium">Qty</p>
                    <p className="text-sm w-full whitespace-pre-wrap min-h-9 flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                      {parseFloat(
                        detailData?.new_quantity_product ?? "0"
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col w-2/3 overflow-hidden gap-0.5">
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm w-full whitespace-pre-wrap min-h-9 flex items-center px-3 border-b border-sky-400/80 text-gray-600">
                      {formatRupiah(
                        parseFloat(detailData?.old_price_product ?? "0")
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm font-semibold border-t justify-between border-gray-500 pt-3">
                <CalendarX className="w-5 h-5 mr-2" />
                <div className="w-full flex justify-between items-center">
                  Experied Date:
                  <Badge className="bg-gray-200 hover:bg-gray-200 border border-black rounded-full text-black">
                    {detailData?.new_date_in_product}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="w-full flex justify-end">
            <Button
              className="bg-transparent hover:bg-transparent text-black border-black/50 border hover:border-black"
              onClick={(e) => {
                e.preventDefault();
                handleClose();
              }}
              type="button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};