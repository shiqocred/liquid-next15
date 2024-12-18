"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import {
  LayoutGrid,
  LayoutList,
  Loader,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn, formatRupiah } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";
import { useGetStorageReport } from "../_api/use-get-storage-report";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";
import { useGetCountStaging } from "../_api/use-get-count-staging";

interface ChartData {
  category_product: string;
  total_category: number;
  total_price_category: string;
  days_since_created: string;
}

const ContentTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean | undefined;
  payload: any;
  label: string;
}) => {
  if (active && payload && label) {
    return (
      <div className="bg-white rounded px-3 py-1.5 border border-gray-300 text-xs dark:bg-gray-900 shadow-sm">
        <p className="text-sm font-bold">{label}</p>
        <div className="mb-2 bg-gray-500 dark:bg-gray-300 w-full h-[1px]" />
        <div className="flex flex-col gap-1">
          {
            <div className="flex w-full gap-4 justify-between">
              <p>Qty:</p>
              <p>{payload[0].value.toLocaleString()}</p>
            </div>
          }
          {
            <div className="flex w-full gap-4 justify-between">
              <p>Value:</p>
              <p>{formatRupiah(payload[0].payload.total_price_category)}</p>
            </div>
          }
        </div>
      </div>
    );
  }
  return null;
};

