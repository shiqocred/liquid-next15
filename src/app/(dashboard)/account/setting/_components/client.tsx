"use client";

import {
  Edit3,
  Loader,
  Loader2,
  PlusCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
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
import { useGetListAccount } from "../_api/use-get-list-account";
import { useDeleteAccount } from "../_api/use-delete-account";
import { useUpdateAccount } from "../_api/use-update-account";
import { useGetDetailAccount } from "../_api/use-get-detail-account";
import { useCreateAccount } from "../_api/use-create-account";
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";
import { useGetListRole } from "../_api/use-get-list-role";

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
  const [userId, setUserId] = useQueryState("userId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    username: "",
    roleId: "",
    email: "",
    password: "",
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
    "Delete User",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteAccount();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateAccount();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateAccount();

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
  } = useGetListAccount({ p: page, q: searchValue });

  const {
    data: dataRole,
    isLoading: isLoadingRole,
    error: errorRole,
    isError: isErrorRole,
  } = useGetListRole();

  // get detail data
  const {
    data: dataUser,
    isLoading: isLoadingUser,
    isSuccess: isSuccessUser,
    isError: isErrorUser,
    error: errorUser,
  } = useGetDetailAccount({ id: userId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListRole: any[] = useMemo(() => {
    return dataRole?.data.data.resource;
  }, [dataRole]);

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
    setUserId("");
    setInput({
      name: "",
      username: "",
      roleId: "",
      email: "",
      password: "",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      email: input.email,
      name: input.name,
      password: input.password,
      role_id: input.roleId,
      username: input.username,
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
      email: input.email,
      name: input.name,
      password: input.password,
      role_id: input.roleId,
      username: input.username,
    };
    mutateUpdate(
      { id: userId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  // set data detail
  useEffect(() => {
    if (isSuccessUser && dataUser) {
      setInput((prev) => ({
        ...prev,
        name: dataUser.data.data.resource.name ?? "",
        username: dataUser.data.data.resource.username ?? "",
        roleId: dataUser.data.data.resource.role_id ?? "",
        email: dataUser.data.data.resource.email ?? "",
      }));
    }
  }, [dataUser]);

  // isError get Detail
  useEffect(() => {
    alertError({
      isError: isErrorUser,
      error: errorUser as AxiosError,
      action: "get data",
      data: "User",
      method: "GET",
    });
  }, [isErrorUser, errorUser]);

  // isError get Role
  useEffect(() => {
    alertError({
      isError: isErrorRole,
      error: errorRole as AxiosError,
      action: "get data",
      data: "Role",
      method: "GET",
    });
  }, [isErrorRole, errorRole]);

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
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role.role_name",
      header: "Role",
    },
    {
      accessorKey: "format_barcode_name",
      header: () => <div className="text-center">Format</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.format_barcode_name ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "total_scans",
      header: () => <div className="text-center">Total Scan</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_scans?.toLocaleString() ?? "-"}
        </div>
      ),
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
              disabled={isLoadingUser || isPendingUpdate || isPendingCreate}
              onClick={(e) => {
                e.preventDefault();
                setUserId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingUser || isPendingUpdate || isPendingCreate ? (
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
        role={dataListRole ?? []}
        isLoading={isLoadingUser}
        userId={userId} // userId
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
          <BreadcrumbItem>Account</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Setting</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-4 flex-col">
        <h2 className="text-xl font-bold">Role Account</h2>
        <ul className="w-full p-4 rounded-md border border-sky-400/80 grid grid-cols-4 gap-2">
          {isLoadingRole ? (
            <li className="col-span-4 h-20 flex items-center justify-center">
              <Loader className="size-5 animate-spin" />
            </li>
          ) : (
            dataListRole?.map((item, i) => (
              <li key={item.id}>{i + 1 + " - " + item.role_name}</li>
            ))
          )}
        </ul>
      </div>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Accounts</h2>
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
                  disabled={isLoadingUser || isPendingUpdate || isPendingCreate}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingUser || isPendingUpdate || isPendingCreate ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Account
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
