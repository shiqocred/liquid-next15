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
import { useGetListWarehousePalet } from "../_api/use-get-list-warehouse-palet";
import { useDeleteWarehousePalet } from "../_api/use-delete-warehouse-palet";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateWarehousePalet } from "../_api/use-update-warehouse-palet";
import { useGetDetailWarehousePalet } from "../_api/use-get-detail-warehouse-palet";
import { useCreateWarehousePalet } from "../_api/use-create-warehouse-palet";
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
  const [warehouseId, setWarehouseId] = useQueryState("warehouseId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    phone: "",
    address: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    latitude: "-6.175392",
    longitude: "106.827153",
  });

  // dataGMaps
  const [address, setAddress] = useState({
    address: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    latitude: "-6.175392",
    longitude: "106.827153",
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
    "Delete Warehouse",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteWarehousePalet();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateWarehousePalet();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateWarehousePalet();

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
  } = useGetListWarehousePalet({ p: page, q: searchValue });

  // get detail data
  const {
    data: dataWarehouse,
    isLoading: isLoadingWarehouse,
    isSuccess: isSuccessWarehouse,
    isError: isErrorWarehouse,
    error: errorWarehouse,
  } = useGetDetailWarehousePalet({ id: warehouseId });

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
      isError: isErrorWarehouse,
      error: errorWarehouse as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorWarehouse, errorWarehouse]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  // handle close
  const handleClose = () => {
    setOpenCreateEdit(false);
    setWarehouseId("");
    setInput((prev) => ({
      ...prev,
      name: "",
      phone: "",
      address: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      latitude: "-6.175392",
      longitude: "106.827153",
    }));
    setAddress({
      address: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      latitude: "-6.175392",
      longitude: "106.827153",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      nama: input.name,
      alamat: input.address,
      provinsi: input.provinsi,
      kabupaten: input.kabupaten,
      kota: input.kabupaten,
      kecamatan: input.kecamatan,
      no_hp: input.phone,
      latitude: input.latitude,
      longitude: input.longitude,
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
      provinsi: input.provinsi,
      kabupaten: input.kabupaten,
      kota: input.kabupaten,
      kecamatan: input.kecamatan,
      no_hp: input.phone,
      latitude: input.latitude,
      longitude: input.longitude,
    };
    mutateUpdate(
      { id: warehouseId, body },
      {
        onSuccess: (data) => {
          handleClose();
          queryClient.invalidateQueries({
            queryKey: ["warehouse-palet-detail", data.data.data.resource.id],
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
      kecamatan: address.kecamatan ?? "",
      kabupaten: address.kabupaten ?? "",
      provinsi: address.provinsi ?? "",
      latitude: address.latitude ?? "-6.175392",
      longitude: address.longitude ?? "106.827153",
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
        provinsi: dataWarehouse.data.data.resource.provinsi ?? "",
        kabupaten: dataWarehouse.data.data.resource.kabupaten ?? "",
        kecamatan: dataWarehouse.data.data.resource.kecamatan ?? "",
      }));
      setAddress((prev) => ({
        ...prev,
        latitude: dataWarehouse.data.data.resource.latitude ?? "-6.175392",
        longitude: dataWarehouse.data.data.resource.longitude ?? "106.827153",
      }));
    }
  }, [dataWarehouse]);

  // set Default lat & lng "-6.175392 && 106.827153"
  useEffect(() => {
    if (isNaN(parseFloat(input.latitude))) {
      setInput((prev) => ({ ...prev, latitude: "-6.175392" }));
    }
    if (isNaN(parseFloat(input.longitude))) {
      setInput((prev) => ({ ...prev, longitude: "106.827153" }));
    }
  }, [input]);

  // set gmaps Default lat & lng "-6.175392 & 106.827153"
  useEffect(() => {
    if (isNaN(parseFloat(address.latitude))) {
      setAddress((prev) => ({ ...prev, latitude: "-6.175392" }));
    }
    if (isNaN(parseFloat(address.longitude))) {
      setAddress((prev) => ({ ...prev, longitude: "106.827153" }));
    }
  }, [address]);

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
      accessorKey: "nama",
      header: "Name",
      cell: ({ row }) => (
        <div className="max-w-[250px] break-all">{row.original.nama}</div>
      ),
    },
    {
      accessorKey: "no_hp",
      header: "No. Hp",
    },
    {
      accessorKey: "alamat",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[300px]">{row.original.alamat}</div>
      ),
    },
    {
      accessorKey: "kecamatan",
      header: "Kec.",
    },
    {
      accessorKey: "kabupaten",
      header: "Kab.",
    },
    {
      accessorKey: "provinsi",
      header: "Prov.",
    },
    {
      accessorKey: "latitude",
      header: "Lat.",
    },
    {
      accessorKey: "longitude",
      header: "Lng.",
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
                setWarehouseId(row.original.id);
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
        warehouseId={warehouseId} // warehouseId
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
          <BreadcrumbItem>Inventory</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/inventory/pallet/list">
              Pallet
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Warehouse</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Warehouse Palet</h2>
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
                  Add Warehouse
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
