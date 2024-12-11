"use client";

import {
  Loader2,
  PackageOpen,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  Unplug,
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
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListQCD } from "../_api/use-get-list-qcd";
import { useScrapQCD } from "../_api/use-scrap-qcd";
import Pagination from "@/components/pagination";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useGetDetailQCD } from "../_api/use-get-detail-qcd";
import { useExportDetailQCD } from "../_api/use-export-detail-qcd";
import { useUnbundleQCD } from "../_api/use-unbundle-qcd";
import { toast } from "sonner";

const SheetDetail = dynamic(() => import("./sheet-detail"), {
  ssr: false,
});
const DialogBarcode = dynamic(() => import("./dialog-barcode"), {
  ssr: false,
});

export const Client = () => {
  // dialog barcode
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  // state barcode
  const [metaBarcode, setMetaBarcode] = useState({
    barcode: "",
    newPrice: "",
    oldPrice: "",
    category: "",
  });

  // sheet detail
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // qcdId for detail
  const [qcdId, setQcdId] = useQueryState("qcdId", {
    defaultValue: "",
  });

  // data search, page
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  // donfirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Scrap QCD",
    "This action cannot be undone",
    "destructive"
  );
  // donfirm unbundle
  const [UnbundleDialog, confirmUnbundle] = useConfirm(
    "Unbundle QCD",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } = useScrapQCD();
  const { mutate: mutateUnbundle, isPending: isPendingUnbundle } =
    useUnbundleQCD();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportDetailQCD();

  // get data utama
  const {
    data,
    refetch,
    isLoading,
    isRefetching,
    isPending,
    error,
    isError,
    isSuccess,
  } = useGetListQCD({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataQCD,
    isLoading: isLoadingQCD,
    refetch: refetchQCD,
    isRefetching: isRefetchingQCD,
    isError: isErrorQCD,
    error: errorQCD,
  } = useGetDetailQCD({ id: qcdId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // memo product detail list
  const dataListDetail: any[] = useMemo(() => {
    return dataQCD?.data.data.resource.product_qcds;
  }, [dataQCD]);

  // memo product detail list
  const dataMetaDetail: any = useMemo(() => {
    return dataQCD?.data.data.resource;
  }, [dataQCD]);

  // load data
  const loadingDetail = isLoadingQCD || isRefetchingQCD;

  // get pagetination
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

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete(
      { id },
      {
        onSuccess: () => {
          setQcdId("");
          setOpenDetail(false);
        },
      }
    );
  };

  // handle unbunlde
  const handleUnbundle = async (id: any) => {
    const ok = await confirmUnbundle();

    if (!ok) return;

    mutateUnbundle(
      { id },
      {
        onSuccess: () => {
          setQcdId("");
          setOpenDetail(false);
        },
      }
    );
  };

  // handle close
  const handleClose = () => {
    setOpenDetail(false);
    setQcdId("");
  };

  // handle export
  const handleExport = async () => {
    mutateExport(
      { id: qcdId },
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

  // isError get Detail
  useEffect(() => {
    if (isErrorQCD && (errorQCD as AxiosError).status === 403) {
      toast.error(`Error 403: Restricted Access`);
    }
    if (isErrorQCD && (errorQCD as AxiosError).status !== 403) {
      toast.error(
        `ERROR ${(errorQCD as AxiosError).status}: QCD failed to get Data`
      );
      console.log("ERROR_GET_QCD:", errorQCD);
    }
  }, [isErrorQCD, errorQCD]);

  // column data
  const columnListQCD: ColumnDef<any>[] = [
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
      accessorKey: "barcode_bundle",
      header: "Barcode",
    },
    {
      accessorKey: "name_bundle",
      header: "QCD Name",
      cell: ({ row }) => (
        <div className="max-w-[500px]">{row.original.name_bundle}</div>
      ),
    },
    {
      accessorKey: "total_product_bundle",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_product_bundle.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "total_price_custom_bundle",
      header: "Total Price",
      cell: ({ row }) => formatRupiah(row.original.total_price_custom_bundle),
    },
    {
      accessorKey: "product_status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Badge className="rounded text-black font-normal capitalize bg-sky-400/80 hover:bg-sky-400/80">
            {row.original.product_status}
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
              onClick={(e) => {
                e.preventDefault();
                setOpenDetail(true);
                setQcdId(row.original.id);
              }}
            >
              <ReceiptText className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Unbundle</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-orange-400 text-orange-700 hover:text-orange-700 hover:bg-orange-50 disabled:opacity-100 disabled:hover:bg-orange-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingUnbundle}
              onClick={(e) => {
                e.preventDefault();
                handleUnbundle(row.original.id);
              }}
            >
              {isPendingUnbundle ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackageOpen className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>To Scrap</p>}>
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
                <Unplug className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
        </div>
      ),
    },
  ];

  // column data detail
  const columnQCDDetail: ColumnDef<any>[] = [
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
      accessorKey: "code_document",
      header: "Document Code",
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
      accessorKey: "new_price_product??old_price_product",
      header: "Price",
      cell: ({ row }) =>
        formatRupiah(
          row.original.new_price_product ?? row.original.old_price_product
        ),
    },
    {
      accessorKey: "new_status_product",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Badge className="rounded text-black font-normal capitalize bg-sky-400/80 hover:bg-sky-400/80">
            {row.original.new_status_product.split("_").join(" ")}
          </Badge>
        </div>
      ),
    },
  ];

  // loading
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
      <UnbundleDialog />
      <DialogBarcode
        onCloseModal={() => {
          if (barcodeOpen) {
            setBarcodeOpen(false);
            setMetaBarcode({
              barcode: "",
              category: "",
              newPrice: "",
              oldPrice: "",
            });
          }
        }}
        open={barcodeOpen}
        oldPrice={metaBarcode.oldPrice ?? "0"}
        barcode={metaBarcode.barcode ?? ""}
        category={metaBarcode.category ?? ""}
        newPrice={metaBarcode.newPrice ?? "0"}
        handleCancel={() => {
          setBarcodeOpen(false);
          setMetaBarcode({
            barcode: "",
            category: "",
            newPrice: "",
            oldPrice: "",
          });
        }}
      />
      <SheetDetail
        open={openDetail}
        onCloseModal={() => {
          if (openDetail) {
            handleClose();
          }
        }}
        setOpenBarcode={setBarcodeOpen}
        setMetaBarcode={setMetaBarcode}
        data={dataMetaDetail}
        isLoading={isLoadingQCD}
        refetch={refetchQCD}
        isRefetching={loadingDetail}
        columns={columnQCDDetail}
        dataTable={dataListDetail ?? []}
        isPendingExport={isPendingExport}
        handleExport={handleExport}
        handleScrap={() => handleDelete(qcdId)}
        handleUnbundle={() => handleUnbundle(qcdId)}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Repair Station</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>QCD</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List QCD</h2>
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
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/repair-station/qcd/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Create
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnListQCD} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
