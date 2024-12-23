"use client";

import {
  Edit3,
  Link2Icon,
  Loader2,
  PlusCircle,
  ReceiptText,
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
import { useGetListFormatBarcode } from "../_api/use-get-list-format-barcode";
import { useDeleteFormatBarcode } from "../_api/use-delete-format-detail";
import { useUpdateFormatBarcode } from "../_api/use-update-format-barcode";
import { useGetDetailFormatBarcode } from "../_api/use-get-detail-format-barcode";
import { useCreateFormatBarcode } from "../_api/use-create-format-barcode";
import Pagination from "@/components/pagination";
import dynamic from "next/dynamic";
import { useGetSelectPanelSPV } from "../_api/use-get-select";
import { useSubmitMatch } from "../_api/use-submit-match";

const DialogCreateEdit = dynamic(() => import("./dialog-create-edit"), {
  ssr: false,
});
const DialogMatchUser = dynamic(() => import("./dialog-match-user"), {
  ssr: false,
});
const DialogDetail = dynamic(() => import("./dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  // dialog create edit
  const [openCreateEdit, setOpenCreateEdit] = useQueryState(
    "dialog",
    parseAsBoolean.withDefault(false)
  );
  const [openMatchUser, setOpenMatchUser] = useQueryState(
    "dialog2",
    parseAsBoolean.withDefault(false)
  );
  const [openDetail, setOpenDetail] = useQueryState(
    "dialog3",
    parseAsBoolean.withDefault(false)
  );

  // warehouse Id for Edit
  const [formatId, setFormatId] = useQueryState("formatId", {
    defaultValue: "",
  });

  // data form create edit
  const [input, setInput] = useState({
    format: "",
    totalScan: "",
    totalUser: "",
    userId: "",
    formatId: "",
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
    "Delete Format",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } =
    useDeleteFormatBarcode();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } =
    useUpdateFormatBarcode();
  const { mutate: mutateCreate, isPending: isPendingCreate } =
    useCreateFormatBarcode();
  const { mutate: mutateSubmit, isPending: isPendingSubmit } = useSubmitMatch();

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

  const {
    data: dataSelect,
    error: errorSelect,
    isError: isErrorSelect,
  } = useGetSelectPanelSPV();

  // get detail data
  const {
    data: dataFormat,
    isLoading: isLoadingFormat,
    isSuccess: isSuccessFormat,
    refetch: refetchFormat,
    isRefetching: isRefetchingFormat,
    isError: isErrorFormat,
    error: errorFormat,
  } = useGetDetailFormatBarcode({ id: formatId });

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  const dataListDetail: any[] = useMemo(() => {
    return dataFormat?.data.data.resource.users;
  }, [dataFormat]);

  const dataDetail: any = useMemo(() => {
    return dataFormat?.data.data.resource;
  }, [dataFormat]);

  const dataListUser: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.users;
  }, [dataSelect]);

  const dataListFormat: any[] = useMemo(() => {
    return dataSelect?.data.data.resource.format_barcode;
  }, [dataSelect]);

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
    setFormatId("");
    setInput({
      format: "",
      totalScan: "",
      totalUser: "",
      userId: "",
      formatId: "",
    });
  };
  // handle close
  const handleDetailClose = () => {
    setOpenDetail(false);
    setFormatId("");
  };

  // handle match close
  const handleMatchClose = () => {
    setOpenMatchUser(false);
    setInput({
      format: "",
      totalScan: "",
      totalUser: "",
      userId: "",
      formatId: "",
    });
  };

  // handle create
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      format: input.format,
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
      format: input.format,
      total_scan: input.totalScan,
      total_user: input.totalUser,
    };
    mutateUpdate(
      { id: formatId, body },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };
  // handle submit
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = {
      format_barcode_id: input.formatId,
      user_id: input.userId,
    };
    mutateSubmit(
      { body },
      {
        onSuccess: () => {
          handleMatchClose();
        },
      }
    );
  };

  // set data detail
  useEffect(() => {
    if (isSuccessFormat && dataFormat) {
      setInput((prev) => ({
        ...prev,
        format: dataFormat?.data.data.resource.format ?? "",
        totalScan: dataFormat?.data.data.resource.total_scan ?? "",
        totalUser: dataFormat?.data.data.resource.total_user ?? "",
      }));
    }
  }, [dataFormat]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      action: "get data",
      data: "Data",
      method: "GET",
    });
  }, [isError, error]);

  // isError get Detail
  useEffect(() => {
    alertError({
      isError: isErrorFormat,
      error: errorFormat as AxiosError,
      action: "get data",
      data: "Detail",
      method: "GET",
    });
  }, [isErrorFormat, errorFormat]);

  // isError get Role
  useEffect(() => {
    alertError({
      isError: isErrorSelect,
      error: errorSelect as AxiosError,
      action: "get data",
      data: "Select",
      method: "GET",
    });
  }, [isErrorSelect, errorSelect]);

  // column data
  const columnListData: ColumnDef<any>[] = [
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
      accessorKey: "format",
      header: "Format",
    },
    {
      accessorKey: "total_user",
      header: () => <div className="text-center">Total User</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_user?.toLocaleString() ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "total_scan",
      header: () => <div className="text-center">Total Scan</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_scan?.toLocaleString() ?? "-"}
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
              disabled={
                isLoadingFormat ||
                isPendingUpdate ||
                isPendingCreate ||
                isPendingSubmit ||
                isPendingDelete
              }
              onClick={(e) => {
                e.preventDefault();
                setFormatId(row.original.id);
                setOpenCreateEdit(true);
              }}
            >
              {isLoadingFormat ||
              isPendingUpdate ||
              isPendingCreate ||
              isPendingSubmit ||
              isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Detail</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={
                isLoadingFormat ||
                isPendingUpdate ||
                isPendingCreate ||
                isPendingSubmit ||
                isPendingDelete
              }
              onClick={(e) => {
                e.preventDefault();
                setFormatId(row.original.id);
                setOpenDetail(true);
              }}
            >
              {isLoadingFormat ||
              isPendingUpdate ||
              isPendingCreate ||
              isPendingSubmit ||
              isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ReceiptText className="w-4 h-4" />
              )}
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>Delete</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={
                isLoadingFormat ||
                isPendingUpdate ||
                isPendingCreate ||
                isPendingSubmit ||
                isPendingDelete
              }
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isLoadingFormat ||
              isPendingUpdate ||
              isPendingCreate ||
              isPendingSubmit ||
              isPendingDelete ? (
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

  const columnListDetail: ColumnDef<any>[] = [
    {
      header: () => <div className="text-center">No</div>,
      id: "id",
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(1 + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "scan_today",
      header: () => <div className="text-center">Scan Today</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.scan_today?.toLocaleString() ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "scan_date",
      header: "Date",
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
      <DialogDetail
        open={openDetail} // open modal
        onCloseModal={() => {
          if (openDetail) {
            handleDetailClose();
          }
        }} // handle close modal
        data={dataDetail}
        isLoading={isLoadingFormat}
        refetch={refetchFormat}
        isRefetching={isRefetchingFormat}
        columns={columnListDetail}
        dataTable={dataListDetail ?? []}
      />
      <DialogMatchUser
        open={openMatchUser} // open modal
        onCloseModal={() => {
          if (openMatchUser) {
            handleMatchClose();
          }
        }} // handle close modal
        isLoading={isLoadingFormat}
        format={dataListFormat ?? []}
        users={dataListUser ?? []}
        input={input}
        setInput={setInput}
        handleClose={handleMatchClose}
        handleSubmit={handleSubmit} // handle update warehouse
      />
      <DialogCreateEdit
        open={openCreateEdit} // open modal
        onCloseModal={() => {
          if (openCreateEdit) {
            handleClose();
          }
        }} // handle close modal
        isLoading={isLoadingFormat}
        formatId={formatId} // formatId
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
          <BreadcrumbItem>Panel SPV</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Barcode Account</h2>
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
                    setOpenMatchUser(true);
                  }}
                  disabled={
                    isLoadingFormat ||
                    isPendingUpdate ||
                    isPendingCreate ||
                    isPendingSubmit ||
                    isPendingDelete
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingFormat ||
                  isPendingUpdate ||
                  isPendingCreate ||
                  isPendingSubmit ||
                  isPendingDelete ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Link2Icon className={"w-4 h-4 mr-1"} />
                  )}
                  Match User
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenCreateEdit(true);
                  }}
                  disabled={
                    isLoadingFormat ||
                    isPendingUpdate ||
                    isPendingCreate ||
                    isPendingSubmit ||
                    isPendingDelete
                  }
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  {isLoadingFormat ||
                  isPendingUpdate ||
                  isPendingCreate ||
                  isPendingSubmit ||
                  isPendingDelete ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                  )}
                  Add Barcode
                </Button>
              </div>
            </div>
          </div>
          <DataTable
            columns={columnListData}
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
