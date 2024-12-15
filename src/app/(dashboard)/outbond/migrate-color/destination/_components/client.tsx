"use client";

import {
  AlertCircle,
  Edit3,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
import { useGetListDestinationMC } from "../_api/use-get-list-destination-mc";
import { useDeleteDestinationMC } from "../_api/use-delete-destination-mc";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateDestinationMC } from "../_api/use-update-destination-mc";
import { useGetDetailDestinationMC } from "../_api/use-get-detail-destination-mc";
import { useCreateDestinationMC } from "../_api/use-create-destination-mc";
import { toast } from "sonner";
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

  // warehouse Id for Edit
  const [destinationId, setDestinationId] = useQueryState("destinationId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // dataGMaps
  const [address, setAddress] = useState({
    address: "",
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
    "Delete Destination",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteDestinationMC();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateDestinationMC();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateDestinationMC();

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
  } = useGetListDestinationMC({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataWarehouse,
    isLoading: isLoadingWarehouse,
    isSuccess: isSuccessWarehouse,
    isError: isErrorWarehouse,
    error: errorWarehouse,
  } = useGetDetailDestinationMC({ id: destinationId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPage(data?.data.data.resource.current_page);
      setMetaPage({
        last: data?.data.data.resource.last_page ?? 1,
        from: data?.data.data.resource.from ?? 0,
        total: data?.data.data.resource.total ?? 0,
        perPage: data?.data.data.resource.per_page ?? 0,
      });
    }
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
    setDestinationId("");
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
      nama: input.name,
      alamat: input.address,
      no_hp: input.phone,
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
      nama: input.name,
      alamat: input.address,
      no_hp: input.phone,
    };
    mutateUpdate(
      { id: destinationId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: ["destination-mc-detail", data.data.data.resource.id],
          });
        },
      }
    );
  };

  // update from gmaps to state
  useEffect(() => {
    setInput((prev) => ({
      ...prev,
      address: address.address ?? "",
    }));
  }, [address]);

  // set data detail
  useEffect(() => {
    if (isSuccessWarehouse && dataWarehouse) {
      setInput((prev) => ({
        ...prev,
        name: dataWarehouse.data.data.resource.nama ?? "",
        phone: dataWarehouse.data.data.resource.no_hp ?? "",
        address: dataWarehouse.data.data.resource.alamat ?? "",
      }));
    }
  }, [dataWarehouse]);

  // isError get Detail
  useEffect(() => {
    if (isErrorWarehouse && (errorWarehouse as AxiosError).status === 403) {
      toast.error(`Error 403: Restricted Access`);
    }
    if (isErrorWarehouse && (errorWarehouse as AxiosError).status !== 403) {
      toast.error(
        `ERROR ${
          (errorWarehouse as AxiosError).status
        }: Warehouse failed to get Data`
      );
      console.log("ERROR_GET_WAREHOUSE:", errorWarehouse);
    }
  }, [isErrorWarehouse, errorWarehouse]);

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
      accessorKey: "shop_name",
      header: "Warehouse Name",
    },
    {
      accessorKey: "phone_number",
      header: "No. Hp",
    },
    {
      accessorKey: "alamat",
      header: "Address",
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
                isLoadingWarehouse || isPendingUpdate || isPendingCreate
              }
              onClick={(e) => {
                e.preventDefault();
                setDestinationId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingWarehouse || isPendingUpdate || isPendingCreate ? (
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
        destinationId={destinationId} // destinationId
        address={address} // address gmaps
        setAddress={setAddress} // set address gmaps
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
          <BreadcrumbItem>Migrate Color</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Destinations</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="w-full px-5 py-3 rounded bg-red-300 flex items-center">
        <AlertCircle className="size-4 mr-1" />
        <p>API GMAPS Error</p>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Destinations</h2>
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
                    isLoadingWarehouse || isPendingUpdate || isPendingCreate
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingWarehouse || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Destination
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
