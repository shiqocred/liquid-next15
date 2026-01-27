"use client";

import {
  Loader2,
  Pencil,
  PlusCircle,
  ReceiptText,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListB2B } from "../_api/use-get-list-b2b";
import Pagination from "@/components/pagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetDetailB2B } from "../_api/use-get-detail-b2b";
import dynamic from "next/dynamic";
import { useDeleteB2B } from "../_api/use-delete-b2b";
import { useConfirm } from "@/hooks/use-confirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useExportDetailDataB2B } from "../_api/use-export-detail-data-b2b";
import { useScanSODocument } from "../_api/use-scan-so-document";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const router = useRouter();
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false),
  );

  const [b2bId, setB2BId] = useQueryState("B2BId", { defaultValue: "" });
  const [soDocumentInput, setSODocumentInput] = useState("");

  // donfirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete B2B",
    "This action cannot be undone",
    "destructive",
  );

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

  // mutate delete
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteB2B();
  const { mutate: mutateExport, isPending: isPendingExport } =
    useExportDetailDataB2B();
  const { mutate: mutateScanSO, isPending: isPendingScanSO } =
    useScanSODocument();

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
  } = useGetListB2B({ p: page, q: searchValue });

  // get data utama
  const {
    data: dataDetail,
    refetch: refetchDetail,
    isLoading: isLoadingDetail,
    isRefetching: isRefetchingDetail,
    error: errorDetail,
    isError: isErrorDetail,
  } = useGetDetailB2B({ id: b2bId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // memo data detail
  const dataListDetail: any[] = useMemo(() => {
    return dataDetail?.data.data.resource.bulky_sales;
  }, [dataDetail]);

  // memo data red detail
  const dataResDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource;
  }, [dataDetail]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
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

  useEffect(() => {
    alertError({
      isError: isErrorDetail,
      error: errorDetail as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetail, errorDetail]);

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    mutateDelete({ id });
  };

  // handle export
  const handleExport = async () => {
    mutateExport(
      { id: b2bId },
      {
        onSuccess: (res) => {
          const link = document.createElement("a");
          link.href = res.data.data.resource;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      },
    );
  };

  // handle scan SO Document
  const handleScanSODocument = (e: FormEvent) => {
    e.preventDefault();
    if (!soDocumentInput.trim()) return;

    mutateScanSO(
      { code_document: soDocumentInput },
      {
        onSuccess: () => {
          setSODocumentInput("");
        },
      },
    );
  };

  // column data
  const columnB2B: ColumnDef<any>[] = [
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
      accessorKey: "code_document_bulky",
      header: "Code Document",
    },
    {
      accessorKey: "name_document",
      header: "Name Document",
    },
    {
      accessorKey: "total_product_bulky",
      header: () => <div className="text-center">Total Product</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.total_product_bulky}
        </div>
      ),
    },
    {
      accessorKey: "total_old_price_bulky",
      header: () => <div className="text-center">Total Old Price</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {formatRupiah(row.original.total_old_price_bulky)}
        </div>
      ),
    },
    {
      accessorKey: "status_bulky",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded w-20 px-0 justify-center text-black font-normal capitalize",
              row.original.status_bulky.toLowerCase() === "selesai"
                ? "bg-green-400 hover:bg-green-400"
                : "bg-yellow-400 hover:bg-yellow-400",
            )}
          >
            {row.original.status_bulky}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status_so_text",
      header: "Status SO",
      cell: ({ row }) => {
        const status = row.original.status_so_text;
        return (
          <Badge
            className={cn(
              "shadow-none font-normal rounded-full capitalize text-black",
              status === "Sudah SO" && "bg-green-400/80 hover:bg-green-400/80",
              status === "Belum SO" && "bg-red-400/80 hover:bg-red-400/80",
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
          <TooltipProviderPage value={<p>Edit</p>}>
            {row.original.status_bulky.toLowerCase() !== "selesai" && (
              <Button
                className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50"
                variant={"outline"}
                onClick={() =>
                  router.push(`/outbond/b2b/edit/${row.original.id}`)
                }
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              // disabled={isLoadingDetail}
              // onClick={(e) => {
              //   e.preventDefault();
              //   setB2BId(row.original.id);
              //   setOpenDetail(true);
              // }}
              onClick={() =>
                router.push(`/outbond/b2b/detail/${row.original.id}`)
              }
            >
              {/* {isLoadingDetail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ( */}
              <ReceiptText className="w-4 h-4" />
              {/* // )} */}
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
  // column data detail
  const columnB2BDetail: ColumnDef<any>[] = [
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
      accessorKey: "barcode_bulky_sale",
      header: "Barcode",
    },
    {
      accessorKey: "name_product_bulky_sale",
      header: () => <div className="text-center">Product Name</div>,
      cell: ({ row }) => (
        <div className="max-w-[400px] break-all">
          {row.original.name_product_bulky_sale}
        </div>
      ),
    },
    {
      accessorKey: "product_category_bulky_sale",
      header: "Category",
    },
    {
      accessorKey: "old_price_bulky_sale",
      header: "Price",
      cell: ({ row }) => formatRupiah(row.original.old_price_bulky_sale),
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
      <DialogDetail
        open={openDetail} // open modal
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
            setB2BId("");
          }
        }} // handle close modal
        data={dataResDetail}
        isLoading={isLoadingDetail}
        refetch={refetchDetail}
        isRefetching={isRefetchingDetail}
        columns={columnB2BDetail}
        dataTable={dataListDetail ?? []}
        isPendingExport={isPendingExport}
        handleExport={handleExport}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>B2B</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
        <h3 className="text-lg font-semibold">SO Document Disini</h3>
        <form onSubmit={handleScanSODocument} className="flex flex-col gap-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Scan Barcode
              </label>
              <Input
                type="text"
                className="border-sky-400/80 focus-visible:ring-sky-400"
                value={soDocumentInput}
                onChange={(e) => setSODocumentInput(e.target.value)}
                placeholder="Scan barcode here..."
                disabled={isPendingScanSO}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="bg-sky-400 hover:bg-sky-400/80 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
              disabled={isPendingScanSO || !soDocumentInput.trim()}
            >
              {isPendingScanSO ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "SO"
              )}
            </Button>
          </div>
        </form>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List B2B</h2>
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
            </div>
            <Button variant={"liquid"} asChild>
              <Link href="/outbond/b2b/create">
                <PlusCircle className="size-4" />
                Create B2B
              </Link>
            </Button>
          </div>
          <DataTable columns={columnB2B} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