export const columnsStorage: ColumnDef<any>[] = [
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
    accessorKey: "category_product",
    header: "Category Name",
    cell: ({ row }) => (
      <TooltipProviderPage
        value={<p className="max-w-[500px]">{row.original.category_product}</p>}
      >
        <div className="truncate max-w-[500px]">
          {row.original.category_product}
        </div>
      </TooltipProviderPage>
    ),
  },
  {
    accessorKey: "total_category",
    header: () => <div className="text-center">Total Product</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.total_category}
      </div>
    ),
  },
  {
    accessorKey: "total_price_category",
    header: "Value Product",
    cell: ({ row }) => {
      const formated = formatRupiah(row.original.total_price_category);
      return <div className="tabular-nums">{formated}</div>;
    },
  },
];

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const searchValue = useDebounce(dataSearch);
  const [layout, setLayout] = useQueryState("layout", {
    defaultValue: "list",
  });
  const { data, refetch, isPending, isRefetching, isLoading, isError, error } =
    useGetStorageReport();
  const {
    data: dataStaging,
    isError: isErrorStaging,
    error: errorStaging,
  } = useGetCountStaging();

  const loading = isPending || isRefetching || isLoading;

  const dataStorage = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataResStaging = useMemo(() => {
    return dataStaging?.data.data.resource;
  }, [dataStaging]);

  const dataChart: ChartData[] = useMemo(() => {
    return data?.data.data.resource.chart.category;
  }, [data]);

  const clearSearch = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDataSearch("");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Loading />;
  }

  if (
    (isError && (error as AxiosError).status === 403) ||
    (isErrorStaging && (errorStaging as AxiosError).status === 403)
  ) {
    return (
      <div className="flex flex-col items-start h-full bg-gray-100 w-full relative p-4 gap-4">
        <Forbidden />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Dashboard</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Storage Report</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 flex-col">
        <div className="w-full justify-between items-center flex mb-5">
          <h2 className="text-xl font-bold">Report Product Per-Category</h2>
          <div className="flex gap-2">
            {dataStorage && (
              <p className="px-5 h-10 border rounded flex items-center text-sm border-gray-500 cursor-default">
                {dataStorage?.month.current_month.month +
                  " " +
                  dataStorage?.month.current_month.year}
              </p>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              className="w-10 h-10 flex items-center justify-center border border-l-none rounded border-gray-500 hover:bg-sky-100"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="h-[300px] w-full relative">
          {loading ? (
            <div className="w-full h-full absolute top-0 left-0 bg-sky-500/15 backdrop-blur z-10 rounded flex justify-center items-center border border-sky-500">
              <Loader className="w-7 h-7 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataChart}
                margin={{
                  top: 5,
                  right: 10,
                  left: 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  className="stroke-gray-200"
                  horizontalCoordinatesGenerator={(props) =>
                    props.height > 250 ? [75, 125, 175, 225] : [100, 200]
                  }
                />
                <YAxis
                  padding={{ top: 10 }}
                  dataKey={"total_category"}
                  style={{ fontSize: "14px" }}
                  tick={false}
                  width={0}
                  axisLine={false}
                />
                <XAxis
                  dataKey="category_product"
                  stroke="#000"
                  label={{ fontSize: "10px", color: "#fff" }}
                  padding={{ left: 0, right: 0 }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: "10px", height: "20px" }}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => (
                    <ContentTooltip
                      active={active}
                      payload={payload}
                      label={label}
                    />
                  )}
                />
                <Bar
                  dataKey="total_category"
                  fill="#7dd3fc"
                  strokeWidth={2}
                  stroke="#38bdf8"
                  radius={[4, 4, 4, 4]}
                  label={{ position: "top", fill: "black" }}
                  activeBar={{ fill: "#38bdf8" }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="w-full flex items-center gap-4">
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 flex-col gap-2">
          <p>Total Product</p>
          {loading ? (
            <Skeleton className="h-8 w-1/3" />
          ) : (
            <p className="text-2xl font-bold">
              {dataStorage?.total_all_category.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 flex-col gap-2">
          <p>Total Value</p>
          {loading ? (
            <Skeleton className="h-8 w-2/3" />
          ) : (
            <p className="text-2xl font-bold">
              {formatRupiah(dataStorage?.total_all_price_category)}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 bg-white rounded-md overflow-hidden shadow p-3 w-full">
        <div className="w-full px-5">
          <div className="w-full border-b border-gray-500 pb-3">
            <h2 className="text-xl font-bold">Report Count Staging</h2>
          </div>
        </div>
        <div className="w-full flex items-center gap-4">
          <div className="flex w-full px-5 py-3 flex-col gap-2">
            <p>Total Product</p>
            <p className="text-2xl font-bold">
              {dataResStaging?.total_product.toLocaleString()}
            </p>
          </div>
          <div className="flex w-full px-5 py-3 flex-col gap-2">
            <p>Total Value</p>
            <p className="text-2xl font-bold">
              {formatRupiah(dataResStaging?.total_price)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6 bg-white rounded-md overflow-hidden shadow p-3 w-full">
        <div className="w-full px-5">
          <div className="w-full border-b border-gray-500 pb-3">
            <h2 className="text-xl font-bold">Report Product Per-Color</h2>
          </div>
        </div>
        {loading ? (
          <div className="w-full flex items-center gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="flex w-full  flex-col gap-2 py-2 first:border-none first:pl-2 pl-4 border-l border-gray-300 text-sm"
              >
                <div className="flex flex-col gap-2 px-3">
                  <div className="flex items-center justify-between">
                    <p>Total Product</p>
                    <Skeleton className="w-10 h-5" />
                  </div>
                  <Skeleton className="w-1/3 h-8" />
                </div>
                <div className="flex items-center justify-between bg-sky-200 py-1 rounded px-3">
                  <p>Total Value</p>
                  <Skeleton className="w-1/3 h-5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full inset-0 gap-4 flex items-center text-sm">
            {dataStorage?.chart?.tag_product.map((item: any) => (
              <div
                key={item.tag_product}
                className="flex w-full  flex-col gap-2 py-2 first:border-none first:pl-2 pl-4 border-l border-gray-300"
              >
                <div className="flex flex-col gap-2 px-3">
                  <div className="flex items-center justify-between">
                    <p>Total Product</p>
                    <Badge className="border-black border rounded-full text-black bg-transparent hover:bg-transparent shadow-none text-sm">
                      {item.tag_product}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">
                    {item.total_tag_product.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between bg-sky-200 py-1 rounded px-3">
                  <p>Total Value</p>
                  <p className="text-xl font-bold">
                    {formatRupiah(item.total_price_tag_product) ?? "Rp 0"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow p-5 gap-6 items-center flex-col">
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-lg font-semibold">List Product Per-Category</h3>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-5" style={{ width: "60%" }}>
              <div className="relative w-full flex items-center mb-0">
                <Label className="absolute left-3" htmlFor="search">
                  <Search className="w-4 h-4" />
                </Label>
                <input
                  id="search"
                  value={dataSearch}
                  onChange={(e) => setDataSearch(e.target.value)}
                  className="w-full h-9 rounded outline-none px-10 text-xs border border-gray-500"
                />
                <button
                  onClick={clearSearch}
                  className={cn(
                    "h-5 w-5 absolute right-2 items-center justify-center outline-none",
                    dataSearch.length > 0 ? "flex" : "hidden"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex border border-gray-500 rounded flex-none h-9 overflow-hidden">
                <button
                  className={cn(
                    "w-9 h-full flex items-center justify-center outline-none",
                    layout === "list" ? "bg-sky-300" : "bg-transparent"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setLayout("list");
                  }}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  className={cn(
                    "w-9 h-full flex items-center justify-center outline-none",
                    layout === "grid" ? "bg-sky-300" : "bg-transparent"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setLayout("grid");
                  }}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {layout === "grid" ? (
          <div className="grid grid-cols-4 gap-4 w-full">
            {searchValue ? (
              dataChart.filter((item: any) =>
                item.category_product
                  .toLowerCase()
                  .includes(searchValue.toLowerCase())
              ).length > 0 ? (
                dataChart
                  .filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .map((item: any, i: number) => (
                    <div
                      key={item.category_product + i}
                      className="flex relative w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                    >
                      <p className="text-sm font-light text-gray-700 pb-1">
                        {item.category_product}
                      </p>
                      <div className="flex flex-col">
                        <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                          {formatRupiah(item.total_price_category)}
                        </h3>
                        <h3 className="text-gray-700 font-bold text-2xl">
                          {item.total_category.toLocaleString()}
                        </h3>
                      </div>
                      <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                        {i + 1}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="w-full flex justify-center col-span-4 items-center px-5 py-10 hover:border-sky-400 border-b border-sky-200">
                  <div className="w-full flex-none text-center font-semibold">
                    No Data Viewed.
                  </div>
                </div>
              )
            ) : (
              dataChart.map((item: any, i: number) => (
                <div
                  key={item.category_product + i}
                  className="flex w-full relative bg-white rounded-md overflow-hidden shadow px-5 py-3 justify-center flex-col border transition-all hover:border-sky-300 box-border"
                >
                  <p className="text-sm font-light text-gray-700 pb-1">
                    {item.category_product}
                  </p>
                  <div className="flex flex-col">
                    <h3 className="text-gray-700 border-t border-gray-500 text-sm font-semibold pb-2 pt-1">
                      {formatRupiah(item.total_price_category)}
                    </h3>
                    <h3 className="text-gray-700 font-bold text-2xl">
                      {item.total_category.toLocaleString()}
                    </h3>
                  </div>
                  <p className="absolute text-end text-[70px] font-bold -bottom-5 right-2 text-gray-300/30 z-0">
                    {i + 1}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {searchValue ? (
              <DataTable
                columns={columnsStorage}
                data={
                  dataChart.filter((item: any) =>
                    item.category_product
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  ) ?? []
                }
              />
            ) : (
              <DataTable columns={columnsStorage} data={dataChart ?? []} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
