"use client";

import { ArrowLeft, Edit3, PencilRuler, ReceiptText, RefreshCw } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, formatRupiah } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useUpdateBuyer } from "../_api/use-update-buyer";
import { useGetDetailBuyer } from "../_api/use-get-detail-buyer";
import Pagination from "@/components/pagination";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useParams } from "next/navigation";

export const Client = () => {
  const { buyerId } = useParams();

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    point_buyer: 0,
  });

  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery();
  const { metaPage, page, setPage, setPagination } = usePagination();

  // mutate DELETE, UPDATE
  const { mutate: mutateUpdate } = useUpdateBuyer();

  // get detail data
  const {
    data: dataBuyer,
    isSuccess: isSuccessBuyer,
    isError: isErrorBuyer,
    error: errorBuyer,
    isLoading,
    isRefetching,
    refetch: refetchBuyer,
    isPending,
  } = useGetDetailBuyer({ id: buyerId, p: page, q: searchValue });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return dataBuyer?.data.data.resource.documents?.data;
  }, [dataBuyer]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    if (dataBuyer && isSuccessBuyer) {
      setPagination(dataBuyer?.data.data.resource.documents);
    }
  }, [dataBuyer]);

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_buyer: input.name,
      address_buyer: input.address,
      phone_buyer: input.phone,
      email: input.email,
    };
    if (!buyerId || Array.isArray(buyerId)) {
      return null;
    }
    mutateUpdate(
      { id: buyerId, body },
      {
        onSuccess: () => {},
      }
    );
  };

  // set data detail
  useEffect(() => {
    if (isSuccessBuyer && dataBuyer) {
      setInput({
        name: dataBuyer.data.data.resource.buyer.name_buyer ?? "",
        email: dataBuyer.data.data.resource.buyer.email ?? "",
        phone: dataBuyer.data.data.resource.buyer.phone_buyer ?? "",
        address: dataBuyer.data.data.resource.buyer.address_buyer ?? "",
        point_buyer: dataBuyer.data.data.resource.buyer.point_buyer ?? 0,
      });
    }
  }, [dataBuyer]);

  // isError get Detail
  useEffect(() => {
    alertError({
      isError: isErrorBuyer,
      error: errorBuyer as AxiosError,
      action: "get data",
      data: "Buyer",
      method: "GET",
    });
  }, [isErrorBuyer, errorBuyer]);

  // column data
  const columnDestinationMC: ColumnDef<any>[] = [
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
      accessorKey: "code_document_sale",
      header: "Code Document",
    },
    {
      accessorKey: "total_product_document_sale",
      header: "Qty Product",
    },
    {
      accessorKey: "grand_total",
      header: "Total Purchase",
      cell: ({ row }) => formatRupiah(row.original.grand_total),
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
              asChild
            >
              <Link href={`/outbond/sale/detail/${row.original.id}`}>
                <ReceiptText className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipProviderPage>
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

  if (isErrorBuyer && (errorBuyer as AxiosError)?.status === 403) {
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
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Buyer</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full flex gap-2 justify-start items-center pt-2 pb-1 mb-1 border-b border-gray-500">
        <Link href="/outbond/buyer">
          <Button className="w-9 h-9 bg-transparent hover:bg-white p-0 shadow-none">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Edit Buyer</h1>
      </div>
      <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow p-5 col-span-3">
        <div className="flex items-center justify-between pb-3 mb-5 border-gray-500 border-b w-full">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full flex items-center justify-center flex-none bg-sky-100 shadow">
              <PencilRuler className="size-4" />
            </div>
            <h5 className="font-bold text-xl">Data Buyer</h5>
          </div>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleUpdate(e);
            }}
            variant={"liquid"}
            disabled={!input.name || dataList.length === 0}
          >
            <Edit3 className="size-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="flex flex-col w-full gap-6">
          <div className="flex flex-row justify-between items-start w-full">
            <div className="flex flex-col gap-4 w-1/2">
              <div className="flex items-center gap-4">
                <Label className="w-24 font-semibold">NAMA</Label>
                <Input
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
                  value={input.name}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 font-semibold">EMAIL</Label>
                <Input
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
                  value={input.email}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 font-semibold">NO HP</Label>
                <Input
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
                  value={input.phone}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-24 font-semibold">ALAMAT</Label>
                <Input
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
                  value={input.address}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex flex-col items-center justify-start w-1/2">
              <div className="flex items-center gap-4">
                <Label className="w-24 font-semibold">RANK</Label>
                <Input
                  className="w-full border border-gray-300 rounded-md px-3 py-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
                  value={dataBuyer?.data?.data?.resource?.buyer?.rank || "-"}
                  onChange={(e) =>
                    setInput((prev) => ({ ...prev, address: e.target.value }))
                  }
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label>Nama</Label>
            <Input
              className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
              placeholder="Bundle Name..."
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Email</Label>
            <Input
              className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
              placeholder="Email ..."
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>No Hp</Label>
            <Input
              className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
              placeholder="No Hp ..."
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Alamat</Label>
            <Input
              className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
              placeholder="Alamat..."
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Rank</Label>
            <Input
              className="border-0 shadow-none focus-visible:ring-transparent focus-visible:outline-none rounded-none focus-visible:border-b focus-visible:border-sky-500 hover:underline hover:underline-offset-2 focus-visible:no-underline"
              placeholder="Rank ..."
              value={input.name}
              onChange={(e) =>
                setInput((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>
        </div> */}
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Shopping Buyers</h2>
        <div className="flex flex-col w-full gap-4">
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
                  onClick={() => refetchBuyer()}
                  className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black hover:bg-sky-50"
                  variant={"outline"}
                >
                  <RefreshCw
                    className={cn("w-4 h-4", loading ? "animate-spin" : "")}
                  />
                </Button>
              </TooltipProviderPage>
            </div>
          </div>
          <DataTable columns={columnDestinationMC} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
