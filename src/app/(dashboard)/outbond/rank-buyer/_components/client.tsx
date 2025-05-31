"use client";

import { Edit3, Loader2, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { alertError, cn, setPaginate } from "@/lib/utils";
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
import { useDeleteRankBuyer } from "../_api/use-delete-rank-buyer";
import { useUpdateRankBuyer } from "../_api/use-update-rank-buyer";
import { useGetDetailRankBuyer } from "../_api/use-get-detail-rank-buyer";
import { useCreateRankBuyer } from "../_api/use-create-rank-buyer";
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";
import { useGetListRankBuyer } from "../_api/use-get-list-rank-buyer";

const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

export const Client = () => {
  // dialog create edit
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // warehouse Id for Edit
  const [rankBuyerId, setRankBuyerId] = useQueryState("rankBuyerId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    rank: "",
    min_transactions: 0,
    min_amount_transaction: 0,
    percentage_discount: 0,
    expired_weeks: 0,
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
    "Delete Rank Buyer",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteRankBuyer();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateRankBuyer();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateRankBuyer();

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
  } = useGetListRankBuyer({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataRankBuyer,
    isLoading: isLoadingRankBuyer,
    isSuccess: isSuccessRankBuyer,
    isError: isErrorRankBuyer,
    error: errorRankBuyer,
  } = useGetDetailRankBuyer({ id: rankBuyerId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    setPaginate({
      isSuccess: isSuccess,
      data: data,
      dataPaginate: data?.data.data.resource,
      setMetaPage: setMetaPage,
      setPage: setPage,
    });
  }, [data]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  // handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setRankBuyerId("");
    setInput((prev) => ({
      ...prev,
      rank: "",
      min_transactions: 0,
      min_amount_transaction: 0,
      percentage_discount: 0,
      expired_weeks: 0,
    }));
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      rank: input.rank,
      min_transactions: input.min_transactions,
      min_amount_transaction: input.min_amount_transaction,
      percentage_discount: input.percentage_discount,
      expired_weeks: input.expired_weeks,
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
      rank: input.rank,
      min_transactions: input.min_transactions,
      min_amount_transaction: input.min_amount_transaction,
      percentage_discount: input.percentage_discount,
      expired_weeks: input.expired_weeks,
    };
    mutateUpdate(
      { id: rankBuyerId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // set data detail
  useEffect(() => {
    if (isSuccessRankBuyer && dataRankBuyer) {
      setInput({
        rank: dataRankBuyer.data.data.resource.rank ?? "",
        min_transactions: dataRankBuyer.data.data.resource.min_transactions ?? 0,
        min_amount_transaction:
          dataRankBuyer.data.data.resource.min_amount_transaction ?? 0,
        percentage_discount:
          dataRankBuyer.data.data.resource.percentage_discount ?? 0,
        expired_weeks: dataRankBuyer.data.data.resource.expired_weeks ?? 0,
      });
    }
  }, [dataRankBuyer]);

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
      isError: isErrorRankBuyer,
      error: errorRankBuyer as AxiosError,
      action: "get data",
      data: "Rank Buyer",
      method: "GET",
    });
  }, [isErrorRankBuyer, errorRankBuyer]);

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
      accessorKey: "rank",
      header: "Rank",
    },
    {
      accessorKey: "min_amount_transaction",
      header: "Min Amount Transaction",
    },
    {
      accessorKey: "min_transactions",
      header: "Min Transactions",
    },
    {
      accessorKey: "percentage_discount",
      header: "Percentage Discount",
    },
    {
      accessorKey: "expired_weeks",
      header: "Expired Weeks",
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
              disabled={isLoadingRankBuyer || isPendingUpdate || isPendingCreate}
              onClick={(e) => {
                e.preventDefault();
                setRankBuyerId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingRankBuyer || isPendingUpdate || isPendingCreate ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
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
        open={openCreateEdit} // open modal
        onCloseModal={() => {
          if (openCreateEdit) {
            handleClose();
          }
        }} // handle close modal
        rankBuyerId={rankBuyerId} // rankBuyerId
        input={input} // input form
        setInput={setInput} // setInput Form
        handleClose={handleClose} // handle close for cancel
        handleCreate={handleCreate} // handle create warehouse
        handleUpdate={handleUpdate} // handle update warehouse
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Outbond</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Rank Buyer</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Rank Buyers</h2>
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
                    setOpenCreateEdit(true);
                  }}
                  disabled={
                    isLoadingRankBuyer || isPendingUpdate || isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingRankBuyer || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Rank Buyer
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
