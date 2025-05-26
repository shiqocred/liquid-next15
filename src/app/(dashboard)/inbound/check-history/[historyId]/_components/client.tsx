"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ArrowLeft,
  ArrowLeftRight,
  FileDown,
  FileText,
  Gem,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { Pie, PieChart, Label } from "recharts";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useGetDetailCheckHistory } from "../_api/use-get-detail-check-history";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Pagination from "@/components/pagination";
import { notFound, useParams } from "next/navigation";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetProductDetailCheckHistory } from "../_api/use-get-product-check-history";
import { useExportHistory } from "../_api/use-export-history";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/(dashboard)/loading";
import { useGetRefreshHistoryDocument } from "../_api/use-get-refresh-history-document";
import { toast } from "sonner";

const chartConfig = {
  values: {
    label: "Values",
  },
  good: {
    label: "Good",
    color: "hsl(var(--chart-1))",
  },
  damaged: {
    label: "Damaged",
    color: "hsl(var(--chart-2))",
  },
  discrepancy: {
    label: "Discrepancy",
    color: "hsl(var(--chart-3))",
  },
  abnormal: {
    label: "Abnormal",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { historyId } = useParams();
  const [filter, setFilter] = useQueryState(
    "quality",
    parseAsStringLiteral([
      "good",
      "damaged",
      "abnormal",
      "discrepancy",
    ] as const).withDefault("good")
  );
  const [isFilter, setIsFilter] = useState(false);
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

  const { mutate, isPending: isPendingExport } = useExportHistory();
  const {
    data: dataDetail,
    isError: isErrorDetail,
    error: errorDetail,
    isPending: isPendingDetail,
    isRefetching: isRefetchingDetail,
    isLoading: isLoadingDetail,
  } = useGetDetailCheckHistory({ id: historyId });

  const dataDetailCH = useMemo(() => {
    return dataDetail?.data.data.resource;
  }, [dataDetail]);

  const {
    data: dataRefresh,
    refetch: refetchRefresh,
    isLoading: isLoadingRefresh,
  } = useGetRefreshHistoryDocument({
    code_document: dataDetailCH?.code_document,
  });

  const dataDetailCHAfterRefresh = useMemo(() => {
    return dataRefresh?.data.data.resource;
  }, [dataRefresh]);

  const loadingDetail =
    isPendingDetail ||
    isRefetchingDetail ||
    isLoadingDetail ||
    isLoadingRefresh;

  const {
    data: dataProduct,
    refetch: refetchProduct,
    isSuccess: isSuccessProduct,
    isError: isErrorProduct,
    error: errorProduct,
  } = useGetProductDetailCheckHistory({
    code: dataDetail?.data.data.resource.code_document,
    p: page,
    q: searchValue,
    type: filter,
  });

  const dataProductDetailCH: any[] = useMemo(() => {
    return dataProduct?.data.data.resource.data;
  }, [dataProduct]);

  const chartData = [
    {
      dataType: "good",
      values: dataDetailCH?.total_data_lolos ?? 0,
      fill: "var(--color-good)",
    },
    {
      dataType: "damaged",
      values: dataDetailCH?.total_data_damaged ?? 0,
      fill: "var(--color-damaged)",
    },
    {
      dataType: "discrepancy",
      values: dataDetailCH?.total_discrepancy ?? 0,
      fill: "var(--color-discrepancy)",
    },
    {
      dataType: "abnormal",
      values: dataDetailCH?.total_data_abnormal ?? 0,
      fill: "var(--color-abnormal)",
    },
  ];

  const totalVisitors = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.values, 0);
  }, [dataDetail]);

  useEffect(() => {
    setPaginate({
      isSuccess: isSuccessProduct,
      data: dataProduct,
      dataPaginate: dataProduct?.data.data.resource,
      setPage: setPage,
      setMetaPage: setMetaPage,
    });
  }, [dataProduct]);

  useEffect(() => {
    alertError({
      isError: isErrorDetail,
      error: errorDetail as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetail, errorDetail]);
  useEffect(() => {
    alertError({
      isError: isErrorProduct,
      error: errorProduct as AxiosError,
      data: "Products",
      action: "get data",
      method: "GET",
    });
  }, [isErrorProduct, errorProduct]);

  const handleExport = async (e: MouseEvent) => {
    e.preventDefault();
    mutate(
      { code_document: dataDetailCH?.code_document },
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

  const columnDetailCheckHistory: ColumnDef<any>[] = [
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
      accessorKey: "old_barcode_product",
      header: "Old Barcode",
    },
    {
      accessorKey: "new_barcode_product",
      header: "New Barcode",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {row.original.new_barcode_product ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="break-all max-w-[500px]">
          {row.original.new_name_product ?? row.original.old_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_quantity_product",
      header: () => <div className="text-center">Qty</div>,
      cell: ({ row }) => (
        <div className="tabular-nums text-center">
          {Math.round(
            row.original.new_quantity_product ??
              row.original.old_quantity_product
          ).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "old_price_product",
      header: "Total Items",
      cell: ({ row }) => (
        <div className="tabular-nums">
          {formatRupiah(row.original.old_price_product)}
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

  if (isErrorDetail && (errorDetail as AxiosError)?.status === 403) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  if (isErrorDetail && (errorDetail as AxiosError)?.status === 404) {
    notFound();
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["check-history"] })
              }
            >
              <BreadcrumbLink href="/inbound/check-history">
                Check History
              </BreadcrumbLink>
            </button>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Detail</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex flex-col gap-4">
        <div className="flex text-sm text-gray-500 py-3 rounded-md shadow bg-white w-full px-5 h-24 items-center justify-between">
          <div className="flex w-full items-center">
            <Button
              asChild
              type="button"
              className="text-black hover:mr-6 mr-4 transition-all shadow-none p-0 w-10 h-10 hover:shadow rounded-full bg-transparent hover:bg-gray-100"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["check-history"] })
              }
            >
              <Link href={"/inbound/check-history"}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="w-full">
              <p>Base Document</p>
              <h3 className="text-black font-semibold text-xl w-full text-ellipsis whitespace-nowrap">
                {dataDetailCH?.base_document}
              </h3>
            </div>
          </div>
          <Badge className="text-sky-700 bg-sky-100 hover:bg-sky-100 rounded-full border border-sky-700">
            {dataDetailCH?.code_document}
          </Badge>
        </div>
        <div className="w-full flex flex-col gap-4 p-3 border border-sky-500 rounded-lg">
          <div className="w-full flex gap-2 items-center py-3">
            <div className="w-9 h-9 rounded-full border-[1.5px] border-sky-500 text-sky-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-black">
              Inventory Details
            </h3>
            <Button
              onClick={() =>
                refetchRefresh().then((res) => {
                  if (res?.data?.data?.data?.status === true) {
                    toast.success("Berhasil refresh data");
                  }
                })
              }
              className="ml-2 w-9 h-9 p-0 flex items-center justify-center border-sky-400 text-black hover:bg-sky-50"
              variant="outline"
              disabled={loadingDetail}
              type="button"
              aria-label="Refresh Inventory Details"
            >
              <RefreshCw
                className={cn("w-4 h-4", loadingDetail ? "animate-spin" : "")}
              />
            </Button>
          </div>
          <div className="w-full flex gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex gap-4">
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-500">
                    Total <span className="font-semibold underline">Data</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {(dataDetailCH?.total_data ?? 0).toLocaleString()}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.precentage_total_data ?? 0)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-500">
                    Total{" "}
                    <span className="font-semibold underline">Data In</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {(
                        dataDetailCHAfterRefresh?.["all data"] ??
                        dataDetailCH?.total_data_in ??
                        0
                      ).toLocaleString()}{" "}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.percentage_in ?? 0)}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-28 gap-2 flex-col">
                  <div className="flex w-full flex-col text-sm text-gray-700 font-semibold">
                    <p>Total</p>
                    <p className="underline">Good Data</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCHAfterRefresh?.lolos ??
                        dataDetailCH?.total_data_lolos ??
                        0
                      ).toLocaleString()}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.percentage_lolos ?? 0)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-28 gap-2 flex-col">
                  <div className="flex w-full flex-col text-sm text-gray-700 font-semibold">
                    <p>Total</p>
                    <p className="underline">Damaged Data</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCHAfterRefresh?.damaged ??
                        dataDetailCH?.total_data_damaged ??
                        0
                      ).toLocaleString()}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.percentage_damaged ?? 0)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-28 gap-2 flex-col">
                  <div className="flex w-full flex-col text-sm text-gray-700 font-semibold">
                    <p>Total</p>
                    <p className="underline">Abnormal Data</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCHAfterRefresh?.abnormal ??
                        dataDetailCH?.total_data_abnormal ??
                        0
                      ).toLocaleString()}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.percentage_abnormal ?? 0)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-28 gap-2 flex-col">
                  <div className="flex w-full flex-col text-sm text-gray-700 font-semibold">
                    <p>Total</p>
                    <p className="underline">Discrepancy Data</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(dataDetailCH?.total_discrepancy ?? 0).toLocaleString()}
                    </h3>
                    <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                      {Math.round(dataDetailCH?.percentage_discrepancy ?? 0)}%
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-500">
                    Total{" "}
                    <span className="font-semibold underline">By Category</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {(
                        dataDetailCH?.total_product_category ?? 0
                      ).toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-500">
                    Total{" "}
                    <span className="font-semibold underline">By Color</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {(
                        dataDetailCH?.total_product_color ?? 0
                      ).toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="w-full flex gap-4">
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-700">
                    Total{" "}
                    <span className="font-semibold underline">
                      Stagging Data
                    </span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCH?.total_product_stagings ?? 0
                      ).toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-700">
                    Total{" "}
                    <span className="font-semibold underline">Sale Data</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCH?.total_product_sales ?? 0
                      ).toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-24 gap-2 flex-col">
                  <p className="text-sm font-light text-gray-700">
                    Total{" "}
                    <span className="font-semibold underline">Bundle Data</span>
                  </p>
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-900 font-bold text-2xl">
                      {(
                        dataDetailCH?.total_product_bundle ?? 0
                      ).toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/4 flex-none flex justify-center rounded-md shadow bg-white relative px-5">
              <div className="flex text-sm text-gray-500 h-[320px] flex-none sticky top-0">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-square h-full"
                >
                  <PieChart className="flex gap-2">
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={chartData}
                      dataKey="values"
                      nameKey="dataType"
                      innerRadius={35}
                      stroke="2"
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy ?? 0) - 15}
                                  className="fill-muted-foreground text-xs"
                                >
                                  Total
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy ?? 0) + 10}
                                  className="fill-foreground text-sm font-bold"
                                >
                                  {totalVisitors.toLocaleString()}
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="dataType" />}
                      className="-translate-y-2 w-3/4 mx-auto flex-wrap gap-y-1 gap-x-4 [&>*]:basis-1/4 [&>*]:justify-center "
                    />
                  </PieChart>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 p-3 border border-sky-500 rounded-lg">
          <div className="w-full flex gap-2 items-center py-3">
            <div className="w-9 h-9 rounded-full border-[1.5px] border-sky-500 text-sky-500 flex items-center justify-center">
              <Gem className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-black">
              Financial Details
            </h3>
          </div>
          <div className="w-full flex gap-4">
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Good Bundle
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.lolosBundle?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(
                      dataDetailCH?.lolosBundle?.price_percentage ?? 0
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">Price Good Sale</span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.lolosSale?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(dataDetailCH?.lolosSale?.price_percentage ?? 0)}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-4">
            <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Good Stagging
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.lolosStaging?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(
                      dataDetailCH?.lolosStaging?.price_percentage ?? 0
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Damaged Stagging
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(
                    dataDetailCH?.damagedStaging?.total_old_price
                  ) ?? "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(
                      dataDetailCH?.damagedStaging?.price_percentage ?? 0
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-sky-200 rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Abnormal Stagging
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(
                    dataDetailCH?.abnormalStaging?.total_old_price
                  ) ?? "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(
                      dataDetailCH?.abnormalStaging?.price_percentage ?? 0
                    )}
                    %
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-4">
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">Price Good Data</span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.lolos?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(dataDetailCH?.lolos?.price_percentage ?? 0)}%
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Damaged Data
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.damaged?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(dataDetailCH?.damaged?.price_percentage ?? 0)}%
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Abnormal Data
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.abnormal?.total_old_price) ??
                    "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(dataDetailCH?.abnormal?.price_percentage ?? 0)}%
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-36 gap-4 flex-col">
              <p className="text-sm font-light text-gray-500">
                Total{" "}
                <span className="font-semibold underline">
                  Price Discrepancy Data
                </span>
              </p>
              <div className="flex flex-col gap-1">
                <h3 className="text-gray-700 font-bold text-xl">
                  {formatRupiah(dataDetailCH?.priceDiscrepancy) ?? "Rp. 0"}
                </h3>
                <div>
                  <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                    {Math.round(dataDetailCH?.price_percentage ?? 0)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 justify-center h-28 gap-4 flex-col">
            <p className="text-sm font-light text-gray-500">
              Total <span className="font-semibold underline">Price</span>
            </p>
            <div className="flex justify-between gap-1">
              <h3 className="text-gray-700 font-bold text-xl">
                {formatRupiah(dataDetailCH?.total_price) ?? "Rp. 0"}
              </h3>
              <div>
                <Badge className="rounded-full bg-transparent hover:bg-transparent text-black border border-black">
                  100%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold capitalize">
          List Data <span className="underline">{filter}</span>
        </h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex w-full justify-between">
            <div className="flex gap-2 items-center w-full">
              <Input
                className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400 flex-none"
                value={dataSearch}
                onChange={(e) => setDataSearch(e.target.value)}
                placeholder="Search..."
              />
              <TooltipProviderPage value={"Reload Data"}>
                <Button
                  onClick={() => refetchProduct()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50 disabled:opacity-100"
                  variant={"outline"}
                  disabled={loadingDetail}
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      loadingDetail ? "animate-spin" : ""
                    )}
                  />
                </Button>
              </TooltipProviderPage>
              <div className="flex items-center justify-start w-full">
                <div className="flex items-center gap-3">
                  <Popover open={isFilter} onOpenChange={setIsFilter}>
                    <PopoverTrigger asChild>
                      <Button className="border-sky-400/80 border text-black bg-transparent border-dashed hover:bg-transparent flex px-3 hover:border-sky-400">
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Type
                        {filter && (
                          <Separator
                            orientation="vertical"
                            className="mx-2 bg-gray-500 w-[1.5px]"
                          />
                        )}
                        {filter && (
                          <Badge
                            className={cn(
                              "rounded w-24 px-0 justify-center text-black font-normal capitalize",
                              filter === "good" &&
                                "bg-sky-200 hover:bg-sky-200",
                              filter === "damaged" &&
                                "bg-red-200 hover:bg-red-200",
                              filter === "abnormal" &&
                                "bg-green-200 hover:bg-green-200",
                              filter === "discrepancy" &&
                                "bg-yellow-200 hover:bg-yellow-200"
                            )}
                          >
                            {filter}
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
                                setFilter("good");
                                setIsFilter(false);
                              }}
                            >
                              <Checkbox
                                className="w-4 h-4 mr-2"
                                checked={filter === "good"}
                                onCheckedChange={() => {
                                  setFilter("good");
                                  setIsFilter(false);
                                }}
                              />
                              Good
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setFilter("damaged");
                                setIsFilter(false);
                              }}
                            >
                              <Checkbox
                                className="w-4 h-4 mr-2"
                                checked={filter === "damaged"}
                                onCheckedChange={() => {
                                  setFilter("damaged");
                                  setIsFilter(false);
                                }}
                              />
                              Damaged
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setFilter("abnormal");
                                setIsFilter(false);
                              }}
                            >
                              <Checkbox
                                className="w-4 h-4 mr-2"
                                checked={filter === "abnormal"}
                                onCheckedChange={() => {
                                  setFilter("abnormal");
                                  setIsFilter(false);
                                }}
                              />
                              Abnormal
                            </CommandItem>
                            <CommandItem
                              onSelect={() => {
                                setFilter("discrepancy");
                                setIsFilter(false);
                              }}
                            >
                              <Checkbox
                                className="w-4 h-4 mr-2"
                                checked={filter === "discrepancy"}
                                onCheckedChange={() => {
                                  setFilter("discrepancy");
                                  setIsFilter(false);
                                }}
                              />
                              Discrepancy
                            </CommandItem>
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={(e) => handleExport(e)}
              className="bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100"
              disabled={isPendingExport}
            >
              {isPendingExport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
          <DataTable
            columns={columnDetailCheckHistory}
            data={dataProductDetailCH ?? []}
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
