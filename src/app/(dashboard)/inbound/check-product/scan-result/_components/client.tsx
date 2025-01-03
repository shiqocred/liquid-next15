"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebounce } from "@/hooks/use-debounce";
import { ImageIcon, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah, setPaginate } from "@/lib/utils";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { useGetListScanResult } from "../_api/use-get-list-scan-result";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { AxiosError } from "axios";
import Forbidden from "@/components/403";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteProductScanResult } from "../_api/use-delete-product-scan-result";
import Pagination from "@/components/pagination";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/(dashboard)/loading";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Client = () => {
  const [isOpenImage, setIsOpenImage] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [imageUrl, setImageUrl] = useState("");

  const [dataSearch, setDataSearch] = useQueryState("q", { defaultValue: "" });
  const queryClient = useQueryClient();
  const searchValue = useDebounce(dataSearch);
  const [page, setPage] = useQueryState("p", parseAsInteger.withDefault(1));
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Product",
    "This action cannot be undone",
    "destructive"
  );
  const [metaPage, setMetaPage] = useState({
    last: 1, //page terakhir
    from: 1, //data dimulai dari (untuk memulai penomoran tabel)
    total: 1, //total data
    perPage: 1,
  });

  const { mutate } = useDeleteProductScanResult();
  const {
    data,
    isError,
    error,
    refetch,
    isPending,
    isRefetching,
    isLoading,
    isSuccess,
  } = useGetListScanResult({
    p: page,
    q: searchValue,
  });

  const loading = isPending || isRefetching || isLoading;

  const dataMI: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

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

  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutate(id);
  };

  const columnManifestInbound: ColumnDef<any>[] = [
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
      header: () => <div className="text-center">IMG</div>,
      accessorKey: "image",
      cell: ({ row }) => (
        <button
          onClick={() => {
            setImageUrl(row.original.image);
            setIsOpenImage(true);
          }}
          disabled={!row.original.image}
          type="button"
          className="flex justify-center relative size-10 border rounded shadow bg-white items-center overflow-hidden focus-visible:ring-0 focus-visible:outline-none"
        >
          {row.original.image ? (
            <Image fill src={row.original.image} alt="image_product" />
          ) : (
            <ImageIcon className="size-6 stroke-[1px]" />
          )}
        </button>
      ),
    },
    {
      accessorKey: "product_name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="hyphens-auto max-w-[500px]">
          {row.original.product_name}
        </div>
      ),
    },
    {
      accessorKey: "product_price",
      header: "Price",
      cell: ({ row }) => {
        const formated = formatRupiah(row.original.product_price);
        return <div className="tabular-nums">{formated}</div>;
      },
    },
    {
      accessorKey: "user.username",
      header: "User",
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value="Check">
            <Button
              asChild
              className="items-center w-9 px-0 flex-none border-green-400 text-green-700 hover:text-green-700 hover:bg-green-50"
              variant={"outline"}
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["detail-scan-result", row.original.id],
                });
              }}
            >
              <Link
                href={`/inbound/check-product/scan-result/${row.original.id}`}
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value="Delete">
            <Button
              className="items-center px-0  border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 w-9"
              variant={"outline"}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
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
    <div className="flex flex-col items-start bg-gray-100 w-full relative px-4 gap-4 py-4">
      <DeleteDialog />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Inbound</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Check Product</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Scan Result</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List of Product Scan</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full">
            <Input
              className="w-2/5 border-sky-400/80 focus-visible:ring-sky-400"
              value={dataSearch}
              onChange={(e) => setDataSearch(e.target.value)}
              placeholder="Search..."
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
          <DataTable columns={columnManifestInbound} data={dataMI ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
      <Dialog
        open={isOpenImage}
        onOpenChange={() => {
          setIsOpenImage(false);
          setImageUrl("/images/liquid.png");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-square relative rounded-md overflow-hidden">
            <Image
              fill
              src={imageUrl}
              alt="image_product"
              className="object-cover"
            />
          </div>
          <DialogFooter className="border-t border-gray-500 pt-5">
            <Button
              onClick={() => {
                setIsOpenImage(false);
                setImageUrl("/images/liquid.png");
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
