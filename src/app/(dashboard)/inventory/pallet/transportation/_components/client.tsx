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
import { useGetListTransportationPalet } from "../_api/use-get-list-transportation-palet";
import { useDeleteTransportationPalet } from "../_api/use-delete-transportation-palet";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateTransportationPalet } from "../_api/use-update-transportation-palet";
import { useGetDetailTransportationPalet } from "../_api/use-get-detail-transportation-palet";
import { useCreateTransportationPalet } from "../_api/use-create-transportation-palet";
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";

const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});

export const Client = () => {
  const queryClient = useQueryClient();

  // dialog create edit
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );

  // transportation Id for Edit
  const [transportationId, setTransportationId] = useQueryState(
    "transportationId",
    {
      defaultValue: "",
    }
  );

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    length: "",
    width: "",
    height: "",
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
    "Delete Transportation",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteTransportationPalet();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateTransportationPalet();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateTransportationPalet();

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
  } = useGetListTransportationPalet({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataTransportation,
    isLoading: isLoadingTransportation,
    isSuccess: isSuccessTransportation,
    isError: isErrorTransportation,
    error: errorTransportation,
  } = useGetDetailTransportationPalet({ id: transportationId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // handle pagination
  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  // handle error data
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  // handle error get detail
  useEffect(() => {
    alertError({
      isError: isErrorTransportation,
      error: errorTransportation as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorTransportation, errorTransportation]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  // handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setTransportationId("");
    setInput({
      name: "",
      length: "",
      width: "",
      height: "",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      vehicle_name: input.name,
      cargo_length: input.length,
      cargo_height: input.height,
      cargo_width: input.width,
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
      vehicle_name: input.name,
      cargo_length: input.length,
      cargo_height: input.height,
      cargo_width: input.width,
    };
    mutateUpdate(
      { id: transportationId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: [
              "transportation-palet-detail",
              data.data.data.resource.id,
            ],
          });
        },
      }
    );
  };

  // set data detail
  useEffect(() => {
    if (isSuccessTransportation && dataTransportation) {
      setInput({
        name: dataTransportation.data.data.resource.vehicle_name ?? "",
        length: dataTransportation.data.data.resource.cargo_length ?? "",
        height: dataTransportation.data.data.resource.cargo_height ?? "",
        width: dataTransportation.data.data.resource.cargo_width ?? "",
      });
    }
  }, [dataTransportation]);

  // set default value !isNaN
  useEffect(() => {
    if (isNaN(parseFloat(input.height))) {
      setInput((prev) => ({ ...prev, height: "0" }));
    }
    if (isNaN(parseFloat(input.length))) {
      setInput((prev) => ({ ...prev, length: "0" }));
    }
    if (isNaN(parseFloat(input.width))) {
      setInput((prev) => ({ ...prev, width: "0" }));
    }
  }, [input]);

  // column data
  const columnWarehousePalet: ColumnDef<any>[] = [
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
      accessorKey: "vehicle_name",
      header: "Name",
      cell: ({ row }) => (
        <div className="hyphens-auto">{row.original.vehicle_name}</div>
      ),
    },
    {
      accessorKey: "cargo_length",
      header: "Length",
    },
    {
      accessorKey: "cargo_height",
      header: "Height",
    },
    {
      accessorKey: "cargo_width",
      header: "Width",
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
              disabled={
                isLoadingTransportation || isPendingUpdate || isPendingCreate
              }
              onClick={(e) => {
                e.preventDefault();
                setTransportationId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingTransportation || isPendingUpdate || isPendingCreate ? (
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
        isLoading={isLoadingTransportation}
        transportationId={transportationId} // transportationId
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
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/pallet/list">
              Pallet
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Transportation</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Transportation Palet</h2>
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
                    isLoadingTransportation ||
                    isPendingUpdate ||
                    isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingTransportation ||
                  isPendingUpdate ||
                  isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Transportation
                </Button>
              </div>
            </div>
          </div>
          <DataTable columns={columnWarehousePalet} data={dataList ?? []} />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
