"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleFadingPlus,
  Loader2,
  RefreshCw,
  XCircle,
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
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useGetListNotification } from "../_api/use-get-list-notification";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { id } from "date-fns/locale";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetDetailApprove } from "../_api/use-get-detail-approve";
import dynamic from "next/dynamic";
import { useApproveDocument } from "../_api/use-approve-document";
import { useApproveProduct } from "../_api/use-approve-product";
import { useRejectDocument } from "../_api/use-reject-document";
import { useRejectProduct } from "../_api/use-reject-product";
import { useConfirm } from "@/hooks/use-confirm";
import { useQueryClient } from "@tanstack/react-query";

const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const queryClient = useQueryClient();
  const [isStatus, setIsStatus] = useState(false);
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // data search, page
  const [saleId, setSaleId] = useQueryState("saleId", {
    defaultValue: "",
  });
  // data search, page
  const [status, setStatus] = useQueryState("status", {
    defaultValue: "",
  });

  const [AprvDocumentDialog, confirmAprvDocument] = useConfirm(
    "Approve Document",
    "This action cannot be undone",
    "liquid"
  );
  const [AprvProductDialog, confirmAprvProduct] = useConfirm(
    "Approve Product",
    "This action cannot be undone",
    "liquid"
  );
  const [RjctDocumentDialog, confirmRjctDocument] = useConfirm(
    "Reject Document",
    "This action cannot be undone",
    "destructive"
  );
  const [RjctProductDialog, confirmRjctProduct] = useConfirm(
    "Reject Product",
    "This action cannot be undone",
    "destructive"
  );

  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const { mutate: mutateAprvDocument, isPending: isPendingAprvDocument } =
    useApproveDocument();
  const { mutate: mutateAprvProduct, isPending: isPendingAprvProduct } =
    useApproveProduct();
  const { mutate: mutateRjctDocument, isPending: isPendingRjctDocument } =
    useRejectDocument();
  const { mutate: mutateRjctProduct, isPending: isPendingRjctProduct } =
    useRejectProduct();

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
  } = useGetListNotification({ p: page, q: status });

  // get data detail
  const {
    data: dataDetail,
    refetch: refetchDetail,
    isLoading: isLoadingDetail,
    isRefetching: isRefetchingDetail,
    error: errorDetail,
    isError: isErrorDetail,
  } = useGetDetailApprove({ id: saleId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // memo data detail
  const dataListDetail: any[] = useMemo(() => {
    return dataDetail?.data.data.resource.sales;
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

  const handleApproveDocument = async (id: any) => {
    const ok = await confirmAprvDocument();

    if (!ok) return;

    mutateAprvDocument(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", saleId],
          });
          setSaleId("");
          setOpenDetail(false);
        },
      }
    );
  };
  const handleApproveProduct = async (id: any) => {
    const ok = await confirmAprvProduct();

    if (!ok) return;

    mutateAprvProduct(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", saleId],
          });
        },
      }
    );
  };
  const handleRejectDocument = async (id: any) => {
    const ok = await confirmRjctDocument();

    if (!ok) return;

    mutateRjctDocument(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", saleId],
          });
          setSaleId("");
          setOpenDetail(false);
        },
      }
    );
  };
  const handleRejectProduct = async (id: any) => {
    const ok = await confirmRjctProduct();

    if (!ok) return;

    mutateRjctProduct(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["detail-sale-approve", saleId],
          });
        },
      }
    );
  };

  // column data
  const columnNotification: ColumnDef<any>[] = [
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
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center my-1.5">
          <Badge
            className={cn(
              "font-normal capitalize text-black shadow-none",
              row.original.status.toLowerCase() === "pending" &&
                "bg-yellow-300 hover:bg-yellow-300",
              row.original.status.toLowerCase() === "display" &&
                "bg-sky-400 hover:bg-sky-400",
              row.original.status.toLowerCase() === "done" &&
                "bg-green-400 hover:bg-green-400",
              row.original.status.toLowerCase() === "sale" &&
                "bg-indigo-400 hover:bg-indigo-400",
              row.original.status.toLowerCase() === "staging" &&
                "bg-red-400 hover:bg-red-400"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "notification_name",
      header: "Notification",
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }) =>
        formatDistanceToNowStrict(new Date(row.original.created_at), {
          locale: id,
          addSuffix: true,
        }),
    },
    {
      accessorKey: "external_id",
      header: () => <div className="text-center">Approve</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.external_id && row.original.approved === "0" ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                setSaleId(row.original.external_id);
                setOpenDetail(true);
              }}
              disabled={isLoadingDetail}
              className="text-black bg-sky-400/80 hover:bg-sky-400 h-7 px-3 [&_svg]:size-3 gap-1"
            >
              <p className="text-xs">Check</p>
              {isLoadingDetail ? (
                <Loader2 className="animate-spin" />
              ) : (
                <ArrowUpRight />
              )}
            </Button>
          ) : row.original.external_id && row.original.approved === "1" ? (
            <Badge className="bg-red-300 hover:bg-red-300 font-normal text-black h-7 px-3 cursor-default">
              Rejected
            </Badge>
          ) : row.original.external_id && row.original.approved === "2" ? (
            <Badge className="bg-green-300 hover:bg-green-300 font-normal text-black h-7 px-3 cursor-default">
              Approved
            </Badge>
          ) : (
            "-"
          )}
        </div>
      ),
    },
  ];

  const columnSales: ColumnDef<any>[] = [
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
      accessorKey: "product_barcode_sale",
      header: "Barcode",
    },
    {
      accessorKey: "product_name_sale",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] hyphens-auto">
          {row.original.product_name_sale}
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
        <div className="flex justify-center">
          {row.original.approved === "1" ? (
            <div className="flex gap-2 justify-center items-center my-0.5">
              <TooltipProviderPage value={"Approve"}>
                <Button
                  className="size-8 px-0 hover:bg-sky-100 border-sky-400 hover:border-sky-600 text-black"
                  size={"icon"}
                  variant={"outline"}
                  type="button"
                  disabled={
                    isPendingAprvProduct ||
                    isPendingRjctProduct ||
                    isPendingAprvDocument ||
                    isPendingRjctDocument
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    handleApproveProduct(row.original.id);
                  }}
                >
                  <CheckCircle2 className="size-4" />
                </Button>
              </TooltipProviderPage>
              <TooltipProviderPage value={"Reject"}>
                <Button
                  className="size-8 px-0 hover:bg-red-100 border-red-400 hover:border-red-600 text-black"
                  size={"icon"}
                  variant={"outline"}
                  type="button"
                  disabled={
                    isPendingAprvProduct ||
                    isPendingRjctProduct ||
                    isPendingAprvDocument ||
                    isPendingRjctDocument
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    handleRejectProduct(row.original.id);
                  }}
                >
                  <XCircle className="size-4" />
                </Button>
              </TooltipProviderPage>
            </div>
          ) : (
            <div className="flex gap-2 justify-center items-center my-0.5">
              <Badge className="bg-sky-300 hover:bg-sky-300 font-normal text-black h-7 px-3 cursor-default">
                Approved
              </Badge>
            </div>
          )}
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
      <AprvDocumentDialog />
      <AprvProductDialog />
      <RjctDocumentDialog />
      <RjctProductDialog />
      <DialogDetail
        open={openDetail} // open modal
        onCloseModal={() => {
          if (openDetail) {
            setOpenDetail(false);
            setSaleId("");
          }
        }} // handle close modal
        data={dataResDetail}
        isLoading={isLoadingDetail}
        refetch={refetchDetail}
        isRefetching={isRefetchingDetail}
        columns={columnSales}
        handleApprove={handleApproveDocument}
        handleReject={handleRejectDocument}
        isPendingApprove={isPendingAprvDocument}
        isPendingReject={isPendingRjctDocument}
        dataTable={dataListDetail ?? []}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Notification</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Notification</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <div className="flex items-center gap-3 w-full">
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
              <div className="flex items-center gap-3">
                <Popover open={isStatus} onOpenChange={setIsStatus}>
                  <PopoverTrigger asChild>
                    <Button className="border-sky-400/80 border text-black bg-transparent border-dashed hover:bg-transparent flex px-3 hover:border-sky-400">
                      <CircleFadingPlus className="h-4 w-4 mr-2" />
                      Status
                      {status && (
                        <Separator
                          orientation="vertical"
                          className="mx-2 bg-gray-500 w-[1.5px]"
                        />
                      )}
                      {status && (
                        <Badge
                          className={cn(
                            "rounded w-20 px-0 justify-center text-black font-normal capitalize",
                            status === "pending" &&
                              "bg-yellow-300 hover:bg-yellow-300",
                            status === "display" &&
                              "bg-sky-400 hover:bg-sky-400",
                            status === "done" &&
                              "bg-green-400 hover:bg-green-400",
                            status === "sale" &&
                              "bg-indigo-400 hover:bg-indigo-400"
                          )}
                        >
                          {status}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-52" align="start">
                    <Command>
                      <CommandGroup>
                        <CommandList>
                          <CommandItem
                            onSelect={() => {
                              setStatus("pending");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "pending"}
                              onCheckedChange={() => {
                                setStatus("pending");
                                setIsStatus(false);
                              }}
                            />
                            Pending
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("display");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "display"}
                              onCheckedChange={() => {
                                setStatus("display");
                                setIsStatus(false);
                              }}
                            />
                            Display
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("done");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "done"}
                              onCheckedChange={() => {
                                setStatus("done");
                                setIsStatus(false);
                              }}
                            />
                            Done
                          </CommandItem>
                          <CommandItem
                            onSelect={() => {
                              setStatus("sale");
                              setIsStatus(false);
                            }}
                          >
                            <Checkbox
                              className="w-4 h-4 mr-2"
                              checked={status === "sale"}
                              onCheckedChange={() => {
                                setStatus("sale");
                                setIsStatus(false);
                              }}
                            />
                            Sale
                          </CommandItem>
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {status && (
                  <Button
                    variant={"ghost"}
                    className="flex px-3"
                    onClick={() => setStatus("")}
                  >
                    Reset
                    <XCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DataTable columns={columnNotification} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
