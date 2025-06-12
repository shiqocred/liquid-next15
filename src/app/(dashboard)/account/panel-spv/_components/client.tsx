"use client";

import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { Link2Icon, Loader2, PlusCircle } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/pagination";
import { DataTable } from "@/components/data-table";
import { InputSearch } from "@/components/input-search";
import { DialogCreateEdit, DialogDetail, DialogMatchUser } from "./dialog";

import {
  useGetListFormatBarcode,
  useDeleteFormatBarcode,
  useGetDetailFormatBarcode,
} from "../_api";

import Forbidden from "@/components/403";
import Loading from "@/app/(dashboard)/loading";

import { alertError } from "@/lib/utils";
import { columnListData } from "./columns";
import { useSearchQuery } from "@/lib/search";
import { usePagination } from "@/lib/pagination";
import { useConfirm } from "@/hooks/use-confirm";

export const Client = () => {
  const [isMounted, setIsMounted] = useState(false); // loading component
  const [openDialog, setOpenDialog] = useQueryState("dialog", parseAsString); // dialog create edit
  const [formatId, setFormatId] = useQueryState("formatId", parseAsString); // warehouse Id for Edit

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Delete Format",
    "This action cannot be undone",
    "destructive"
  ); // confirm delete

  // data search, page
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, metaPage, setPage, setPagination } = usePagination();

  // mutate DELETE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteFormatBarcode();

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
  } = useGetListFormatBarcode({ p: page, q: searchValue });

  // get detail data
  const dataFormat = useGetDetailFormatBarcode({ id: formatId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // load data
  const loading = isLoading || isRefetching || isPending;
  const loadingDetail = dataFormat.isLoading || isPendingDelete;

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ params: { id } });
  };

  // handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(null);
    setFormatId(null);
  };

  // get pagetination
  useEffect(() => {
    if (isSuccess && data) {
      setPagination(data?.data.data.resource);
    }
  }, [data, isSuccess]);

  // handle error
  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Data",
      method: "GET",
    });
    alertError({
      isError: dataFormat.isError,
      error: dataFormat.error as AxiosError,
      action: "get data",
      data: "Detail",
      method: "GET",
    });
  }, [isError, error, dataFormat.isError, dataFormat.error]);

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
      <DialogDetail
        open={openDialog === "detail"}
        onCloseModal={handleCloseDialog}
        dataFormat={dataFormat}
      />
      <DialogMatchUser
        open={openDialog === "match"}
        onCloseModal={handleCloseDialog}
      />
      <DialogCreateEdit
        open={openDialog === "create" || openDialog === "edit"}
        onCloseModal={handleCloseDialog}
        dataFormat={dataFormat}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Account</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Panel SPV</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Barcode Account</h2>
        <div className="flex flex-col w-full gap-4">
          <div className="flex gap-2 items-center w-full justify-between">
            <InputSearch
              value={search ?? ""}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              autoFocus
              onClick={() => refetch()}
              loading={loading}
            />
            <div className="flex gap-4 items-center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDialog("match");
                }}
                disabled={loadingDetail}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
              >
                {loadingDetail ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Link2Icon className={"w-4 h-4 mr-1"} />
                )}
                Match User
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDialog("create");
                }}
                disabled={isLoading}
                className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                variant={"outline"}
              >
                {loadingDetail ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <PlusCircle className={"w-4 h-4 mr-1"} />
                )}
                Add Barcode
              </Button>
            </div>
          </div>
          <DataTable
            columns={columnListData({
              metaPage,
              loadingDetail,
              setFormatId,
              setOpenDialog,
              handleDelete,
            })}
            data={dataList ?? []}
            isLoading={loading}
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
