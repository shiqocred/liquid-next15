"use client";

import {
  CalendarIcon,
  Crown,
  Edit3,
  FileDown,
  Loader2,
  Medal,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
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
import { parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListBuyer } from "../_api/use-get-list-buyer";
import { useDeleteBuyer } from "../_api/use-delete-buyer";
import { useUpdateBuyer } from "../_api/use-update-buyer";
import { useGetDetailBuyer } from "../_api/use-get-detail-buyer";
import { useCreateBuyer } from "../_api/use-create-buyer";
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import Link from "next/link";
import { useGetTopBuyer } from "../_api/use-get-top-buyer";
import { format } from "date-fns";
import { DialogFiltered } from "./dialog-filtered";
import { useExportBuyer } from "../_api/use-export-buyer";

const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

export const Client = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "dialog",
    parseAsString.withDefault("")
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // buyer Id for Edit
  const [buyerId, setBuyerId] = useQueryState("buyerId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    phone: "",
    address: "",
    point_buyer: 0,
  });

  // dataGMaps
  const [address, setAddress] = useState({
    address: "",
  });

  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery();
  const { metaPage, page, setPage, setPagination } = usePagination();

  // donfirm delete
  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Buyer",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } = useDeleteBuyer();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateBuyer();
  const { mutate: mutateCreate, isPending: isPendingCreate } = useCreateBuyer();
  const { mutate: mutateExport, isPending: isPendingExport } = useExportBuyer();

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
  } = useGetListBuyer({
    p: page,
    q: searchValue,
    month: selectedMonth,
    year: selectedYear,
  });

  // get detail data
  const {
    data: dataBuyer,
    isLoading: isLoadingBuyer,
    isSuccess: isSuccessBuyer,
    isError: isErrorBuyer,
    error: errorBuyer,
  } = useGetDetailBuyer({ id: buyerId });

  const {
    data: dataTopBuyer,
    isFetching,
    isError: isErrorTopBuyer,
    error: errorTopBuyer,
  } = useGetTopBuyer({
    month: selectedMonth,
    year: selectedYear,
  });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const topBuyers = useMemo(() => {
    return dataTopBuyer?.data?.data?.resource ?? [];
  }, [dataTopBuyer]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    if (data && isSuccess) {
      setPagination(data?.data.data.resource);
    }
  }, [data]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  const handleExport = async () => {
    const body: {
      month: number;
      year: number;
    } = {
      month: selectedMonth,
      year: selectedYear,
    };

    mutateExport(
      { body },
      {
        onSuccess: (res) => {
          console.log("RES_EXPORT_BUYER:", res);
          const link = document.createElement("a");
          link.href = res.data.data.resource.download_url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
      }
    );
  };

  // handle close
  const handleClose = () => {
    setIsOpen("");
    setBuyerId("");
    setInput((prev) => ({
      ...prev,
      name: "",
      phone: "",
      address: "",
    }));
    setAddress({
      address: "",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_buyer: input.name,
      address_buyer: input.address,
      phone_buyer: input.phone,
    };
    mutateCreate(
      { body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // handle update
  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      name_buyer: input.name,
      address_buyer: input.address,
      phone_buyer: input.phone,
    };
    mutateUpdate(
      { id: buyerId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-7 h-7 text-yellow-500 mb-1" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 mb-1" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 mb-1" />;
    return <Medal className="w-5 h-5 text-gray-300 mb-1" />;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "border-2 border-sky-400 py-6 -translate-y-6";
    return "border py-4";
  };

  const orderedTopBuyers = useMemo(() => {
    if (!topBuyers?.length) return [];

    const byRank = (r: number) => topBuyers.find((b: any) => b.rank === r);

    return [byRank(4), byRank(2), byRank(1), byRank(3), byRank(5)].filter(
      Boolean
    );
  }, [topBuyers]);

  const isTopBuyerForbidden =
    isErrorTopBuyer && (errorTopBuyer as AxiosError)?.response?.status === 403;

  // update from gmaps to state
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      address: address.address ?? "",
    }));
  }, [address]);

  // set data detail
  useEffect(() => {
    if (isSuccessBuyer && dataBuyer) {
      setInput({
        name: dataBuyer.data.data.resource.name_buyer ?? "",
        phone: dataBuyer.data.data.resource.phone_buyer ?? "",
        address: dataBuyer.data.data.resource.address_buyer ?? "",
        point_buyer: dataBuyer.data.data.resource.point_buyer ?? 0,
      });
    }
  }, [dataBuyer]);

  // isError get data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

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
      accessorKey: "name_buyer",
      header: "Name Buyer",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "no_hp",
      header: "No. Hp",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "monthly_transaction",
      header: () => <div className="text-center">Monthly Transaction</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.monthly_transaction.toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "monthly_total_purchase",
      header: "Total Purchase",
      cell: ({ row }) => formatRupiah(row.original.monthly_total_purchase),
    },
    {
      accessorKey: "total_points",
      header: () => <div className="text-center">Total Points</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.total_points}</div>
      ),
    },
    {
      accessorKey: "monthly_points",
      header: () => <div className="text-center">Monthly Points</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.monthly_points}</div>
      ),
    },
    {
      accessorKey: "rank",
      header: () => <div className="text-center">Rank</div>,
      cell: ({ row }) => <div className="text-center">{row.original.rank}</div>,
    },

    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>Edit</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-yellow-400 text-yellow-700 hover:text-yellow-700 hover:bg-yellow-50 disabled:opacity-100 disabled:hover:bg-yellow-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              asChild
            >
              <Link href={`/outbond/buyer/edit/${row.original.id}`}>
                <Edit3 className="w-4 h-4" />
              </Link>
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
      <DialogCreateEdit
        open={isOpen === "create-edit"}
        onCloseModal={handleClose}
        buyerId={buyerId} // buyerId
        address={address} // address gmaps
        setAddress={setAddress} // set address gmaps
        input={input} // input form
        setInput={setInput} // setInput Form
        handleClose={handleClose} // handle close for cancel
        handleCreate={handleCreate} // handle create warehouse
        handleUpdate={handleUpdate} // handle update warehouse
      />
      <DialogFiltered
        open={isOpen === "filtered"}
        onOpenChange={() => {
          if (isOpen === "filtered") {
            setIsOpen("");
          }
        }}
      />
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
      {/* Buyer of the Month */}
      {!isTopBuyerForbidden && (
        <div className="w-full bg-white rounded-md shadow px-6 py-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Buyer of the Month</h2>

              <div className="flex items-center gap-4">
                {/* Select Month */}
                <div className="flex items-center gap-2 border border-sky-400/80 rounded px-3 py-2">
                  <CalendarIcon className="w-4 h-4" />
                  <select
                    disabled={isFetching}
                    className="outline-none bg-transparent text-sm disabled:opacity-60"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {format(new Date(2025, i, 1), "MMMM")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Year */}
                <div className="flex items-center gap-2 border border-sky-400/80 rounded px-3 py-2">
                  <CalendarIcon className="w-4 h-4" />
                  <select
                    disabled={isFetching}
                    className="outline-none bg-transparent text-sm disabled:opacity-60"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Loader kecil */}
                {isFetching && (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                )}
              </div>
            </div>

            {isFetching ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                {orderedTopBuyers.map((buyer: any) => (
                  <div
                    key={buyer.rank}
                    className={cn(
                      "flex flex-col items-center rounded-lg transition-all",
                      getRankStyle(buyer.rank)
                    )}
                  >
                    {getRankIcon(buyer.rank)}

                    <span
                      className={cn(
                        "text-sm",
                        buyer.rank === 1 ? "text-sky-600" : "text-gray-500"
                      )}
                    >
                      {buyer.rank}
                    </span>

                    <p className="font-semibold text-center">
                      {buyer.buyer_name ?? "-"}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Point :{" "}
                      <span className="font-medium">
                        {buyer.total_points?.toLocaleString() ?? 0}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Buyers</h2>
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
                <TooltipProviderPage value={"Export Data"} side="left">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport();
                    }}
                    className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-black bg-sky-100 hover:bg-sky-200 disabled:opacity-100 disabled:hover:bg-sky-200 disabled:pointer-events-auto disabled:cursor-not-allowed"
                    disabled={isPendingExport}
                    variant={"outline"}
                  >
                    {isPendingExport ? (
                      <Loader2 className={cn("w-4 h-4 animate-spin")} />
                    ) : (
                      <FileDown className={cn("w-4 h-4")} />
                    )}
                  </Button>
                </TooltipProviderPage>
                <Button
                  onClick={() => setIsOpen("filtered")}
                  disabled={
                    isLoadingBuyer || isPendingUpdate || isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingBuyer || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Filtered
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen("create-edit");
                  }}
                  disabled={
                    isLoadingBuyer || isPendingUpdate || isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingBuyer || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Buyer
                </Button>
              </div>
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
