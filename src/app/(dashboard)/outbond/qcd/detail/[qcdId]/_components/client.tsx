"use client";

import { ArrowLeft, ScanBarcode } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetDetailQCD } from "../_api/use-get-detail-qcd";

export const Client = () => {
  const { qcdId } = useParams();

  // search, debounce, paginate end ----------------------------------------------------------------

  // query strat ----------------------------------------------------------------

  const { data, isRefetching, error, isError } = useGetDetailQCD({
    id: qcdId,
  });
  // query end ----------------------------------------------------------------

  // memeo strat ----------------------------------------------------------------

  const dataRes: any = useMemo(() => {
    return data?.data.data.resource;
  }, [data]);

  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.items;
  }, [data]);

  // memo end ----------------------------------------------------------------

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  const columnQcd: ColumnDef<any>[] = [
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
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <div className="max-w-[500px] break-all">{row.original.source}</div>
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
    // {
    //   accessorKey: "action",
    //   header: () => <div className="text-center">Action</div>,
    //   cell: ({ row }) => (
    //     <div className="flex gap-4 justify-center items-center">
    //       <Button
    //         className="items-center border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50"
    //         variant={"outline"}
    //         type="button"
    //         disabled={isPendingRemoveProduct || isPendingSubmit}
    //         onClick={() => {
    //           handleRemoveProduct(row.original.id);
    //         }}
    //       >
    //         {isPendingRemoveProduct ? (
    //           <Loader2 className="w-4 h-4 mr-1" />
    //         ) : (
    //           <Trash2 className="w-4 h-4 mr-1" />
    //         )}
    //         <div>Delete</div>
    //       </Button>
    //     </div>
    //   ),
    // },
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
      <div className="flex flex-col gap-4 w-full">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Outbound</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/outbond/qcd">QCD</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>Detail</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
          <Link href="/outbond/qcd">
            <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
              <ArrowLeft className="w-5 h-5 text-black" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Detail QCD</h1>
        </div>
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
          <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
            <div className="flex items-center gap-4">
              <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
                <ScanBarcode className="size-4" />
              </div>
              <h5 className="font-bold text-xl">
                {dataRes?.document?.code_document_scrap}
              </h5>
            </div>
          </div>
          <div className="flex w-full gap-4">
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Product</p>
                <p className="font-semibold">
                  {dataRes?.document?.total_product}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Status</p>
                <p className="font-semibold">{dataRes?.document?.status}</p>
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-sm">Total Old Price</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.document?.total_old_price)}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="text-sm">Total New Price</p>
                <p className="font-semibold">
                  {formatRupiah(dataRes?.document?.total_new_price)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
          <h2 className="text-xl font-bold">List Product</h2>
          <DataTable
            isLoading={isRefetching}
            columns={columnQcd}
            data={dataList ?? []}
          />
        </div>
      </div>
    </div>
  );
};
