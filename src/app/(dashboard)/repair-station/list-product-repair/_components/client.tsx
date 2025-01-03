"use client";

import {
  Loader2,
  PlusCircle,
  Recycle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { alertError, cn, setPaginate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { parseAsInteger, useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { TooltipProviderPage } from "@/providers/tooltip-provider-page";
import Forbidden from "@/components/403";
import { AxiosError } from "axios";
import Loading from "@/app/(dashboard)/loading";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetListLPR } from "../_api/use-get-list-lpr";
import { useQCDLPR } from "../_api/use-qcd-lpr";
import Pagination from "@/components/pagination";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useGetDetailLPR } from "../_api/use-get-detail-lpr";
import { useGetListCategories } from "../_api/use-get-list-categories";
import { useToDisplay } from "../_api/use-to-display";
import { useQueryClient } from "@tanstack/react-query";

const DialogDetail = dynamic(() => import("../_components/dialog-detail"), {
  ssr: false,
});

export const Client = () => {
  const queryClient = useQueryClient();
  const [openDisplay, setOpenDisplay] = useState(false);
  const [documentDetail, setDocumentDetail] = useState({
    documentCode: "",
    barcode: "",
  });

  const [input, setInput] = useState({
    name: "",
    price: "0",
    qty: "0",
    category: "",
    discount: "0",
    displayPrice: "0",
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
    "QCD LPR",
    "This action cannot be undone",
    "destructive"
  );

  // mutate DELETE, UPDATE, CREATE
  const { mutate: mutateDelete, isPending: isPendingDelete } = useQCDLPR();
  const { mutate: mutateToDisplay, isPending: isPendingToDisplay } =
    useToDisplay();

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
  } = useGetListLPR({ p: page, q: searchValue });

  // get data detail
  const {
    data: dataDetail,
    isLoading: isLoadingDetail,
    error: errorDetail,
    isError: isErrorDetail,
    isSuccess: isSuccessDetail,
  } = useGetDetailLPR({
    document: documentDetail.documentCode,
    barcode: documentDetail.barcode,
  });

  // get data category
  const {
    data: dataCategory,
    error: errorCategory,
    isError: isErrorCategory,
  } = useGetListCategories();

  // memo data utama
  const dataList: any[] = useMemo(() => {
    return data?.data.data.resource.data;
  }, [data]);

  // memo data detail
  const dataResDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource.product;
  }, [dataDetail]);

  // memo data detail
  const dataResColorDetail: any = useMemo(() => {
    return dataDetail?.data.data.resource.color_tags?.[0];
  }, [dataDetail]);

  // memo data category
  const dataCategories: any[] = useMemo(() => {
    return dataCategory?.data.data.resource;
  }, [dataCategory]);

  useEffect(() => {
    if (isSuccessDetail && dataDetail) {
      const dataResponse = dataDetail?.data.data.resource.product;
      setInput({
        name: dataResponse?.new_name_product ?? "",
        price: dataResponse?.new_price_product ?? "0",
        qty: dataResponse?.new_quantity_product ?? "0",
        category: dataResponse?.new_category_product ?? "",
        discount: dataResponse?.new_discount ?? "0",
        displayPrice: dataResponse?.display_price ?? "0",
      });
    }
  }, [dataDetail]);

  // load data
  const loading = isLoading || isRefetching || isPending;

  useEffect(() => {
    setPaginate({
      isSuccess,
      data,
      dataPaginate: data?.data.data.resource,
      setPage,
      setMetaPage,
    });
  }, [data]);

  useEffect(() => {
    alertError({
      isError,
      error: error as AxiosError,
      data: "Data",
      action: "get data",
      method: "GET",
    });
  }, [isError, error]);

  useEffect(() => {
    alertError({
      isError: isErrorDetail,
      error: errorDetail as AxiosError,
      data: "Detail Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorDetail, errorDetail]);

  useEffect(() => {
    alertError({
      isError: isErrorCategory,
      error: errorCategory as AxiosError,
      data: "Category Data",
      action: "get data",
      method: "GET",
    });
  }, [isErrorCategory, errorCategory]);

  // handle delete
  const handleDelete = async (id: any) => {
    const ok = await confirmDelete();

    if (!ok) return;

    mutateDelete({ id });
  };

  const handleToDisplay = () => {
    const body = {
      old_barcode_product: dataResDetail?.old_barcode_product,
      old_price_product: dataResDetail?.old_price_product,
      new_status_product: dataResDetail?.new_status_product,
      new_barcode_product: dataResDetail?.new_barcode_product,
      new_name_product: input.name,
      new_price_product: input.price,
      new_quantity_product: input.qty,
      new_category_product: input.category ?? null,
    };
    mutateToDisplay(
      { id: dataResDetail?.id, body },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: [
              "detail-lpr",
              data?.data.resource.product?.code_document,
              data?.data.resource.product?.old_barcode_product,
            ],
          });
        },
      }
    );
  };

  // fn find not null quality
  const findNotNull = (v: any) => {
    const qualityObject = JSON.parse(v);

    const filteredEntries = Object.entries(qualityObject).find(
      ([, value]) => value !== null
    );

    return {
      key: filteredEntries?.[0] ?? "",
      value: filteredEntries?.[1] ?? "",
    };
  };

  // default numeric
  useEffect(() => {
    if (isNaN(parseFloat(input.price))) {
      setInput((prev) => ({ ...prev, price: "0" }));
    }
    if (isNaN(parseFloat(input.qty))) {
      setInput((prev) => ({ ...prev, qty: "0" }));
    }
    if (isNaN(parseFloat(input.discount))) {
      setInput((prev) => ({ ...prev, discount: "0" }));
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
      accessorKey: "old_barcode_product||new_barcode_product",
      header: "Name",
      cell: ({ row }) =>
        row.original.old_barcode_product ?? row.original.new_barcode_product,
    },
    {
      accessorKey: "new_name_product",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="max-w-[500px] hyphens-auto">
          {row.original.new_name_product}
        </div>
      ),
    },
    {
      accessorKey: "new_quality",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <span className="font-bold">
            {"[" +
              (findNotNull(row.original.new_quality).key === "damaged"
                ? "DMG"
                : "ABL") +
              "] "}
          </span>
          {`- ${String(findNotNull(row.original.new_quality).value)}`}
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          <TooltipProviderPage value={<p>To Display</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-sky-400 text-sky-700 hover:text-sky-700 hover:bg-sky-50 disabled:opacity-100 disabled:hover:bg-sky-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingToDisplay || isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                setOpenDisplay(true);
                setDocumentDetail({
                  documentCode: row.original.code_document,
                  barcode: row.original.old_barcode_product,
                });
              }}
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </TooltipProviderPage>
          <TooltipProviderPage value={<p>QCD</p>}>
            <Button
              className="items-center w-9 px-0 flex-none h-9 border-red-400 text-red-700 hover:text-red-700 hover:bg-red-50 disabled:opacity-100 disabled:hover:bg-red-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
              variant={"outline"}
              disabled={isPendingToDisplay || isPendingDelete}
              onClick={(e) => {
                e.preventDefault();
                handleDelete(row.original.id);
              }}
            >
              {isPendingDelete ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Recycle className="w-4 h-4" />
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
      <DialogDetail
        open={openDisplay}
        handleClose={() => {
          if (openDisplay) {
            setOpenDisplay(false);
            setInput({
              name: "",
              price: "0",
              qty: "0",
              category: "",
              discount: "0",
              displayPrice: "0",
            });
          }
        }}
        isLoading={isLoadingDetail}
        data={dataResDetail}
        dataColor={dataResColorDetail}
        input={input}
        setInput={setInput}
        categories={dataCategories}
        handleSubmit={handleToDisplay}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>Repair Station</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>List Product Repair</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow px-5 py-3 gap-10 flex-col">
        <h2 className="text-xl font-bold">List Product Repair</h2>
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
                  asChild
                  className="items-center flex-none h-9 bg-sky-400/80 hover:bg-sky-400 text-black disabled:opacity-100 disabled:hover:bg-sky-400 disabled:pointer-events-auto disabled:cursor-not-allowed"
                  variant={"outline"}
                >
                  <Link href={"/repair-station/list-product-repair/create"}>
                    <PlusCircle className={"w-4 h-4 mr-1"} />
                    Create
                  </Link>
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
