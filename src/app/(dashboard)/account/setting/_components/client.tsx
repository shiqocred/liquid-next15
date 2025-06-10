"use client";

import { Loader, Loader2, PlusCircle, RefreshCw } from "lucide-react";
import { AxiosError } from "axios";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { parseAsBoolean, parseAsString, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";

import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";

import { useGetListAccount } from "../_api/use-get-list-account";
import { useDeleteAccount } from "../_api/use-delete-account";
import { useUpdateAccount } from "../_api/use-update-account";
import { useGetDetailAccount } from "../_api/use-get-detail-account";
import { useCreateAccount } from "../_api/use-create-account";
import { useGetListRole } from "../_api/use-get-list-role";

import DialogCreateEdit from "./dialog/dialog-create-edit";

import { alertError, cn } from "@/lib/utils";
import { columnDestinationMC } from "./columns";
import { useConfirm } from "@/hooks/use-confirm";
import { useSearchQuery } from "@/lib/search";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import { usePagination } from "@/lib/pagination";

export const Client = () => {
  // dialog create edit
  const [openDialog, setOpenDialog] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [userId, setUserId] = useQueryState(
    "userId",
    parseAsString.withDefault("")
  ); // user Id for Edit

  // data form create edit
  const [input, setInput] = useState({
    name: "",
    username: "",
    roleId: "",
    email: "",
    password: "",
  });

  // data search, page
  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, setPage, setPagination } = usePagination();

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
  const loading =
    isLoading ||
    isRefetching ||
    isPending ||
    isLoadingUser ||
    isPendingUpdate ||
    isPendingCreate ||
    isPendingDelete;

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  // handle close
  const handleClose = () => {
    setOpenDialog(false);
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
      { id: userId ?? "", body },
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

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Data",
      method: "GET",
    });
    // isError get Detail
    alertError({
      isError: isErrorUser,
      error: errorUser as AxiosError,
      action: "get data",
      data: "User",
      method: "GET",
    });
    // isError get Role
    alertError({
      isError: isErrorRole,
      error: errorRole as AxiosError,
      action: "get data",
      data: "Role",
      method: "GET",
    });
  }, [isError, error, isErrorUser, errorUser, isErrorRole, errorRole]);

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
        open={openDialog} // open modal
        onCloseModal={() => {
          if (openDialog) {
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
                value={search ?? ""}
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
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDialog(true);
                  }}
                  disabled={loading}
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Account
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnDestinationMC({
              metaPage,
              isLoading: loading,
              handleDelete,
              setOpenDialog,
              setUserId,
            })}
            data={dataList ?? []}
          />
          <Pagination
            pagination={{ ...metaPage, current: page }}
            setPagination={setPage}
          />
        </div>
      </div>
    </div>
  );
};
